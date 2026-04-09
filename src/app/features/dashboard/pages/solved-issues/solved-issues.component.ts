import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrievanceService } from '../../../../core/services/grievance.service';
import { Grievance } from '../../../../core/models/grievance.model';
import { DEPARTMENTS } from '../../../../core/constants/departments.constants';

type SortOption = 'recent' | 'oldest' | 'upvotes';

@Component({
  selector: 'app-solved-issues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solved-issues.component.html',
  styleUrls: ['./solved-issues.component.css']
})
export class SolvedIssuesComponent implements OnInit {

  grievances:    Grievance[] = [];
  filtered:      Grievance[] = [];
  isLoading      = true;
  errorMessage   = '';
  searchQuery    = '';
  selectedDept   = '';
  sortBy: SortOption = 'recent';

  selectedGrievance: Grievance | null = null;
  modalOpen = false;

  currentPage    = 1;
  readonly pageSize = 9;
  totalPages     = 1;
  totalRecords   = 0;
  thisMonthCount = 0;
  topDept        = '';

  readonly sortOptions: { key: SortOption; label: string; icon: string }[] = [
    { key: 'recent',  label: 'Most Recent',  icon: 'fa-clock'     },
    { key: 'oldest',  label: 'Oldest',       icon: 'fa-hourglass' },
    { key: 'upvotes', label: 'Most Upvoted', icon: 'fa-thumbs-up' },
  ];

  readonly departments = DEPARTMENTS;

  constructor(private grievanceService: GrievanceService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.grievanceService.getAll({
      pageNumber: this.currentPage,
      pageSize:   this.pageSize,
      sortBy:     this.sortBy,
      department: this.selectedDept || undefined,
      status:     'solved'
    }).subscribe({
      next: (res) => {
        this.grievances   = res.data;
        this.totalPages   = res.totalPages;
        this.totalRecords = res.totalRecords;
        this.calcStats();
        this.applyLocalSearch();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load resolved issues. Please refresh.';
        this.isLoading = false;
      }
    });
  }

  calcStats(): void {
    const now = new Date();
    this.thisMonthCount = this.grievances.filter(g => {
      const d = new Date(g.updatedAt ?? g.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const deptCounts: Record<string, number> = {};
    this.grievances.forEach(g => {
      deptCounts[g.department] = (deptCounts[g.department] ?? 0) + 1;
    });
    this.topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
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

  onSearch():     void { this.applyLocalSearch(); }
  onDeptChange(): void { this.currentPage = 1; this.load(); }
  onSort(s: SortOption): void { this.sortBy = s; this.currentPage = 1; this.load(); }

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

  openModal(g: Grievance): void  { this.selectedGrievance = g; this.modalOpen = true; }
  closeModal(): void {
    this.modalOpen = false;
    setTimeout(() => { this.selectedGrievance = null; }, 280);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.modalOpen) this.closeModal(); }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  daysToResolve(g: Grievance): number {
    const filed    = new Date(g.createdAt).getTime();
    const resolved = new Date(g.updatedAt ?? g.createdAt).getTime();
    return Math.max(1, Math.floor((resolved - filed) / 86400000));
  }

  deptIcon(dept: string): string {
    const map: Record<string, string> = {
      'Water-Works':   'fa-tint',      'Roadways':      'fa-road',
      'Electricity':   'fa-bolt',      'Sanitation':    'fa-trash-alt',
      'Street-Lights': 'fa-lightbulb', 'Drainage':      'fa-water',
    };
    return map[dept] ?? 'fa-building';
  }

  deptColor(dept: string): string {
    const map: Record<string, string> = {
      'Water-Works':   '#0369A1', 'Roadways':      '#7C3AED',
      'Electricity':   '#B45309', 'Sanitation':    '#065F46',
      'Street-Lights': '#1D4ED8', 'Drainage':      '#0E7490',
    };
    return map[dept] ?? '#475569';
  }

  trackById(_: number, g: Grievance): string { return g.id; }
}