// ─────────────────────────────────────────────────────────────
// grievance.model.ts
// Mirrors the backend DTOs exactly:
//   GrievanceResponseDto, CreateGrievanceDto, UpdateGrievanceDto,
//   UpdateStatusDto, StatisticsDto, PaginatedResponse<T>
// ─────────────────────────────────────────────────────────────

// ── Matches backend GrievanceResponseDto ──────────────────────
export interface Grievance {
  id: string;
  userId: string;
  userName: string;

  name: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  department: string;
  description: string;
  phoneNumber: string;

  imageUrl: string;
  imagePublicId: string;
  solvedImageUrl: string | null;
  solvedImagePublicId: string | null;

  upvotes: number;
  status: GrievanceStatus;
  priority: GrievancePriority;

  hasUpvoted: boolean;   // Did the current logged-in user upvote this?

  createdAt: string;     // ISO date string from backend
  updatedAt: string;
  solvedOn: string | null;
}

// ── Status & Priority enums matching backend constants ─────────
// Backend: "pending" | "in process" | "solved"
export type GrievanceStatus = 'pending' | 'in process' | 'solved';

// Backend default is "medium"
export type GrievancePriority = 'low' | 'medium' | 'high';

// ── Matches backend CreateGrievanceDto ─────────────────────────
export interface CreateGrievanceRequest {
  name: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  department: string;
  description: string;
  phoneNumber: string;
  imageUrl: string;       // Cloudinary URL — uploaded before calling API
  imagePublicId: string;  // Cloudinary public ID
}

// ── Matches backend UpdateGrievanceDto (all fields optional) ───
export interface UpdateGrievanceRequest {
  name?: string;
  street?: string;
  locality?: string;
  city?: string;
  state?: string;
  department?: string;
  description?: string;
  phoneNumber?: string;
}

// ── Matches backend UpdateStatusDto ───────────────────────────
export interface UpdateStatusRequest {
  status: GrievanceStatus;
  solvedImageUrl?: string;      // Optional — only when marking as solved
  solvedImagePublicId?: string;
}

// ── Matches backend StatisticsDto ─────────────────────────────
export interface Statistics {
  totalGrievances: number;
  pendingGrievances: number;
  inProcessGrievances: number;
  solvedGrievances: number;
  averageResolutionDays: number;
  departmentWiseStats: DepartmentStats[];
  topLocalities: LocalityStats[];
}

export interface DepartmentStats {
  department: string;
  total: number;
  pending: number;
  inProcess: number;
  solved: number;
}

export interface LocalityStats {
  locality: string;
  totalGrievances: number;
  solvedGrievances: number;
}

// ── Matches backend PaginatedResponse<T> ──────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ── Matches backend ApiResponse<T> wrapper ────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// ── Query params for GET /api/grievance ───────────────────────
export interface GrievanceFilters {
  pageNumber?: number;
  pageSize?: number;
  department?: string;
  status?: GrievanceStatus;
  locality?: string;
  sortBy?: 'recent' | 'upvotes' | 'oldest';
}

// ── Valid department values matching backend Departments.cs ────
export const DEPARTMENTS = [
  'Water-Works',
  'Roadways',
  'Electricity',
  'Sanitation',
  'Street-Lights',
  'Drainage'
] as const;

export type Department = typeof DEPARTMENTS[number];