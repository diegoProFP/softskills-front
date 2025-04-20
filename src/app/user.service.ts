import { Injectable } from '@angular/core';
import { UserInfo } from './user-info';

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
}
