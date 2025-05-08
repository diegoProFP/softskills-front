import { Component, OnInit } from '@angular/core';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../modelo/curso';

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

  constructor(private cursoService: CursoService) {}

  ngOnInit(): void {
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
}
