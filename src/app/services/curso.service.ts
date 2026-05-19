import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Curso } from '../modelo/curso';
import { CursoSoftSkillMuestrasResponse } from '../modelo/curso-soft-skill-muestras';

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

  getMuestrasByCursoAlumnoSoftSkill(
    cursoId: number,
    alumnoId: number,
    softSkillId: number
  ): Observable<CursoSoftSkillMuestrasResponse> {
    return this.http.get<CursoSoftSkillMuestrasResponse>(
      `${this.apiUrl}/${cursoId}/alumnos/${alumnoId}/soft-skills/${softSkillId}/muestras`
    );
  }

  registrarCurso(id: string | number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${id}/registrar`, {}, {
      responseType: 'text'
    });
  }
}
