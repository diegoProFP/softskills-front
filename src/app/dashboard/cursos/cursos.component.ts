import { Component, OnInit } from '@angular/core';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../modelo/curso';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss']
})
export class CursosComponent implements OnInit {
  cursos: Curso[] = [];
  cursosRegistrados: Curso[] = [];
  cursosNoRegistrados: Curso[] = [];
  cursosRegistradosFiltrados: Curso[] = [];
  cursosNoRegistradosFiltrados: Curso[] = [];
  opcionesAutocompletado: Curso[] = [];
  busquedaControl = new FormControl('', { nonNullable: true });
  loading = true;

  registrarCurso(id: number): void {
    this.cursoService.registrarCurso(id).subscribe({
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
    private notificationService: NotificationService,
    private router: Router
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
    if (!termino) {
      return cursos;
    }

    return cursos.filter(curso => this.normalizar(this.textoBuscable(curso)).includes(termino));
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
