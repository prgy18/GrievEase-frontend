// import { Routes } from '@angular/router';

// export const routes: Routes = [
//     {
//     path: '',
//     loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
//     title: 'GrievEase - Transform Grievances into Solutions'
//   }
// ];
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Home Page (Eagerly Loaded)
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'GrievEase - Transform Grievances into Solutions'
  },

  // About Us Page (Lazy Loaded)
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'About Us - GrievEase'
  },

  // Auth Routes (Lazy Loaded - will be created later)
  // {
  //   path: 'auth',
  //   loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  // },

  // Grievances Routes (Lazy Loaded - will be created later)
  // {
  //   path: 'grievances',
  //   loadChildren: () => import('./features/grievances/grievances.routes').then(m => m.GRIEVANCE_ROUTES)
  // },

  // Dashboard Routes (Lazy Loaded - will be created later)
  // {
  //   path: 'dashboard',
  //   loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  // },

  // Profile Routes (Lazy Loaded - will be created later)
  // {
  //   path: 'profile',
  //   loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
  // },

  // Wildcard - Redirect to home
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];