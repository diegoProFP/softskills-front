import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CursoService } from '../../services/curso.service';
import { Curso } from '../../modelo/curso';

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
}
