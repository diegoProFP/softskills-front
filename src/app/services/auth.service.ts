import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthState } from '../modelo/auth-state';
import { LoginResponse } from '../modelo/login-response';
import { UserInfo } from '../modelo/user-info';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenStorageKey = 'jwt_token';
  private readonly rolesStorageKey = 'user_roles';
  private readonly portalModeStorageKey = 'portal_mode';
  private readonly studentPortalUrlStorageKey = 'student_portal_url';
  private rootApiUrl = environment.apiUrl;
  private loginApiUrl = this.rootApiUrl + '/auth/login';
  private logoutUrl = this.rootApiUrl + '/auth/logout';

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<LoginResponse> {
    const body = {
      username,
      password,
    };

    return this.http.post<LoginResponse>(this.loginApiUrl, body).pipe(
      tap((response) => {
        if (response?.token) {
          sessionStorage.setItem(this.tokenStorageKey, response.token);
        }

        this.setRoles(response?.roles ?? []);
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenStorageKey);
  }

  setRoles(roles: string[]): void {
    sessionStorage.setItem(this.rolesStorageKey, JSON.stringify(roles));
  }

  getRoles(): string[] {
    const rawRoles = sessionStorage.getItem(this.rolesStorageKey);

    if (!rawRoles) {
      return [];
    }

    try {
      const roles = JSON.parse(rawRoles);
      return Array.isArray(roles) ? roles : [];
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    const normalizedRole = role.toUpperCase();
    return this.getRoles().some((currentRole) => currentRole.toUpperCase() === normalizedRole);
  }

  isTeacher(): boolean {
    return this.hasRole('ROLE_TEACHER');
  }

  isStudent(): boolean {
    return this.hasRole('ROLE_STUDENT');
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  getAuthState(user: UserInfo | null): AuthState | null {
    const token = this.getToken();

    if (!token || !user) {
      return null;
    }

    return {
      token,
      user,
      roles: this.getRoles(),
      isTeacher: this.isTeacher(),
      isStudent: this.isStudent(),
      isAdmin: this.isAdmin()
    };
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
    sessionStorage.removeItem(this.rolesStorageKey);
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
