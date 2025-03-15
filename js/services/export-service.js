/**
 * @fileoverview Servicio para exportación de paletas de colores
 * @author Daniel Gómez (oddradiocircle)
 */

import { config } from '../config.js';
import { eventBus } from '../core/event-bus.js';

/**
 * Gestiona la exportación e importación de paletas
 */
export class ExportService {
  /**
   * Genera una URL de Coolors a partir de colores
   * @param {Array<ColorModel>} colors - Colores para exportar
   * @returns {string} URL formateada
   */
  generateCoolorsUrl(colors) {
    if (!colors || colors.length === 0) {
      return null;
    }
    
    const formattedColors = colors.map(color => 
      color.hex.substring(1).toUpperCase()
    ).join('-');
    
    return `${config.services.coolorsBaseUrl}${formattedColors}`;
  }
  
  /**
   * Genera una URL de la aplicación con hash para compartir
   * @param {Array<ColorModel>} colors - Colores para exportar
   * @returns {string} URL formateada
   */
  generateAppUrl(colors) {
    if (!colors || colors.length === 0) {
      return null;
    }
    
    const formattedColors = colors.map(color => 
      color.hex.substring(1).toUpperCase()
    ).join('-');
    
    return `${window.location.origin}${window.location.pathname}#${formattedColors}`;
  }
  
  /**
   * Copia la URL de Coolors al portapapeles
   * @param {Array<ColorModel>} colors - Colores para exportar
   * @returns {Promise<boolean>} true si se copió correctamente
   */
  async copyColoorsUrl(colors) {
    const url = this.generateCoolorsUrl(colors);
    
    if (!url) {
      eventBus.emit('notification', {
        title: 'Error de exportación',
        message: 'No hay colores para exportar',
        type: 'error'
      });
      return false;
    }
    
    try {
      await navigator.clipboard.writeText(url);
      
      eventBus.emit('notification', {
        title: 'URL copiada',
        message: 'URL de Coolors copiada al portapapeles',
        type: 'success'
      });
      
      return true;
    } catch (error) {
      console.error('Error copying URL to clipboard:', error);
      
      eventBus.emit('notification', {
        title: 'Error al copiar',
        message: 'No se pudo copiar la URL al portapapeles',
        type: 'error'
      });
      
      return false;
    }
  }
  
  /**
   * Copia la URL de la aplicación al portapapeles
   * @param {Array<ColorModel>} colors - Colores para exportar
   * @returns {Promise<boolean>} true si se copió correctamente
   */
  async copyAppUrl(colors) {
    const url = this.generateAppUrl(colors);
    
    if (!url) {
      eventBus.emit('notification', {
        title: 'Error de exportación',
        message: 'No hay colores para exportar',
        type: 'error'
      });
      return false;
    }
    
    try {
      await navigator.clipboard.writeText(url);
      
      eventBus.emit('notification', {
        title: 'URL copiada',
        message: 'URL de Color Combinator copiada al portapapeles',
        type: 'success'
      });
      
      return true;
    } catch (error) {
      console.error('Error copying URL to clipboard:', error);
      
      eventBus.emit('notification', {
        title: 'Error al copiar',
        message: 'No se pudo copiar la URL al portapapeles',
        type: 'error'
      });
      
      return false;
    }
  }
  
  /**
   * Copia valores de colores al portapapeles como texto
   * @param {Array<ColorModel>} colors - Colores para copiar
   * @returns {Promise<boolean>} true si se copió correctamente
   */
  async copyColorsAsText(colors) {
    if (!colors || colors.length === 0) {
      eventBus.emit('notification', {
        title: 'Error al copiar',
        message: 'No hay colores para copiar',
        type: 'error'
      });
      return false;
    }
    
    // Obtener valores hex
    const colorText = colors.map(color => color.hex).join(', ');
    
    try {
      await navigator.clipboard.writeText(colorText);
      
      eventBus.emit('notification', {
        title: 'Paleta copiada',
        message: 'Los colores se han copiado al portapapeles',
        type: 'success'
      });
      
      return true;
    } catch (error) {
      console.error('Error copying colors to clipboard:', error);
      
      eventBus.emit('notification', {
        title: 'Error al copiar',
        message: 'No se pudo copiar los colores al portapapeles',
        type: 'error'
      });
      
      return false;
    }
  }
  
  /**
   * Importa paleta desde URL de Coolors
   * @param {string} url - URL de Coolors
   * @returns {Array<string>|null} Array de colores hex o null si es inválido
   */
  importFromCoolorsUrl(url) {
    if (!url || !url.includes('coolors.co')) {
      return null;
    }
    
    try {
      // Extraer colores de la URL
      let urlSegments = url.split('/');
      let colorString = urlSegments[urlSegments.length - 1];
      
      // Limpiar posibles parámetros adicionales
      colorString = colorString.split('?')[0];
      colorString = colorString.split('#')[0];
      
      // Separar cada color
      let colorArray = colorString.split('-');
      let validColors = [];
      
      // Verificar y formatear colores
      colorArray.forEach(color => {
        if (color && color.length) {
          // Asegurar formato con #
          if (!color.startsWith('#')) {
            color = `#${color}`;
          }
          
          // Verificar formato válido
          if (/^#[0-9A-F]{6}$/i.test(color)) {
            validColors.push(color.toUpperCase());
          }
        }
      });
      
      return validColors.length > 0 ? validColors : null;
    } catch (error) {
      console.error('Error importing from Coolors URL:', error);
      return null;
    }
  }
}