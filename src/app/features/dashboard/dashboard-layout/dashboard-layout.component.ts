import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent} from '../../../shared/header/header.component';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

// ─── Why a Layout Component? ──────────────────────────────────────
// The dashboard has a persistent structure: header on top, sidebar
// on the left, and a content area on the right. Every dashboard page
// (overview, grievances, statistics, profile) shares this shell.
// Instead of repeating the shell in every page, ONE layout component
// holds it, and child pages plug into the <router-outlet>.
//
// Route structure:
//   /dashboard                → DashboardLayoutComponent
//     /dashboard/overview     → OverviewComponent     (inside outlet)
//     /dashboard/submit       → SubmitGrievanceComponent
//     /dashboard/statistics   → StatisticsComponent
//     etc.

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardLayoutComponent {}
