import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GrievanceService } from '../../../../core/services/grievance.service';
import { Grievance, Statistics } from '../../../../core/models/grievance.model';

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  colorClass: string;
  animDelay: string;
}

interface MonthBar {
  month: string;
  submitted: number;
  solved: number;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OverviewComponent implements OnInit {

  isLoading = true;
  errorMessage = '';

  statCards: StatCard[] = [];
  recentGrievances: Grievance[] = [];
  localityGrievances: Grievance[] = [];
  monthlyBars: MonthBar[] = [];
  staleCount = 0;
  maxBarHeight = 1;

  constructor(
    private authService: AuthService,
    private grievanceService: GrievanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isOfficial ? this.loadOfficialData() : this.loadMemberData();
  }

  get isOfficial(): boolean {
    return this.authService.currentUserValue?.signInType === 'GovernmentOfficial';
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  get userName(): string {
    return this.authService.currentUserValue?.name ?? '';
  }

  // ── Member ────────────────────────────────────────────────────
  private loadMemberData(): void {
    this.grievanceService.getMine(1, 100).subscribe({
      next: (res) => {
        const all       = res.data;
        const pending   = all.filter(g => g.status === 'pending').length;
        const inProcess = all.filter(g => g.status === 'in process').length;
        const solved    = all.filter(g => g.status === 'solved').length;

        this.statCards = [
          { label: 'Submitted',  value: all.length, icon: 'fa-clipboard-list', colorClass: 'navy',  animDelay: '0ms'   },
          { label: 'Pending',    value: pending,    icon: 'fa-clock',          colorClass: 'amber', animDelay: '80ms'  },
          { label: 'In Process', value: inProcess,  icon: 'fa-spinner',        colorClass: 'blue',  animDelay: '160ms' },
          { label: 'Solved',     value: solved,     icon: 'fa-check-circle',   colorClass: 'green', animDelay: '240ms' }
        ];

        this.recentGrievances = all.slice(0, 5);
        this.monthlyBars = this.buildMonthlyBars(all);
        this.isLoading = false;
        this.loadLocalityIssues();
      },
      error: () => {
        this.errorMessage = 'Could not load your data. Please refresh.';
        this.isLoading = false;
      }
    });
  }

  private loadLocalityIssues(): void {
    this.grievanceService.getAll({ pageSize: 3, sortBy: 'upvotes' }).subscribe({
      next: (res) => { this.localityGrievances = res.data; }
    });
  }

  // ── Official ──────────────────────────────────────────────────
  private loadOfficialData(): void {
    this.grievanceService.getStatistics().subscribe({
      next: (stats: Statistics) => {
        this.statCards = [
          { label: 'Total',      value: stats.totalGrievances,     icon: 'fa-clipboard-list', colorClass: 'navy',  animDelay: '0ms'   },
          { label: 'Pending',    value: stats.pendingGrievances,   icon: 'fa-clock',          colorClass: 'amber', animDelay: '80ms'  },
          { label: 'In Process', value: stats.inProcessGrievances, icon: 'fa-spinner',        colorClass: 'blue',  animDelay: '160ms' },
          { label: 'Solved',     value: stats.solvedGrievances,    icon: 'fa-check-circle',   colorClass: 'green', animDelay: '240ms' }
        ];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load statistics. Please refresh.';
        this.isLoading = false;
      }
    });

    this.grievanceService.getAll({ pageSize: 5, status: 'pending', sortBy: 'upvotes' })
      .subscribe({ next: (res) => { this.recentGrievances = res.data; } });

    this.grievanceService.getAll({ pageSize: 100, status: 'pending' }).subscribe({
      next: (res) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        this.staleCount = res.data.filter(g => new Date(g.createdAt) < cutoff).length;
      }
    });
  }

  // ── Chart ─────────────────────────────────────────────────────
  private buildMonthlyBars(grievances: Grievance[]): MonthBar[] {
    const months = this.getLast6Months();
    const bars: MonthBar[] = months.map(m => ({ month: m.label, submitted: 0, solved: 0 }));

    grievances.forEach(g => {
      const d = new Date(g.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = months.findIndex(m => m.key === key);
      if (idx !== -1) bars[idx].submitted++;

      if (g.status === 'solved' && g.solvedOn) {
        const s = new Date(g.solvedOn);
        const sk = `${s.getFullYear()}-${s.getMonth()}`;
        const si = months.findIndex(m => m.key === sk);
        if (si !== -1) bars[si].solved++;
      }
    });

    this.maxBarHeight = Math.max(...bars.map(b => b.submitted), 1);
    return bars;
  }

  private getLast6Months(): { key: string; label: string }[] {
    const result = [];
    const now = new Date();
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: labels[d.getMonth()] });
    }
    return result;
  }

  barHeight(value: number): string {
    return Math.max(4, Math.round((value / this.maxBarHeight) * 80)) + 'px';
  }

  // ── Helpers ───────────────────────────────────────────────────
  navigateTo(route: string): void { this.router.navigate([route]); }

  toggleUpvote(grievance: Grievance, event: Event): void {
    event.stopPropagation();
    this.grievanceService.toggleUpvote(grievance.id).subscribe({
      next: (updated) => {
        const idx = this.localityGrievances.findIndex(g => g.id === updated.id);
        if (idx !== -1) this.localityGrievances[idx] = updated;
      }
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  }
}