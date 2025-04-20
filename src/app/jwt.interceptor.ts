import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoadingService } from './loading.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    this.loadingService.show();
    let requestToSend = req;
    if (token) {
      requestToSend = req.clone({
        setHeaders: {
          Authorization: "Bearer " + token
        }
      });
    }
    return next.handle(requestToSend).pipe(
      finalize(() => this.loadingService.hide())
    );
  }
}
