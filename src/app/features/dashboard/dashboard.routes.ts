import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },

      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/overview/overview.component').then(m => m.OverviewComponent),
        title: 'Overview - GrievEase'
      },

      // ── Member routes ──────────────────────────────────────────
      {
        path: 'submit',
        loadComponent: () =>
          import('./pages/submit-grievance/submit-grievance.component').then(m => m.SubmitGrievanceComponent),
        title: 'Submit Grievance - GrievEase'
      },
      {
        path: 'my-grievances',
        loadComponent: () =>
          import('./pages/my-grievances/my-grievances.component').then(m => m.MyGrievancesComponent),
        title: 'My Grievances - GrievEase'
      },
      {
        path: 'upvote-issues',
        loadComponent: () =>
          import('./pages/upvote-issues/upvote-issues.component').then(m => m.UpvoteIssuesComponent),
        title: 'Upvote Issues - GrievEase'
      },
      {
        path: 'solved-issues',
        loadComponent: () =>
          import('./pages/solved-issues/solved-issues.component').then(m => m.SolvedIssuesComponent),
        title: 'Solved Issues - GrievEase'
      },
      {
        path: 'pending-approval',
        loadComponent: () =>
          import('./pages/pending-approval/pending-approval.component').then(m => m.PendingApprovalComponent),
        title: 'Pending Approval - GrievEase'
      },

      // ── Shared routes (both roles) ─────────────────────────────
      {
        path: 'all-grievances',
        loadComponent: () =>
          import('./pages/all-grievances/all-grievances.component').then(m => m.AllGrievancesComponent),
        title: 'All Grievances - GrievEase'
      },

      // ── Official routes ────────────────────────────────────────
      {
        path: 'pending',
        loadComponent: () =>
          import('./pages/pending/pending.component').then(m => m.PendingComponent),
        title: 'Pending - GrievEase'
      },
      {
        path: 'in-process',
        loadComponent: () =>
          import('./pages/in-process/in-process.component').then(m => m.InProcessComponent),
        title: 'In Process - GrievEase'
      },
      {
        path: 'awaiting-approval',
        loadComponent: () =>
          import('./pages/awaiting-approval/awaiting-approval.component').then(m => m.AwaitingApprovalComponent),
        title: 'Awaiting Approval - GrievEase'
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./pages/statistics/statistics.component').then(m => m.StatisticsComponent),
        title: 'Statistics - GrievEase'
      },

      // ── Account ────────────────────────────────────────────────
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        title: 'My Profile - GrievEase'
      }
    ]
  }
];