import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MuestraSK } from '../modelo/muestra-sk';
import { environment } from '../../environments/environment';
import { AdminSoftSkill, AdminSoftSkillUpdate, SoftSkillAdminOptions } from '../modelo/softskill';

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

  getAdminSoftSkills(): Observable<AdminSoftSkill[]> {
    return this.http.get<AdminSoftSkill[]>(this.apiUrl + '/admin');
  }

  getAdminOptions(): Observable<SoftSkillAdminOptions> {
    return this.http.get<SoftSkillAdminOptions>(this.apiUrl + '/admin/opciones');
  }

  actualizarAdminSoftSkill(id: number, softSkill: AdminSoftSkillUpdate): Observable<AdminSoftSkill> {
    return this.http.put<AdminSoftSkill>(this.apiUrl + '/admin/' + id, softSkill);
  }
}
