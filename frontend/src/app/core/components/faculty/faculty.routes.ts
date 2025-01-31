import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const FACULTY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./faculty-main/faculty-main.component').then(
        (m) => m.FacultyMainComponent,
      ),
    canActivate: [AuthGuard],
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
        data: { pageTitle: 'Home' },
      },
      {
        path: 'preferences',
        loadComponent: () =>
          import('./preferences/preferences.component').then(
            (m) => m.PreferencesComponent,
          ),
        data: { pageTitle: 'Set Preferences' },
      },
      {
        path: 'load-and-schedule',
        loadComponent: () =>
          import('./load-and-schedule/load-and-schedule.component').then(
            (m) => m.LoadAndScheduleComponent,
          ),
        data: { pageTitle: 'Load and Schedule' },
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
];
