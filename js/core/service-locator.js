/**
 * @fileoverview Localizador de servicios para gestión de dependencias
 * @author Daniel Gómez (oddradiocircle)
 */

/**
 * Gestor de servicios y dependencias
 */
export class ServiceLocator {
  constructor() {
    this.services = new Map();
  }
  
  /**
   * Registrar un servicio
   * @param {string} name - Nombre del servicio
   * @param {Object} instance - Instancia del servicio
   */
  register(name, instance) {
    if (this.services.has(name)) {
      console.warn(`Service '${name}' already registered, overwriting`);
    }
    
    this.services.set(name, instance);
    return this;
  }
  
  /**
   * Obtener un servicio registrado
   * @param {string} name - Nombre del servicio
   * @returns {Object} Instancia del servicio
   */
  get(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service '${name}' not found`);
    }
    
    return this.services.get(name);
  }
  
  /**
   * Verificar si un servicio está registrado
   * @param {string} name - Nombre del servicio
   * @returns {boolean} true si el servicio está registrado
   */
  has(name) {
    return this.services.has(name);
  }
  
  /**
   * Eliminar un servicio registrado
   * @param {string} name - Nombre del servicio
   */
  remove(name) {
    if (this.services.has(name)) {
      this.services.delete(name);
    }
  }
}

// Singleton para uso global
export const serviceLocator = new ServiceLocator();