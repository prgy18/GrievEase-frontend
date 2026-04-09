import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GrievanceService } from '../../../../core/services/grievance.service';
import { Grievance, Statistics } from '../../../../core/models/grievance.model';

interface StatCard {
  label: string; value: number | string;
  icon: string; colorClass: string; animDelay: string;
}
interface MonthBar { month: string; submitted: number; solved: number; }

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OverviewComponent implements OnInit {

  isLoading     = true;
  errorMessage  = '';
  statCards:    StatCard[]  = [];
  trendingGrievances: Grievance[] = [];  // top upvoted — read-only in overview
  recentGrievances:   Grievance[] = [];  // member's own recent submissions
  monthlyBars:  MonthBar[] = [];
  staleCount    = 0;
  awaitingApprovalCount = 0;  // member's grievances awaiting their approval
  maxBarHeight  = 1;
  deptName          = '';
  deptResolutionRate = 0;

  constructor(
    private authService: AuthService,
    private grievanceService: GrievanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.deptName = this.authService.currentUserValue?.department ?? '';
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
  get userName(): string { return this.authService.currentUserValue?.name ?? ''; }

  // ── Member ─────────────────────────────────────────────────────
  private loadMemberData(): void {
    // Load member's own grievances for stat cards + trend chart
    this.grievanceService.getMine(1, 100).subscribe({
      next: (res) => {
        const all       = res.data;
        const pending   = all.filter(g => g.status === 'pending').length;
        const inProcess = all.filter(g => g.status === 'in process').length;
        const awaiting  = all.filter(g => g.status === 'awaiting approval').length;
        const solved    = all.filter(g => g.status === 'solved').length;
        this.awaitingApprovalCount = awaiting;
        this.statCards = [
          { label: 'Submitted',        value: all.length, icon: 'fa-clipboard-list',  colorClass: 'navy',    animDelay: '0ms'   },
          { label: 'Pending',          value: pending,    icon: 'fa-clock',            colorClass: 'amber',   animDelay: '80ms'  },
          { label: 'In Process',       value: inProcess,  icon: 'fa-spinner',          colorClass: 'blue',    animDelay: '160ms' },
          { label: 'Awaiting Approval',value: awaiting,   icon: 'fa-hourglass-half',   colorClass: 'orange',  animDelay: '220ms' },
          { label: 'Solved',           value: solved,     icon: 'fa-check-circle',     colorClass: 'green',   animDelay: '300ms' },
        ];
        this.recentGrievances = all.slice(0, 5);
        this.monthlyBars      = this.buildMonthlyBars(all);
        this.isLoading        = false;
      },
      error: () => { this.errorMessage = 'Could not load your data. Please refresh.'; this.isLoading = false; }
    });

    // Top trending — ALL grievances platform-wide sorted by upvotes
    // Read-only in overview — upvoting only allowed in Upvote Issues page
    this.grievanceService.getAll({ pageSize: 5, sortBy: 'upvotes' }).subscribe({
      next: (res) => { this.trendingGrievances = res.data; }
    });

    // Count member's grievances awaiting their approval — for alert banner
    this.grievanceService.getMine(1, 100).subscribe({
      next: (res) => {
        this.awaitingApprovalCount = res.data
          .filter(g => g.status === 'awaiting approval').length;
      }
    });
  }

  // ── Official ──────────────────────────────────────────────────
  private loadOfficialData(): void {
    // Dept-scoped statistics — find official's dept in departmentWiseStats
    this.grievanceService.getStatistics().subscribe({
      next: (stats: Statistics) => {
        // Find this official's dept entry from the dept breakdown
        const deptStats = stats.departmentWiseStats
          .find(d => d.department === this.deptName);

        // Use dept-specific numbers if found, else fall back to platform totals
        this.statCards = [
          { label: 'Total',      value: deptStats?.total    ?? stats.totalGrievances,     icon: 'fa-clipboard-list', colorClass: 'navy',  animDelay: '0ms'   },
          { label: 'Pending',    value: deptStats?.pending   ?? stats.pendingGrievances,   icon: 'fa-clock',          colorClass: 'amber', animDelay: '80ms'  },
          { label: 'In Process', value: deptStats?.inProcess ?? stats.inProcessGrievances, icon: 'fa-spinner',        colorClass: 'blue',  animDelay: '160ms' },
          { label: 'Solved',     value: deptStats?.solved    ?? stats.solvedGrievances,    icon: 'fa-check-circle',   colorClass: 'green', animDelay: '240ms' },
        ];

        // Resolution rate for dept
        const total  = deptStats?.total  ?? stats.totalGrievances;
        const solved = deptStats?.solved ?? stats.solvedGrievances;
        this.deptResolutionRate = total > 0 ? Math.round((solved / total) * 100) : 0;

        this.isLoading = false;
      },
      error: () => { this.errorMessage = 'Could not load statistics. Please refresh.'; this.isLoading = false; }
    });

    // Top trending in official's DEPT — all statuses, sorted by upvotes
    this.grievanceService.getAll({
      pageSize: 5, sortBy: 'upvotes',
      department: this.deptName || undefined
    }).subscribe({
      next: (res) => { this.trendingGrievances = res.data; }
    });

    // Stale pending count — dept scoped
    this.grievanceService.getAll({
      pageSize: 100, status: 'pending',
      department: this.deptName || undefined
    }).subscribe({
      next: (res) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        this.staleCount = res.data.filter(g => new Date(g.createdAt) < cutoff).length;
      }
    });

    // Dept-scoped grievances for resolution trend chart (last 100)
    this.grievanceService.getAll({
      pageSize: 100,
      department: this.deptName || undefined
    }).subscribe({
      next: (res) => { this.monthlyBars = this.buildMonthlyBars(res.data); }
    });
  }

  // ── Chart ─────────────────────────────────────────────────────
  private buildMonthlyBars(grievances: Grievance[]): MonthBar[] {
    const months = this.getLast6Months();
    const bars: MonthBar[] = months.map(m => ({ month: m.label, submitted: 0, solved: 0 }));
    grievances.forEach(g => {
      const d   = new Date(g.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = months.findIndex(m => m.key === key);
      if (idx !== -1) bars[idx].submitted++;
      if (g.status === 'solved') {
        const sd  = new Date(g.updatedAt ?? g.createdAt);
        const sk  = `${sd.getFullYear()}-${sd.getMonth()}`;
        const si  = months.findIndex(m => m.key === sk);
        if (si !== -1) bars[si].solved++;
      }
    });
    this.maxBarHeight = Math.max(...bars.map(b => b.submitted), 1);
    return bars;
  }

  private getLast6Months(): { key: string; label: string }[] {
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: labels[d.getMonth()] };
    });
  }

  barHeight(value: number): string {
    return Math.max(4, Math.round((value / this.maxBarHeight) * 80)) + 'px';
  }

  navigateTo(route: string): void { this.router.navigate([route]); }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}