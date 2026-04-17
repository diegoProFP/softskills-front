import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({ providedIn: 'root' })
export class DashboardAccessGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isStudentPortal()) {
      return true;
    }

    const studentPortalUrl = this.authService.getStudentPortalUrl();
    return studentPortalUrl
      ? this.router.parseUrl(studentPortalUrl)
      : this.router.parseUrl('/login');
  }
}
