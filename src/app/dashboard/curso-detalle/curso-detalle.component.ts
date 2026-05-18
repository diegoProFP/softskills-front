import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CursoService } from '../../services/curso.service';
import { NotificationService } from '../../services/notification.service';
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

type SortDirection = 'asc' | 'desc';
type CursoSortColumn = 'id' | 'nombre' | 'apellidos' | `skill:${string}`;

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
  sortColumn: CursoSortColumn = 'id';
  sortDirection: SortDirection = 'asc';

  constructor(
    private route: ActivatedRoute,
    private cursoService: CursoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      return;
    }

    this.cargarCurso(id);
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

  get alumnosOrdenados(): Alumno[] {
    const alumnos = this.curso?.alumnos || [];

    return alumnos.slice().sort((a, b) => this.compareAlumnos(a, b));
  }

  get numeroAlumnos(): number {
    return this.curso?.alumnos?.length || 0;
  }

  getCursoNombre(curso: Curso): string {
    return curso.nombre?.trim() || `Curso ${curso.id}`;
  }

  getTotalPorSkill(alumno: Alumno, skill: SkillColumn): number | null {
    const totalByCodigo = getSoftSkillTotalByCodigo(alumno?.totalesPorSkill, skill.codigo);
    const total = totalByCodigo ?? getSoftSkillTotalByKey(alumno?.totalesPorSkill, skill.key);

    return typeof total?.puntuacionTotal === 'number' ? total.puntuacionTotal : null;
  }

  ordenarPor(column: CursoSortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  getSortLabel(column: CursoSortColumn): string {
    if (this.sortColumn !== column) {
      return '⇅';
    }

    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  isSortedBy(column: CursoSortColumn): boolean {
    return this.sortColumn === column;
  }

  getSkillSortColumn(skill: SkillColumn): CursoSortColumn {
    return `skill:${skill.key}`;
  }

  abrirWizardNuevaMuestra(alumno: Alumno): void {
    this.alumnoWizardSeleccionado = alumno;
    this.isWizardVisible = true;
  }

  cerrarWizardNuevaMuestra(): void {
    this.isWizardVisible = false;
    this.alumnoWizardSeleccionado = null;
  }

  recargarCursoActual(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.cargarCurso(id, false);
    }
  }

  getNuevaMuestraTooltip(alumno: Alumno): string {
    return `nueva muestra para el alumno ${this.getAlumnoNombreCompleto(alumno)}`;
  }

  private getAlumnoNombreCompleto(alumno: Alumno): string {
    return alumno.nombreCompleto || [alumno.nombre, alumno.apellidos].filter(Boolean).join(' ') || 'seleccionado';
  }

  private cargarCurso(id: string, showLoading = true): void {
    if (showLoading) {
      this.loading = true;
    }

    this.cursoService.getCursoById(id).subscribe({
      next: (curso) => {
        this.curso = {
          ...curso,
          alumnos: (curso.alumnos || []).map((alumno) => this.normalizarAlumno(alumno))
        };
        this.loading = false;
      },
      error: (error) => {
        this.curso = null;
        this.notificationService.showHttpError(error, 'No se pudo cargar el detalle del curso.');
        this.loading = false;
      }
    });
  }

  private compareAlumnos(a: Alumno, b: Alumno): number {
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    const value = this.compareByColumn(a, b, this.sortColumn);

    return value * direction || a.id - b.id;
  }

  private compareByColumn(a: Alumno, b: Alumno, column: CursoSortColumn): number {
    if (column === 'id') {
      return this.compareNumbers(a.id, b.id);
    }

    if (column === 'nombre') {
      return this.compareText(a.nombre, b.nombre);
    }

    if (column === 'apellidos') {
      return this.compareText(a.apellidos, b.apellidos);
    }

    const skill = this.skillColumns.find((columnItem) => this.getSkillSortColumn(columnItem) === column);

    return skill
      ? this.compareNullableNumbers(this.getTotalPorSkill(a, skill), this.getTotalPorSkill(b, skill))
      : 0;
  }

  private compareNumbers(a: number, b: number): number {
    return a - b;
  }

  private compareNullableNumbers(a: number | null, b: number | null): number {
    if (a === null && b === null) {
      return 0;
    }

    if (a === null) {
      return 1;
    }

    if (b === null) {
      return -1;
    }

    return a - b;
  }

  private compareText(a?: string | null, b?: string | null): number {
    return (a || '').localeCompare(b || '', 'es', { sensitivity: 'base' });
  }

  private normalizarAlumno(alumno: Alumno): Alumno {
    const nombre = this.getTexto(alumno.nombre);
    const apellidos = this.getTexto(alumno.apellidos);
    const nombreCompleto = this.getTexto(alumno.nombreCompleto) || [nombre, apellidos].filter(Boolean).join(' ');

    if (apellidos) {
      return {
        ...alumno,
        nombre,
        apellidos,
        nombreCompleto
      };
    }

    const partesNombreCompleto = (nombreCompleto || nombre).split(/\s+/).filter(Boolean);
    const nombreSeparado = partesNombreCompleto[0] || nombre;
    const apellidosSeparados = partesNombreCompleto.slice(1).join(' ');

    return {
      ...alumno,
      nombre: nombreSeparado,
      apellidos: apellidosSeparados || null,
      nombreCompleto: nombreCompleto || [nombreSeparado, apellidosSeparados].filter(Boolean).join(' ')
    };
  }

  private getTexto(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toSkillColumn(softSkill: SoftSkill | SoftSkillTotalDTO): SkillColumn {
    return {
      key: getSoftSkillLookupKey(softSkill),
      codigo: softSkill.codigo ?? null,
      nombre: softSkill.nombre
    };
  }
}
