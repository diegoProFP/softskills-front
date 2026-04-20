import { LoginUserInfo } from './user-info';

export interface LoginResponse {
  token: string;
  datosUsuario: LoginUserInfo;
  roles?: string[];
  exito: boolean;
  mensaje: string | null;
}
