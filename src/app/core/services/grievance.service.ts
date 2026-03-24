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
  Statistics,
  PaginatedResponse,
  ApiResponse,
  GrievanceFilters
} from '../models/grievance.model';

@Injectable({
  providedIn: 'root'
})
export class GrievanceService {

  private readonly BASE = `${environment.apiUrl}/grievance`;

  // The auth interceptor (built next) automatically attaches
  // the Bearer token to every request — no manual headers needed.
  constructor(private http: HttpClient) {}

  // ── GET all grievances with optional filters ───────────────
  // Calls: GET /api/grievance?pageNumber=1&pageSize=10&...
  getAll(filters: GrievanceFilters = {}): Observable<PaginatedResponse<Grievance>> {
    let params = new HttpParams();

    if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber);
    if (filters.pageSize)   params = params.set('pageSize', filters.pageSize);
    if (filters.department) params = params.set('department', filters.department);
    if (filters.status)     params = params.set('status', filters.status);
    if (filters.locality)   params = params.set('locality', filters.locality);
    if (filters.sortBy)     params = params.set('sortBy', filters.sortBy);

    return this.http
      .get<ApiResponse<PaginatedResponse<Grievance>>>(this.BASE, { params })
      .pipe(map(res => res.data));
  }

  // ── GET single grievance by ID ─────────────────────────────
  // Calls: GET /api/grievance/:id
  getById(id: string): Observable<Grievance> {
    return this.http
      .get<ApiResponse<Grievance>>(`${this.BASE}/${id}`)
      .pipe(map(res => res.data));
  }

  // ── GET current user's own grievances ──────────────────────
  // Calls: GET /api/grievance/my-grievances
  getMine(pageNumber = 1, pageSize = 10): Observable<PaginatedResponse<Grievance>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http
      .get<ApiResponse<PaginatedResponse<Grievance>>>(`${this.BASE}/my-grievances`, { params })
      .pipe(map(res => res.data));
  }

  // ── POST create new grievance ──────────────────────────────
  // Calls: POST /api/grievance
  create(payload: CreateGrievanceRequest): Observable<Grievance> {
    return this.http
      .post<ApiResponse<Grievance>>(this.BASE, payload)
      .pipe(map(res => res.data));
  }

  // ── PUT update grievance details (creator only) ────────────
  // Calls: PUT /api/grievance/:id
  update(id: string, payload: UpdateGrievanceRequest): Observable<Grievance> {
    return this.http
      .put<ApiResponse<Grievance>>(`${this.BASE}/${id}`, payload)
      .pipe(map(res => res.data));
  }

  // ── DELETE grievance (creator only, pending status only) ───
  // Calls: DELETE /api/grievance/:id
  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.BASE}/${id}`)
      .pipe(map(() => void 0));
  }

  // ── PUT toggle upvote ──────────────────────────────────────
  // Calls: PUT /api/grievance/:id/upvote
  // Returns updated grievance with new upvote count + hasUpvoted
  toggleUpvote(id: string): Observable<Grievance> {
    return this.http
      .put<ApiResponse<Grievance>>(`${this.BASE}/${id}/upvote`, {})
      .pipe(map(res => res.data));
  }

  // ── PUT update status (government official only) ───────────
  // Calls: PUT /api/grievance/:id/status
  updateStatus(id: string, payload: UpdateStatusRequest): Observable<Grievance> {
    return this.http
      .put<ApiResponse<Grievance>>(`${this.BASE}/${id}/status`, payload)
      .pipe(map(res => res.data));
  }

  // ── GET search grievances by keyword ──────────────────────
  // Calls: GET /api/grievance/search?query=pothole
  search(query: string, pageNumber = 1, pageSize = 10): Observable<PaginatedResponse<Grievance>> {
    const params = new HttpParams()
      .set('query', query)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http
      .get<ApiResponse<PaginatedResponse<Grievance>>>(`${this.BASE}/search`, { params })
      .pipe(map(res => res.data));
  }

  // ── GET solved grievances ──────────────────────────────────
  // Calls: GET /api/grievance/solved
  getSolved(pageNumber = 1, pageSize = 10): Observable<PaginatedResponse<Grievance>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http
      .get<ApiResponse<PaginatedResponse<Grievance>>>(`${this.BASE}/solved`, { params })
      .pipe(map(res => res.data));
  }

  // ── GET platform statistics (government official only) ─────
  // Calls: GET /api/grievance/stats
  getStatistics(): Observable<Statistics> {
    return this.http
      .get<ApiResponse<Statistics>>(`${this.BASE}/stats`)
      .pipe(map(res => res.data));
  }
}