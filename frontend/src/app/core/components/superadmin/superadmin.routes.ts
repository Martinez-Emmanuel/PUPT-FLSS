import { Routes } from '@angular/router';

export const SUPERADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./superadmin-main/superadmin-main.component').then(
        (m) => m.SuperadminMainComponent
      ),
    children: [
      { path: '', redirectTo: 'admin', pathMatch: 'full' },
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
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./management/faculty/faculty.component').then(
                (m) => m.FacultyComponent
              ),
            data: { pageTitle: 'Manage Faculty' },
          },
          {
            path: 'types',
            loadComponent: () =>
              import(
                './management/faculty/faculty-types/faculty-types.component'
              ).then((m) => m.FacultyTypesComponent),
            data: { pageTitle: 'Faculty Types' },
          },
        ],
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
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./maintenance/rooms/rooms.component').then(
                (m) => m.RoomsComponent
              ),
            data: { pageTitle: 'Rooms' },
          },
          {
            path: 'types',
            loadComponent: () =>
              import(
                './maintenance/rooms/room-types/room-types.component'
              ).then((m) => m.RoomTypesComponent),
            data: { pageTitle: 'Room Types' },
          },
        ],
      },
      {
        path: 'buildings',
        loadComponent: () =>
          import('./maintenance/buildings/buildings.component').then(
            (m) => m.BuildingsComponent
          ),
        data: { pageTitle: 'Buildings' },
      },
      { path: '**', redirectTo: 'admin' },
    ],
  },
];
