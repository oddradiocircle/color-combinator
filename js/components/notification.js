/**
 * @fileoverview Componente para mostrar notificaciones
 * @author Daniel Gómez (oddradiocircle)
 */

import { Component } from '../core/component.js';
import { config } from '../config.js';
import { fadeAnimation, createElement } from '../utils/dom-utils.js';

/**
 * Componente para gestionar notificaciones
 */
export class NotificationManager extends Component {
  constructor(container) {
    super(container, 'notification-manager');
    
    // Inicializar contenedor
    this.render();
    
    // Escuchar eventos de notificación
    this.subscribe('notification', this.showNotification.bind(this));
  }
  
  render() {
    // El contenedor ya debería existir, no necesitamos hacer nada especial aquí
    this.container.className = 'notification-container';
  }
  
  /**
   * Muestra una notificación
   * @param {Object} data - Datos de la notificación
   * @param {string} data.title - Título
   * @param {string} data.message - Mensaje
   * @param {string} data.type - Tipo (success, error, info)
   * @param {number} data.duration - Duración en ms (opcional)
   */
  showNotification(data) {
    const { title, message, type = 'info', duration = config.ui.notificationDuration } = data;
    const notificationId = `notification-${Date.now()}`;
    
    // Icono según tipo
    let icon;
    switch (type) {
      case 'success':
        icon = 'check_circle';
        break;
      case 'error':
        icon = 'error';
        break;
      case 'info':
      default:
        icon = 'info';
        break;
    }
    
    // Crear elemento de notificación
    const notification = createElement('div', {
      className: `notification ${type}`,
      id: notificationId,
      innerHTML: `
        <div class="notification-icon">
          <span class="material-symbols-outlined">${icon}</span>
        </div>
        <div class="notification-content">
          <div class="notification-title">${title}</div>
          <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
          <span class="material-symbols-outlined">close</span>
        </button>
      `,
      style: {
        opacity: '0',
        transform: 'translateX(120%)'
      }
    });
    
    // Añadir al contenedor
    this.container.appendChild(notification);
    
    // Botón de cierre
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      this.closeNotification(notificationId);
    });
    
    // Animar entrada
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Cierre automático
    if (duration > 0) {
      setTimeout(() => {
        if (document.getElementById(notificationId)) {
          this.closeNotification(notificationId);
        }
      }, duration);
    }
    
    return notificationId;
  }
  
  /**
   * Cierra una notificación específica
   * @param {string} id - ID de la notificación
   */
  closeNotification(id) {
    const notification = document.getElementById(id);
    if (!notification) return;
    
    // Animar salida
    notification.style.transform = 'translateX(120%)';
    notification.style.opacity = '0';
    
    // Eliminar después de la animación
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
  
  /**
   * Cierra todas las notificaciones
   */
  clearAll() {
    const notifications = this.container.querySelectorAll('.notification');
    notifications.forEach(notification => {
      this.closeNotification(notification.id);
    });
  }
}