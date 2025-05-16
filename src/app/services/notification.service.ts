import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationType } from '../modelo/notification-type';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

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
}