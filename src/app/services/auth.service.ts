import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth/login';
  private logoutUrl = 'http://localhost:8080/api/v1/auth/logout';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const body = {
      username: email,
      password: password,
    };
    return this.http.post<any>(this.apiUrl, body).pipe(
      tap((response) => {
        if (response && response.token) {
          sessionStorage.setItem('jwt_token', response.token);
        }
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem('jwt_token');
  }

  logout(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: token ? token : ''
    });
    return this.http.post<any>(this.logoutUrl, {}, { headers }).pipe(
      tap(() => {
        sessionStorage.removeItem('jwt_token');
      })
    );
  }
}
