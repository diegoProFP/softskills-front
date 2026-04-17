import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenStorageKey = 'jwt_token';
  private readonly portalModeStorageKey = 'portal_mode';
  private readonly studentPortalUrlStorageKey = 'student_portal_url';
  private rootApiUrl = environment.apiUrl;
  private loginApiUrl = this.rootApiUrl + '/auth/login';
  private logoutUrl = this.rootApiUrl + '/auth/logout';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    const body = {
      username: email,
      password: password,
    };
    return this.http.post<any>(this.loginApiUrl, body).pipe(
      tap((response) => {
        if (response && response.token) {
          sessionStorage.setItem(this.tokenStorageKey, response.token);
        }
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenStorageKey);
  }

  setPortalMode(mode: 'dashboard' | 'student'): void {
    sessionStorage.setItem(this.portalModeStorageKey, mode);
  }

  getPortalMode(): 'dashboard' | 'student' | null {
    const portalMode = sessionStorage.getItem(this.portalModeStorageKey);

    if (portalMode === 'dashboard' || portalMode === 'student') {
      return portalMode;
    }

    return null;
  }

  isStudentPortal(): boolean {
    return this.getPortalMode() === 'student';
  }

  setStudentPortalUrl(url: string): void {
    sessionStorage.setItem(this.studentPortalUrlStorageKey, url);
  }

  getStudentPortalUrl(): string | null {
    return sessionStorage.getItem(this.studentPortalUrlStorageKey);
  }

  clearPortalContext(): void {
    sessionStorage.removeItem(this.portalModeStorageKey);
    sessionStorage.removeItem(this.studentPortalUrlStorageKey);
  }

  clearSession(): void {
    sessionStorage.removeItem(this.tokenStorageKey);
    this.clearPortalContext();
  }

  logout(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: token ? token : ''
    });
    return this.http.post<any>(this.logoutUrl, {}, { headers }).pipe(
      tap(() => {
        this.clearSession();
      })
    );
  }
}
