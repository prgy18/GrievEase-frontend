export interface User {
  id:          string;
  name:        string;
  email:       string;
  phoneNumber: string;
  address:     string;
  signInType:  'LocalityMember' | 'GovernmentOfficial';
  department?: string;  // GovernmentOfficial only
  pincode?:    string;  // LocalityMember only
  city?:       string;  // LocalityMember only — used for upvote city scoping
  state?:      string;  // LocalityMember only
  isActive:    boolean;
  lastLogin?:  string;
  createdAt:   string;
}

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface RegisterRequest {
  name:            string;
  email:           string;
  phoneNumber:     string;
  address:         string;
  password:        string;
  confirmPassword: string;
  signInType:      0 | 1;
  department?:     string;  // required for officials
  pincode?:        string;  // required for members
  city?:           string;  // required for members — auto-filled from pincode lookup
  state?:          string;  // required for members — auto-filled from pincode lookup
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
  errors:  string[] | null;
}

export interface AuthResponseData {
  token: string;
  user:  User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data:    AuthResponseData;
  errors:  string[] | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
}