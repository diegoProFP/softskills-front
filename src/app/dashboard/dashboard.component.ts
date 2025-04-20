import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { UserInfo } from '../user-info';
import { AuthService } from '../auth.service';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  user: UserInfo | null = null;
  isSidenavOpen = true;
  isLoading$ = this.loadingService.isLoading$;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    public router: Router,
    public loadingService: LoadingService
  ) {
    this.user = this.userService.getUserInfo();
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.userService.clearUserInfo();
        this.router.navigate(['/login']);
      },
      error: () => {
        // Incluso si falla el logout en backend, limpiar sesión local
        this.userService.clearUserInfo();
        this.router.navigate(['/login']);
      }
    });
  }
}
