import { LoginUserInfo } from './user-info';

export type LoginErrorCode =
  | 'CREDENCIALES_INVALIDAS'
  | 'MOODLE_NO_DISPONIBLE'
  | 'LOGIN_RECHAZADO';

export interface LoginResponse {
  token?: string;
  datosUsuario?: LoginUserInfo;
  roles?: string[];
  exito: boolean;
  mensaje?: string | null;
  codigoError?: LoginErrorCode | string | null;
}

export interface LoginErrorResponse {
  exito: false;
  codigoError?: LoginErrorCode | string | null;
  mensaje?: string | null;
}
