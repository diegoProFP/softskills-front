import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CursoService } from '../../services/curso.service';
import { NotificationService } from '../../services/notification.service';
import { SoftSkillService } from '../../services/softskill.service';
import { Curso } from '../../modelo/curso';
import { Alumno } from '../../modelo/alumno';
import { SoftSkill } from '../../modelo/softskill';
import { CursoSoftSkillMuestrasResponse } from '../../modelo/curso-soft-skill-muestras';
import { MuestraSKDetalle, MuestraSKTotalActualizado, MuestraSKUpdateResponse } from '../../modelo/muestra-sk';
import {
  getSoftSkillLookupKey,
  getSoftSkillTotalByCodigo,
  getSoftSkillTotalByKey,
  indexSoftSkillsByCodigo,
  SoftSkillTotalDTO,
  sortSoftSkillsByNombre
} from '../../modelo/softskill-total';

interface SkillColumn {
  id: number;
  key: string;
  codigo: string | null;
  nombre: string;
}

interface MuestrasPanelState {
  alumno: Alumno;
  skill: SkillColumn;
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
  softSkillWizardSeleccionada: SoftSkill | null = null;
  muestraWizardSeleccionada: MuestraSKDetalle | null = null;
  muestrasPanelState: MuestrasPanelState | null = null;
  muestrasDetalle: CursoSoftSkillMuestrasResponse | null = null;
  muestrasErrorMessage: string | null = null;
  muestrasLoading = false;
  borrandoMuestras = new Set<number>();
  private touchStartPoint: { x: number; y: number } | null = null;
  private touchMoved = false;
  private suppressNextClick = false;
  sortColumn: CursoSortColumn = 'id';
  sortDirection: SortDirection = 'asc';

  constructor(
    private route: ActivatedRoute,
    private cursoService: CursoService,
    private softSkillService: SoftSkillService,
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
    this.softSkillWizardSeleccionada = null;
    this.muestraWizardSeleccionada = null;
    this.isWizardVisible = true;
  }

  cerrarWizardNuevaMuestra(): void {
    this.isWizardVisible = false;
    this.alumnoWizardSeleccionado = null;
    this.softSkillWizardSeleccionada = null;
    this.muestraWizardSeleccionada = null;
  }

