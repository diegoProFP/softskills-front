import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Curso } from '../modelo/curso';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private rootApiUrl = environment.apiUrl;
  private apiUrl = this.rootApiUrl + '/cursos';
  private cursoSeleccionado: Curso;

  constructor(private http: HttpClient) { }

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl).pipe(
      tap(() => this.cursoSeleccionado = null)
    );
  }

  getCursoById(id: string): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`).pipe(
      tap(curso => this.cursoSeleccionado = curso)
    );
  }
}