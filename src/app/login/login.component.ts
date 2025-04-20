import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from '../user.service';
import { UserInfo } from '../user-info';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string = '';
  jwtPayload: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private jwtHelper: JwtHelperService,
    private userService: UserService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (response) => {
        const token = response.token;
        if (token) {
          const payload = this.jwtHelper.decodeToken(token.replace('Bearer ', ''));
          this.jwtPayload = payload;
          this.loginError = '';
          // Guardar info del usuario
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
          // Redirigir al dashboard
          this.router.navigate(['/dashboard']);
        } else {
          this.loginError = 'Token no recibido.';
        }
      },
      error: (err) => {
        this.loginError = 'Error de autenticación.';
        this.jwtPayload = null;
      }
    });
  }
}
