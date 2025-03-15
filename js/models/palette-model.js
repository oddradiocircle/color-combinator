/**
 * @fileoverview Modelo para una paleta de colores
 * @author Daniel Gómez (oddradiocircle)
 */

import { ColorModel } from './color-model.js';
import { saveToStorage, getFromStorage } from '../utils/storage-utils.js';
import { config } from '../config.js';
import { eventBus } from '../core/event-bus.js';

/**
 * Modelo para gestionar una paleta de colores
 */
export class PaletteModel {
  constructor() {
    this.colors = [];
    this.history = [];
    this.maxHistorySteps = config.ui.maxHistorySteps;
  }
  
  /**
   * Añade un color a la paleta
   * @param {string|ColorModel} color - Color a añadir (hex o instancia)
   * @param {number} alpha - Transparencia (solo si color es string)
   * @returns {ColorModel} Modelo del color añadido
   */
  addColor(color, alpha = 0) {
    // Guardar estado actual para deshacer
    this._saveToHistory();
    
    let colorModel;
    
    if (color instanceof ColorModel) {
      colorModel = color;
    } else {
      colorModel = new ColorModel(color, alpha);
    }
    
    this.colors.push(colorModel);
    
    // Notificar cambio
    eventBus.emit('palette:change', { type: 'add', color: colorModel });
    eventBus.emit('palette:updated', this.colors);
    
    return colorModel;
  }
  
  /**
   * Reemplaza la paleta completa con nuevos colores
   * @param {Array} colors - Array de valores hex o instancias de ColorModel
   */
  setColors(colors) {
    if (!Array.isArray(colors) || colors.length === 0) {
      return false;
    }
    
    // Guardar estado actual para deshacer
    this._saveToHistory();
    
    // Limpiar paleta actual
    this.colors = [];
    
    // Añadir nuevos colores
    colors.forEach(color => {
      if (color instanceof ColorModel) {
        this.colors.push(color);
      } else if (typeof color === 'string') {
        this.colors.push(new ColorModel(color));
      } else if (typeof color === 'object' && color.color) {
        // Formato de objeto simple {color: '#HEX', alpha: number}
        this.colors.push(new ColorModel(color.color, color.alpha || 0));
      }
    });
    
    // Notificar cambio
    eventBus.emit('palette:updated', this.colors);
    return true;
  }
  
  /**
   * Elimina un color de la paleta
   * @param {string} colorId - ID del color a eliminar
   * @returns {boolean} true si se eliminó correctamente
   */
  removeColor(colorId) {
    const index = this.colors.findIndex(c => c.id === colorId);
    
    if (index === -1) {
      return false;
    }
    
    // Verificar que no es el último color
    if (this.colors.length <= config.ui.minColors) {
      eventBus.emit('notification', {
        title: 'No se puede eliminar',
        message: `Debes tener al menos ${config.ui.minColors} colores en la paleta`,
        type: 'error'
      });
      return false;
    }
    
    // Guardar estado actual para deshacer
    this._saveToHistory();
    
    // Eliminar color
    const removedColor = this.colors.splice(index, 1)[0];
    
    // Notificar cambio
    eventBus.emit('palette:change', { type: 'remove', color: removedColor });
    eventBus.emit('palette:updated', this.colors);
    
    return true;
  }
  
  /**
   * Actualiza un color existente
   * @param {string} colorId - ID del color a actualizar
   * @param {string} newHexValue - Nuevo valor hexadecimal
   * @returns {boolean} true si se actualizó correctamente
   */
  updateColor(colorId, newHexValue) {
    const index = this.colors.findIndex(c => c.id === colorId);
    
    if (index === -1) {
      return false;
    }
    
    // Guardar estado actual para deshacer
    this._saveToHistory();
    
    // Guardar color anterior para el evento
    const oldColor = { ...this.colors[index].toJSON() };
    
    // Actualizar color
    this.colors[index] = new ColorModel(newHexValue, this.colors[index].alpha);
    this.colors[index].id = colorId; // Mantener el mismo ID
    this.colors[index].format = oldColor.format; // Mantener el formato
    
    // Notificar cambio
    eventBus.emit('palette:change', { 
      type: 'update', 
      color: this.colors[index],
      oldColor: oldColor
    });
    eventBus.emit('palette:updated', this.colors);
    
    return true;
  }
  
  /**
   * Obtiene un color por su ID
   * @param {string} colorId - ID del color
   * @returns {ColorModel|null} Color encontrado o null
   */
  getColorById(colorId) {
    return this.colors.find(c => c.id === colorId) || null;
  }
  
  /**
   * @returns {Array<ColorModel>} Todos los colores de la paleta
   */
  getColors() {
    return [...this.colors];
  }
  
  /**
   * Guarda el estado actual en el historial para poder deshacer
   * @private
   */
  _saveToHistory() {
    // Guardar copia de los colores actuales
    const colorsCopy = this.colors.map(color => color.toJSON());
    
    this.history.push(colorsCopy);
    
    // Limitar tamaño del historial
    if (this.history.length > this.maxHistorySteps) {
      this.history.shift();
    }
    
    // Notificar que hay cambios para deshacer
    eventBus.emit('history:updated', {
      canUndo: this.history.length > 0
    });
  }
  
  /**
   * Deshace la última acción
   * @returns {boolean} true si se pudo deshacer
   */
  undo() {
    if (this.history.length === 0) {
      return false;
    }
    
    // Recuperar estado anterior
    const previousColors = this.history.pop();
    
    // Restaurar colores
    this.colors = previousColors.map(data => ColorModel.fromJSON(data));
    
    // Notificar cambio
    eventBus.emit('palette:updated', this.colors);
    
    // Notificar estado del historial
    eventBus.emit('history:updated', {
      canUndo: this.history.length > 0
    });
    
    return true;
  }
  
  /**
   * Guarda la paleta en localStorage
   * @returns {boolean} true si se guardó correctamente
   */
  saveToStorage() {
    const serialized = this.colors.map(color => color.toJSON());
    return saveToStorage(config.storage.keys.colors, serialized);
  }
  
  /**
   * Carga la paleta desde localStorage
   * @returns {boolean} true si se cargó correctamente
   */
  loadFromStorage() {
    const stored = getFromStorage(config.storage.keys.colors);
    
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      return false;
    }
    
    try {
      // Convertir datos almacenados a instancias de ColorModel
      const loadedColors = stored.map(data => {
        if (typeof data === 'string') {
          return new ColorModel(data);
        } else if (data && data.color) {
          return ColorModel.fromJSON(data);
        }
        return null;
      }).filter(color => color !== null);
      
      if (loadedColors.length === 0) {
        return false;
      }
      
      // Establecer colores cargados
      this.colors = loadedColors;
      
      // Notificar cambio
      eventBus.emit('palette:updated', this.colors);
      return true;
    } catch (error) {
      console.error('Error loading palette from storage:', error);
      return false;
    }
  }
}