import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { GrievanceService } from '../../../../core/services/grievance.service';
import { DEPARTMENTS } from '../../../../core/models/grievance.model';
import { environment } from '../../../../../environments/environment';

// Cloudinary upload response shape
interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

// India Post API response shape
interface PostalApiResponse {
  Status: string;
  PostOffice: {
    Name: string;
    District: string;
    State: string;
    Block: string;
  }[] | null;
}

@Component({
  selector: 'app-submit-grievance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './submit-grievance.component.html',
  styleUrls: ['./submit-grievance.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SubmitGrievanceComponent implements OnInit {

  form!: FormGroup;

  // Department options matching backend exactly
  readonly departments = DEPARTMENTS;

  // Department display config (icon + label)
  readonly deptConfig: Record<string, { icon: string; label: string }> = {
    'Water-Works':   { icon: 'fa-tint',         label: 'Water-Works'   },
    'Roadways':      { icon: 'fa-road',          label: 'Roadways'      },
    'Electricity':   { icon: 'fa-bolt',          label: 'Electricity'   },
    'Sanitation':    { icon: 'fa-trash',         label: 'Sanitation'    },
    'Street-Lights': { icon: 'fa-lightbulb',     label: 'Street-Lights' },
    'Drainage':      { icon: 'fa-water',         label: 'Drainage'      }
  };

  // Pincode state
  pincodeStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  pincodeMessage = '';

  // Image upload state
  imageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  imageUploadStatus: 'idle' | 'uploading' | 'done' | 'error' = 'idle';
  imageUrl = '';
  imagePublicId = '';

  // Form submit state
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private grievanceService: GrievanceService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;

    this.form = this.fb.group({
      // Reporter Info — name pre-filled from user profile
      name:        [user?.name ?? '',        [Validators.required, Validators.maxLength(100)]],
      phoneNumber: [user?.phoneNumber ?? '', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],

      // Location
      pincode:  ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      street:   ['', [Validators.required, Validators.maxLength(255)]],
      locality: ['', [Validators.required, Validators.maxLength(100)]],
      city:     ['', [Validators.required, Validators.maxLength(100)]],
      state:    ['', [Validators.required, Validators.maxLength(100)]],

      // Issue
      department:  ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });

    // Watch pincode field — auto-fill city/state when 6 digits entered
    this.form.get('pincode')!.valueChanges.subscribe((val: string) => {
      if (val && val.length === 6 && /^[0-9]{6}$/.test(val)) {
        this.fetchPincodeData(val);
      } else {
        // Clear if user deletes digits
        if (val.length < 6) {
          this.form.patchValue({ city: '', state: '' }, { emitEvent: false });
          this.pincodeStatus = 'idle';
          this.pincodeMessage = '';
        }
      }
    });
  }

  // ── Getters ───────────────────────────────────────────────────
  get f() { return this.form.controls; }

  get descLength(): number {
    return this.form.get('description')?.value?.length ?? 0;
  }

  get canSubmit(): boolean {
    return this.form.valid
      && this.imageUploadStatus === 'done'
      && !this.isSubmitting;
  }

  // ── Pincode API ───────────────────────────────────────────────
  private fetchPincodeData(pin: string): void {
    this.pincodeStatus = 'loading';
    this.pincodeMessage = 'Looking up pincode...';

    // Clear old values while loading
    this.form.patchValue({ city: '', state: '' }, { emitEvent: false });

    // ── Route through our own backend to avoid CORS / firewall issues
    // with the third-party postalpincode.in API. The backend proxies
    // the request server-side and returns the same JSON response.
    this.http
      .get<PostalApiResponse[]>(`${environment.apiUrl}/Grievance/pincode/${pin}`)
      .subscribe({
        next: (res) => {
          const result = res[0];
          if (result.Status === 'Success' && result.PostOffice?.length) {
            const po = result.PostOffice[0];
            const city  = po.District || po.Block || po.Name;
            const state = po.State;

            this.form.patchValue({ city, state }, { emitEvent: false });
            this.pincodeStatus  = 'success';
            this.pincodeMessage = `${city}, ${state}`;
          } else {
            this.pincodeStatus  = 'error';
            this.pincodeMessage = 'Pincode not found. Please enter city & state manually.';
          }
        },
        error: () => {
          // Fallback: let the user type manually — don't block the form
          this.pincodeStatus  = 'error';
          this.pincodeMessage = 'Auto-fill unavailable. Please enter city & state manually.';
        }
      });
  }

  // ── Department Selection ──────────────────────────────────────
  selectDepartment(dept: string): void {
    this.form.patchValue({ department: dept });
  }

  // ── Image Upload ──────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.imageUploadStatus = 'error';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.imageUploadStatus = 'error';
      return;
    }

    this.imageFile = file;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    this.uploadToCloudinary(file);
  }

  private uploadToCloudinary(file: File): void {
    this.imageUploadStatus = 'uploading';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);

    const url = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;

    // Note: Cloudinary upload does NOT go through the auth interceptor
    // because it's an external service. We use a fresh HttpClient call.
    this.http.post<CloudinaryResponse>(url, formData).subscribe({
      next: (res) => {
        this.imageUrl = res.secure_url;
        this.imagePublicId = res.public_id;
        this.imageUploadStatus = 'done';
      },
      error: () => {
        this.imageUploadStatus = 'error';
      }
    });
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreviewUrl = null;
    this.imageUploadStatus = 'idle';
    this.imageUrl = '';
    this.imagePublicId = '';
  }

  // ── Submit ────────────────────────────────────────────────────
  onSubmit(): void {
    if (!this.canSubmit) {
      // Mark all touched to show validation errors
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const { name, phoneNumber, street, locality, city, state, department, description } = this.form.value;

    this.grievanceService.create({
      name,
      phoneNumber,
      street,
      locality,
      city,
      state,
      department,
      description,
      imageUrl: this.imageUrl,
      imagePublicId: this.imagePublicId
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        // Navigate to my grievances after 2 seconds
        setTimeout(() => this.router.navigate(['/dashboard/overview']), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/overview']);
  }

  // ── Helpers ───────────────────────────────────────────────────
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required'])   return 'This field is required';
    if (ctrl.errors['minlength'])  return `Minimum ${ctrl.errors['minlength'].requiredLength} characters`;
    if (ctrl.errors['maxlength'])  return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters`;
    if (ctrl.errors['pattern'])    return 'Invalid format';
    return 'Invalid value';
  }
}