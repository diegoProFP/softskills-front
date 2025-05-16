import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MuestraSK } from '../modelo/muestra-sk';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SoftSkillService {
  private rootApiUrl = environment.apiUrl;
  private apiUrl = this.rootApiUrl + '/softskills';

  constructor(private http: HttpClient) {}

  crearMuestra(muestra: MuestraSK): Observable<any> {
    return this.http.post(this.apiUrl + '/muestra', muestra);
  }
}