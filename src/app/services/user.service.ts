import { Injectable } from '@angular/core';
import { UserInfo } from '../modelo/user-info';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userInfo: UserInfo | null = null;

  setUserInfo(info: UserInfo) {
    this.userInfo = info;
  }

  getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  clearUserInfo() {
    this.userInfo = null;
  }

  isLoggedIn(): boolean {
    return !!this.userInfo;
  }
}
