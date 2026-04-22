import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserInfo } from '../modelo/user-info';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  user: UserInfo | null = null;
  isSidenavOpen = true;
  isTeacher = false;
  isAdmin = false;
  isStudent = false;
  isLoading$ = this.loadingService.isLoading$;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    public router: Router,
    public loadingService: LoadingService
  ) {
    this.user = this.userService.getUserInfo();
    this.isTeacher = this.authService.isTeacher();
    this.isAdmin = this.authService.isAdmin();
    this.isStudent = this.authService.isStudent();
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
        this.authService.clearSession();
        this.userService.clearUserInfo();
        this.router.navigate(['/login']);
      }
    });
  }
}
