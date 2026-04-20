import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminSoftSkill, AdminSoftSkillUpdate, MotivoSoftSkill, SoftSkillAdminOptions } from '../../modelo/softskill';
import { NotificationService } from '../../services/notification.service';
import { SoftSkillService } from '../../services/softskill.service';

@Component({
  selector: 'app-soft-skills-admin',
  templateUrl: './soft-skills-admin.component.html',
  styleUrls: ['./soft-skills-admin.component.scss']
})
export class SoftSkillsAdminComponent implements OnInit {
  softSkills: AdminSoftSkill[] = [];
  filteredSoftSkills: AdminSoftSkill[] = [];
  selectedSoftSkill: AdminSoftSkill | null = null;
  options: SoftSkillAdminOptions = {
    tiposMedicion: ['PENALIZACION_POR_TRAMOS', 'ACUMULACION_SATURADA'],
    codigos: [
      'GENERICA',
      'ENFOQUE_DISTRACCIONES',
      'PARTICIPACION',
      'TRABAJO_EN_EQUIPO',
      'COMUNICACION',
      'AUTONOMIA',
      'RESPONSABILIDAD',
      'GESTION_EMOCIONAL',
      'RESOLUCION_DE_PROBLEMAS',
      'RESPETO',
      'PUNTUALIDAD'
    ]
  };
  softSkillForm: FormGroup;
  filtroControl = new FormControl('', { nonNullable: true });
  loading = false;
  saving = false;
  errorCarga = '';

  constructor(
    private fb: FormBuilder,
    private softSkillService: SoftSkillService,
    private notificationService: NotificationService
  ) {
    this.softSkillForm = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      descripcion: [''],
      tipoMedicion: ['', Validators.required],
      codigo: ['', Validators.required],
      listaMotivos: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.filtroControl.valueChanges.subscribe(() => this.aplicarFiltro());
  }

  get motivos(): FormArray {
    return this.softSkillForm.get('listaMotivos') as FormArray;
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorCarga = '';

    forkJoin({
      softSkills: this.softSkillService.getAdminSoftSkills(),
      options: this.softSkillService.getAdminOptions()
    }).subscribe({
      next: ({ softSkills, options }) => {
        this.softSkills = this.ordenarSoftSkills(softSkills);
        this.options = {
          tiposMedicion: this.combinarOpciones(
            options.tiposMedicion?.length ? options.tiposMedicion : this.options.tiposMedicion,
            softSkills.map((softSkill) => softSkill.tipoMedicion)
          ),
          codigos: this.combinarOpciones(options.codigos ?? [], softSkills.map((softSkill) => softSkill.codigo))
        };
        this.aplicarFiltro();
        this.seleccionarSoftSkill(this.selectedSoftSkill?.id ?? this.softSkills[0]?.id);
        this.loading = false;
      },
      error: (error) => {
        this.errorCarga = this.obtenerMensajeError(error, 'No se han podido cargar las soft skills.');
        this.loading = false;
      }
    });
  }

  seleccionarSoftSkill(id: number | undefined): void {
    if (!id) {
      this.selectedSoftSkill = null;
      this.softSkillForm.reset();
      this.motivos.clear();
      return;
    }

    const softSkill = this.softSkills.find((item) => item.id === id) ?? null;
    this.selectedSoftSkill = softSkill;

    if (!softSkill) {
      return;
    }

    this.softSkillForm.reset({
      id: softSkill.id,
      nombre: softSkill.nombre,
      descripcion: softSkill.descripcion ?? '',
      tipoMedicion: softSkill.tipoMedicion,
      codigo: softSkill.codigo
    });

    this.motivos.clear();
    (softSkill.listaMotivos ?? []).forEach((motivo) => this.motivos.push(this.crearMotivoGroup(motivo)));
  }

  agregarMotivo(): void {
    this.motivos.push(this.crearMotivoGroup({ motivo: '' }));
  }

  eliminarMotivo(index: number): void {
    this.motivos.removeAt(index);
    this.motivos.markAsDirty();
  }

  guardarSoftSkill(): void {
    if (!this.selectedSoftSkill) {
      return;
    }

    if (this.softSkillForm.invalid || this.tieneMotivosVacios()) {
      this.softSkillForm.markAllAsTouched();
      this.motivos.controls.forEach((control) => control.markAllAsTouched());
      this.notificationService.showWarning('Revisa los campos obligatorios antes de guardar.');
      return;
    }

    const payload = this.construirPayload();
    this.saving = true;

    this.softSkillService.actualizarAdminSoftSkill(this.selectedSoftSkill.id, payload).subscribe({
      next: (softSkillActualizada) => {
        this.softSkills = this.ordenarSoftSkills(
          this.softSkills.map((softSkill) =>
            softSkill.id === softSkillActualizada.id ? softSkillActualizada : softSkill
          )
        );
        this.aplicarFiltro();
        this.seleccionarSoftSkill(softSkillActualizada.id);
        this.saving = false;
        this.notificationService.showSuccess('Soft skill guardada correctamente.');
      },
      error: (error) => {
        this.saving = false;
        this.notificationService.showError(this.obtenerMensajeError(error, 'No se ha podido guardar la soft skill.'));
      }
    });
  }

  limpiarFiltro(): void {
    this.filtroControl.setValue('');
  }

  private crearMotivoGroup(motivo: MotivoSoftSkill): FormGroup {
    return this.fb.group({
      id: [motivo.id ?? null],
      motivo: [motivo.motivo ?? '', Validators.required]
    });
  }

  private construirPayload(): AdminSoftSkillUpdate {
    const formValue = this.softSkillForm.value;
    const motivos = this.motivos.controls
      .map((control) => control.value)
      .map((motivo) => ({
        ...(motivo.id ? { id: motivo.id } : {}),
        motivo: motivo.motivo.trim()
      }));

    return {
      nombre: formValue.nombre.trim(),
      descripcion: formValue.descripcion?.trim() || null,
      tipoMedicion: formValue.tipoMedicion,
      codigo: formValue.codigo,
      listaMotivos: motivos
    };
  }

  private tieneMotivosVacios(): boolean {
    return this.motivos.controls.some((control) => {
      const motivo = control.get('motivo')?.value;
      return !motivo || !motivo.trim();
    });
  }

  private aplicarFiltro(): void {
    const filtro = this.filtroControl.value.trim().toLowerCase();

    if (!filtro) {
      this.filteredSoftSkills = [...this.softSkills];
      return;
    }

    this.filteredSoftSkills = this.softSkills.filter((softSkill) =>
      softSkill.nombre.toLowerCase().includes(filtro) ||
      softSkill.codigo.toLowerCase().includes(filtro) ||
      softSkill.id.toString().includes(filtro)
    );
  }

  private ordenarSoftSkills(softSkills: AdminSoftSkill[]): AdminSoftSkill[] {
    return [...softSkills].sort((a, b) => a.id - b.id);
  }

  private combinarOpciones(opciones: string[], valoresActuales: string[]): string[] {
    return Array.from(new Set([...opciones, ...valoresActuales].filter(Boolean)));
  }

  private obtenerMensajeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
      return 'Acceso denegado. Necesitas permisos de administrador.';
    }

    return this.notificationService.getErrorMessage(error, fallback);
  }
}
