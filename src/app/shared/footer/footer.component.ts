import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent {

  // ─── Footer Data ──────────────────────────────────────────────
  // Previously this data was duplicated in home, about, process,
  // and rules components. Now it lives in exactly one place.

  currentYear = new Date().getFullYear();

  footerLinks = {
    about: [
      { label: 'About Us', link: '/about' },
      { label: 'How It Works', link: '/process' },
      { label: 'Community Guidelines', link: '/rules' }
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
}