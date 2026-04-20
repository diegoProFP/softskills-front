import { Component, OnInit } from '@angular/core';
import { UserInfo } from '../../modelo/user-info';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss']
})
export class MiPerfilComponent implements OnInit {
  user: UserInfo | null = null;
  roles: string[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getUserInfo();
    this.roles = this.authService.getRoles();
  }
}
