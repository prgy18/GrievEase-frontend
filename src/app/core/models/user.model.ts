/**
 * User Model - Matches backend User entity
 */
export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address:string;
  role: UserRole;
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
export enum UserRole {
  LocalityMember = 'LocalityMember',
  GovernmentOfficial = 'GovernmentOfficial',
  Admin = 'Admin'
}

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
  role: UserRole;
  department?: string;
}

/**
 * Auth Response from API
 */
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
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