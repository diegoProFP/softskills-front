import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { CursosComponent } from './cursos/cursos.component';
import { BienvenidaComponent } from './bienvenida/bienvenida.component';
import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { CursoDetalleComponent } from './curso-detalle/curso-detalle.component';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FloatingButtonComponent } from './floating-button/floating-button.component';
import { WizardModalComponent } from './wizard-modal/wizard-modal.component';
import { MatExpansionModule } from '@angular/material/expansion';


@NgModule({
  declarations: [
    DashboardComponent,
    CursosComponent,
    BienvenidaComponent,
    MiPerfilComponent,
    CursoDetalleComponent,
    FloatingButtonComponent,
    WizardModalComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressBarModule,
    MatExpansionModule
  ]
})
export class DashboardModule { }
