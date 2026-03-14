import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, RegisterRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  // User roles
  userRoles = [
    { value: UserRole.LocalityMember, label: 'Locality Member', description: 'Report civic issues in your area' },
    { value: UserRole.GovernmentOfficial, label: 'Government Official', description: 'Manage and resolve grievances' }
  ];

  // Government departments
  departments = [
    'Water Works',
    'Road & Infrastructure',
    'Garbage Management',
    'Electricity',
    'Public Safety',
    'Parks & Gardens',
    'Health & Sanitation',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If already logged in, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Initialize register form
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      role: [UserRole.LocalityMember, [Validators.required]],
      department: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Listen to role changes to set department validators
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const departmentControl = this.registerForm.get('department');
      
      if (role === UserRole.GovernmentOfficial) {
        departmentControl?.setValidators([Validators.required]);
      } else {
        departmentControl?.clearValidators();
        departmentControl?.setValue('');
      }
      
      departmentControl?.updateValueAndValidity();
    });
  }

  // Custom validator for password match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Getters for form controls
  get fullName() {
    return this.registerForm.get('fullName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get phoneNumber() {
    return this.registerForm.get('phoneNumber');
  }

  get role() {
    return this.registerForm.get('role');
  }

  get department() {
    return this.registerForm.get('department');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get acceptTerms() {
    return this.registerForm.get('acceptTerms');
  }

  // Check if passwords match
  get passwordsMatch(): boolean {
    return !this.registerForm.hasError('passwordMismatch');
  }

  // Check if role is Government Official
  get isGovernmentOfficial(): boolean {
    return this.role?.value === UserRole.GovernmentOfficial;
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Toggle confirm password visibility
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Handle form submission
  onSubmit(): void {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate form
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Set loading state
    this.isLoading = true;

    // Prepare register data
    const registerData: RegisterRequest = {
      fullName: this.fullName?.value,
      email: this.email?.value,
      phoneNumber: this.phoneNumber?.value,
      password: this.password?.value,
      confirmPassword: this.confirmPassword?.value,
      role: this.role?.value,
      department: this.isGovernmentOfficial ? this.department?.value : undefined
    };

    // Call auth service
    this.authService.register(registerData).subscribe({
      next: (response) => {
        // Registration successful
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting to dashboard...';

        // Navigate to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        // Registration failed
        this.isLoading = false;

        // Set error message
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.errors) {
          // Validation errors from backend
          const errors = Object.values(error.error.errors).flat();
          this.errorMessage = errors.join(', ');
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }

        console.error('Registration error:', error);
      }
    });
  }

  // Navigate to home
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  // Navigate to login
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
