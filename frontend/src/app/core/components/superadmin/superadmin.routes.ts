import { Routes } from '@angular/router';

export const SUPERADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./main/main.component').then((m) => m.MainComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
          data: { pageTitle: 'Dashboard' }
      },
      {
        path: 'programs',
        loadComponent: () =>
          import('./maintenance/programs/programs.component').then(
            (m) => m.ProgramsComponent
          ),
          data: { pageTitle: 'Programs' }
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./maintenance/courses/courses.component').then(
            (m) => m.CoursesComponent
          ),
          data: { pageTitle: 'Courses' }
      },
      {
        path: 'curriculum',
        loadComponent: () =>
          import('./maintenance/curriculum/curriculum.component').then(
            (m) => m.CurriculumComponent
          ),
          data: { pageTitle: 'Curriculum' }
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./maintenance/rooms/rooms.component').then(
            (m) => m.RoomsComponent
          ),
          data: { pageTitle: 'Rooms' }
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];
