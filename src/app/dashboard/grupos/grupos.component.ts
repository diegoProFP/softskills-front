import { Component, OnInit } from '@angular/core';
import { Grupo } from '../../modelo/grupo';
import { GrupoService } from '../../services/grupo.service';

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.scss']
})
export class GruposComponent implements OnInit {
  grupos: Grupo[] = [];
  loading = true;
  errorMessage = '';

  constructor(private grupoService: GrupoService) {}

  ngOnInit(): void {
    this.cargarGrupos();
  }

  cargarGrupos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.grupoService.getGrupos().subscribe({
      next: (grupos) => {
        this.grupos = grupos || [];
        this.loading = false;
      },
      error: () => {
        this.grupos = [];
        this.errorMessage = 'No se pudieron cargar los grupos.';
        this.loading = false;
      }
    });
  }

  formatGrupoTitle(grupo: Grupo): string {
    return `${grupo.nivel}º ${grupo.cicloFormativo} ${grupo.grupo}`;
  }
}
