import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../modelo/curso';
import { Alumno } from '../../modelo/alumno';
import { SoftSkill } from '../../modelo/softskill';

@Component({
  selector: 'app-curso-detalle',
  templateUrl: './curso-detalle.component.html',
  styleUrls: ['./curso-detalle.component.scss']
})
export class CursoDetalleComponent implements OnInit {
  curso: Curso | null = null;
  loading = true;

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

  get skillColumns(): string[] {
    if (!this.curso) {
      return [];
    }

    const nombresSoftSkills = this.curso.softSkills?.map((softSkill) => softSkill.nombre) ?? [];
    const nombresTotales = this.curso.alumnos?.flatMap((alumno) => Object.keys(alumno.totalesPorSkill ?? {})) ?? [];

    return Array.from(new Set([...nombresSoftSkills, ...nombresTotales]));
  }

  getTotalPorSkill(alumno: Alumno, skill: string): number | null {
    const total = alumno?.totalesPorSkill?.[skill];

    return typeof total === 'number' ? total : null;
  }

  getSoftSkillByName(skillName: string): SoftSkill | undefined {
    return this.curso?.softSkills?.find((softSkill) => softSkill.nombre === skillName);
  }
}
