import { Component, Input, OnInit, OnChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GrievanceService } from '../../../../core/services/grievance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Grievance, GrievanceStatus, UpdateStatusRequest } from '../../../../core/models/grievance.model';
import { DEPARTMENTS } from '../../../../core/constants/departments.constants';
import { environment } from '../../../../../environments/environment';

interface CloudinaryResponse { secure_url: string; public_id: string; }

export type OfficialMode = 'all' | 'pending' | 'in-process' | 'awaiting-approval' | 'solved';
type SortOption = 'recent' | 'oldest' | 'upvotes';

@Component({
  selector: 'app-official-grievances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './official-grievances.component.html',
  styleUrls: ['./official-grievances.component.css']
})
export class OfficialGrievancesComponent implements OnInit, OnChanges {

  @Input() mode: OfficialMode = 'all';

  grievances:  Grievance[] = [];
  filtered:    Grievance[] = [];
  isLoading    = true;
  errorMessage = '';
  searchQuery  = '';
  sortBy: SortOption = 'recent';

  // Status filter for "all" mode — empty string means no filter
  statusFilter: GrievanceStatus | '' = '';

  // Modal
  selectedGrievance: Grievance | null = null;
  modalOpen  = false;
  // Inline status update confirm
  confirmingId:  string | null = null;
  isUpdating     = false;
  updateSuccess: string | null = null;

  // Solved image upload (shown when marking as solved)
  solvedImageFile:      File | null = null;
  solvedImagePreview:   string | null = null;
  solvedImageUrl        = '';
  solvedImagePublicId   = '';
  solvedUploadStatus: 'idle' | 'uploading' | 'done' | 'error' = 'idle';

  currentPage  = 1;
  readonly pageSize = 9;
  totalPages   = 1;
  totalRecords = 0;

  deptName    = '';
  private initialised = false;

  readonly sortOptions: { key: SortOption; label: string; icon: string }[] = [
    { key: 'recent',  label: 'Most Recent',  icon: 'fa-clock'     },
    { key: 'oldest',  label: 'Oldest',       icon: 'fa-hourglass' },
    { key: 'upvotes', label: 'Most Upvoted', icon: 'fa-thumbs-up' },
  ];

