import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AdminGrupoAcademico } from '../../modelo/grupo';
import { GrupoService } from '../../services/grupo.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-grupos-admin',
  templateUrl: './grupos-admin.component.html',
  styleUrls: ['./grupos-admin.component.scss']
})
export class GruposAdminComponent implements OnInit {
  grupos: AdminGrupoAcademico[] = [];
  gruposFiltrados: AdminGrupoAcademico[] = [];
  filtroControl = new FormControl('', { nonNullable: true });
  cursoMoodleControls = new Map<number, FormControl<number | null>>();
  loading = false;
  errorCarga = '';
  guardandoFilas = new Set<number>();

  constructor(
    private grupoService: GrupoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarGrupos();
    this.filtroControl.valueChanges.subscribe(() => this.aplicarFiltro());
  }

  cargarGrupos(): void {
    this.loading = true;
    this.errorCarga = '';

    this.grupoService.getAdminGrupos().subscribe({
      next: (grupos) => {
        this.grupos = this.ordenarGrupos(grupos || []);
        this.reconstruirControles();
        this.aplicarFiltro();
        this.loading = false;
      },
      error: (error) => {
        this.grupos = [];
        this.gruposFiltrados = [];
        this.errorCarga = this.obtenerMensajeError(error, 'No se han podido cargar los grupos academicos.');
        this.loading = false;
      }
    });
  }

  guardarCursoMoodleGrupo(grupo: AdminGrupoAcademico): void {
    const control = this.getCursoMoodleControl(grupo);

    if (control.invalid) {
      control.markAsTouched();
      this.notificationService.showWarning('El ID del curso Moodle debe ser un numero entero positivo.');
      return;
    }

    const cursoMoodleGrupoId = this.normalizarCursoMoodleGrupoId(control.value);
    this.guardandoFilas.add(grupo.id);

    this.grupoService.actualizarCursoMoodleGrupo(grupo.id, { cursoMoodleGrupoId }).subscribe({
      next: (grupoActualizado) => {
        this.grupos = this.ordenarGrupos(
          this.grupos.map((grupoActual) =>
            grupoActual.id === grupoActualizado.id ? grupoActualizado : grupoActual
          )
        );
        this.cursoMoodleControls.set(
          grupoActualizado.id,
          this.crearCursoMoodleControl(grupoActualizado.cursoMoodleGrupoId)
        );
        this.aplicarFiltro();
        this.guardandoFilas.delete(grupo.id);
        this.notificationService.showSuccess('Curso Moodle del grupo guardado correctamente.');
      },
      error: (error) => {
        this.guardandoFilas.delete(grupo.id);
        this.notificationService.showError(
          this.obtenerMensajeError(error, 'No se ha podido guardar el curso Moodle del grupo.')
        );
      }
    });
  }

  limpiarCursoMoodleGrupo(grupo: AdminGrupoAcademico): void {
    const control = this.getCursoMoodleControl(grupo);
    control.setValue(null);
    control.markAsDirty();
  }

  limpiarFiltro(): void {
    this.filtroControl.setValue('');
  }

  getCursoMoodleControl(grupo: AdminGrupoAcademico): FormControl<number | null> {
    let control = this.cursoMoodleControls.get(grupo.id);

    if (!control) {
      control = this.crearCursoMoodleControl(grupo.cursoMoodleGrupoId);
      this.cursoMoodleControls.set(grupo.id, control);
    }

    return control;
  }

  estaGuardandoFila(id: number): boolean {
    return this.guardandoFilas.has(id);
  }

  tieneCambios(grupo: AdminGrupoAcademico): boolean {
    const valorActual = this.normalizarCursoMoodleGrupoId(this.getCursoMoodleControl(grupo).value);
    const valorPersistido = grupo.cursoMoodleGrupoId ?? null;
    return valorActual !== valorPersistido;
  }

  formatGrupoTitle(grupo: AdminGrupoAcademico): string {
    return `${grupo.nivel}º ${grupo.cicloFormativo} ${grupo.grupo}`;
  }

  getCursoEscolar(grupo: AdminGrupoAcademico): string {
    const raw = grupo as AdminGrupoAcademico & Record<string, unknown>;
    return this.getStringValue(
      grupo.cursoEscolar,
      raw['cursoescolar'],
      raw['curso_escolar'],
      raw['CURSOESCOLAR']
    ) || '-';
  }

  private reconstruirControles(): void {
    this.cursoMoodleControls.clear();
    this.grupos.forEach((grupo) =>
      this.cursoMoodleControls.set(grupo.id, this.crearCursoMoodleControl(grupo.cursoMoodleGrupoId))
    );
  }

  private crearCursoMoodleControl(value: number | null): FormControl<number | null> {
    return new FormControl<number | null>(value ?? null, {
      validators: [
        Validators.min(1),
        (control) => {
          const value = control.value;

          if (value === null || value === undefined || value === '') {
            return null;
          }

          return Number.isInteger(Number(value)) ? null : { integer: true };
        }
      ]
    });
  }

  private aplicarFiltro(): void {
    const filtro = this.filtroControl.value.trim().toLowerCase();

    if (!filtro) {
      this.gruposFiltrados = [...this.grupos];
      return;
    }

    this.gruposFiltrados = this.grupos.filter((grupo) => {
      const cursoMoodleGrupoId = grupo.cursoMoodleGrupoId?.toString() ?? '';
      return [
        grupo.id.toString(),
        grupo.nivel,
        grupo.cicloFormativo,
        grupo.grupo,
        this.getCursoEscolar(grupo),
        cursoMoodleGrupoId
      ].some((value) => value.toLowerCase().includes(filtro));
    });
  }

  private ordenarGrupos(grupos: AdminGrupoAcademico[]): AdminGrupoAcademico[] {
    return [...grupos].sort((a, b) =>
      this.getCursoEscolar(a).localeCompare(this.getCursoEscolar(b), 'es', { sensitivity: 'base' }) ||
      a.nivel.localeCompare(b.nivel, 'es', { sensitivity: 'base' }) ||
      a.cicloFormativo.localeCompare(b.cicloFormativo, 'es', { sensitivity: 'base' }) ||
      a.grupo.localeCompare(b.grupo, 'es', { sensitivity: 'base' })
    );
  }

  private normalizarCursoMoodleGrupoId(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numberValue = Number(value);
    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
  }

  private getStringValue(...values: unknown[]): string {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return '';
  }

  private obtenerMensajeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        return 'Acceso denegado. Necesitas permisos de administrador.';
      }

      if (error.status === 404) {
        return 'El grupo academico ya no existe o no se ha encontrado.';
      }
    }

    return this.notificationService.getErrorMessage(error, fallback);
  }
}
