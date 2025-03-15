/**
 * @fileoverview Servicio para cálculos de accesibilidad WCAG
 * @author Daniel Gómez (oddradiocircle)
 */

import { config } from '../config.js';
import { calculateContrastRatio } from '../utils/color-utils.js';

/**
 * Gestiona cálculos y correcciones de accesibilidad WCAG
 */
export class WcagService {
  constructor() {
    // Cargar umbrales desde configuración
    this.thresholds = {
      AA: {
        normal: config.wcag.AA_NORMAL_TEXT,
        large: config.wcag.AA_LARGE_TEXT
      },
      AAA: {
        normal: config.wcag.AAA_NORMAL_TEXT,
        large: config.wcag.AAA_LARGE_TEXT
      }
    };
  }
  
  /**
   * Calcula el ratio de contraste entre dos colores
   * @param {string} bgColor - Color de fondo (hex)
   * @param {string} textColor - Color de texto (hex)
   * @returns {number} Ratio de contraste
   */
  getContrastRatio(bgColor, textColor) {
    return calculateContrastRatio(bgColor, textColor);
  }
  
  /**
   * Verifica si una combinación cumple con los estándares WCAG
   * @param {string} bgColor - Color de fondo (hex)
   * @param {string} textColor - Color de texto (hex)
   * @returns {Object} Objeto con estado de conformidad
   */
  checkConformance(bgColor, textColor) {
    const contrastRatio = this.getContrastRatio(bgColor, textColor);
    
    return {
      contrastRatio: contrastRatio,
      AA: {
        normal: contrastRatio >= this.thresholds.AA.normal,
        large: contrastRatio >= this.thresholds.AA.large
      },
      AAA: {
        normal: contrastRatio >= this.thresholds.AAA.normal,
        large: contrastRatio >= this.thresholds.AAA.large
      }
    };
  }
  
  /**
   * Corrige un color para cumplir con un nivel específico de WCAG
   * @param {string} bgColor - Color de fondo (hex)
   * @param {string} textColor - Color de texto (hex)
   * @param {string} elementToFix - 'background' o 'text'
   * @param {string} level - 'AA' o 'AAA'
   * @param {string} textSize - 'normal' o 'large'
   * @returns {string|null} Color corregido o null si no es necesario
   */
  fixColor(bgColor, textColor, elementToFix = 'text', level = 'AA', textSize = 'normal') {
    // Obtener el umbral objetivo
    const targetRatio = this.thresholds[level][textSize];
    
    // Comprobar si ya cumple
    const currentRatio = this.getContrastRatio(bgColor, textColor);
    if (currentRatio >= targetRatio) {
      return null; // No es necesario corregir
    }
    
    // Implementar la lógica de corrección (esta es una versión simplificada)
    // La implementación completa debería ajustar gradualmente la luminosidad
    
    if (elementToFix === 'text') {
      // Opción simple: cambiar a negro o blanco según el fondo
      const bgLuminance = this._getLuminance(bgColor);
      return bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
    } else {
      // Opción simple: cambiar a negro o blanco según el texto
      const textLuminance = this._getLuminance(textColor);
      return textLuminance > 0.5 ? '#000000' : '#FFFFFF';
    }
  }
  
  /**
   * Calcula la luminancia relativa de un color
   * @private
   * @param {string} hex - Color en formato hexadecimal
   * @returns {number} Luminancia (0-1)
   */
  _getLuminance(hex) {
    // Extraer componentes RGB
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Calcular luminancia
    const rgb = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }
}