export interface Grievance {
  id:         string;
  userId:     string;
  userName:   string;

  name:        string;
  street:      string;
  locality:    string;
  city:        string;
  state:       string;
  pincode:     string;
  department:  string;
  description: string;
  phoneNumber: string;

  imageUrl:            string;
  imagePublicId:       string;
  solvedImageUrl:      string | null;
  solvedImagePublicId: string | null;

  upvotes:    number;
  status:     GrievanceStatus;
  priority:   GrievancePriority;
  hasUpvoted: boolean;

  // Rejection fields — set when citizen rejects the resolution
  wasRejected?:     boolean;
  rejectionReason?: string | null;

  createdAt: string;
  updatedAt: string;
  solvedOn:  string | null;
}

// 4 statuses now
export type GrievanceStatus =
  'pending' | 'in process' | 'awaiting approval' | 'solved';

export type GrievancePriority = 'low' | 'medium' | 'high';

export interface CreateGrievanceRequest {
  name:         string;
  street:       string;
  locality:     string;
  city:         string;
  state:        string;
  pincode:      string;
  department:   string;
  description:  string;
  phoneNumber:  string;
  imageUrl:     string;
  imagePublicId: string;
}

export interface UpdateGrievanceRequest {
  name?:        string;
  street?:      string;
  locality?:    string;
  city?:        string;
  state?:       string;
  department?:  string;
  description?: string;
  phoneNumber?: string;
}

// Used by official for pending → in process only
export interface UpdateStatusRequest {
  status: GrievanceStatus;
}

// Official sends for citizen approval (in process → awaiting approval)
export interface RequestApprovalRequest {
  solvedImageUrl:       string;
  solvedImagePublicId?: string;
}

// Citizen rejects with mandatory reason (awaiting approval → pending)
export interface RejectResolutionRequest {
  reason: string;
}

export interface Statistics {
  totalGrievances:     number;
  pendingGrievances:   number;
  inProcessGrievances: number;
  solvedGrievances:    number;
  averageResolutionDays: number;
  departmentWiseStats: DepartmentStats[];
  topLocalities:       LocalityStats[];
  myDepartment?:       DepartmentStats;
}

export interface DepartmentStats {
  department: string;
  total:      number;
  pending:    number;
  inProcess:  number;
  solved:     number;
}

export interface LocalityStats {
  locality:         string;
  totalGrievances:  number;
  solvedGrievances: number;
}

export interface GrievanceFilters {
  pageNumber?: number;
  pageSize?:   number;
  department?: string;
  status?:     GrievanceStatus;
  locality?:   string;
  pincode?:    string;
  city?:       string;
  name?:       string;  // filter by submitter name
  sortBy?:     'recent' | 'upvotes' | 'oldest';
}

export interface PaginatedResponse<T> {
  data:         T[];
  pageNumber:   number;
  pageSize:     number;
  totalRecords: number;
  totalPages:   number;
}

export const DEPARTMENTS = [
  'Water-Works', 'Roadways', 'Electricity',
  'Sanitation', 'Street-Lights', 'Drainage'
];

// Re-export ApiResponse here so grievance components can import it
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
  errors:  string[] | null;
}