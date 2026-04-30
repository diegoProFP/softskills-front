import { Component, OnInit } from '@angular/core';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../modelo/curso';
import { NotificationService } from '../../services/notification.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss']
})
export class CursosComponent implements OnInit {
  readonly avisoCursoNoRegistrable = 'No se puede registrar en Soft Skills porque falta informar correctamente el ID number en Moodle.';
  readonly patronIdNumberPrincipal = 'nivel_ciclo_grupo_cursoEscolar';
  readonly patronIdNumberConSufijo = 'nivel_ciclo_grupo_cursoEscolar_sufijo';
  readonly ejemploIdNumber = '1_DAW_A_2425';
  readonly ejemploIdNumberConSufijo = '1_DAW_A_2425_OPT';

  cursos: Curso[] = [];
  cursosRegistrados: Curso[] = [];
  cursosNoRegistrados: Curso[] = [];
  cursosRegistradosFiltrados: Curso[] = [];
  cursosNoRegistradosFiltrados: Curso[] = [];
  opcionesAutocompletado: Curso[] = [];
  busquedaControl = new FormControl('', { nonNullable: true });
  soloRegistrablesControl = new FormControl(true, { nonNullable: true });
  loading = true;

  registrarCurso(curso: Curso): void {
    if (!this.puedeRegistrarCurso(curso)) {
      this.notificationService.showWarning(this.avisoCursoNoRegistrable);
      return;
    }

    this.cursoService.registrarCurso(curso.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Curso registrado exitosamente');
        this.cargarCursos();
      },
      error: (error) => {
        this.notificationService.showHttpError(error, 'Error al registrar el curso.');
      }
    });
  }

  constructor(
    private cursoService: CursoService,
    private notificationService: NotificationService
  ) {}

  cargarCursos(): void {
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data || [];
        this.cursosRegistrados = this.cursos.filter(curso => curso.registradoSk);
        this.cursosNoRegistrados = this.cursos.filter(curso => !curso.registradoSk);
        this.aplicarFiltro(this.busquedaControl.value);
        this.loading = false;
      },
      error: (error) => {
        this.cursos = [];
        this.cursosRegistrados = [];
        this.cursosNoRegistrados = [];
        this.cursosRegistradosFiltrados = [];
        this.cursosNoRegistradosFiltrados = [];
        this.opcionesAutocompletado = [];
        this.notificationService.showHttpError(error, 'No se pudieron cargar los cursos.');
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {
    this.busquedaControl.valueChanges.subscribe(valor => this.aplicarFiltro(valor));
    this.soloRegistrablesControl.valueChanges.subscribe(() => this.aplicarFiltro(this.busquedaControl.value));
    this.cargarCursos();
  }

  limpiarBusqueda(): void {
    this.busquedaControl.setValue('');
  }

  private aplicarFiltro(valor: string): void {
    const termino = this.normalizar(valor);

    this.cursosRegistradosFiltrados = this.filtrarCursos(this.cursosRegistrados, termino);
    this.cursosNoRegistradosFiltrados = this.filtrarCursos(this.cursosNoRegistrados, termino);
    this.opcionesAutocompletado = termino
      ? this.filtrarCursos(this.cursos, termino).slice(0, 6)
      : [];
  }

  private filtrarCursos(cursos: Curso[], termino: string): Curso[] {
    return cursos.filter((curso) => {
      const cumpleBusqueda = !termino || this.normalizar(this.textoBuscable(curso)).includes(termino);
      const cumpleRegistrable = !this.soloRegistrablesControl.value || curso.registrableEnSoftSkills;
      return cumpleBusqueda && cumpleRegistrable;
    });
  }

  puedeRegistrarCurso(curso: Curso): boolean {
    return !curso.registradoSk && curso.registrableEnSoftSkills;
  }

  mostrarAvisoNoRegistrable(curso: Curso): boolean {
    return !curso.registrableEnSoftSkills;
  }

  private textoBuscable(curso: Curso): string {
    return [
      curso.nombreCorto,
      curso.nombreLargo,
      curso.nombreVisible
    ].filter(Boolean).join(' ');
  }

  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
