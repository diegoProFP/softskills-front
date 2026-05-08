import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlumnoConTotales } from '../../modelo/alumno-con-totales';
import { Grupo } from '../../modelo/grupo';
import { GrupoService } from '../../services/grupo.service';
import { NotificationService } from '../../services/notification.service';
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

type SortDirection = 'asc' | 'desc';
type GrupoSortColumn = 'ranking' | 'nombre' | 'apellidos' | 'score' | 'muestras' | `skill:${string}`;

@Component({
  selector: 'app-grupo-detalle',
  templateUrl: './grupo-detalle.component.html',
  styleUrls: ['./grupo-detalle.component.scss']
})
export class GrupoDetalleComponent implements OnInit {
  private readonly ordinalIndicator = '\u00BA';

  grupo: Grupo | null = null;
  alumnos: AlumnoConTotales[] = [];
  loading = true;
  errorMessage = '';
  sortColumn: GrupoSortColumn = 'ranking';
  sortDirection: SortDirection = 'asc';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grupoService: GrupoService,
    private notificationService: NotificationService
  ) {}

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

    return `${this.grupo.nivel}${this.ordinalIndicator} ${this.grupo.cicloFormativo} ${this.grupo.grupo}`;
  }

  get topRankingAlumnos(): AlumnoConTotales[] {
    return this.alumnos.slice(0, 3);
  }

  get alumnosOrdenados(): AlumnoConTotales[] {
    return this.alumnos.slice().sort((a, b) => this.compareAlumnos(a, b));
  }

  get resumenReturnUrl(): string {
    return this.router.url;
  }

  getTotalPorSkill(alumno: AlumnoConTotales, skill: SkillColumn): number | null {
    const totalByCodigo = getSoftSkillTotalByCodigo(alumno?.totalesPorSkill, skill.codigo);
    const total = totalByCodigo ?? getSoftSkillTotalByKey(alumno?.totalesPorSkill, skill.key);

    return typeof total?.puntuacionTotal === 'number' ? total.puntuacionTotal : null;
  }

  getRankingPositionLabel(alumno: AlumnoConTotales): string {
    return typeof alumno.posicionRanking === 'number'
      ? `${alumno.posicionRanking}${this.ordinalIndicator}`
      : 'S/R';
  }

  getRankingScore(alumno: AlumnoConTotales): number | null {
    return typeof alumno.rankingScore === 'number' ? alumno.rankingScore : null;
  }

  getNumMuestras(alumno: AlumnoConTotales): number | null {
    return typeof alumno.numMuestrasTotales === 'number' ? alumno.numMuestrasTotales : null;
  }

  getAlumnoNombreCompleto(alumno: AlumnoConTotales): string {
    return alumno.nombreCompleto || [alumno.nombre, alumno.apellidos].filter(Boolean).join(' ') || '-';
  }

  ordenarPor(column: GrupoSortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  getSortLabel(column: GrupoSortColumn): string {
    if (this.sortColumn !== column) {
      return '⇅';
    }

    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  isSortedBy(column: GrupoSortColumn): boolean {
    return this.sortColumn === column;
  }

  getSkillSortColumn(skill: SkillColumn): GrupoSortColumn {
    return `skill:${skill.key}`;
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
        this.alumnos = (alumnos || []).map((alumno) => this.normalizarAlumno(alumno));
        this.loading = false;
      },
      error: (error) => {
        this.alumnos = [];
        this.errorMessage = this.notificationService.showHttpError(error, 'No se pudieron cargar los totales del grupo.');
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

  private compareAlumnos(a: AlumnoConTotales, b: AlumnoConTotales): number {
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    const value = this.compareByColumn(a, b, this.sortColumn);

    return value * direction || this.compareNullableNumbers(a.posicionRanking ?? null, b.posicionRanking ?? null);
  }

  private compareByColumn(a: AlumnoConTotales, b: AlumnoConTotales, column: GrupoSortColumn): number {
    if (column === 'ranking') {
      return this.compareNullableNumbers(a.posicionRanking ?? null, b.posicionRanking ?? null);
    }

    if (column === 'nombre') {
      return this.compareText(a.nombre, b.nombre);
    }

    if (column === 'apellidos') {
      return this.compareText(a.apellidos, b.apellidos);
    }

    if (column === 'score') {
      return this.compareNullableNumbers(this.getRankingScore(a), this.getRankingScore(b));
    }

    if (column === 'muestras') {
      return this.compareNullableNumbers(this.getNumMuestras(a), this.getNumMuestras(b));
    }

    const skill = this.skillColumns.find((columnItem) => this.getSkillSortColumn(columnItem) === column);

    return skill
      ? this.compareNullableNumbers(this.getTotalPorSkill(a, skill), this.getTotalPorSkill(b, skill))
      : 0;
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

  private normalizarAlumno(alumno: AlumnoConTotales): AlumnoConTotales {
    const alumnoResponse = alumno as AlumnoConTotales & Record<string, unknown>;
    const nombre = this.getTexto(alumno.nombre);
    const apellidos = this.getTexto(alumno.apellidos);
    const nombreCompleto = this.getTexto(alumnoResponse['nombreCompleto']) || [nombre, apellidos].filter(Boolean).join(' ');

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
}
