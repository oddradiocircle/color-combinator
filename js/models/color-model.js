/**
 * @fileoverview Modelo de un color individual
 * @author Daniel Gómez (oddradiocircle)
 */

import { hexToRgb, rgbToHsl, formatColor } from '../utils/color-utils.js';

/**
 * Modelo para representar un color
 */
export class ColorModel {
  /**
   * @param {string} hex - Color en formato hexadecimal
   * @param {number} alpha - Transparencia (0-100, donde 0 es opaco y 100 es transparente)
   */
  constructor(hex, alpha = 0) {
    this.id = `color-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this._hex = this._normalizeHex(hex);
    this._alpha = Math.max(0, Math.min(100, alpha || 0));
    this._format = 'hex'; // Formato de visualización predeterminado
  }
  
  /**
   * @returns {string} Valor hexadecimal del color (#RRGGBB)
   */
  get hex() {
    return this._hex;
  }
  
  /**
   * @returns {number} Valor de transparencia (0-100)
   */
  get alpha() {
    return this._alpha;
  }
  
  /**
   * @returns {string} Formato actual de visualización
   */
  get format() {
    return this._format;
  }
  
  /**
   * Establece el formato de visualización
   * @param {string} newFormat - Nuevo formato ('hex', 'rgb', 'hsl', etc)
   */
  set format(newFormat) {
    if (['hex', 'rgb', 'hsl', 'hexa', 'rgba', 'hsla'].includes(newFormat)) {
      this._format = newFormat;
    }
  }
  
  /**
   * Establece el valor de transparencia
   * @param {number} value - Nuevo valor (0-100)
   */
  set alpha(value) {
    this._alpha = Math.max(0, Math.min(100, value || 0));
  }
  
  /**
   * Normaliza un valor hexadecimal
   * @private
   * @param {string} hex - Valor a normalizar
   * @returns {string} Valor normalizado (#RRGGBB)
   */
  _normalizeHex(hex) {
    // Asegurar que tiene # al inicio
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    
    // Validar formato hex
    if (!/^#[0-9A-Fa-f]{3,6}$/i.test(hex)) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
    
    // Convertir formato corto (#RGB) a largo (#RRGGBB)
    if (hex.length === 4) {
      return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    
    return hex.toUpperCase();
  }
  
  /**
   * Obtiene el valor RGB del color
   * @returns {Object} Objeto con propiedades r, g, b
   */
  toRgb() {
    return hexToRgb(this._hex);
  }
  
  /**
   * Obtiene el valor HSL del color
   * @returns {Object} Objeto con propiedades h, s, l
   */
  toHsl() {
    const rgb = this.toRgb();
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
  }
  
  /**
   * Obtiene el valor del color en el formato configurado
   * @returns {string} Color formateado
   */
  getFormattedValue() {
    return formatColor(this._hex, this._format, this._alpha);
  }
  
  /**
   * Serializa el modelo para almacenamiento o transmisión
   * @returns {Object} Representación serializada
   */
  toJSON() {
    return {
      id: this.id,
      color: this._hex,
      alpha: this._alpha,
      format: this._format
    };
  }
  
  /**
   * Crea una instancia desde un objeto JSON
   * @param {Object} data - Datos serializados
   * @returns {ColorModel} Nueva instancia
   */
  static fromJSON(data) {
    const color = new ColorModel(data.color, data.alpha);
    color.id = data.id || color.id;
    color.format = data.format || 'hex';
    return color;
  }
}