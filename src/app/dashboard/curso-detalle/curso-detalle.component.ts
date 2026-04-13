import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../modelo/curso';
import { Alumno } from '../../modelo/alumno';
import { SoftSkill } from '../../modelo/softskill';
import {
  getSoftSkillLookupKey,
  getSoftSkillTotalByCodigo,
  getSoftSkillTotalByKey,
  indexSoftSkillsByCodigo,
  SoftSkillTotalDTO,
  sortSoftSkillsByNombre
} from '../../modelo/softskill-total';

interface SkillColumn {
  key: string;
  codigo: string | null;
  nombre: string;
}

@Component({
  selector: 'app-curso-detalle',
  templateUrl: './curso-detalle.component.html',
  styleUrls: ['./curso-detalle.component.scss']
})
export class CursoDetalleComponent implements OnInit {
  curso: Curso | null = null;
  loading = true;
  isWizardVisible = false;
  alumnoWizardSeleccionado: Alumno | null = null;

  constructor(private route: ActivatedRoute, private cursoService: CursoService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cursoService.getCursoById(id).subscribe({
        next: (curso) => {
          this.curso = curso;
          this.loading = false;
        },
        error: () => {
          this.curso = null;
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  get skillColumns(): SkillColumn[] {
    if (!this.curso) {
      return [];
    }

    const columnsByKey = new Map<string, SkillColumn>();
    const cursoSoftSkills = sortSoftSkillsByNombre(this.curso.softSkills);
    const cursoSoftSkillsByCodigo = indexSoftSkillsByCodigo(cursoSoftSkills);

    cursoSoftSkills.forEach((softSkill) => {
      columnsByKey.set(getSoftSkillLookupKey(softSkill), this.toSkillColumn(softSkill));
    });

    this.curso.alumnos?.forEach((alumno) => {
      sortSoftSkillsByNombre(alumno.totalesPorSkill).forEach((softSkillTotal) => {
        const softSkill = softSkillTotal.codigo
          ? cursoSoftSkillsByCodigo[softSkillTotal.codigo] ?? softSkillTotal
          : softSkillTotal;
        const key = getSoftSkillLookupKey(softSkillTotal);

        if (!columnsByKey.has(key)) {
          columnsByKey.set(key, this.toSkillColumn(softSkill));
        }
      });
    });

    return Array.from(columnsByKey.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );
  }

  getTotalPorSkill(alumno: Alumno, skill: SkillColumn): number | null {
    const totalByCodigo = getSoftSkillTotalByCodigo(alumno?.totalesPorSkill, skill.codigo);
    const total = totalByCodigo ?? getSoftSkillTotalByKey(alumno?.totalesPorSkill, skill.key);

    return typeof total?.puntuacionTotal === 'number' ? total.puntuacionTotal : null;
  }

  abrirWizardNuevaMuestra(alumno: Alumno): void {
    this.alumnoWizardSeleccionado = alumno;
    this.isWizardVisible = true;
  }

  cerrarWizardNuevaMuestra(): void {
    this.isWizardVisible = false;
    this.alumnoWizardSeleccionado = null;
  }

  getNuevaMuestraTooltip(alumno: Alumno): string {
    return `nueva muestra para el alumno ${alumno.nombre}`;
  }

  private toSkillColumn(softSkill: SoftSkill | SoftSkillTotalDTO): SkillColumn {
    return {
      key: getSoftSkillLookupKey(softSkill),
      codigo: softSkill.codigo ?? null,
      nombre: softSkill.nombre
    };
  }
}
