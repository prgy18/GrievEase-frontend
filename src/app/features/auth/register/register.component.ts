
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule, AbstractControl, ValidationErrors
} from '@angular/forms';
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

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  departments: Department[] = DEPARTMENTS;
  // ── Role options ──────────────────────────────────────────────
  // value matches backend SignInType enum:
  //   LocalityMember = 0, GovernmentOfficial = 1
  userRoles = [
    {
      value: 0,
      key: 'LocalityMember',
      label: 'Locality Member',
      description: 'Report civic issues in your area'
    },
    {
      value: 1,
      key: 'GovernmentOfficial',
      label: 'Government Official',
      description: 'Manage and resolve grievances'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({});
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      // Default to 0 (LocalityMember)
      signInType: [0, Validators.required],
      department: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
    this.signInType!.valueChanges.subscribe((value: number) => {
      const deptControl = this.registerForm.get('department')!;
      if (value === 1) {
        deptControl.setValidators([Validators.required, this.validDepartmentValidator]);
      } else {
        deptControl.clearValidators();
        deptControl.setValue('');
      }
      deptControl.updateValueAndValidity();
    });
    
  }
validDepartmentValidator(ctrl: AbstractControl): ValidationErrors | null {
    if (!ctrl.value) return null;
    return DEPARTMENT_VALUES.includes(ctrl.value) ? null : { invalidDepartment: true };
  }

  // ── Password match validator ──────────────────────────────────
  passwordMatchValidator(ctrl: AbstractControl): ValidationErrors | null {
    const pw = ctrl.get('password');
    const cpw = ctrl.get('confirmPassword');
    if (!pw || !cpw) return null;
    return pw.value === cpw.value ? null : { passwordMismatch: true };
  }

  // ── Getters ───────────────────────────────────────────────────
  get fullName() { return this.registerForm.get('fullName'); }
  get email() { return this.registerForm.get('email'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get address() { return this.registerForm.get('address'); }
  get signInType() { return this.registerForm.get('signInType'); }
  get department()      { return this.registerForm.get('department'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }
  get passwordsMatch(): boolean { return !this.registerForm.hasError('passwordMismatch'); }

  get isGovernmentOfficial(): boolean {
    return this.signInType?.value === 1;
  }

  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  // ── Submit ────────────────────────────────────────────────────
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(k =>
        this.registerForm.get(k)?.markAsTouched()
      );
      return;
    }

    this.isLoading = true;

    // ── KEY FIX ────────────────────────────────────────────────
    // Old code sent: { role: 'LocalityMember' }  ← string, wrong field name
    // Fix sends:    { signInType: 0 }             ← integer matching C# enum
    const payload: RegisterRequest = {
      name: this.fullName?.value,
      email: this.email?.value,
      phoneNumber: this.phoneNumber?.value,
      address: this.address?.value,
      password: this.password?.value,
      confirmPassword: this.confirmPassword?.value,
      signInType: this.signInType?.value  , // 0 or 1
      department:      this.isGovernmentOfficial ? this.department?.value : undefined
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

  navigateToHome(): void { this.router.navigate(['/']); }
  navigateToLogin(): void { this.router.navigate(['/auth/login']); }
}