import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Curso } from '../modelo/curso';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class CursoService {
  private rootApiUrl = environment.apiUrl;

  private apiUrl = this.rootApiUrl + '/cursos';

  constructor(private http: HttpClient) { }

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  getCursoById(id: string) {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }
}
