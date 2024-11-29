import { Routes } from '@angular/router';

export const SUPERADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./main/main.component').then((m) => m.MainComponent),
    children: [
      { path: '', redirectTo: 'programs', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        data: { pageTitle: 'Dashboard' },
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./management/admin/admin.component').then(
            (m) => m.AdminComponent
          ),
        data: { pageTitle: 'Manage Admin' },
      },
      {
        path: 'faculty',
        loadComponent: () =>
          import('./management/faculty/faculty.component').then(
            (m) => m.FacultyComponent
          ),
        data: { pageTitle: 'Manage Faculty' },
      },
      {
        path: 'programs',
        loadComponent: () =>
          import('./maintenance/programs/programs.component').then(
            (m) => m.ProgramsComponent
          ),
        data: { pageTitle: 'Programs' },
      },
      {
        path: 'curriculum',
        loadComponent: () =>
          import('./maintenance/curriculum/curriculum.component').then(
            (m) => m.CurriculumComponent
          ),
        data: { pageTitle: 'Curriculum' },
      },
      {
        path: 'curriculum/:year',
        loadComponent: () =>
          import(
            './maintenance/curriculum/curriculum-detail/curriculum-detail.component'
          ).then((m) => m.CurriculumDetailComponent),
        data: { pageTitle: 'Curriculum' },
        resolve: {
          curriculumYear: (route: {
            paramMap: { get: (arg0: string) => any };
          }) => route.paramMap.get('year'),
        },
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./maintenance/rooms/rooms.component').then(
            (m) => m.RoomsComponent
          ),
        data: { pageTitle: 'Rooms' },
      },
      { path: '**', redirectTo: 'programs' },
    ],
  },
];
