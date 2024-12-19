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
        path: 'manage-preferences',
        loadComponent: () =>
          import('./manage-preferences/manage-preferences.component').then(
            (m) => m.ManagePreferencesComponent
          ),
        data: { pageTitle: 'Faculty Preferences' },
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
        path: 'academic-years',
        loadComponent: () =>
          import('./academic-year/academic-year.component').then(
            (m) => m.AcademicYearComponent
          ),
        data: { pageTitle: 'Manage Academic Years' },
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./reports/reports.component').then((m) => m.ReportsComponent),
        data: { pageTitle: 'Official Reports' },
        children: [
          {
            path: 'faculty',
            loadComponent: () =>
              import('./reports/report-faculty/report-faculty.component').then(
                (m) => m.ReportFacultyComponent
              ),
            data: { pageTitle: 'Reports' },
          },
          {
            path: 'programs',
            loadComponent: () =>
              import(
                './reports/report-programs/report-programs.component'
              ).then((m) => m.ReportProgramsComponent),
            data: { pageTitle: 'Reports' },
          },
          {
            path: 'rooms',
            loadComponent: () =>
              import('./reports/report-rooms/report-rooms.component').then(
                (m) => m.ReportRoomsComponent
              ),
            data: { pageTitle: 'Reports' },
          },
          {
            path: '',
            redirectTo: 'faculty',
            pathMatch: 'full',
          },
        ],
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
