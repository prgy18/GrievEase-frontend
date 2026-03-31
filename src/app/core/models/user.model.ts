/**
 * User Model - Matches backend User entity
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address:string;
  signInType: 'LocalityMember' | 'GovernmentOfficial';
  department?: string;
  profilePictureUrl?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

/**
 * User Role Enum
 */
// export enum UserRole {
//   LocalityMember = 0,
//   GovernmentOfficial = 1
// }

/**
 * Login Request DTO
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register Request DTO
 */
export interface RegisterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address:string;
  password: string;
  confirmPassword: string;
  signInType: 0|1;
  department?: string;
}

/**
 * Auth Response from API
 */
// export interface AuthResponse {
//   token: string;
//   refreshToken?: string;
//   user: User;
//   expiresIn?: number;
// }
/**
 * API Response Wrapper (from backend)
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
}

/**
 * Auth Response Data (inside API wrapper)
 */
export interface AuthResponseData {
  token: string;
  user: User;
}

/**
 * Auth Response from API (wrapped)
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
  errors: any;
}

/**
 * Update Profile Request
 */
export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}