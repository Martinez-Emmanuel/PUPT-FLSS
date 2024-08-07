import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard'; // Ensure the path is correct

export const FACULTY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./main/main.component').then((m) => m.MainComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'preferences',
        loadComponent: () =>
          import('./preferences/preferences.component').then(
            (m) => m.PreferencesComponent
          ),
        canActivate: [AuthGuard], // Protect this route with AuthGuard
      },
      {
        path: 'load-and-schedule',
        loadComponent: () =>
          import('./load-and-schedule/load-and-schedule.component').then(
            (m) => m.LoadAndScheduleComponent
          ),
        canActivate: [AuthGuard], // Protect this route with AuthGuard
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
];
