import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Profesor } from '../../modelo/profesor';
import { NotificationService } from '../../services/notification.service';
import { ProfesorService } from '../../services/profesor.service';

@Component({
  selector: 'app-profesores-admin',
  templateUrl: './profesores-admin.component.html',
  styleUrls: ['./profesores-admin.component.scss']
})
export class ProfesoresAdminComponent implements OnInit {
  profesores: Profesor[] = [];
  profesoresFiltrados: Profesor[] = [];
  profesorForm: FormGroup;
  filtroControl = new FormControl('', { nonNullable: true });
  loading = false;
  creando = false;
  errorCarga = '';
  guardandoFilas = new Set<number>();

  constructor(
    private fb: FormBuilder,
    private profesorService: ProfesorService,
    private notificationService: NotificationService
  ) {
    this.profesorForm = this.fb.group({
      id: [null, [Validators.required, Validators.min(1)]],
      administrador: [false]
    });
  }

  ngOnInit(): void {
    this.cargarProfesores();
    this.filtroControl.valueChanges.subscribe(() => this.aplicarFiltro());
  }

  cargarProfesores(): void {
    this.loading = true;
    this.errorCarga = '';

    this.profesorService.getProfesores().subscribe({
      next: (profesores) => {
        this.profesores = this.ordenarProfesores(profesores);
        this.aplicarFiltro();
        this.loading = false;
      },
      error: (error) => {
        this.errorCarga = this.obtenerMensajeError(error, 'No se han podido cargar los profesores.');
        this.loading = false;
      }
    });
  }

  crearProfesor(): void {
    if (this.profesorForm.invalid) {
      this.profesorForm.markAllAsTouched();
      return;
    }

    const id = Number(this.profesorForm.value.id);
    const administrador = !!this.profesorForm.value.administrador;

    if (!Number.isInteger(id) || id <= 0) {
      this.profesorForm.get('id')?.setErrors({ invalidId: true });
      return;
    }

    if (this.profesores.some((profesor) => profesor.id === id)) {
      this.profesorForm.get('id')?.setErrors({ duplicate: true });
      this.notificationService.showWarning('Ese profesor ya esta registrado.');
      return;
    }

    this.creando = true;

    this.profesorService.crearProfesor({ id, administrador }).subscribe({
      next: (profesorCreado) => {
        this.profesores = this.ordenarProfesores([...this.profesores, profesorCreado]);
        this.aplicarFiltro();
        this.profesorForm.reset({ id: null, administrador: false });
        this.creando = false;
        this.notificationService.showSuccess('Profesor anadido correctamente.');
      },
      error: (error) => {
        this.creando = false;
        this.notificationService.showError(this.obtenerMensajeError(error, 'No se ha podido anadir el profesor.'));
      }
    });
  }

  actualizarAdministrador(profesor: Profesor, administrador: boolean): void {
    if (this.guardandoFilas.has(profesor.id)) {
      return;
    }

    const administradorAnterior = profesor.administrador;
    this.guardandoFilas.add(profesor.id);

    this.profesorService.actualizarProfesorAdministrador(profesor.id, administrador).subscribe({
      next: (profesorActualizado) => {
        this.profesores = this.ordenarProfesores(
          this.profesores.map((profesorActual) =>
            profesorActual.id === profesor.id ? profesorActualizado : profesorActual
          )
        );
        this.aplicarFiltro();
        this.guardandoFilas.delete(profesor.id);
        this.notificationService.showSuccess('Permisos actualizados.');
      },
      error: (error) => {
        profesor.administrador = administradorAnterior;
        this.guardandoFilas.delete(profesor.id);
        this.notificationService.showError(this.obtenerMensajeError(error, 'No se ha podido actualizar el profesor.'));

        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.cargarProfesores();
        }
      }
    });
  }

  limpiarFiltro(): void {
    this.filtroControl.setValue('');
  }

  estaGuardandoFila(id: number): boolean {
    return this.guardandoFilas.has(id);
  }

  get idControl() {
    return this.profesorForm.get('id');
  }

  private aplicarFiltro(): void {
    const filtro = this.filtroControl.value.trim();

    if (!filtro) {
      this.profesoresFiltrados = [...this.profesores];
      return;
    }

    this.profesoresFiltrados = this.profesores.filter((profesor) =>
      profesor.id.toString().includes(filtro)
    );
  }

  private ordenarProfesores(profesores: Profesor[]): Profesor[] {
    return [...profesores].sort((a, b) => a.id - b.id);
  }

  private obtenerMensajeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        return 'Acceso denegado. Necesitas permisos de administrador.';
      }

      if (error.status === 409) {
        return 'Ya existe un profesor con ese ID.';
      }

      if (error.status === 404) {
        return 'El profesor ya no existe o no se ha encontrado.';
      }
    }

    return this.notificationService.getErrorMessage(error, fallback);
  }
}
