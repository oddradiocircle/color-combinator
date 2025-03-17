import { Color } from '../core/domain/Color.js';

/**
 * Clase que maneja la sincronización del estado de la aplicación con la URL
 * Permite compartir paletas de colores mediante URLs compatibles con Coolors
 */
export class URLService {
  constructor() {
    this.currentColors = [];
    
    // Configurar listener para cambios en la URL (navegación)
    window.addEventListener('popstate', this.parseURL.bind(this));
    
    // Leer colores de la URL al inicializar
    this.parseURL();
  }

  /**
   * Extrae colores de la URL actual
   */
  parseURL() {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const colorParam = params.get('colors');
    
    // Revisar si hay un formato hash (coolors.co style)
    const hash = window.location.hash.replace('#', '');
    
    try {
      let colorString = '';
      
      // Prioridad: parámetro colors > hash
      if (colorParam) {
        colorString = colorParam;
      } else if (hash && hash.includes('-')) {
        colorString = hash;
      }
      
      // Si encontramos colores, procesarlos
      if (colorString) {
        this.currentColors = colorString
          .split('-')
          .map(c => {
            // Asegurar formato hex con # al inicio
            const hex = c.startsWith('#') ? c : `#${c}`;
            return new Color(hex);
          });
        
        // Notificar a la aplicación que hay nuevos colores
        window.dispatchEvent(new CustomEvent('colors-updated', {
          detail: this.currentColors
        }));
      }
    } catch (error) {
      console.error('Error al procesar colores de la URL:', error);
      this.currentColors = [];
    }
  }

  /**
   * Actualiza la URL con los colores actuales
   * @param {Array} colors - Array de objetos Color
   * @param {boolean} useLegacy - Si es true, usa formato antiguo
   */
  updateURL(colors, useLegacy = false) {
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return;
    }
    
    try {
      // Convertir colores a string para URL
      const colorString = colors
        .map(c => c.hex.replace('#', ''))
        .join('-');
      
      // Determinar si usar hash o parámetro de búsqueda
      const useHash = window.location.hostname.includes('coolors.co') || useLegacy;
      
      if (useHash) {
        // Formato Coolors.co
        window.history.pushState({}, '', `${window.location.pathname}#${colorString}`);
      } else {
        // Formato con parámetros de búsqueda
        const url = new URL(window.location.href);
        url.searchParams.set('colors', colorString);
        window.history.pushState({}, '', url);
      }
      
      // Actualizar colores actuales
      this.currentColors = [...colors];
    } catch (error) {
      console.error('Error al actualizar URL:', error);
    }
  }
}