  readonly departments = DEPARTMENTS;

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Set deptName in constructor so it's available when ngOnChanges
    // fires (which happens BEFORE ngOnInit in Angular's lifecycle).
    this.deptName = this.authService.currentUserValue?.department ?? '';
  }

  ngOnInit(): void {
    this.initialised = true;
    this.load();
  }

  ngOnChanges(): void {
    this.currentPage  = 1;
    this.searchQuery  = '';
    this.statusFilter = '';
    // Guard: ngOnChanges fires before ngOnInit on first render.
    // Only reload here for subsequent @Input changes, not the first render.
    if (this.initialised) this.load();
  }

  // ── Config per mode ───────────────────────────────────────────
  get config(): { title: string; sub: string; icon: string; accentClass: string } {
    switch (this.mode) {
      case 'pending':           return { title: 'Pending Grievances',   sub: 'Complaints waiting for your department to take action.',          icon: 'fa-clock',           accentClass: 'accent--indigo'  };
      case 'in-process':        return { title: 'In Process',           sub: 'Complaints your department is actively working on.',              icon: 'fa-cog',             accentClass: 'accent--teal'    };
      case 'awaiting-approval': return { title: 'Awaiting Approval',    sub: 'Sent to citizens for approval — waiting for their verdict.',      icon: 'fa-hourglass-half',  accentClass: 'accent--amber'   };
      case 'solved':            return { title: 'Solved Grievances',    sub: 'Grievances confirmed as resolved by citizens.',                   icon: 'fa-check-circle',    accentClass: 'accent--green'   };
      default:                  return { title: 'All Grievances',       sub: 'All complaints filed under your department.',                     icon: 'fa-list-alt',        accentClass: 'accent--navy'    };
    }
  }

  get statusForApi(): GrievanceStatus | undefined {
    if (this.mode === 'pending')           return 'pending';
    if (this.mode === 'in-process')        return 'in process';
    if (this.mode === 'awaiting-approval') return 'awaiting approval';
    if (this.mode === 'solved')            return 'solved';
    if (this.mode === 'all' && this.statusFilter) return this.statusFilter as GrievanceStatus;
    return undefined;
  }

  // ── Load ──────────────────────────────────────────────────────
  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.grievanceService.getAll({
      pageNumber:  this.currentPage,
      pageSize:    this.pageSize,
      sortBy:      this.sortBy,
      status:      this.statusForApi,
      department:  this.deptName || undefined,
    }).subscribe({
      next: (res) => {
        this.grievances   = res.data;
        this.totalPages   = res.totalPages;
        this.totalRecords = res.totalRecords;
        this.applyLocalSearch();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load grievances. Please refresh.';
        this.isLoading = false;
      }
    });
  }

  applyLocalSearch(): void {
    if (!this.searchQuery.trim()) { this.filtered = this.grievances; return; }
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.grievances.filter(g =>
      g.description.toLowerCase().includes(q) ||
      g.locality.toLowerCase().includes(q)    ||
      g.city.toLowerCase().includes(q)        ||
      g.userName.toLowerCase().includes(q)
    );
  }

  onSearch():       void { this.applyLocalSearch(); }
  onSort(s: SortOption): void { this.sortBy = s; this.currentPage = 1; this.load(); }
  onStatusFilter(): void { this.currentPage = 1; this.load(); }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p; this.searchQuery = ''; this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageNumbers(): number[] {
    const start = Math.max(1, this.currentPage - 2);
    const end   = Math.min(this.totalPages, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // ── Status update ─────────────────────────────────────────────
  actionLabel(g: Grievance): string | null {
    if (g.status === 'pending')    return 'Mark In Process';
    if (g.status === 'in process') return 'Mark Awaiting Approval';
    // awaiting approval and solved — no action for official
    return null;
  }

  nextStatus(g: Grievance): GrievanceStatus | null {
    if (g.status === 'pending')    return 'in process';
    // in process → handled by requestApproval endpoint, not updateStatus
    return null;
  }

  // Whether this is a "request approval" action (requires photo upload)
  isRequestApprovalAction(g: Grievance): boolean {
    return g.status === 'in process';
  }

  requestConfirm(id: string, g: Grievance, event: Event): void {
    event.stopPropagation();
    this.confirmingId       = id;
    // Reset solved image state each time a new confirm is opened
    this.solvedImageFile    = null;
    this.solvedImagePreview = null;
    this.solvedImageUrl     = '';
    this.solvedImagePublicId = '';
    this.solvedUploadStatus = 'idle';
  }

  cancelConfirm(event: Event): void {
    event.stopPropagation();
    this.confirmingId       = null;
    this.solvedImageFile    = null;
    this.solvedImagePreview = null;
    this.solvedImageUrl     = '';
    this.solvedImagePublicId = '';
    this.solvedUploadStatus = 'idle';
  }

  // Called when official picks a solved-proof image
  onSolvedImagePick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.solvedImageFile = file;

    // Local preview
    const reader = new FileReader();
    reader.onload = (e) => { this.solvedImagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);

    // Upload to Cloudinary immediately
    this.solvedUploadStatus = 'uploading';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);
    const url = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;
    this.http.post<CloudinaryResponse>(url, formData).subscribe({
      next: (res) => {
        this.solvedImageUrl      = res.secure_url;
        this.solvedImagePublicId = res.public_id;
        this.solvedUploadStatus  = 'done';
      },
      error: () => { this.solvedUploadStatus = 'error'; }
    });
  }

  removeSolvedImage(event: Event): void {
    event.stopPropagation();
    this.solvedImageFile    = null;
    this.solvedImagePreview = null;
    this.solvedImageUrl     = '';
    this.solvedImagePublicId = '';
    this.solvedUploadStatus = 'idle';
  }

  get canConfirmUpdate(): boolean {
    if (this.solvedUploadStatus === 'uploading') return false;
    // Photo is required when moving in process → awaiting approval
    const g = this.grievances.find(x => x.id === this.confirmingId)
           ?? this.selectedGrievance;
    if (g?.status === 'in process') {
      return this.solvedUploadStatus === 'done';
    }
    return true;
  }

  confirmUpdate(g: Grievance, event: Event): void {
    event.stopPropagation();
    if (this.isUpdating || !this.canConfirmUpdate) return;
    this.isUpdating = true;

    // in process → awaiting approval (requires photo)
    if (g.status === 'in process') {
      this.grievanceService.requestApproval(g.id, {
        solvedImageUrl:      this.solvedImageUrl,
        solvedImagePublicId: this.solvedImagePublicId,
      }).subscribe({
        next: (updated) => this.handleUpdateSuccess(updated),
        error: () => { this.isUpdating = false; }
      });
      return;
    }

    // pending → in process (simple status update)
    const newStatus = this.nextStatus(g);
    if (!newStatus) { this.isUpdating = false; return; }
    const payload: UpdateStatusRequest = { status: newStatus };
    this.grievanceService.updateStatus(g.id, payload).subscribe({
      next: (updated) => this.handleUpdateSuccess(updated),
      error: () => { this.isUpdating = false; }
    });
  }

  private handleUpdateSuccess(updated: Grievance): void {
    const patch = (arr: Grievance[]) => {
      const i = arr.findIndex(x => x.id === updated.id);
      if (i !== -1) arr[i] = updated;
    };
    patch(this.grievances);
    patch(this.filtered);
    if (this.selectedGrievance?.id === updated.id) this.selectedGrievance = updated;
    this.confirmingId        = null;
    this.isUpdating          = false;
    this.solvedImageFile     = null;
    this.solvedImagePreview  = null;
    this.solvedImageUrl      = '';
    this.solvedImagePublicId = '';
    this.solvedUploadStatus  = 'idle';
    this.updateSuccess = updated.id;
    setTimeout(() => { this.updateSuccess = null; }, 2500);
    if (this.mode !== 'all') setTimeout(() => this.load(), 800);
  }

  // ── Modal ─────────────────────────────────────────────────────
  openModal(g: Grievance): void { this.selectedGrievance = g; this.modalOpen = true; }
  closeModal(): void {
    this.modalOpen          = false;
    this.confirmingId       = null;
    this.solvedImageFile    = null;
    this.solvedImagePreview = null;
    this.solvedImageUrl     = '';
    this.solvedImagePublicId = '';
    this.solvedUploadStatus = 'idle';
    setTimeout(() => { this.selectedGrievance = null; }, 280);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.modalOpen) this.closeModal(); }

  // ── Helpers ───────────────────────────────────────────────────
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  daysAgo(d: string): string {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 30)  return `${diff}d ago`;
    return this.formatDate(d);
  }

  deptIcon(dept: string): string {
    const map: Record<string, string> = {
      'Water-Works': 'fa-tint', 'Roadways': 'fa-road',
      'Electricity': 'fa-bolt', 'Sanitation': 'fa-trash-alt',
      'Street-Lights': 'fa-lightbulb', 'Drainage': 'fa-water',
    };
    return map[dept] ?? 'fa-building';
  }

  trackById(_: number, g: Grievance): string { return g.id; }
}