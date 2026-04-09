import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule, AbstractControl, ValidationErrors
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/user.model';
import { DEPARTMENTS, DEPARTMENT_VALUES, Department } from '../../../core/constants/departments.constants';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  isLoading      = false;
  errorMessage   = '';
  successMessage = '';
  showPassword        = false;
  showConfirmPassword = false;

  // Pincode lookup state (same logic as submit grievance)
  pincodeStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  pincodeMessage = '';

  departments: Department[] = DEPARTMENTS;

  userRoles = [
    { value: 0, key: 'LocalityMember',     label: 'Locality Member',    description: 'Report civic issues in your area' },
    { value: 1, key: 'GovernmentOfficial', label: 'Government Official', description: 'Manage and resolve grievances'    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.registerForm = this.fb.group({
      fullName:        ['', [Validators.required, Validators.minLength(3)]],
      email:           ['', [Validators.required, Validators.email]],
      phoneNumber:     ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address:         ['', [Validators.required, Validators.minLength(10)]],
      signInType:      [0,  Validators.required],
      department:      [''],
      pincode:         [''],
      city:            [''],
      state:           [''],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      acceptTerms:     [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });

    // Toggle validators based on role
    this.signInType!.valueChanges.subscribe((value: number) => {
      const deptControl    = this.registerForm.get('department')!;
      const pincodeControl = this.registerForm.get('pincode')!;

      if (value === 1) {
        // Government Official — needs dept, not pincode
        deptControl.setValidators([Validators.required, this.validDepartmentValidator]);
        pincodeControl.clearValidators();
        pincodeControl.setValue('');
        this.pincodeStatus  = 'idle';
        this.pincodeMessage = '';
        this.registerForm.get('city')!.setValue('');
        this.registerForm.get('state')!.setValue('');
      } else {
        // Locality Member — needs pincode, not dept
        deptControl.clearValidators();
        deptControl.setValue('');
        pincodeControl.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9]{6}$/)
        ]);
      }
      deptControl.updateValueAndValidity();
      pincodeControl.updateValueAndValidity();
    });

    // Watch pincode for auto-fetch city/state
    this.registerForm.get('pincode')!.valueChanges.subscribe((val: string) => {
      if (val && /^[0-9]{6}$/.test(val) && !this.isGovernmentOfficial) {
        this.lookupPincode(val);
      } else if (!val) {
        this.pincodeStatus  = 'idle';
        this.pincodeMessage = '';
        this.registerForm.get('city')!.setValue('');
        this.registerForm.get('state')!.setValue('');
      }
    });
  }

  private lookupPincode(pin: string): void {
    this.pincodeStatus  = 'loading';
    this.pincodeMessage = 'Looking up pincode...';
    this.http.get<any>(`/api/location/pincode/${pin}`).subscribe({
      next: (res) => {
        if (res?.city && res?.state) {
          this.registerForm.get('city')!.setValue(res.city);
          this.registerForm.get('state')!.setValue(res.state);
          this.pincodeStatus  = 'success';
          this.pincodeMessage = `${res.city}, ${res.state}`;
        } else {
          this.pincodeStatus  = 'error';
          this.pincodeMessage = 'Pincode not found. Please check.';
        }
      },
      error: () => {
        this.pincodeStatus  = 'error';
        this.pincodeMessage = 'Could not verify pincode.';
      }
    });
  }

  validDepartmentValidator(ctrl: AbstractControl): ValidationErrors | null {
    if (!ctrl.value) return null;
    return DEPARTMENT_VALUES.includes(ctrl.value) ? null : { invalidDepartment: true };
  }

  passwordMatchValidator(ctrl: AbstractControl): ValidationErrors | null {
    const pw  = ctrl.get('password');
    const cpw = ctrl.get('confirmPassword');
    if (!pw || !cpw) return null;
    return pw.value === cpw.value ? null : { passwordMismatch: true };
  }

  get fullName()        { return this.registerForm.get('fullName'); }
  get email()           { return this.registerForm.get('email'); }
  get phoneNumber()     { return this.registerForm.get('phoneNumber'); }
  get address()         { return this.registerForm.get('address'); }
  get signInType()      { return this.registerForm.get('signInType'); }
  get department()      { return this.registerForm.get('department'); }
  get pincode()         { return this.registerForm.get('pincode'); }
  get password()        { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get acceptTerms()     { return this.registerForm.get('acceptTerms'); }

  get isGovernmentOfficial(): boolean { return this.signInType?.value === 1; }
  get passwordsMatch(): boolean       { return !this.registerForm.hasError('passwordMismatch'); }

  togglePasswordVisibility():        void { this.showPassword        = !this.showPassword; }
  toggleConfirmPasswordVisibility(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit(): void {
    this.errorMessage   = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(k =>
        this.registerForm.get(k)?.markAsTouched()
      );
      return;
    }

    // Extra check: locality member must have valid pincode resolved
    if (!this.isGovernmentOfficial && this.pincodeStatus !== 'success') {
      this.errorMessage = 'Please enter a valid 6-digit pincode to continue.';
      return;
    }

    this.isLoading = true;

    const payload: RegisterRequest = {
      name:            this.fullName?.value,
      email:           this.email?.value,
      phoneNumber:     this.phoneNumber?.value,
      address:         this.address?.value,
      password:        this.password?.value,
      confirmPassword: this.confirmPassword?.value,
      signInType:      this.signInType?.value,
      department:      this.isGovernmentOfficial ? this.department?.value  : undefined,
      pincode:         !this.isGovernmentOfficial ? this.pincode?.value    : undefined,
      city:            !this.isGovernmentOfficial ? this.registerForm.get('city')?.value  : undefined,
      state:           !this.isGovernmentOfficial ? this.registerForm.get('state')?.value : undefined,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Account created! Redirecting to dashboard...';
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  navigateToHome():  void { this.router.navigate(['/']); }
  navigateToLogin(): void { this.router.navigate(['/auth/login']); }
}


