import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'faculty',
    loadChildren: () =>
      import('./core/components/faculty/faculty.routes').then(
        (m) => m.FACULTY_ROUTES
      ),
    canActivate: [AuthGuard],
    data: { role: 'faculty' },
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./core/components/admin/admin.routes').then(
        (m) => m.ADMIN_ROUTES
      ),
    canActivate: [AuthGuard],
    data: { role: 'admin' },
  },
  {
    path: 'superadmin',
    loadChildren: () =>
      import('./core/components/superadmin/superadmin.routes').then(
        (m) => m.SUPERADMIN_ROUTES
      ),
    canActivate: [AuthGuard],
    data: { role: 'superadmin' },
  },
  {
    path: 'unauthenticated',
    loadComponent: () =>
      import('./shared/unauthenticated/unauthenticated.component').then(
        (m) => m.UnauthenticatedComponent
      ),
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/unauthenticated',
  },
];
