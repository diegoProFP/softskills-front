import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { FloatingButtonComponent } from './floating-button/floating-button.component';
import { WizardModalComponent } from './wizard-modal/wizard-modal.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { ValoracionPositivaNegativaComponent } from './valoracion-positiva-negativa/valoracion-positiva-negativa.component';
import { GruposComponent } from './grupos/grupos.component';
import { GrupoDetalleComponent } from './grupo-detalle/grupo-detalle.component';
import { SharedModule } from '../shared/shared.module';
import { ProfesoresAdminComponent } from './administracion/profesores-admin.component';
import { SoftSkillsAdminComponent } from './administracion/soft-skills-admin.component';


@NgModule({
  declarations: [
    DashboardComponent,
    CursosComponent,
    BienvenidaComponent,
    MiPerfilComponent,
    CursoDetalleComponent,
    GruposComponent,
    GrupoDetalleComponent,
    FloatingButtonComponent,
    WizardModalComponent,
    ValoracionPositivaNegativaComponent,
    ProfesoresAdminComponent,
    SoftSkillsAdminComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatExpansionModule,
    MatCardModule,
    SharedModule,
  ]
})
export class DashboardModule { }
