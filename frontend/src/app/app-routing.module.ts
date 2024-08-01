import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth-routing.module').then((m) => m.AuthRoutingModule),
  },
  {
    path: 'core',
    loadChildren: () =>
      import('./core/core-routing.module').then((m) => m.CoreRoutingModule),
  },
  {
    path: 'shared',
    loadChildren: () =>
      import('./shared/shared-routing.module').then((m) => m.SharedRoutingModule),
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
