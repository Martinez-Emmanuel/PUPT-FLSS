import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard'; 
import { UnauthenticatedComponent } from './shared/unauthenticated/unauthenticated.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'faculty',
    loadChildren: () =>
      import('./core/components/faculty/faculty.routes').then(m => m.FACULTY_ROUTES),
    canActivate: [AuthGuard],
    data: { role: 'faculty' }
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./core/components/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  {
    path: 'superadmin',
    loadChildren: () =>
      import('./core/components/superadmin/superadmin.routes').then(m => m.SUPERADMIN_ROUTES),
    canActivate: [AuthGuard],
    data: { role: 'superadmin' }
  },
  {
    path: 'unauthenticated',
    loadComponent: () =>
      import('./shared/unauthenticated/unauthenticated.component').then(m => m.UnauthenticatedComponent),
  },
  {
    path: '',
    canActivate: [AuthGuard], // Check authentication status here
    loadComponent: () => {
      const token = localStorage.getItem('token'); // Check local storage for token
      const userRole = localStorage.getItem('user_role'); // Get user role from local storage

      if (token) {
        if (userRole === 'faculty') {
          return import('./core/components/faculty/home/home.component').then(m => m.HomeComponent); // Redirect to faculty home
        } else if (userRole === 'admin') {
          return import('./core/components/admin/overview/overview.component').then(m => m.OverviewComponent); // Redirect to admin overview
        } else if (userRole === 'superadmin') {
          return import('./core/components/superadmin/dashboard/dashboard.component').then(m => m.DashboardComponent); // Redirect to superadmin dashboard
        } else {
          return import('./shared/unauthenticated/unauthenticated.component').then(m => m.UnauthenticatedComponent); // Redirect to unauthenticated page if role is unknown
        }
      } else {
        return import('./auth/login/login.component').then(m => m.LoginComponent); // Redirect to login page if not authenticated
      }
    },
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/unauthenticated', // Catch-all route
  },
];
