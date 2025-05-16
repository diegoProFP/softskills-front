import { Component, ViewChildren, QueryList, Output, EventEmitter, OnInit } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatCard } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { CursoService } from '../../services/curso.service';
import { Alumno, Curso } from '../../modelo/curso';
import { Observable } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { SoftSkill } from 'src/app/modelo/softskill';
import { SoftSkillService } from 'src/app/services/softskill.service';
import { MuestraSK } from 'src/app/modelo/muestra-sk';
import { LoadingService } from 'src/app/services/loading.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-wizard-modal',
  templateUrl: './wizard-modal.component.html',
  styleUrls: ['./wizard-modal.component.scss']
})
export class WizardModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  currentStep: number = 1;
  totalSteps: number = 5;
  @ViewChildren(MatExpansionPanel) panels: QueryList<MatExpansionPanel>;

  cursoSeleccionado: Curso | null = null;
  cursos$: Observable<Curso[]>;
  alumnos: Alumno[] = [];
  alumnoSeleccionado: Alumno | null = null;


  letrasGrupos: { letra: string; rango: string }[] = [
    { letra: 'A-D', rango: 'A-D' },
    { letra: 'E-H', rango: 'E-H' },
    { letra: 'I-L', rango: 'I-L' },
    { letra: 'M-P', rango: 'M-P' },
    { letra: 'Q-T', rango: 'Q-T' },
    { letra: 'U-X', rango: 'U-X' },
    { letra: 'Y-Z', rango: 'Y-Z' }
  ];
  letraSeleccionada: string | null = null;
  alumnosFiltrados: Alumno[] = [];
  softSkillSeleccionada: SoftSkill | null = null;
softSkills: SoftSkill[] = [];

valoracionSeleccionada: 'positiva' | 'negativa' | null = null;


  constructor(private cursoService: CursoService,
    private softSkillService: SoftSkillService,
    private loadingService: LoadingService,
    private snackBar: MatSnackBar ,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cursoSeleccionado = this.cursoService['cursoSeleccionado'];
    if (!this.cursoSeleccionado) {
      this.cursos$ = this.cursoService.getCursos();
    } else {
      this.cargarSoftSkills();
      this.currentStep = 2; // Establece el paso inicial en el segundo panel
    }
  }

  ngAfterViewInit() {
    if (this.currentStep === 2) {
      const panelArray = this.panels.toArray();
      panelArray[1].open(); // Abre el segundo panel
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      const panelArray = this.panels.toArray();
      panelArray[this.currentStep - 1].open();
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
    this.panels.forEach(panel => panel.close());
    this.panels.first.open();
  }

  closeModal() {
    console.log('Modal closed');
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
    this.alumnosFiltrados = this.cursoSeleccionado.alumnos.filter(alumno => {
      const primeraLetra = alumno.nombre.charAt(0).toUpperCase();
      return primeraLetra >= inicio && primeraLetra <= fin;
    });
  }

  seleccionarAlumno(alumno: Alumno) {
    this.alumnoSeleccionado = alumno;
    this.nextStep();
  }

  // Método para seleccionar una soft skill
seleccionarSoftSkill(softSkill: SoftSkill) {
  this.softSkillSeleccionada = softSkill;
  this.nextStep();
}

// En el método que se llama cuando se selecciona un curso
cargarSoftSkills() {
  if (this.cursoSeleccionado?.softSkills) {
    this.softSkills = this.cursoSeleccionado.softSkills;
  } else {
    this.softSkills = [];
  }
  this.softSkillSeleccionada = null;
}

// Llama a cargarSoftSkills cuando se selecciona un curso
seleccionarCurso(curso: Curso) {
  this.cursoSeleccionado = curso;
  this.cargarAlumnos();
  this.cargarSoftSkills(); // Agrega esta línea
}


// Método para manejar la selección de valoración
handleValoracionSeleccionada(valoracion: 'positiva' | 'negativa') {
  this.valoracionSeleccionada = valoracion;
  this.nextStep();
}

// Agrega este método
enviarMuestra() {
  if (!this.cursoSeleccionado || !this.alumnoSeleccionado || 
      !this.softSkillSeleccionada || !this.valoracionSeleccionada) {
        this.notificationService.showError('Faltan datos necesarios para enviar la valoración');

        return;
  }

  const muestra: MuestraSK = {
    profesorId: this.cursoSeleccionado.profesor.id,
    cursoId: this.cursoSeleccionado.id,
    alumnoId: this.alumnoSeleccionado.id,
    softSkillId: this.softSkillSeleccionada.id,
    valor: this.valoracionSeleccionada === 'positiva' ? 1 : -1
  };

  this.softSkillService.crearMuestra(muestra).subscribe({
    next: (response) => {
      this.notificationService.showSuccess('Valoración enviada correctamente');
      this.closeModal();
    },
    error: (error) => {
      this.notificationService.showError('Error al enviar la valoración: ' + error.message);
    },
    complete: () => {
      this.loadingService.hide();
    }
  });
}

}