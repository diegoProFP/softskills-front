import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlumnoConTotales } from '../../modelo/alumno-con-totales';
import { Grupo } from '../../modelo/grupo';
import { GrupoService } from '../../services/grupo.service';
import {
  getSoftSkillLookupKey,
  getSoftSkillTotalByCodigo,
  getSoftSkillTotalByKey,
  SoftSkillTotalDTO,
  sortSoftSkillsByNombre
} from '../../modelo/softskill-total';

interface SkillColumn {
  key: string;
  codigo: string | null;
  nombre: string;
}

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

  get skillColumns(): SkillColumn[] {
    const columnsByKey = new Map<string, SkillColumn>();

    this.alumnos.forEach((alumno) => {
      sortSoftSkillsByNombre(alumno.totalesPorSkill).forEach((softSkillTotal) => {
        const key = getSoftSkillLookupKey(softSkillTotal);

        if (!columnsByKey.has(key)) {
          columnsByKey.set(key, this.toSkillColumn(softSkillTotal));
        }
      });
    });

    return Array.from(columnsByKey.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );
  }

  get tituloGrupo(): string {
    if (!this.grupo) {
      return 'Detalle del grupo';
    }

    return `${this.grupo.nivel}Âº ${this.grupo.cicloFormativo} ${this.grupo.grupo}`;
  }

  getTotalPorSkill(alumno: AlumnoConTotales, skill: SkillColumn): number | null {
    const totalByCodigo = getSoftSkillTotalByCodigo(alumno?.totalesPorSkill, skill.codigo);
    const total = totalByCodigo ?? getSoftSkillTotalByKey(alumno?.totalesPorSkill, skill.key);

    return typeof total?.puntuacionTotal === 'number' ? total.puntuacionTotal : null;
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

  private toSkillColumn(softSkill: SoftSkillTotalDTO): SkillColumn {
    return {
      key: getSoftSkillLookupKey(softSkill),
      codigo: softSkill.codigo ?? null,
      nombre: softSkill.nombre
    };
  }
}
