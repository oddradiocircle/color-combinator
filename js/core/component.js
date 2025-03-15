/**
 * @fileoverview Clase base para componentes de UI
 * @author Daniel Gómez (oddradiocircle)
 */

import { eventBus } from './event-bus.js';

/**
 * Clase base para componentes de UI
 */
export class Component {
  /**
   * @param {HTMLElement} container - Elemento contenedor del componente
   * @param {string} name - Nombre único del componente
   */
  constructor(container, name) {
    if (!container) {
      throw new Error(`Container element is required for component: ${name}`);
    }
    
    this.container = container;
    this.name = name;
    this.id = `${name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this._eventSubscriptions = [];
  }
  
  /**
   * Método para renderizar el componente (debe ser implementado por las clases hijas)
   */
  render() {
    throw new Error('render() method must be implemented by subclass');
  }
  
  /**
   * Suscribirse a un evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función a llamar
   */
  subscribe(event, callback) {
    const unsubscribe = eventBus.on(event, callback);
    this._eventSubscriptions.push(unsubscribe);
    
    return unsubscribe;
  }
  
  /**
   * Emitir un evento
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos a enviar con el evento
   */
  emit(event, data) {
    eventBus.emit(event, data);
  }
  
  /**
   * Eliminar el componente y limpiar suscripciones
   */
  destroy() {
    // Limpiar todas las suscripciones
    this._eventSubscriptions.forEach(unsubscribe => unsubscribe());
    this._eventSubscriptions = [];
    
    // Limpiar contenido del contenedor
    this.container.innerHTML = '';
  }
}