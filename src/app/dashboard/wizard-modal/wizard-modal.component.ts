import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Observable } from 'rxjs';
import { Alumno, Curso } from '../../modelo/curso';
import { MuestraSK, MuestraSKDetalle, MuestraSKUpdate, MuestraSKUpdateResponse } from '../../modelo/muestra-sk';
import { MotivoSoftSkill, NivelMuestraSoftSkill, SoftSkill, TipoMedicionSoftSkill } from '../../modelo/softskill';
import { CursoService } from '../../services/curso.service';
import { LoadingService } from '../../services/loading.service';
import { NotificationService } from '../../services/notification.service';
import { SoftSkillService } from '../../services/softskill.service';

@Component({
  selector: 'app-wizard-modal',
  templateUrl: './wizard-modal.component.html',
  styleUrls: ['./wizard-modal.component.scss']
})
export class WizardModalComponent implements OnInit {
  @Input() initialAlumno: Alumno | null = null;
  @Input() initialSoftSkill: SoftSkill | null = null;
  @Input() editingMuestra: MuestraSKDetalle | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() muestraCreada = new EventEmitter<void>();
  @Output() muestraActualizada = new EventEmitter<MuestraSKUpdateResponse>();
  @ViewChildren(MatExpansionPanel) panels: QueryList<MatExpansionPanel>;

  currentStep = 1;
  totalSteps = 5;
  cursoSeleccionado: Curso | null = null;
  cursos$: Observable<Curso[]>;
  alumnos: Alumno[] = [];
  alumnoSeleccionado: Alumno | null = null;
  letraSeleccionada: string | null = null;
  alumnosFiltrados: Alumno[] = [];
  softSkillSeleccionada: SoftSkill | null = null;
  softSkills: SoftSkill[] = [];
  motivoControl = new FormControl<string>('', { nonNullable: true });
  comentarioControl = new FormControl<string>('', { nonNullable: true });
  motivoSeleccionado: MotivoSoftSkill | null = null;
  grupoConductaActivo: 'positiva' | 'negativa' | null = null;
  valoracionSeleccionada: 'positiva' | 'negativa' | null = null;
  nivelSeleccionado: NivelMuestraSoftSkill = 'NORMAL';
  readonly nivelesMuestra: { value: NivelMuestraSoftSkill; label: string }[] = [
    { value: 'LEVE', label: 'Leve' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'SIGNIFICATIVA', label: 'Significativa' }
  ];

  letrasGrupos: { letra: string; rango: string }[] = [
    { letra: 'A-D', rango: 'A-D' },
    { letra: 'E-H', rango: 'E-H' },
    { letra: 'I-L', rango: 'I-L' },
    { letra: 'M-P', rango: 'M-P' },
    { letra: 'Q-T', rango: 'Q-T' },
    { letra: 'U-X', rango: 'U-X' },
    { letra: 'Y-Z', rango: 'Y-Z' }
  ];

  constructor(
    private cursoService: CursoService,
    private softSkillService: SoftSkillService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cursoSeleccionado = this.cursoService['cursoSeleccionado'];

    if (!this.cursoSeleccionado) {
      this.cursos$ = this.cursoService.getCursos();
      return;
    }

    this.cargarAlumnos();
    this.cargarSoftSkills();

    if (this.initialAlumno) {
      this.alumnoSeleccionado = this.initialAlumno;
    }

    if (this.initialSoftSkill) {
      this.softSkillSeleccionada = this.resolveInitialSoftSkill(this.initialSoftSkill);
    }

    if (this.editingMuestra) {
      this.hidratarEdicion(this.editingMuestra);
      this.currentStep = 4;
      return;
    }

    if (this.initialAlumno) {
      this.currentStep = this.softSkillSeleccionada ? 4 : 3;
      return;
    }

    this.currentStep = 2;
  }

  ngAfterViewInit() {
    const panelArray = this.panels.toArray();
    const activePanel = panelArray[this.currentStep - 1];

    if (activePanel) {
      activePanel.open();
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.panels.toArray()[this.currentStep - 1].open();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      const panelArray = this.panels.toArray();
      panelArray[this.currentStep - 1].close();
      this.currentStep--;
      panelArray[this.currentStep - 1].open();
    }
  }

  onPanelOpened(stepNumber: number) {
    this.currentStep = stepNumber;
  }

  resetWizard() {
    this.currentStep = 1;
    this.panels.forEach((panel) => panel.close());
    this.panels.first.open();
  }

  closeModal() {
    this.close.emit();
  }

  cargarAlumnos() {
    if (this.cursoSeleccionado) {
      this.alumnos = this.cursoSeleccionado.alumnos || [];
    }
  }

