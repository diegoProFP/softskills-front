import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Grupo } from '../modelo/grupo';
import { AlumnoConTotales } from '../modelo/alumno-con-totales';

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private rootApiUrl = environment.apiUrl;
  private apiUrl = this.rootApiUrl + '/grupos';

  constructor(private http: HttpClient) {}

  getGrupos(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(this.apiUrl);
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
}
