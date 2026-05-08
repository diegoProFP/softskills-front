import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginErrorResponse } from '../modelo/login-response';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { UserService } from '../services/user.service';

type LoginFailurePayload = Pick<LoginErrorResponse, 'codigoError' | 'mensaje'> | null;

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
    private loadingService: LoadingService
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
          this.loginError = this.getLoginErrorMessage(response);
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
        this.loginError = this.getLoginErrorMessage(this.getLoginErrorPayload(error));
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private getLoginErrorPayload(error: unknown): LoginErrorResponse | null {
    if (!(error instanceof HttpErrorResponse)) {
      return null;
    }

    if (this.isLoginErrorResponse(error.error)) {
      return error.error;
    }

    if (typeof error.error !== 'string') {
      return null;
    }

    try {
      const payload = JSON.parse(error.error);
      return this.isLoginErrorResponse(payload) ? payload : null;
    } catch {
      return null;
    }
  }

  private getLoginErrorMessage(error: LoginFailurePayload): string {
    switch (error?.codigoError) {
      case 'CREDENCIALES_INVALIDAS':
        return 'Usuario o contraseña incorrectos.';
      case 'MOODLE_NO_DISPONIBLE':
        return 'No se puede conectar con Moodle en este momento. Inténtalo más tarde.';
      case 'LOGIN_RECHAZADO':
        return error.mensaje?.trim() || 'No se ha podido iniciar sesión.';
      default:
        return 'No se ha podido iniciar sesión.';
    }
  }

  private isLoginErrorResponse(value: unknown): value is LoginErrorResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const payload = value as Record<string, unknown>;
    return payload['exito'] === false;
  }

}
