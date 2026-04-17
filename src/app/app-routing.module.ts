import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { DashboardAccessGuard } from './dashboard-access.guard';
import { AlumnoResumenComponent } from './alumno-resumen/alumno-resumen.component';
// Dashboard se importará tras crearlo

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'alumnos/:alumnoId/resumen', component: AlumnoResumenComponent, canActivate: [AuthGuard] },
  {
    path: 'dashboard',
    canActivate: [AuthGuard, DashboardAccessGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
