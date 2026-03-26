import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Grupo } from '../modelo/grupo';

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
}
