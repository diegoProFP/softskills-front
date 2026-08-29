import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AdminGrupoAcademico, AdminGrupoAcademicoUpdate, Grupo } from '../modelo/grupo';
import { AlumnoConTotales } from '../modelo/alumno-con-totales';

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private rootApiUrl = environment.apiUrl;
  private apiUrl = this.rootApiUrl + '/grupos';

  constructor(private http: HttpClient) {}

  getGrupos(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(this.apiUrl).pipe(
      map((grupos) => (grupos || []).map((grupo) => this.normalizarGrupo(grupo)))
    );
  }

  getAdminGrupos(): Observable<AdminGrupoAcademico[]> {
    return this.http.get<AdminGrupoAcademico[]>(`${this.apiUrl}/admin`).pipe(
      map((grupos) => (grupos || []).map((grupo) => this.normalizarGrupo(grupo)))
    );
  }

  actualizarCursoMoodleGrupo(
    id: number,
    payload: AdminGrupoAcademicoUpdate
  ): Observable<AdminGrupoAcademico> {
    return this.http.put<AdminGrupoAcademico>(`${this.apiUrl}/admin/${id}/curso-moodle-grupo`, payload).pipe(
      map((grupo) => this.normalizarGrupo(grupo))
    );
  }

  getTotalesByGrupo(grupo: Grupo): Observable<AlumnoConTotales[]> {
    const params = new HttpParams({
      fromObject: {
        nivel: grupo.nivel,
        cicloFormativo: grupo.cicloFormativo,
        grupo: grupo.grupo,
        cursoEscolar: grupo.cursoEscolar
      }
    });

    return this.http.get<AlumnoConTotales[]>(`${this.apiUrl}/totales`, { params });
  }

  private normalizarGrupo<T extends Grupo>(grupo: T): T {
    const raw = grupo as T & Record<string, unknown>;
    const cursoEscolar = this.getStringValue(
      raw['cursoEscolar'],
      raw['cursoescolar'],
      raw['curso_escolar'],
      raw['CURSOESCOLAR']
    );
    const cursoMoodleGrupoId = this.getNumberValue(
      raw['cursoMoodleGrupoId'],
      raw['cursomoodlegrupoid'],
      raw['curso_moodle_grupo_id'],
      raw['CURSOMOODLEGRUPOID']
    );

    return {
      ...grupo,
      cursoEscolar: cursoEscolar || grupo.cursoEscolar || '',
      cursoMoodleGrupoId
    };
  }

  private getStringValue(...values: unknown[]): string {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return '';
  }

  private getNumberValue(...values: unknown[]): number | null {
    for (const value of values) {
      if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
        return value;
      }

      if (typeof value === 'string' && value.trim()) {
        const numberValue = Number(value);
        if (Number.isInteger(numberValue) && numberValue > 0) {
          return numberValue;
        }
      }
    }

    return null;
  }
}
