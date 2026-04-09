import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

interface SidebarItem  { label: string; icon: string; route: string; }
interface SidebarGroup { label: string; items: SidebarItem[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit, OnDestroy {

  groups: SidebarGroup[] = [];
  private sub!: Subscription;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // ── KEY FIX ───────────────────────────────────────────────
    // Previously: groups built once in ngOnInit from currentUserValue
    // Problem:    if user object isn't ready yet, isOfficial = false
    //             → member sidebar shown to officials permanently
    // Fix:        subscribe to currentUser observable so sidebar
    //             rebuilds whenever the user object changes
    this.sub = this.authService.currentUser.subscribe(user => {
      this.groups = user?.signInType === 'GovernmentOfficial'
        ? this.officialGroups
        : this.memberGroups;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── Computed properties ───────────────────────────────────────
  get isOfficial(): boolean {
    return this.authService.currentUserValue?.signInType === 'GovernmentOfficial';
  }

  get userName(): string {
    return this.authService.currentUserValue?.name ?? '';
  }

  get userRole(): string {
    return this.isOfficial ? 'Govt. Official' : 'Locality Member';
  }

  get userDepartment(): string | null {
    if (!this.isOfficial) return null;
    return this.authService.currentUserValue?.department ?? null;
  }

  get userInitials(): string {
    const name = this.userName.trim();
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // ── Member navigation ─────────────────────────────────────────
  private memberGroups: SidebarGroup[] = [
    {
      label: 'Dashboard',
      items: [{ label: 'Overview', icon: 'fa-tachometer-alt', route: '/dashboard/overview' }]
    },
    {
      label: 'My Grievances',
      items: [
        { label: 'Submit Grievance',   icon: 'fa-plus-circle',  route: '/dashboard/submit'            },
        { label: 'My Grievances',      icon: 'fa-list-alt',     route: '/dashboard/my-grievances'     },
        { label: 'Pending Approval',   icon: 'fa-hourglass-half', route: '/dashboard/pending-approval' },
        { label: 'Solved Issues',      icon: 'fa-check-circle', route: '/dashboard/solved-issues'     },
      ]
    },
    {
      label: 'Community',
      items: [
        { label: 'Upvote Issues',   icon: 'fa-thumbs-up',  route: '/dashboard/upvote-issues'  },
        { label: 'All Grievances',  icon: 'fa-globe-asia', route: '/dashboard/all-grievances' },
      ]
    },
    {
      label: 'Account',
      items: [{ label: 'My Profile', icon: 'fa-user-cog', route: '/dashboard/profile' }]
    }
  ];

  // ── Official navigation ───────────────────────────────────────
  private officialGroups: SidebarGroup[] = [
    {
      label: 'Dashboard',
      items: [{ label: 'Overview', icon: 'fa-tachometer-alt', route: '/dashboard/overview' }]
    },
    {
      label: 'Grievances',
      items: [
        { label: 'All Grievances',     icon: 'fa-globe',          route: '/dashboard/all-grievances'    },
        { label: 'Pending',            icon: 'fa-clock',          route: '/dashboard/pending'            },
        { label: 'In Process',         icon: 'fa-spinner',        route: '/dashboard/in-process'         },
        { label: 'Awaiting Approval',  icon: 'fa-hourglass-half', route: '/dashboard/awaiting-approval'  },
        { label: 'Solved',             icon: 'fa-check-circle',   route: '/dashboard/solved-issues'      },
      ]
    },
    {
      label: 'Insights',
      items: [{ label: 'Statistics', icon: 'fa-chart-bar', route: '/dashboard/statistics' }]
    },
    {
      label: 'Account',
      items: [{ label: 'My Profile', icon: 'fa-user-cog', route: '/dashboard/profile' }]
    }
  ];
}