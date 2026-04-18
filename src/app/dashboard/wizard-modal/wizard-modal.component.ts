import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Observable } from 'rxjs';
import { Alumno, Curso } from '../../modelo/curso';
import { MuestraSK } from '../../modelo/muestra-sk';
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
  @Output() close = new EventEmitter<void>();
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
      this.currentStep = 3;
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
    this.nivelSeleccionado = 'NORMAL';
    this.motivoControl.setValue('');
    this.nextStep();
  }

  cargarSoftSkills() {
    this.softSkills = this.cursoSeleccionado?.softSkills || [];
    this.softSkillSeleccionada = null;
    this.valoracionSeleccionada = null;
    this.nivelSeleccionado = 'NORMAL';
    this.motivoControl.setValue('');
  }

  seleccionarCurso(curso: Curso) {
    this.cursoSeleccionado = curso;
    this.cargarAlumnos();
    this.cargarSoftSkills();
  }

  handleValoracionSeleccionada(valoracion: 'positiva' | 'negativa') {
    this.valoracionSeleccionada = valoracion;
  }

  seleccionarNivel(nivel: NivelMuestraSoftSkill) {
    this.nivelSeleccionado = nivel;
    this.valoracionSeleccionada = 'positiva';
  }

  seleccionarMotivo(motivo: MotivoSoftSkill) {
    this.motivoControl.setValue(motivo.motivo);
  }

  get motivosSoftSkillSeleccionada(): MotivoSoftSkill[] {
    return (this.softSkillSeleccionada?.listaMotivos ?? [])
      .filter((motivo) => typeof motivo?.motivo === 'string' && motivo.motivo.trim().length > 0);
  }

  get motivoResumen(): string | null {
    const motivo = this.motivoControl.value.trim();
    return motivo.length > 0 ? motivo : null;
  }

  get tipoMedicionSeleccionada(): TipoMedicionSoftSkill {
    return this.softSkillSeleccionada?.tipoMedicion ?? 'PENALIZACION_POR_TRAMOS';
  }

  get esAcumulacionSaturada(): boolean {
    return this.tipoMedicionSeleccionada === 'ACUMULACION_SATURADA';
  }

  get puedeContinuarValoracion(): boolean {
    return this.esAcumulacionSaturada || !!this.valoracionSeleccionada;
  }

  get resumenValoracion(): string {
    if (this.esAcumulacionSaturada) {
      return `Participacion positiva - ${this.getNivelLabel(this.nivelSeleccionado)}`;
    }

    return this.valoracionSeleccionada === 'positiva' ? 'Positiva' : 'Negativa';
  }

  private getNivelLabel(nivel: NivelMuestraSoftSkill): string {
    return this.nivelesMuestra.find((item) => item.value === nivel)?.label ?? 'Normal';
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
    const muestra: MuestraSK = {
      profesorId: this.cursoSeleccionado.profesor.id,
      cursoId: this.cursoSeleccionado.id,
      alumnoId: this.alumnoSeleccionado.id,
      softSkillId: this.softSkillSeleccionada.id,
      valor: esAcumulacionSaturada || this.valoracionSeleccionada === 'positiva' ? 1 : -1,
      motivo: motivo.length > 0 ? motivo : null,
      ...(esAcumulacionSaturada ? { nivel: this.nivelSeleccionado } : {})
    };

    this.softSkillService.crearMuestra(muestra).subscribe({
      next: () => {
        this.notificationService.showSuccess('Valoración enviada correctamente');
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
}
