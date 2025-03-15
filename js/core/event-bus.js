/**
 * @fileoverview Sistema de eventos para comunicación entre componentes
 * @author Daniel Gómez (oddradiocircle)
 */

/**
 * Bus de eventos para comunicación entre componentes
 */
class EventBus {
  constructor() {
    this.listeners = {};
  }
  
  /**
   * Suscribe a un evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función a llamar
   * @returns {Function} Función para cancelar suscripción
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    
    // Retornar función para cancelar suscripción
    return () => this.off(event, callback);
  }
  
  /**
   * Escucha un evento una sola vez
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función a llamar
   */
  once(event, callback) {
    const onceCallback = (data) => {
      this.off(event, onceCallback);
      callback(data);
    };
    
    this.on(event, onceCallback);
  }
  
  /**
   * Cancela suscripción a evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función a eliminar
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event]
      .filter(listener => listener !== callback);
  }
  
  /**
   * Emite un evento
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos a enviar con el evento
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

// Singleton
export const eventBus = new EventBus();