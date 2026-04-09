import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GrievanceService } from '../../../../core/services/grievance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Grievance } from '../../../../core/models/grievance.model';
import { environment } from '../../../../../environments/environment';

interface CloudinaryResponse { secure_url: string; public_id: string; }

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-approval.component.html',
  styleUrls: ['./pending-approval.component.css']
})
export class PendingApprovalComponent implements OnInit {

  grievances:  Grievance[] = [];
  isLoading    = true;
  errorMessage = '';

  // Modal
  selected:   Grievance | null = null;
  modalOpen   = false;

  // Rejection flow
  showRejectForm   = false;
  rejectionReason  = '';
  isActioning      = false;
  actionSuccess:   string | null = null;
  actionError      = '';

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    // Load only the user's OWN grievances that are awaiting approval
    this.grievanceService.getMine(1, 100).subscribe({
      next: (res) => {
        this.grievances = res.data.filter(g => g.status === 'awaiting approval');
        this.isLoading  = false;
      },
      error: () => {
        this.errorMessage = 'Could not load grievances. Please refresh.';
        this.isLoading = false;
      }
    });
  }

  openModal(g: Grievance): void {
    this.selected       = g;
    this.modalOpen      = true;
    this.showRejectForm = false;
    this.rejectionReason = '';
    this.actionError    = '';
    this.actionSuccess  = null;
  }

  closeModal(): void {
    this.modalOpen = false;
    setTimeout(() => { this.selected = null; }, 280);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.modalOpen) this.closeModal(); }

  // ── Approve ───────────────────────────────────────────────────
  approve(): void {
    if (!this.selected || this.isActioning) return;
    this.isActioning = true;
    this.actionError = '';
    this.grievanceService.approveResolution(this.selected.id).subscribe({
      next: (updated) => {
        this.grievances  = this.grievances.filter(g => g.id !== updated.id);
        this.isActioning = false;
        this.actionSuccess = 'approved';
        setTimeout(() => this.closeModal(), 1800);
      },
      error: (err) => {
        this.isActioning = false;
        this.actionError = err.error?.message || 'Could not approve. Please try again.';
      }
    });
  }

  // ── Reject ────────────────────────────────────────────────────
  openRejectForm(): void { this.showRejectForm = true; }
  cancelReject():   void { this.showRejectForm = false; this.rejectionReason = ''; }

  submitRejection(): void {
    if (!this.selected || this.isActioning) return;
    if (!this.rejectionReason.trim()) {
      this.actionError = 'Please provide a reason for rejection.';
      return;
    }
    this.isActioning = true;
    this.actionError = '';
    this.grievanceService.rejectResolution(this.selected.id, {
      reason: this.rejectionReason.trim()
    }).subscribe({
      next: (updated) => {
        this.grievances  = this.grievances.filter(g => g.id !== updated.id);
        this.isActioning = false;
        this.actionSuccess = 'rejected';
        setTimeout(() => this.closeModal(), 1800);
      },
      error: (err) => {
        this.isActioning = false;
        this.actionError = err.error?.message || 'Could not reject. Please try again.';
      }
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN',
      { day: '2-digit', month: 'short', year: 'numeric' });
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