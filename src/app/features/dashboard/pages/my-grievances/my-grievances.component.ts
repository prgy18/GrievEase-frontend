import { Component, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GrievanceService } from '../../../../core/services/grievance.service';
import { Grievance, GrievanceStatus } from '../../../../core/models/grievance.model';

type FilterTab = 'all' | GrievanceStatus;

@Component({
  selector: 'app-my-grievances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-grievances.component.html',
  styleUrls: ['./my-grievances.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MyGrievancesComponent implements OnInit {

  // ── Data ──────────────────────────────────────────────────────
  allGrievances: Grievance[] = [];
  filtered: Grievance[] = [];

  // ── UI State ──────────────────────────────────────────────────
  isLoading      = true;
  errorMessage   = '';
  activeFilter: FilterTab = 'all';
  searchQuery    = '';
  selectedGrievance: Grievance | null = null;
  panelOpen      = false;

  // ── "Not allowed" toast ───────────────────────────────────────
  showEditNotAllowed = false;

  // ── Delete ────────────────────────────────────────────────────
  deleteTargetId: string | null = null;
  isDeleting = false;

  // ── Pagination ────────────────────────────────────────────────
  currentPage = 1;
  readonly pageSize = 6;
  totalPages  = 1;

  readonly tabs: { key: FilterTab; label: string; icon: string }[] = [
    { key: 'all',                label: 'All',              icon: 'fa-layer-group'    },
    { key: 'pending',            label: 'Pending',          icon: 'fa-clock'          },
    { key: 'in process',         label: 'In Process',       icon: 'fa-spinner'        },
    { key: 'awaiting approval',  label: 'Awaiting',         icon: 'fa-hourglass-half' },
    { key: 'solved',             label: 'Solved',           icon: 'fa-check-circle'   },
  ];

  constructor(
    private grievanceService: GrievanceService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadGrievances(); }

  // ── Load ──────────────────────────────────────────────────────
  loadGrievances(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.grievanceService.getMine(1, 100).subscribe({
      next: (res) => {
        this.allGrievances = res.data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load your grievances. Please refresh.';
        this.isLoading = false;
      }
    });
  }

  // ── Filter / Search / Paginate ────────────────────────────────
  applyFilter(): void {
    let result = [...this.allGrievances];
    if (this.activeFilter !== 'all')
      result = result.filter(g => g.status === this.activeFilter);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(g =>
        g.description.toLowerCase().includes(q) ||
        g.department.toLowerCase().includes(q)  ||
        g.locality.toLowerCase().includes(q)
      );
    }
    this.totalPages  = Math.max(1, Math.ceil(result.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    const start = (this.currentPage - 1) * this.pageSize;
    this.filtered = result.slice(start, start + this.pageSize);
  }

  setFilter(tab: FilterTab): void {
    this.activeFilter = tab; this.currentPage = 1; this.applyFilter();
  }

  onSearch(): void { this.currentPage = 1; this.applyFilter(); }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p; this.applyFilter();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  countFor(tab: FilterTab): number {
    if (tab === 'all') return this.allGrievances.length;
    return this.allGrievances.filter(g => g.status === tab).length;
  }

  // ── Modal ─────────────────────────────────────────────────────
  openPanel(g: Grievance): void {
    this.selectedGrievance = g;
    this.panelOpen = true;
    this.deleteTargetId = null;
    this.showEditNotAllowed = false;
  }

  closePanel(): void {
    this.panelOpen = false;
    this.deleteTargetId = null;
    this.showEditNotAllowed = false;
    setTimeout(() => { this.selectedGrievance = null; }, 280);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.panelOpen) this.closePanel(); }

  // ── Edit ──────────────────────────────────────────────────────
  // Pending   → navigate to submit page with grievance data as router state
  // Non-pending → show inline "editing not allowed" message
  onEditClick(g: Grievance, event: Event): void {
    event.stopPropagation();
    if (g.status === 'pending') {
      // Pass grievance as navigation state — no query params exposed in URL
      this.router.navigate(['/dashboard/submit'], {
        state: { editGrievance: g }
      });
    } else {
      // Show toast inside modal if open, otherwise just show on card
      this.showEditNotAllowed = true;
      setTimeout(() => { this.showEditNotAllowed = false; }, 3000);
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  confirmDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.deleteTargetId = id;
  }

  cancelDelete(event?: Event): void {
    event?.stopPropagation();
    this.deleteTargetId = null;
  }

  executeDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.isDeleting = true;
    this.grievanceService.delete(id).subscribe({
      next: () => {
        this.allGrievances = this.allGrievances.filter(g => g.id !== id);
        this.applyFilter();
        this.isDeleting = false;
        this.deleteTargetId = null;
        if (this.selectedGrievance?.id === id) this.closePanel();
      },
      error: () => {
        this.isDeleting = false;
        this.deleteTargetId = null;
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  daysAgo(d: string): string {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  }

  resolutionDays(g: Grievance): number | null {
    if (!g.solvedOn) return null;
    return Math.floor(
      (new Date(g.solvedOn).getTime() - new Date(g.createdAt).getTime()) / 86400000
    );
  }

  statusStep(s: GrievanceStatus): number {
    return ({ pending: 0, 'in process': 1, solved: 2 } as Record<string, number>)[s] ?? 0;
  }

  canDelete(g: Grievance): boolean { return g.status === 'pending'; }
  canEdit(g: Grievance):   boolean { return g.status === 'pending'; }

  navigateToSubmit(): void { this.router.navigate(['/dashboard/submit']); }

  deptIcon(dept: string): string {
    const map: Record<string, string> = {
      'Water-Works': 'fa-tint', 'Roadways': 'fa-road',
      'Electricity': 'fa-bolt', 'Sanitation': 'fa-trash-alt',
      'Street-Lights': 'fa-lightbulb', 'Drainage': 'fa-water',
    };
    return map[dept] ?? 'fa-building';
  }
}