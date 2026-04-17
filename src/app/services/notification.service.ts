import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationType } from '../modelo/notification-type';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  getErrorMessage(error: unknown, fallback = 'Se ha producido un error inesperado.'): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      const backendMessage = this.extractMessageFromPayload(error.error);
      if (backendMessage) {
        return backendMessage;
      }

      if (error.status === 0) {
        return 'No se ha podido conectar con el servidor.';
      }

      if (error.statusText && error.statusText !== 'OK') {
        return error.statusText;
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return this.extractMessageFromPayload(error) || fallback;
  }

  showHttpError(
    error: unknown,
    fallback = 'Se ha producido un error inesperado.',
    action = 'Cerrar',
    duration = 5000
  ) {
    const message = this.getErrorMessage(error, fallback);
    this.showError(message, action, duration);
    return message;
  }

  showNotification(
    message: string,
    type: NotificationType,
    action = 'Cerrar',
    duration = 3000
  ) {
    const config = {
      duration,
      panelClass: ['snack-' + type]
    };

    this.snackBar.open(message, action, config);
  }
  // Tipos de notificaciones
  showSuccess(message: string, action = 'Cerrar', duration = 3000) {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['snack-success']
    });
  }

  showError(message: string, action = 'Cerrar', duration = 3000) {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['snack-error']
    });
  }

  showInfo(message: string, action = 'Cerrar', duration = 3000) {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['snack-info']
    });
  }

  showWarning(message: string, action = 'Cerrar', duration = 3000) {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['snack-warning']
    });
  }

  private extractMessageFromPayload(payload: unknown): string | null {
    if (!payload) {
      return null;
    }

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (typeof payload !== 'object') {
      return null;
    }

    const candidate = payload as Record<string, unknown>;
    const messageKeys = ['message', 'error', 'detail', 'descripcion', 'descripcionError'];

    for (const key of messageKeys) {
      const value = candidate[key];

      if (typeof value === 'string' && value.trim()) {
        return value;
      }

      if (Array.isArray(value)) {
        const joined = value
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .join(', ');

        if (joined) {
          return joined;
        }
      }
    }

    return null;
  }
}
