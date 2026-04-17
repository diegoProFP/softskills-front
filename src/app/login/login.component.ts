import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserInfo } from '../modelo/user-info';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError = '';
  jwtPayload: any = null;
  showPassword = false;
  isLoading$ = this.loadingService.isLoading$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private jwtHelper: JwtHelperService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError = '';
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        const token = response.token;

        if (!token) {
          this.loginError = 'Token no recibido.';
          return;
        }

        const payload = this.jwtHelper.decodeToken(token.replace('Bearer ', ''));
        this.jwtPayload = payload;
        this.loginError = '';

        const userInfo: UserInfo = {
          fullname: payload.fullname,
          username: payload.username,
          userid: payload.userid,
          lastname: payload.lastname,
          firstname: payload.firstname,
          sitename: payload.sitename,
          userPictureUrl: payload.userPictureUrl
        };

        this.userService.setUserInfo(userInfo);

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          if (returnUrl.startsWith('/alumnos/')) {
            this.authService.setPortalMode('student');
            this.authService.setStudentPortalUrl(returnUrl);
          } else {
            this.authService.setPortalMode('dashboard');
          }

          void this.router.navigateByUrl(returnUrl);
          return;
        }

        this.authService.setPortalMode('dashboard');
        void this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loginError = this.notificationService.showHttpError(error, 'Error de autenticación.');
        this.jwtPayload = null;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
