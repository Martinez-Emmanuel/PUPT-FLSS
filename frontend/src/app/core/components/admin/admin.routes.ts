import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./main/main.component').then((m) => m.MainComponent),
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./overview/overview.component').then(
            (m) => m.OverviewComponent
          ),
        data: { pageTitle: 'Overview' },
      },
      {
        path: 'faculty',
        loadComponent: () =>
          import('./faculty/faculty.component').then((m) => m.FacultyComponent),
        data: { pageTitle: 'Faculty' },
      },
      {
        path: 'scheduling',
        loadComponent: () =>
          import('./scheduling/scheduling.component').then(
            (m) => m.SchedulingComponent
          ),
        data: { pageTitle: 'Scheduling' },
      },
      {
        path: 'scheduling/academic-year',
        loadComponent: () =>
          import('./academic-year/academic-year.component').then(
            (m) => m.AcademicYearComponent
          ),
        data: { pageTitle: 'Academic Year' },
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./reports/reports.component').then((m) => m.ReportsComponent),
        data: { pageTitle: 'Reports' },
      },
      {
        path: 'help',
        loadComponent: () =>
          import('./help/help.component').then((m) => m.HelpComponent),
        data: { pageTitle: 'Help' },
      },
      {
        path: '**',
        redirectTo: 'overview',
      },
    ],
  },
];
