import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Grievance,
  CreateGrievanceRequest,
  UpdateGrievanceRequest,
  UpdateStatusRequest,
  RequestApprovalRequest,
  RejectResolutionRequest,
  Statistics,
  PaginatedResponse,
  ApiResponse,
  GrievanceFilters
} from '../models/grievance.model';

@Injectable({ providedIn: 'root' })
export class GrievanceService {

  private readonly BASE = `${environment.apiUrl}/grievance`;

  constructor(private http: HttpClient) {}

  // ── GET all grievances ─────────────────────────────────────
  getAll(filters: GrievanceFilters = {}): Observable<PaginatedResponse<Grievance>> {
    let params = new HttpParams();
    if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber);
    if (filters.pageSize)   params = params.set('pageSize',   filters.pageSize);
    if (filters.department) params = params.set('department', filters.department);
    if (filters.status)     params = params.set('status',     filters.status);
    if (filters.locality)   params = params.set('locality',   filters.locality);
    if (filters.pincode)    params = params.set('pincode',    filters.pincode);
    if (filters.city)       params = params.set('city',       filters.city);
    if (filters.name)       params = params.set('name',       filters.name);
    if (filters.sortBy)     params = params.set('sortBy',     filters.sortBy);
    return this.http
      .get<ApiResponse<PaginatedResponse<Grievance>>>(this.BASE, { params })
      .pipe(map(res => res.data));
  }

  // ── GET single grievance ───────────────────────────────────
  getById(id: string): Observable<Grievance> {
    return this.http
      .get<ApiResponse<Grievance>>(`${this.BASE}/${id}`)
      .pipe(map(res => res.data));
  }

  // ── GET current user's own grievances ──────────────────────
  getMine(pageNumber = 1, pageSize = 10): Observable<PaginatedResponse<Grievance>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize',   pageSize);
    return this.http
      .get<ApiResponse<PaginatedResponse<Grievance>>>(`${this.BASE}/my-grievances`, { params })
      .pipe(map(res => res.data));
  }

  // ── POST create ────────────────────────────────────────────
  create(payload: CreateGrievanceRequest): Observable<Grievance> {
    return this.http
      .post<ApiResponse<Grievance>>(this.BASE, payload)
      .pipe(map(res => res.data));
  }

  // ── PUT update details ─────────────────────────────────────
  update(id: string, payload: UpdateGrievanceRequest): Observable<Grievance> {
    return this.http
      .put<ApiResponse<Grievance>>(`${this.BASE}/${id}`, payload)
      .pipe(map(res => res.data));
  }

  // ── DELETE ─────────────────────────────────────────────────
  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.BASE}/${id}`)
      .pipe(map(() => void 0));
  }

  // ── PUT toggle upvote ──────────────────────────────────────
  toggleUpvote(id: string): Observable<Grievance> {
    return this.http
      .put<ApiResponse<Grievance>>(`${this.BASE}/${id}/upvote`, {})
      .pipe(map(res => res.data));
  }

  // ── PUT update status (official: pending → in process only) ─
  updateStatus(id: string, payload: UpdateStatusRequest): Observable<Grievance> {
    return this.http
      .put<ApiResponse<Grievance>>(`${this.BASE}/${id}/status`, payload)
      .pipe(map(res => res.data));
  }

  // ── PUT request approval (official: in process → awaiting approval)
  // Requires solved proof photo
  requestApproval(id: string, payload: RequestApprovalRequest): Observable<Grievance> {
    return this.http
      .put<ApiResponse<Grievance>>(`${this.BASE}/${id}/request-approval`, payload)
      .pipe(map(res => res.data));
  }

  // ── PUT approve resolution (citizen: awaiting approval → solved)
  approveResolution(id: string): Observable<Grievance> {
    return this.http
      .put<ApiResponse<Grievance>>(`${this.BASE}/${id}/approve`, {})
      .pipe(map(res => res.data));
  }

  // ── PUT reject resolution (citizen: awaiting approval → pending)
  // Requires mandatory rejection reason
  rejectResolution(id: string, payload: RejectResolutionRequest): Observable<Grievance> {
    return this.http
      .put<ApiResponse<Grievance>>(`${this.BASE}/${id}/reject`, payload)
      .pipe(map(res => res.data));
  }

  // ── GET statistics (official only) ────────────────────────
  getStatistics(): Observable<Statistics> {
    return this.http
      .get<ApiResponse<Statistics>>(`${this.BASE}/stats`)
      .pipe(map(res => res.data));
  }
}