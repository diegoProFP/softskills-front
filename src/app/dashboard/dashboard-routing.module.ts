import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CursosComponent } from './cursos/cursos.component';
import { BienvenidaComponent } from './bienvenida/bienvenida.component';
import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { CursoDetalleComponent } from './curso-detalle/curso-detalle.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'bienvenida' },
      { path: 'bienvenida', component: BienvenidaComponent },
      { path: 'cursos', component: CursosComponent },
      { path: 'cursos/:id', component: CursoDetalleComponent },
      { path: 'mi-perfil', component: MiPerfilComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
