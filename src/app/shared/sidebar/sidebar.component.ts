
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {

  groups: SidebarGroup[] = [];

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.groups = this.isOfficial
      ? this.officialGroups
      : this.memberGroups;
  }

  get isOfficial(): boolean {
    return this.authService.currentUserValue?.role === 'GovernmentOfficial';
  }

  get userName(): string {
    return this.authService.currentUserValue?.name ?? '';
  }

  get userRole(): string {
    return this.isOfficial ? 'Govt. Official' : 'Locality Member';
  }

  get userInitials(): string {
    const name = this.userName.trim();
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private memberGroups: SidebarGroup[] = [
    {
      label: 'Dashboard',
      items: [
        { label: 'Overview', icon: 'fa-tachometer-alt', route: '/dashboard/overview' }
      ]
    },
    {
      label: 'My Grievances',
      items: [
        { label: 'Submit Grievance', icon: 'fa-plus-circle', route: '/dashboard/submit' },
        { label: 'My Grievances',    icon: 'fa-list-alt',    route: '/dashboard/my-grievances' }
      ]
    },
    {
      label: 'Community',
      items: [
        { label: 'Upvote Issues', icon: 'fa-thumbs-up',    route: '/dashboard/upvote-issues' },
        { label: 'Solved Issues', icon: 'fa-check-circle', route: '/dashboard/solved-issues' }
      ]
    },
    {
      label: 'Account',
      items: [
        { label: 'My Profile', icon: 'fa-user-cog', route: '/dashboard/profile' }
      ]
    }
  ];

  private officialGroups: SidebarGroup[] = [
    {
      label: 'Dashboard',
      items: [
        { label: 'Overview', icon: 'fa-tachometer-alt', route: '/dashboard/overview' }
      ]
    },
    {
      label: 'Grievances',
      items: [
        { label: 'All Grievances', icon: 'fa-globe',         route: '/dashboard/all-grievances' },
        { label: 'Pending',        icon: 'fa-clock',         route: '/dashboard/pending' },
        { label: 'In Process',     icon: 'fa-spinner',       route: '/dashboard/in-process' },
        { label: 'Solved',         icon: 'fa-check-circle',  route: '/dashboard/solved-issues' }
      ]
    },
    {
      label: 'Insights',
      items: [
        { label: 'Statistics', icon: 'fa-chart-bar', route: '/dashboard/statistics' }
      ]
    },
    {
      label: 'Account',
      items: [
        { label: 'My Profile', icon: 'fa-user-cog', route: '/dashboard/profile' }
      ]
    }
  ];
}