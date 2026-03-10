import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProcessComponent {

  // Main Process Steps (3 steps)
  mainSteps = [
    {
      number: 1,
      icon: 'fa-file-alt',
      title: 'Report Your Grievance',
      description: 'Citizens can easily submit complaints about civic issues in their locality through our user-friendly platform.',
      details: [
        'Fill out a simple form with issue details',
        'Add photos to document the problem',
        'Select the appropriate category',
        'Specify the exact location'
      ],
      color: '#0A3161'
    },
    {
      number: 2,
      icon: 'fa-tasks',
      title: 'Track & Monitor Progress',
      description: 'Once submitted, your grievance is automatically assigned to the relevant department for quick resolution.',
      details: [
        'Real-time status updates (Pending → In Progress → Resolved)',
        'Receive notifications at each stage',
        'View estimated resolution time',
        'Community can upvote to prioritize'
      ],
      color: '#1E4D8B'
    },
    {
      number: 3,
      icon: 'fa-check-circle',
      title: 'Get It Resolved',
      description: 'Government officials work on resolving the issue efficiently while maintaining full transparency.',
      details: [
        'Department reviews and assigns priority',
        'Officials take action on the ground',
        'Citizens get notified of resolution',
        'Feedback and rating system'
      ],
      color: '#2E7D32'
    }
  ];

  // User Journeys
  citizenJourney = [
    {
      step: 'Sign Up',
      description: 'Create your free account as a Locality Member',
      icon: 'fa-user-plus'
    },
    {
      step: 'Submit Issue',
      description: 'Report civic problems with photos and location',
      icon: 'fa-clipboard-list'
    },
    {
      step: 'Track Status',
      description: 'Monitor real-time progress of your grievances',
      icon: 'fa-chart-line'
    },
    {
      step: 'Receive Updates',
      description: 'Get notified when status changes',
      icon: 'fa-bell'
    },
    {
      step: 'Provide Feedback',
      description: 'Rate the resolution and share your experience',
      icon: 'fa-star'
    }
  ];

  officialJourney = [
    {
      step: 'Access Dashboard',
      description: 'View all pending grievances in your department',
      icon: 'fa-tachometer-alt'
    },
    {
      step: 'Review Complaints',
      description: 'Examine details, photos, and community votes',
      icon: 'fa-search'
    },
    {
      step: 'Assign Priority',
      description: 'Categorize by urgency and assign to team',
      icon: 'fa-flag'
    },
    {
      step: 'Take Action',
      description: 'Coordinate resolution efforts on the ground',
      icon: 'fa-wrench'
    },
    {
      step: 'Update Status',
      description: 'Mark as resolved and add completion notes',
      icon: 'fa-check-double'
    }
  ];

  // Features That Support the Process
  processFeatures = [
    {
      icon: 'fa-mobile-alt',
      title: 'Mobile-Friendly',
      description: 'Submit grievances on-the-go from any device'
    },
    {
      icon: 'fa-cloud-upload-alt',
      title: 'Photo Upload',
      description: 'Attach images to better illustrate the problem'
    },
    {
      icon: 'fa-map-marker-alt',
      title: 'Location Tagging',
      description: 'Automatic routing to the right department'
    },
    {
      icon: 'fa-comments',
      title: 'Community Support',
      description: 'Upvote important issues to fast-track resolution'
    },
    {
      icon: 'fa-history',
      title: 'Complete History',
      description: 'Full audit trail of all actions taken'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Data Security',
      description: 'Your information is protected and encrypted'
    }
  ];

  // Grievance Categories
  categories = [
    { name: 'Water Supply', icon: 'fa-tint', color: '#0A3161' },
    { name: 'Road Maintenance', icon: 'fa-road', color: '#1E4D8B' },
    { name: 'Garbage Collection', icon: 'fa-trash', color: '#2E7D32' },
    { name: 'Street Lights', icon: 'fa-lightbulb', color: '#C9A961' },
    { name: 'Drainage', icon: 'fa-water', color: '#0A3161' },
    { name: 'Public Safety', icon: 'fa-shield-alt', color: '#1E4D8B' }
  ];

  // FAQ Data
  faqs = [
    {
      question: 'How long does it take to resolve a grievance?',
      answer: 'On average, grievances are resolved within 3-5 days. However, complex issues may take longer. You can track the status in real-time through your dashboard.',
      isOpen: false
    },
    {
      question: 'Can I submit anonymous complaints?',
      answer: 'No, all complaints require user registration to ensure accountability and prevent spam. However, your personal details are kept confidential and only visible to authorized officials.',
      isOpen: false
    },
    {
      question: 'What happens if my issue is not resolved?',
      answer: 'If a grievance remains unresolved beyond the expected timeframe, you can escalate it through the platform. Senior officials are automatically notified of pending issues.',
      isOpen: false
    },
    {
      question: 'Can I upload photos of the issue?',
      answer: 'Yes! We highly encourage uploading photos as visual evidence helps officials understand and prioritize the issue more effectively.',
      isOpen: false
    },
    {
      question: 'How do I track multiple grievances?',
      answer: 'Your personal dashboard shows all your submitted grievances with current status. You can filter by status (pending, in progress, resolved) and sort by date.',
      isOpen: false
    },
    {
      question: 'Can I edit my grievance after submission?',
      answer: 'You can add comments and additional photos, but the core details cannot be edited once submitted. If you made an error, please contact support.',
      isOpen: false
    }
  ];

  constructor(private router: Router) {}

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }
}