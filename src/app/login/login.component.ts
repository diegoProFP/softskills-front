import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  showPassword = false;
  isLoading$ = this.loadingService.isLoading$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError = '';
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        if (!response.exito) {
          this.loginError = response.mensaje ?? 'No se pudo iniciar sesion.';
          return;
        }

        if (!response.token) {
          this.loginError = 'Token no recibido.';
          return;
        }

        if (!response.datosUsuario) {
          this.loginError = 'Datos de usuario no recibidos.';
          return;
        }

        this.userService.setUserInfo(response.datosUsuario);

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
        this.loginError = this.notificationService.showHttpError(error, 'Error de autenticacion.');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

}
