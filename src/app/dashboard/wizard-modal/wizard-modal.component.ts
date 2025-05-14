import { Component, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector: 'app-wizard-modal',
  templateUrl: './wizard-modal.component.html',
  styleUrls: ['./wizard-modal.component.scss']
})
export class WizardModalComponent {

  @Output() close = new EventEmitter<void>();

  currentStep: number = 1;
  totalSteps: number = 5;
  isModalVisible: boolean = true;

  @ViewChildren(MatExpansionPanel) panels: QueryList<MatExpansionPanel>;

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
      panelArray[this.currentStep - 1].close(); // Cierra el panel actual
      this.currentStep--;
      panelArray[this.currentStep - 1].open(); // Abre el panel anterior
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