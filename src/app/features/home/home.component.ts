import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
 
  
})
export class HomeComponent {
  // Statistics data
  statistics = [
    { value: '10K+', label: 'Active Users', icon: 'fa-users' },
    { value: '5K+', label: 'Issues Resolved', icon: 'fa-check-circle' },
    { value: '95%', label: 'Success Rate', icon: 'fa-chart-line' },
    { value: '24/7', label: 'Support', icon: 'fa-headset' }
  ];

  // How it works steps
  steps = [
    {
      number: 1,
      icon: 'fa-file-alt',
      title: 'Report Issue',
      description: 'Submit your grievance with comprehensive details, photos, and location information.'
    },
    {
      number: 2,
      icon: 'fa-thumbs-up',
      title: 'Community Support',
      description: 'Gain visibility through community upvotes and support from fellow citizens.'
    },
    {
      number: 3,
      icon: 'fa-check-double',
      title: 'Get Resolution',
      description: 'Officials review, prioritize, and resolve your issue with transparent tracking.'
    }
  ];

  // Features
  features = [
    {
      icon: 'fa-chart-line',
      title: 'Track Progress',
      description: 'Monitor your grievances from submission to resolution in real-time with detailed tracking.'
    },
    {
      icon: 'fa-users',
      title: 'Community Driven',
      description: 'Upvote issues that matter to you and help prioritize solutions for your neighborhood.'
    },
    {
      icon: 'fa-eye',
      title: 'Transparent Governance',
      description: 'Public visibility ensures accountability and faster resolution of civic issues.'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Secure Platform',
      description: 'User authentication and secure grievance handling ensures data protection.'
    }
  ];

  // Footer links
  footerLinks = {
    about: [
      { label: 'About Us', link: '/about' },
      { label: 'How It Works', link: '#how-it-works' },
      { label: 'Community Guidelines', link: '/guidelines' }
    ],
    support: [
      { label: 'Help Center', link: '/help' },
      { label: 'Contact Us', link: '/contact' },
      { label: 'FAQs', link: '/faqs' }
    ],
    legal: [
      { label: 'Privacy Policy', link: '/privacy' },
      { label: 'Terms of Service', link: '/terms' },
      { label: 'Cookie Policy', link: '/cookies' }
    ]
  };

  socialLinks = [
    { icon: 'fa-github', url: 'https://github.com', label: 'GitHub' },
    { icon: 'fa-twitter', url: 'https://twitter.com', label: 'Twitter' },
    { icon: 'fa-linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: 'fa-envelope', url: 'mailto:contact@grievease.com', label: 'Email' }
  ];

  constructor(private router: Router) {}
  navigateToAbout(): void {
  this.router.navigate(['/about']);
}
  navigateToSignup(): void {
    this.router.navigate(['/auth/register']);
  }
  navigateToProcess(): void {
  this.router.navigate(['/process']);
}

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/grievances']);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}