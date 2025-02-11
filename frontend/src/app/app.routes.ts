import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { UnauthGuard } from './core/guards/unauth.guard';

const authenticatedRoutes: Routes = [
  {
    path: 'faculty',
    loadChildren: () =>
      import('./core/components/faculty/faculty.routes').then(
        (m) => m.FACULTY_ROUTES,
      ),
    data: { role: 'faculty', animation: 'faculty' },
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./core/components/admin/admin.routes').then(
        (m) => m.ADMIN_ROUTES,
      ),
    data: { role: 'admin', animation: 'admin' },
  },
  {
    path: 'superadmin',
    loadChildren: () =>
      import('./core/components/superadmin/superadmin.routes').then(
        (m) => m.SUPERADMIN_ROUTES,
      ),
    data: { role: 'superadmin', animation: 'superadmin' },
  },
];

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [UnauthGuard],
    data: {
      animation: 'login',
      pageTitle: 'Login',
    },
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./auth/callback/callback.component').then(
        (m) => m.CallbackComponent,
      ),
    data: { animation: 'callback' },
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import(
        './auth/request-password-reset/request-password-reset.component'
      ).then((m) => m.RequestPasswordResetComponent),
    canActivate: [UnauthGuard],
    data: { pageTitle: 'Reset Password' },
  },
  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),

    canActivate: [UnauthGuard],
    data: { animation: 'reset-password', pageTitle: 'Reset Password' },
  },
  ...authenticatedRoutes.map((route) => ({
    ...route,
    canActivate: [AuthGuard],
  })),
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/forbidden/forbidden.component').then(
        (m) => m.ForbiddenComponent,
      ),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./shared/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
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
