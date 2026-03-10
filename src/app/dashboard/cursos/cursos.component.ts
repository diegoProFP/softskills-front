import { Component, OnInit } from '@angular/core';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../modelo/curso';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss']
})
export class CursosComponent implements OnInit {
  cursos: Curso[] = [];
  cursosRegistrados: Curso[] = [];
  cursosNoRegistrados: Curso[] = [];
  loading = true;

  registrarCurso(id: string): void {
    this.cursoService.registrarCurso(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Curso registrado exitosamente');
        this.cargarCursos();
      },
      error: () => {
        this.notificationService.showError('Error al registrar el curso');
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
        this.loading = false;
      },
      error: () => {
        this.cursos = [];
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {
    this.cargarCursos();
  }
}