  abrirPanelMuestras(alumno: Alumno, skill: SkillColumn, event?: Event): void {
    if (this.suppressNextClick && event instanceof MouseEvent) {
      this.suppressNextClick = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event?.preventDefault();
    event?.stopPropagation();

    if (!this.curso) {
      return;
    }

    if (
      this.muestrasPanelState?.alumno.id === alumno.id &&
      this.muestrasPanelState.skill.id === skill.id &&
      (this.muestrasLoading || this.muestrasDetalle)
    ) {
      return;
    }

    this.muestrasPanelState = { alumno, skill };
    this.muestrasDetalle = null;
    this.muestrasErrorMessage = null;
    this.cargarMuestrasPanel();
  }

  registrarInicioToque(event: TouchEvent): void {
    const touch = event.touches[0];

    if (!touch) {
      this.touchStartPoint = null;
      this.touchMoved = false;
      return;
    }

    this.touchStartPoint = { x: touch.clientX, y: touch.clientY };
    this.touchMoved = false;
  }

  registrarMovimientoToque(event: TouchEvent): void {
    const touch = event.touches[0];

    if (!touch || !this.touchStartPoint) {
      return;
    }

    const deltaX = Math.abs(touch.clientX - this.touchStartPoint.x);
    const deltaY = Math.abs(touch.clientY - this.touchStartPoint.y);

    if (deltaX > 10 || deltaY > 10) {
      this.touchMoved = true;
    }
  }

  abrirPanelMuestrasConToque(alumno: Alumno, skill: SkillColumn, event: TouchEvent): void {
    this.suppressNextClick = true;
    window.setTimeout(() => {
      this.suppressNextClick = false;
    }, 400);

    if (this.touchMoved) {
      this.touchStartPoint = null;
      this.touchMoved = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.touchStartPoint = null;
    this.touchMoved = false;
    this.abrirPanelMuestras(alumno, skill);
  }

  cerrarPanelMuestras(): void {
    this.muestrasPanelState = null;
    this.muestrasDetalle = null;
    this.muestrasErrorMessage = null;
    this.muestrasLoading = false;
    this.borrandoMuestras.clear();
  }

  abrirEdicionMuestra(muestra: MuestraSKDetalle): void {
    if (!this.muestrasPanelState) {
      return;
    }

    this.alumnoWizardSeleccionado = this.muestrasPanelState.alumno;
    this.softSkillWizardSeleccionada = this.getSoftSkillByColumn(this.muestrasPanelState.skill);
    this.muestraWizardSeleccionada = muestra;
    this.isWizardVisible = true;
  }

  borrarMuestra(muestra: MuestraSKDetalle): void {
    if (!this.muestrasPanelState || !this.curso || this.borrandoMuestras.has(muestra.id)) {
      return;
    }

    const confirmed = window.confirm('¿Borrar esta muestra? Esta accion actualizara la puntuacion del alumno.');

    if (!confirmed) {
      return;
    }

    const { alumno, skill } = this.muestrasPanelState;
    this.borrandoMuestras.add(muestra.id);

    this.softSkillService.borrarMuestra(muestra.id, this.curso.id, alumno.id, skill.id).subscribe({
      next: (response) => {
        this.muestrasDetalle = this.muestrasDetalle
          ? {
              ...this.muestrasDetalle,
              numMuestras: response.totalActualizado.numMuestras,
              muestras: this.muestrasDetalle.muestras.filter((item) => item.id !== muestra.id)
            }
          : null;
        this.aplicarTotalActualizado(response.totalActualizado);
        this.notificationService.showSuccess('Muestra borrada correctamente');
      },
      error: (error) => {
        this.notificationService.showHttpError(error, 'No se ha podido borrar la muestra.');
      },
      complete: () => {
        this.borrandoMuestras.delete(muestra.id);
      }
    });
  }

  onMuestraActualizada(response: MuestraSKUpdateResponse): void {
    if (this.muestrasDetalle) {
      this.muestrasDetalle = {
        ...this.muestrasDetalle,
        muestras: this.muestrasDetalle.muestras.map((muestra) =>
          muestra.id === response.muestra.id ? response.muestra : muestra
        )
      };
    }

    this.aplicarTotalActualizado(response.totalActualizado);
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

  getMuestraAccionTooltip(alumno: Alumno, skill: SkillColumn): string {
    return `ver muestras de ${skill.nombre} para ${this.getAlumnoNombreCompleto(alumno)}`;
  }

  getValorMuestraLabel(muestra: MuestraSKDetalle): string {
    if (muestra.valor > 0) {
      return `+${muestra.valor}`;
    }

    return `${muestra.valor}`;
  }

  getNivelMuestraLabel(muestra: MuestraSKDetalle): string {
    return muestra.nivel || 'Sin nivel';
  }

  getMotivoMuestra(muestra: MuestraSKDetalle): string {
    return muestra.motivo?.trim() || 'Sin motivo informado';
  }

  isBorrandoMuestra(muestra: MuestraSKDetalle): boolean {
    return this.borrandoMuestras.has(muestra.id);
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

  private cargarMuestrasPanel(): void {
    if (!this.curso || !this.muestrasPanelState) {
      return;
    }

    const { alumno, skill } = this.muestrasPanelState;
    this.muestrasLoading = true;
    this.muestrasErrorMessage = null;

    this.cursoService.getMuestrasByCursoAlumnoSoftSkill(this.curso.id, alumno.id, skill.id).subscribe({
      next: (detalle) => {
        this.muestrasDetalle = detalle;
        this.muestrasLoading = false;
      },
      error: (error) => {
        this.muestrasErrorMessage = this.notificationService.showHttpError(error, 'No se han podido cargar las muestras.');
        this.muestrasDetalle = null;
        this.muestrasLoading = false;
      }
    });
  }

  private aplicarTotalActualizado(totalActualizado: MuestraSKTotalActualizado): void {
    if (!this.curso?.alumnos) {
      return;
    }

    this.curso = {
      ...this.curso,
      alumnos: this.curso.alumnos.map((alumno) => {
        if (alumno.id !== totalActualizado.alumnoId) {
          return alumno;
        }

        const totales = [...(alumno.totalesPorSkill ?? [])];
        const skill = this.skillColumns.find((column) => column.id === totalActualizado.softSkillId);
        const totalIndex = totales.findIndex((total) =>
          total.id === totalActualizado.softSkillId ||
          (!!skill && (
            getSoftSkillLookupKey(total) === skill.key ||
            (!!skill.codigo && total.codigo === skill.codigo)
          ))
        );

        if (totalIndex >= 0) {
          totales[totalIndex] = {
            ...totales[totalIndex],
            puntuacionTotal: totalActualizado.puntuacionTotal
          };
        } else if (skill) {
          totales.push({
            id: skill.id,
            codigo: skill.codigo,
            nombre: skill.nombre,
            descripcion: null,
            puntuacionTotal: totalActualizado.puntuacionTotal
          });
        }

        return {
          ...alumno,
          totalesPorSkill: totales
        };
      })
    };
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
      id: softSkill.id,
      key: getSoftSkillLookupKey(softSkill),
      codigo: softSkill.codigo ?? null,
      nombre: softSkill.nombre
    };
  }

  private getSoftSkillByColumn(skill: SkillColumn): SoftSkill | null {
    const cursoSkill = this.curso?.softSkills?.find((softSkill) => softSkill.id === skill.id);

    if (cursoSkill) {
      return cursoSkill;
    }

    return {
      id: skill.id,
      nombre: skill.nombre,
      codigo: skill.codigo,
      descripcion: '',
      tipo: 0
    };
  }
}
