import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Profesor } from '../modelo/profesor';

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {
  private apiUrl = environment.apiUrl + '/profesores';

  constructor(private http: HttpClient) {}

  getProfesores(): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(this.apiUrl);
  }

  crearProfesor(profesor: Profesor): Observable<Profesor> {
    return this.http.post<Profesor>(this.apiUrl, profesor);
  }

  actualizarProfesorAdministrador(id: number, administrador: boolean): Observable<Profesor> {
    return this.http.put<Profesor>(`${this.apiUrl}/${id}`, { administrador });
  }
}
