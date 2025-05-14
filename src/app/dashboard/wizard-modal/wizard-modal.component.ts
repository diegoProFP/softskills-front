import { Component, ViewChildren, QueryList, Output, EventEmitter, OnInit } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../modelo/curso';
import { Observable } from 'rxjs';

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

  constructor(private cursoService: CursoService) {}

  ngOnInit() {
    this.cursoSeleccionado = this.cursoService['cursoSeleccionado'];
    if (!this.cursoSeleccionado) {
      this.cursos$ = this.cursoService.getCursos();
    } else {
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

  resetWizard() {
    this.currentStep = 1;
    this.panels.forEach(panel => panel.close());
    this.panels.first.open();
  }

  closeModal() {
    console.log('Modal closed');
    this.close.emit();
  }
}