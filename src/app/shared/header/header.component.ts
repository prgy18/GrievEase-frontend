import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',                          // was: app-navbar
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',          // was: navbar.component.html
  styleUrls: ['./header.component.css'],           // was: navbar.component.css
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent {                     // was: NavbarComponent

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get userName(): string {
    return this.authService.currentUserValue?.name ?? '';
  }

  get isGovernmentOfficial(): boolean {
    return this.authService.isGovernmentOfficial();
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}