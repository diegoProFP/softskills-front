import { Injectable } from '@angular/core';
import { LoginUserInfo, UserInfo } from '../modelo/user-info';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userInfoStorageKey = 'user_info';
  private userInfo: UserInfo | null = null;

  setUserInfo(info: LoginUserInfo | UserInfo) {
    this.userInfo = this.normalizeUserInfo(info);
    sessionStorage.setItem(this.userInfoStorageKey, JSON.stringify(info));
  }

  getUserInfo(): UserInfo | null {
    if (this.userInfo) {
      return this.userInfo;
    }

    const storedUserInfo = sessionStorage.getItem(this.userInfoStorageKey);

    if (!storedUserInfo) {
      return null;
    }

    try {
      this.userInfo = this.normalizeUserInfo(JSON.parse(storedUserInfo) as LoginUserInfo | UserInfo);
    } catch {
      this.userInfo = null;
    }

    return this.userInfo;
  }

  clearUserInfo() {
    this.userInfo = null;
    sessionStorage.removeItem(this.userInfoStorageKey);
  }

  isLoggedIn(): boolean {
    return !!this.getUserInfo();
  }

  private normalizeUserInfo(info: LoginUserInfo | UserInfo): UserInfo {
    return {
      ...info,
      userPictureUrl: info.userPictureUrl ?? ('userpictureurl' in info ? info.userpictureurl : undefined)
    };
  }
}
