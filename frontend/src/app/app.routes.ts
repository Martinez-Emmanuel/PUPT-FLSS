import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard'; 

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'faculty',
    loadChildren: () =>
      import('./core/components/faculty/faculty.routes').then(
        (m) => m.FACULTY_ROUTES
      ),
    canActivate: [AuthGuard], // Protect with AuthGuard
    data: { role: 'faculty' } // Only accessible by users with the 'faculty' role
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./core/components/admin/admin.routes').then(
        (m) => m.ADMIN_ROUTES
      ),
    canActivate: [AuthGuard], // Protect with AuthGuard
    data: { role: 'admin' } // Only accessible by users with the 'admin' role
  },
  {
    path: 'superadmin',
    loadChildren: () =>
      import('./core/components/superadmin/superadmin.routes').then(
        (m) => m.SUPERADMIN_ROUTES
      ),
    canActivate: [AuthGuard], // Protect with AuthGuard
    data: { role: 'superadmin' } // Only accessible by users with the 'superadmin' role
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
