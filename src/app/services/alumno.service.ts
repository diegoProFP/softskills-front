import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AlumnoConTotales } from '../modelo/alumno-con-totales';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private rootApiUrl = environment.apiUrl;
  private apiUrl = `${this.rootApiUrl}/alumnos`;

  constructor(private http: HttpClient) {}

  getResumenById(alumnoId: string): Observable<AlumnoConTotales> {
    const params = new HttpParams({
      fromObject: {
        idalumno: alumnoId
      }
    });

    return this.http.get<AlumnoConTotales>(`${this.apiUrl}/resumen`, { params });
  }
}
