import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-page">
      <div class="placeholder-icon"><i class="fas fa-tools"></i></div>
      <h2 class="placeholder-title">Statistics</h2>
      <p class="placeholder-sub">This page is coming soon. Implementation in progress.</p>
    </div>
  `,
  styles: [`
    .placeholder-page {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 60vh; text-align: center; gap: 1rem;
    }
    .placeholder-icon { font-size: 2.5rem; color: #CBD5E0; }
    .placeholder-title { font-family: 'Merriweather', serif; font-size: 1.5rem; color: #0A3161; }
    .placeholder-sub { color: #718096; font-size: 0.9rem; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class StatisticsComponent {}