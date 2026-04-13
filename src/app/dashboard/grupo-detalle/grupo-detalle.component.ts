import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlumnoConTotales } from '../../modelo/alumno-con-totales';
import { Grupo } from '../../modelo/grupo';
import { GrupoService } from '../../services/grupo.service';

@Component({
  selector: 'app-grupo-detalle',
  templateUrl: './grupo-detalle.component.html',
  styleUrls: ['./grupo-detalle.component.scss']
})
export class GrupoDetalleComponent implements OnInit {
  grupo: Grupo | null = null;
  alumnos: AlumnoConTotales[] = [];
  loading = true;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private grupoService: GrupoService) {}

  ngOnInit(): void {
    const nivel = this.route.snapshot.paramMap.get('nivel');
    const cicloFormativo = this.route.snapshot.paramMap.get('cicloFormativo');
    const grupo = this.route.snapshot.paramMap.get('grupo');
    const cursoEscolar = this.route.snapshot.paramMap.get('cursoEscolar');

    if (!nivel || !cicloFormativo || !grupo || !cursoEscolar) {
      this.errorMessage = 'No se pudo identificar el grupo seleccionado.';
      this.loading = false;
      return;
    }

    this.grupo = {
      id: 0,
      nivel,
      cicloFormativo,
      grupo,
      cursoEscolar
    };

    this.cargarTotales();
  }

  get skillColumns(): string[] {
    return Array.from(
      new Set(this.alumnos.flatMap((alumno) => Object.keys(alumno.totalesPorSkill ?? {})))
    );
  }

  get tituloGrupo(): string {
    if (!this.grupo) {
      return 'Detalle del grupo';
    }

    return `${this.grupo.nivel}º ${this.grupo.cicloFormativo} ${this.grupo.grupo}`;
  }

  getTotalPorSkill(alumno: AlumnoConTotales, skill: string): number | null {
    const total = alumno?.totalesPorSkill?.[skill];

    return typeof total === 'number' ? total : null;
  }

  recargar(): void {
    if (!this.grupo) {
      return;
    }

    this.cargarTotales();
  }

  private cargarTotales(): void {
    if (!this.grupo) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.grupoService.getTotalesByGrupo(this.grupo).subscribe({
      next: (alumnos) => {
        this.alumnos = alumnos || [];
        this.loading = false;
      },
      error: () => {
        this.alumnos = [];
        this.errorMessage = 'No se pudieron cargar los totales del grupo.';
        this.loading = false;
      }
    });
  }
}
