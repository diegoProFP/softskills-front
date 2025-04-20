import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserInfo } from '../../modelo/user-info';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss']
})
export class MiPerfilComponent implements OnInit {
  user: UserInfo | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.user = this.userService.getUserInfo();
  }
}
