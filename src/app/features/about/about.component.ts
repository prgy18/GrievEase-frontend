import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule,HeaderComponent,FooterComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AboutComponent {
  
  // Vision Points
constructor(
    private router: Router,
  ) {}
  visionPoints = [
    {
      icon: 'fa-eye',
      title: 'Promote civic engagement across all communities',
      color: '#0A3161'
    },
    {
      icon: 'fa-chart-bar',
      title: 'Use data to drive real-world improvements',
      color: '#0A3161'
    },
    {
      icon: 'fa-comments',
      title: 'Enable two-way communication between citizens & officials',
      color: '#0A3161'
    }
  ];

  // What Makes Us Different
  differentiators = [
    {
      icon: 'fa-users',
      title: 'Citizen-Centric Design',
      description: 'Built for simplicity — our platform ensures anyone can raise a complaint effortlessly, regardless of technical skill.'
    },
    {
      icon: 'fa-chart-line',
      title: 'Real-Time Tracking',
      description: 'Get instant updates on the progress of your grievances. Transparency is at the heart of GrievEase.'
    },
    {
      icon: 'fa-map-marker-alt',
      title: 'Location-Based Solutions',
      description: 'Issues are automatically routed to the right authorities based on location, ensuring faster resolution.'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security. We prioritize privacy and data protection.'
    }
  ];

  // Impact Statistics
  impactStats = [
    {
      value: '12K+',
      label: 'Complaints Resolved',
      icon: 'fa-check-circle'
    },
    {
      value: '25K+',
      label: 'Active Users',
      icon: 'fa-users'
    },
    {
      value: '30+',
      label: 'Partner Municipalities',
      icon: 'fa-building'
    },
    {
      value: '3 Days',
      label: 'Avg. Resolution Time',
      icon: 'fa-clock'
    }
  ];
   navigateToSignup(): void {
    this.router.navigate(['/auth/register']);
  }

}