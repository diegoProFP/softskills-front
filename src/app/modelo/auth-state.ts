import { UserInfo } from './user-info';

export interface AuthState {
  token: string;
  user: UserInfo;
  roles: string[];
  isTeacher: boolean;
  isStudent: boolean;
  isAdmin: boolean;
}
