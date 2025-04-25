import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private rootApiUrl = environment.apiUrl;
  private loginApiUrl = this.rootApiUrl + '/auth/login';
  private logoutUrl = this.rootApiUrl + '/auth/logout';

  constructor(private http: HttpClient, private loadingService: LoadingService) { }

  login(email: string, password: string): Observable<any> {
    // this.loadingService.show();
    const body = {
      username: email,
      password: password,
    };
    return this.http.post<any>(this.loginApiUrl, body).pipe(
      tap((response) => {
        this.loadingService.hide();
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
