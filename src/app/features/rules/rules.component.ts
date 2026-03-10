import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RulesComponent {

  // Community Guidelines Sections
  guidelines = [
    {
      icon: 'fa-handshake',
      title: 'Be Respectful',
      description: 'Treat all users, officials, and community members with respect and dignity.',
      rules: [
        'Use polite and professional language',
        'No hate speech, harassment, or discrimination',
        'Respect different opinions and perspectives',
        'Avoid personal attacks or inflammatory comments'
      ]
    },
    {
      icon: 'fa-check-circle',
      title: 'Be Honest & Accurate',
      description: 'Provide truthful and accurate information when reporting grievances.',
      rules: [
        'Report only genuine civic issues',
        'Provide accurate location details',
        'Upload authentic photos (no edited images)',
        'Do not exaggerate or fabricate problems'
      ]
    },
    {
      icon: 'fa-flag',
      title: 'Report Responsibly',
      description: 'File grievances that are relevant and within the platform\'s scope.',
      rules: [
        'Submit only civic/municipal issues',
        'Choose the correct category for your issue',
        'Avoid duplicate submissions',
        'Do not spam the system with frivolous complaints'
      ]
    },
    {
      icon: 'fa-shield-alt',
      title: 'Protect Privacy',
      description: 'Respect the privacy of others and protect personal information.',
      rules: [
        'Do not share others\' personal information',
        'Blur faces in photos if necessary',
        'Avoid posting sensitive or private details',
        'Report privacy violations to moderators'
      ]
    }
  ];

  // Prohibited Content
  prohibitedContent = [
    {
      icon: 'fa-ban',
      title: 'No Spam',
      description: 'Repeated, irrelevant, or promotional content'
    },
    {
      icon: 'fa-exclamation-triangle',
      title: 'No Misinformation',
      description: 'False or misleading information about civic issues'
    },
    {
      icon: 'fa-user-slash',
      title: 'No Harassment',
      description: 'Threatening, abusive, or intimidating behavior'
    },
    {
      icon: 'fa-gavel',
      title: 'No Illegal Content',
      description: 'Content that violates laws or encourages illegal activity'
    },
    {
      icon: 'fa-angry',
      title: 'No Hate Speech',
      description: 'Discriminatory content based on race, religion, gender, etc.'
    },
    {
      icon: 'fa-ad',
      title: 'No Advertisements',
      description: 'Commercial promotion or advertising without permission'
    }
  ];

  // Grievance Filing Best Practices
  bestPractices = [
    {
      step: '1',
      title: 'Choose the Right Category',
      description: 'Select the most appropriate category for your issue (Water, Road, Garbage, etc.)',
      icon: 'fa-list'
    },
    {
      step: '2',
      title: 'Provide Clear Description',
      description: 'Write a detailed, objective description of the problem without exaggeration',
      icon: 'fa-file-alt'
    },
    {
      step: '3',
      title: 'Add Supporting Evidence',
      description: 'Upload clear photos showing the issue from multiple angles if possible',
      icon: 'fa-camera'
    },
    {
      step: '4',
      title: 'Specify Exact Location',
      description: 'Provide accurate address or landmark information for quick identification',
      icon: 'fa-map-marker-alt'
    },
    {
      step: '5',
      title: 'Check for Duplicates',
      description: 'Search existing grievances to avoid reporting the same issue twice',
      icon: 'fa-search'
    },
    {
      step: '6',
      title: 'Monitor Your Submission',
      description: 'Track status updates and respond to any requests for additional information',
      icon: 'fa-bell'
    }
  ];

  // Moderation Policy
  moderationPolicies = [
    {
      icon: 'fa-eye',
      title: 'Content Review',
      description: 'All submissions are reviewed by moderators within 24 hours to ensure compliance with guidelines.'
    },
    {
      icon: 'fa-exclamation-circle',
      title: 'Warning System',
      description: 'First-time violations may result in a warning. Repeated violations lead to account suspension.'
    },
    {
      icon: 'fa-user-lock',
      title: 'Account Suspension',
      description: 'Serious or repeated violations can result in temporary or permanent account suspension.'
    },
    {
      icon: 'fa-trash-alt',
      title: 'Content Removal',
      description: 'Content violating guidelines will be removed without prior notice to maintain platform integrity.'
    }
  ];

  // User Rights
  userRights = [
    'Right to submit grievances without fear of retaliation',
    'Right to track the status of your submissions',
    'Right to receive timely updates on resolution progress',
    'Right to appeal moderation decisions',
    'Right to data privacy and protection',
    'Right to delete your account and associated data'
  ];

  // Government Official Responsibilities
  officialResponsibilities = [
    'Review and acknowledge grievances within 48 hours',
    'Provide regular status updates to citizens',
    'Maintain professional communication at all times',
    'Resolve issues within committed timeframes',
    'Document all actions taken for transparency',
    'Respect citizen privacy and data protection laws'
  ];

  // Acceptable Issue Categories
  issueCategories = [
    { name: 'Water Supply', icon: 'fa-tint' },
    { name: 'Road & Infrastructure', icon: 'fa-road' },
    { name: 'Garbage Collection', icon: 'fa-trash' },
    { name: 'Street Lights', icon: 'fa-lightbulb' },
    { name: 'Drainage & Sewage', icon: 'fa-water' },
    { name: 'Public Safety', icon: 'fa-shield-alt' },
    { name: 'Parks & Gardens', icon: 'fa-tree' },
    { name: 'Electricity', icon: 'fa-bolt' }
  ];

  constructor(private router: Router) {}

  navigateToSignup(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  navigateToProcess(): void {
    this.router.navigate(['/process']);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}