  filtrarAlumnos(rango: string) {
    this.letraSeleccionada = rango;
    if (!this.cursoSeleccionado?.alumnos) {
      this.alumnosFiltrados = [];
      return;
    }

    const [inicio, fin] = rango.split('-');
    this.alumnosFiltrados = this.cursoSeleccionado.alumnos
      .filter((alumno) => {
        const primeraLetra = alumno.nombre.charAt(0).toUpperCase();
        return primeraLetra >= inicio && primeraLetra <= fin;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  seleccionarAlumno(alumno: Alumno) {
    this.alumnoSeleccionado = alumno;
    this.nextStep();
  }

  seleccionarSoftSkill(softSkill: SoftSkill) {
    this.softSkillSeleccionada = softSkill;
    this.valoracionSeleccionada = this.esAcumulacionSaturada ? 'positiva' : null;
    this.resetSeleccionConducta();
    this.nextStep();
  }

  cargarSoftSkills() {
    this.softSkills = this.cursoSeleccionado?.softSkills || [];
    this.softSkillSeleccionada = null;
    this.resetSeleccionConducta();
  }

  seleccionarCurso(curso: Curso) {
    this.cursoSeleccionado = curso;
    this.cargarAlumnos();
    this.cargarSoftSkills();
  }

  getCursoNombre(curso: Curso | null | undefined): string {
    return curso?.nombre?.trim() || (curso ? `Curso ${curso.id}` : '');
  }

  handleValoracionSeleccionada(valoracion: 'positiva' | 'negativa') {
    this.valoracionSeleccionada = valoracion;
  }

  seleccionarNivel(nivel: NivelMuestraSoftSkill) {
    this.nivelSeleccionado = nivel;
    this.valoracionSeleccionada = 'positiva';
  }

  seleccionarMotivo(motivo: MotivoSoftSkill) {
    this.motivoSeleccionado = motivo;
    this.motivoControl.setValue(motivo.motivo);
    this.grupoConductaActivo = motivo.valorPorDefecto === -1 ? 'negativa' : motivo.valorPorDefecto === 1 ? 'positiva' : this.grupoConductaActivo;

    if (this.tieneMetadatosMotivo(motivo)) {
      this.valoracionSeleccionada = motivo.valorPorDefecto === 1 ? 'positiva' : 'negativa';
      this.nivelSeleccionado = motivo.nivelPorDefecto ?? 'NORMAL';
    }

    if (this.puedeContinuarValoracion) {
      this.nextStep();
    }
  }

  seleccionarGrupoConducta(grupo: 'positiva' | 'negativa'): void {
    this.grupoConductaActivo = this.grupoConductaActivo === grupo ? null : grupo;
  }

  mostrarAyudaMotivo(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  get motivosSoftSkillSeleccionada(): MotivoSoftSkill[] {
    return (this.softSkillSeleccionada?.listaMotivos ?? [])
      .filter((motivo) => typeof motivo?.motivo === 'string' && motivo.motivo.trim().length > 0);
  }

  get motivosPositivos(): MotivoSoftSkill[] {
    return this.motivosSoftSkillSeleccionada
      .filter((motivo) => motivo.valorPorDefecto === 1)
      .sort((a, b) => this.getOrdenNivel(b) - this.getOrdenNivel(a));
  }

  get motivosNegativos(): MotivoSoftSkill[] {
    return this.motivosSoftSkillSeleccionada
      .filter((motivo) => motivo.valorPorDefecto === -1)
      .sort((a, b) => this.getOrdenNivel(b) - this.getOrdenNivel(a));
  }

  get motivosLegacy(): MotivoSoftSkill[] {
    return this.motivosSoftSkillSeleccionada.filter((motivo) => !this.tieneMetadatosMotivo(motivo));
  }

  get hayMotivosEnriquecidos(): boolean {
    return this.motivosPositivos.length > 0 || this.motivosNegativos.length > 0;
  }

  get motivoResumen(): string | null {
    const motivo = this.motivoControl.value.trim();
    return motivo.length > 0 ? motivo : null;
  }

  get comentarioResumen(): string | null {
    const comentario = this.comentarioControl.value.trim();
    return comentario.length > 0 ? comentario : null;
  }

  get tipoMedicionSeleccionada(): TipoMedicionSoftSkill {
    return this.softSkillSeleccionada?.tipoMedicion ?? 'PENALIZACION_POR_TRAMOS';
  }

  get esAcumulacionSaturada(): boolean {
    return this.tipoMedicionSeleccionada === 'ACUMULACION_SATURADA';
  }

  get puedeContinuarValoracion(): boolean {
    if (this.motivoSeleccionado && this.tieneMetadatosMotivo(this.motivoSeleccionado)) {
      return true;
    }

    if (this.hayMotivosEnriquecidos && !this.motivoSeleccionado) {
      return false;
    }

    return this.esAcumulacionSaturada || !!this.valoracionSeleccionada;
  }

  get resumenValoracion(): string {
    if (this.motivoSeleccionado && this.tieneMetadatosMotivo(this.motivoSeleccionado)) {
      return `${this.getTipoEvidenciaLabel(this.motivoSeleccionado)} ${this.getNivelLabel(this.nivelSeleccionado).toLowerCase()}`;
    }

    if (this.esAcumulacionSaturada) {
      return `Participacion positiva - ${this.getNivelLabel(this.nivelSeleccionado)}`;
    }

    return this.valoracionSeleccionada === 'positiva' ? 'Positiva' : 'Negativa';
  }

  get resumenRegistro(): string {
    const partes = [
      this.softSkillSeleccionada?.nombre,
      this.getMotivoTitulo(this.motivoSeleccionado) ?? this.motivoResumen,
      this.resumenValoracion,
      this.motivoSeleccionado ? this.getImpactoLabel(this.motivoSeleccionado) : null
    ].filter(Boolean);

    return partes.join(' - ');
  }

  get muestraAyudaAutonomia(): boolean {
    const codigo = this.softSkillSeleccionada?.codigo?.toString().toUpperCase();
    const nombre = this.softSkillSeleccionada?.nombre?.toUpperCase() ?? '';

    return codigo === 'AUTONOMIA' || nombre.includes('AUTONOM');
  }

  private getNivelLabel(nivel: NivelMuestraSoftSkill): string {
    return this.nivelesMuestra.find((item) => item.value === nivel)?.label ?? 'Normal';
  }

  private getOrdenNivel(motivo: MotivoSoftSkill): number {
    const ordenPorNivel: Record<NivelMuestraSoftSkill, number> = {
      LEVE: 1,
      NORMAL: 2,
      SIGNIFICATIVA: 3
    };

    return motivo.nivelPorDefecto ? ordenPorNivel[motivo.nivelPorDefecto] : 0;
  }

  getMotivoTitulo(motivo: MotivoSoftSkill | null | undefined): string | null {
    if (!motivo) {
      return null;
    }

    return motivo.descripcionCorta?.trim() || motivo.motivo.trim();
  }

  getMotivoDetalle(motivo: MotivoSoftSkill): string {
    const descripcion = motivo.descripcionLarga?.trim();

    if (descripcion) {
      return descripcion.length > 150 ? `${descripcion.slice(0, 147)}...` : descripcion;
    }

    return motivo.descripcionCorta?.trim() && motivo.descripcionCorta.trim() !== motivo.motivo.trim()
      ? motivo.motivo.trim()
      : '';
  }

  getNivelBadge(motivo: MotivoSoftSkill): string {
    return motivo.nivelPorDefecto ?? 'Manual';
  }

  getTipoEvidenciaLabel(motivo: MotivoSoftSkill): string {
    if (motivo.valorPorDefecto === 1) {
      return 'Positiva';
    }

    if (motivo.valorPorDefecto === -1) {
      return 'Negativa';
    }

    return 'Neutra';
  }

  getImpactoLabel(motivo: MotivoSoftSkill): string {
    const nivel = motivo.nivelPorDefecto;

    if (this.tipoMedicionSeleccionada === 'EVIDENCIA_MIXTA') {
      const impactoMixto: Record<string, string> = {
        '1-LEVE': '+0.4',
        '1-NORMAL': '+0.8',
        '1-SIGNIFICATIVA': '+1.5',
        '-1-LEVE': '-0.5',
        '-1-NORMAL': '-1.0',
        '-1-SIGNIFICATIVA': '-2.0'
      };

      return impactoMixto[`${motivo.valorPorDefecto}-${nivel}`] ?? 'impacto variable';
    }

    if (this.tipoMedicionSeleccionada === 'ACUMULACION_SATURADA') {
      const evidencia: Record<NivelMuestraSoftSkill, string> = {
        LEVE: 'suma evidencia leve',
        NORMAL: 'suma evidencia normal',
        SIGNIFICATIVA: 'suma evidencia fuerte'
      };

      return nivel ? evidencia[nivel] : 'suma evidencia';
    }

    if (motivo.valorPorDefecto === 1) {
      return 'recupera puntuacion';
    }

    if (motivo.valorPorDefecto === -1) {
      return 'penaliza puntuacion';
    }

    return 'manual';
  }

  tieneMetadatosMotivo(motivo: MotivoSoftSkill | null | undefined): boolean {
    return !!motivo?.id && (motivo.valorPorDefecto === 1 || motivo.valorPorDefecto === -1) && !!motivo.nivelPorDefecto;
  }

  private resetSeleccionConducta(): void {
    this.valoracionSeleccionada = this.esAcumulacionSaturada ? 'positiva' : null;
    this.nivelSeleccionado = 'NORMAL';
    this.motivoSeleccionado = null;
    this.grupoConductaActivo = null;
    this.motivoControl.setValue('');
    this.comentarioControl.setValue('');
  }

  enviarMuestra() {
    if (
      !this.cursoSeleccionado ||
      !this.alumnoSeleccionado ||
      !this.softSkillSeleccionada ||
      !this.puedeContinuarValoracion
    ) {
      this.notificationService.showError('Faltan datos necesarios para enviar la valoración');
      return;
    }

    const esAcumulacionSaturada = this.esAcumulacionSaturada;
    const motivo = this.motivoControl.value.trim();
    const comentario = this.comentarioControl.value.trim();
    const motivoEnriquecido = this.motivoSeleccionado && this.tieneMetadatosMotivo(this.motivoSeleccionado)
      ? this.motivoSeleccionado
      : null;
    const muestraPayload = this.buildMuestraPayload(esAcumulacionSaturada, motivo, comentario, motivoEnriquecido);

    if (this.editingMuestra) {
      this.softSkillService.actualizarMuestra(this.editingMuestra.id, muestraPayload).subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Muestra actualizada correctamente');
          this.muestraActualizada.emit(response);
          this.closeModal();
        },
        error: (error) => {
          this.notificationService.showHttpError(error, 'Error al actualizar la muestra.');
        },
        complete: () => {
          this.loadingService.hide();
        }
      });
      return;
    }

    const muestra: MuestraSK = {
      profesorId: this.cursoSeleccionado.profesor.id,
      ...muestraPayload
    };

    this.softSkillService.crearMuestra(muestra).subscribe({
      next: () => {
        this.notificationService.showSuccess('Valoración enviada correctamente');
        this.muestraCreada.emit();
        this.closeModal();
      },
      error: (error) => {
        this.notificationService.showHttpError(error, 'Error al enviar la valoración.');
      },
      complete: () => {
        this.loadingService.hide();
      }
    });
  }

  get tituloAccion(): string {
    return this.editingMuestra ? 'Editar muestra' : 'Resumen y Confirmar';
  }

  get textoBotonEnviar(): string {
    return this.editingMuestra ? 'Guardar cambios' : 'Enviar';
  }

  private buildMuestraPayload(
    esAcumulacionSaturada: boolean,
    motivo: string,
    comentario: string,
    motivoEnriquecido: MotivoSoftSkill | null
  ): MuestraSKUpdate {
    if (!this.cursoSeleccionado || !this.alumnoSeleccionado || !this.softSkillSeleccionada) {
      throw new Error('Faltan datos necesarios para enviar la valoracion');
    }

    return {
      cursoId: this.cursoSeleccionado.id,
      alumnoId: this.alumnoSeleccionado.id,
      softSkillId: this.softSkillSeleccionada.id,
      ...(motivoEnriquecido?.id ? { motivoId: motivoEnriquecido.id } : {}),
      ...(motivoEnriquecido
        ? { motivoComentario: comentario.length > 0 ? comentario : null }
        : {
            valor: esAcumulacionSaturada || this.valoracionSeleccionada === 'positiva' ? 1 : -1,
            motivo: motivo.length > 0 ? motivo : null,
            nivel: this.nivelSeleccionado,
            motivoComentario: comentario.length > 0 ? comentario : null
          })
    };
  }

  private resolveInitialSoftSkill(initialSoftSkill: SoftSkill): SoftSkill {
    return this.softSkills.find((softSkill) => softSkill.id === initialSoftSkill.id) ?? initialSoftSkill;
  }

  private hidratarEdicion(muestra: MuestraSKDetalle): void {
    const motivoPredefinido = muestra.motivoId && this.softSkillSeleccionada
      ? this.softSkillSeleccionada.listaMotivos?.find((motivo) => motivo.id === muestra.motivoId) ?? null
      : null;

    this.motivoSeleccionado = motivoPredefinido;
    this.motivoControl.setValue(muestra.motivo ?? '');
    this.comentarioControl.setValue(muestra.motivoComentario ?? '');

    if (motivoPredefinido) {
      this.valoracionSeleccionada = motivoPredefinido.valorPorDefecto === 1 ? 'positiva' : 'negativa';
      this.nivelSeleccionado = motivoPredefinido.nivelPorDefecto ?? this.normalizarNivel(muestra.nivel);
      this.grupoConductaActivo = motivoPredefinido.valorPorDefecto === -1 ? 'negativa' : 'positiva';
      return;
    }

    this.valoracionSeleccionada = muestra.valor >= 0 ? 'positiva' : 'negativa';
    this.nivelSeleccionado = this.normalizarNivel(muestra.nivel);
  }

  private normalizarNivel(nivel: string | null): NivelMuestraSoftSkill {
    return this.nivelesMuestra.some((item) => item.value === nivel)
      ? nivel as NivelMuestraSoftSkill
      : 'NORMAL';
  }
}
