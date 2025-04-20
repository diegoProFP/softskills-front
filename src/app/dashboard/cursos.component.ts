import { Component, OnInit } from '@angular/core';
import { CursoService } from '../curso.service';
import { Curso } from '../curso';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss']
})
export class CursosComponent implements OnInit {
  cursos: Curso[] = [];
  loading = true;

  constructor(private cursoService: CursoService) {}

  ngOnInit(): void {
    this.cursoService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data || [];
        this.loading = false;
      },
      error: () => {
        this.cursos = [];
        this.loading = false;
      }
    });
  }
}
