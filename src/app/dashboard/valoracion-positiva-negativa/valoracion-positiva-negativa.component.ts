import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-valoracion-positiva-negativa',
  templateUrl: './valoracion-positiva-negativa.component.html',
  styleUrls: ['./valoracion-positiva-negativa.component.scss']
})
export class ValoracionPositivaNegativaComponent {
  @Output() valoracionSeleccionada = new EventEmitter<'positiva' | 'negativa'>();

  seleccionarValoracion(valoracion: 'positiva' | 'negativa') {
    this.valoracionSeleccionada.emit(valoracion);
  }


  
}