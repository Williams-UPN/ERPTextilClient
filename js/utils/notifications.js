// notifications.js - Sistema de notificaciones
import { NOTIFICATION_TYPES, NOTIFICATION_DURATION } from '../config/constants.js';

class NotificationManager {
  constructor() {
    this.createContainer();
  }

  createContainer() {
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
  }

  show(message, type = NOTIFICATION_TYPES.INFO, duration = NOTIFICATION_DURATION) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${this.getIcon(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;

    const container = document.getElementById('notification-container');
    container.appendChild(notification);

    // Agregar clase para animación de entrada
    setTimeout(() => notification.classList.add('show'), 10);

    // Manejar cierre manual
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.remove(notification));

    // Auto-cerrar después de la duración especificada
    setTimeout(() => this.remove(notification), duration);
  }

  remove(notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }

  getIcon(type) {
    const icons = {
      [NOTIFICATION_TYPES.SUCCESS]: 'fa-check-circle',
      [NOTIFICATION_TYPES.ERROR]: 'fa-exclamation-circle',
      [NOTIFICATION_TYPES.WARNING]: 'fa-exclamation-triangle',
      [NOTIFICATION_TYPES.INFO]: 'fa-info-circle'
    };
    return icons[type] || icons[NOTIFICATION_TYPES.INFO];
  }
}

// Instancia global
const notificationManager = new NotificationManager();

// Funciones de conveniencia
export function showNotification(message, type, duration) {
  notificationManager.show(message, type, duration);
}

export function showSuccess(message, duration) {
  notificationManager.show(message, NOTIFICATION_TYPES.SUCCESS, duration);
}

export function showError(message, duration) {
  notificationManager.show(message, NOTIFICATION_TYPES.ERROR, duration);
}

export function showWarning(message, duration) {
  notificationManager.show(message, NOTIFICATION_TYPES.WARNING, duration);
}

export function showInfo(message, duration) {
  notificationManager.show(message, NOTIFICATION_TYPES.INFO, duration);
}

export default notificationManager;