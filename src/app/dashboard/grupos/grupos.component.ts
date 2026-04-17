import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Grupo } from '../../modelo/grupo';
import { GrupoService } from '../../services/grupo.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.scss']
})
export class GruposComponent implements OnInit {
  grupos: Grupo[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private grupoService: GrupoService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

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
      error: (error) => {
        this.grupos = [];
        this.errorMessage = this.notificationService.showHttpError(error, 'No se pudieron cargar los grupos.');
        this.loading = false;
      }
    });
  }

  formatGrupoTitle(grupo: Grupo): string {
    return `${grupo.nivel}º ${grupo.cicloFormativo} ${grupo.grupo}`;
  }

  goToDetalle(grupo: Grupo): void {
    void this.router.navigate([
      '/dashboard',
      'grupos',
      grupo.nivel,
      grupo.cicloFormativo,
      grupo.grupo,
      grupo.cursoEscolar
    ]);
  }
}
