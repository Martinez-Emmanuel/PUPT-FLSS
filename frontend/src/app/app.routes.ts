import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { UnauthGuard } from './core/guards/unauth.guard';

const authenticatedRoutes: Routes = [
  {
    path: 'faculty',
    loadChildren: () =>
      import('./core/components/faculty/faculty.routes').then(
        (m) => m.FACULTY_ROUTES
      ),
    data: { role: 'faculty', animation: 'faculty' },
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./core/components/admin/admin.routes').then(
        (m) => m.ADMIN_ROUTES
      ),
    data: { role: 'admin' },
  },
  {
    path: 'superadmin',
    loadChildren: () =>
      import('./core/components/superadmin/superadmin.routes').then(
        (m) => m.SUPERADMIN_ROUTES
      ),
    data: { role: 'superadmin' },
  },
];

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [UnauthGuard],
    data: { animation: 'login' },
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./auth/callback/callback.component').then(
        (m) => m.CallbackComponent
      ),
    data: { animation: 'callback' },
  },
  ...authenticatedRoutes.map((route) => ({
    ...route,
    canActivate: [AuthGuard],
  })),
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/forbidden/forbidden.component').then(
        (m) => m.ForbiddenComponent
      ),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./shared/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
