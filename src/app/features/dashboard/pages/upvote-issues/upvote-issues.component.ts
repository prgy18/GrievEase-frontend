import { Component, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrievanceService } from '../../../../core/services/grievance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Grievance, GrievanceStatus } from '../../../../core/models/grievance.model';
import { DEPARTMENTS } from '../../../../core/constants/departments.constants';

type SortOption = 'upvotes' | 'recent' | 'oldest';

@Component({
  selector: 'app-upvote-issues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upvote-issues.component.html',
  styleUrls: ['./upvote-issues.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UpvoteIssuesComponent implements OnInit {

  grievances:   Grievance[] = [];
  filtered:     Grievance[] = [];
  isLoading     = true;
  errorMessage  = '';
  searchQuery   = '';
  selectedDept  = '';
  sortBy: SortOption = 'upvotes';
  selectedGrievance: Grievance | null = null;
  modalOpen     = false;
  upvotingId:   string | null = null;

  // Locality member's pincode — used to scope grievances
  userPincode   = '';
  userCity      = '';

  currentPage   = 1;
  readonly pageSize = 9;
  totalPages    = 1;
  totalRecords  = 0;

  readonly sortOptions: { key: SortOption; label: string; icon: string }[] = [
    { key: 'upvotes', label: 'Most Voted',   icon: 'fa-fire'      },
    { key: 'recent',  label: 'Latest',       icon: 'fa-clock'     },
    { key: 'oldest',  label: 'Oldest',       icon: 'fa-hourglass' },
  ];

  readonly departments = DEPARTMENTS;

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user       = this.authService.currentUserValue;
    this.userPincode = user?.pincode ?? '';
    this.userCity    = user?.city    ?? '';
    this.load();
  }

  isOwnGrievance(g: Grievance): boolean {
    return g.userId === this.authService.currentUserValue?.id;
  }

  // City-scoped upvote guard
  // Cannot upvote: own grievance OR grievance from different city
  canUpvote(g: Grievance): boolean {
    if (this.isOwnGrievance(g)) return false;
    if (this.userCity && g.city.toLowerCase() !== this.userCity.toLowerCase()) return false;
    return true;
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.grievanceService.getAll({
      pageNumber: this.currentPage,
      pageSize:   this.pageSize,
      sortBy:     this.sortBy,
      department: this.selectedDept || undefined,
      city:       this.userCity     || undefined,   // scope to user's city server-side
      status:     'pending'
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
      g.city.toLowerCase().includes(q)
    );
  }

  onSearch():    void { this.applyLocalSearch(); }
  onDeptChange():void { this.currentPage = 1; this.load(); }
  onSort(s: SortOption): void { this.sortBy = s; this.currentPage = 1; this.load(); }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p; this.searchQuery = ''; this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageNumbers(): number[] {
    const range = 2;
    const start = Math.max(1, this.currentPage - range);
    const end   = Math.min(this.totalPages, this.currentPage + range);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // ── Upvote ────────────────────────────────────────────────────
  toggleUpvote(g: Grievance, event: Event): void {
    event.stopPropagation();
    if (!this.canUpvote(g) || this.upvotingId === g.id) return;
    this.upvotingId = g.id;
    this.grievanceService.toggleUpvote(g.id).subscribe({
      next: (updated) => {
        const patch = (arr: Grievance[]) => {
          const i = arr.findIndex(x => x.id === updated.id);
          if (i !== -1) arr[i] = updated;
        };
        patch(this.grievances);
        patch(this.filtered);
        if (this.selectedGrievance?.id === updated.id) this.selectedGrievance = updated;
        if (this.sortBy === 'upvotes')
          this.filtered = [...this.filtered].sort((a, b) => b.upvotes - a.upvotes);
        this.upvotingId = null;
      },
      error: () => { this.upvotingId = null; }
    });
  }

  // ── Modal ─────────────────────────────────────────────────────
  openModal(g: Grievance): void { this.selectedGrievance = g; this.modalOpen = true; }
  closeModal(): void {
    this.modalOpen = false;
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
  deptColor(dept: string): string {
    const map: Record<string, string> = {
      'Water-Works':   '#0369A1',   // deep ocean blue
      'Roadways':      '#7C3AED',   // rich violet
      'Electricity':   '#B45309',   // warm amber-brown (not neon yellow)
      'Sanitation':    '#065F46',   // deep teal-green
      'Street-Lights': '#1D4ED8',   // solid royal blue (was garish orange)
      'Drainage':      '#0E7490',   // slate teal
    };
    return map[dept] ?? '#475569';
  }
  trackById(_: number, g: Grievance): string { return g.id; }
}