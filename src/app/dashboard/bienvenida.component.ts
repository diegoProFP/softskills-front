import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { UserInfo } from '../user-info';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.scss']
})
export class BienvenidaComponent {
  user: UserInfo | null = null;
  constructor(private userService: UserService) {
    this.user = this.userService.getUserInfo();
  }
}
