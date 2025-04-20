import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { UserInfo } from '../user-info';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  user: UserInfo | null = null;
  isSidenavOpen = true;

  constructor(private userService: UserService) {
    this.user = this.userService.getUserInfo();
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}
