/**
 * @fileoverview Servicio para gestión de URLs y parámetros (versión corregida)
 * @author Daniel Gómez (oddradiocircle)
 */

/**
 * Gestiona la interacción con URLs para compartir paletas
 */
export class UrlService {
  /**
   * Extrae colores del fragmento hash de la URL
   * @returns {Array<string>|null} Array de colores hex o null
   */
  getColorsFromUrl() {
    try {
      // Verificar si hay un fragmento en la URL
      const hash = window.location.hash;
      if (!hash || hash.length <= 1) return null;
      
      // Extraer los colores del fragmento (quitando el #)
      const colorString = hash.substring(1);
      const colorValues = colorString.split('-');
      
      // Validar y formatear colores
      const validColors = [];
      colorValues.forEach(color => {
        // Verificar que sea un color HEX válido de 6 dígitos
        if (/^[0-9A-F]{6}$/i.test(color)) {
          validColors.push('#' + color.toUpperCase());
        }
      });
      
      return validColors.length > 0 ? validColors : null;
    } catch (e) {
      console.error('Error parsing colors from URL hash:', e);
      return null;
    }
  }
  
  /**
   * Actualiza la URL con los colores de la paleta actual
   * @param {Array<Object>} colors - Colores para incluir en la URL
   */
  updateUrlWithColors(colors) {
    try {
      if (!colors || !Array.isArray(colors) || colors.length === 0) {
        console.warn('updateUrlWithColors: No se recibieron colores válidos', colors);
        return;
      }
      
      // Obtener solo los valores de color sin el #
      const colorValues = colors.map(colorObj => {
        // Verificar si tenemos un objeto con propiedad 'color' o 'hex'
        let colorValue = null;
        
        if (colorObj && typeof colorObj === 'object') {
          if (colorObj.color && typeof colorObj.color === 'string') {
            colorValue = colorObj.color;
          } else if (colorObj.hex && typeof colorObj.hex === 'string') {
            colorValue = colorObj.hex;
          }
        } else if (typeof colorObj === 'string') {
          colorValue = colorObj;
        }
        
        // Si no tenemos un valor válido, usar un comodín
        if (!colorValue) {
          console.warn('updateUrlWithColors: Color inválido en la posición', colors.indexOf(colorObj));
          return 'FF0000'; // Color rojo como fallback
        }
        
        // Asegurarse de que el color empiece con # y quitarlo
        if (colorValue.startsWith('#')) {
          return colorValue.substring(1).toUpperCase();
        } else {
          return colorValue.toUpperCase();
        }
      }).join('-');
      
      // Crear la URL en formato Coolors (usando hash)
      const newUrl = window.location.pathname + '#' + colorValues;
      
      // Actualizar URL sin recargar
      history.replaceState({}, '', newUrl);
    } catch (e) {
      console.error('Error updating URL with colors:', e);
    }
  }
  
  /**
   * Configura un listener para cambios en el hash de la URL
   * @param {Function} callback - Función a llamar cuando cambia el hash
   * @returns {Function} Función para eliminar el listener
   */
  listenForUrlChanges(callback) {
    try {
      const handleHashChange = () => {
        const colors = this.getColorsFromUrl();
        if (colors && colors.length > 0 && typeof callback === 'function') {
          callback(colors);
        }
      };
      
      window.addEventListener('hashchange', handleHashChange);
      
      // Retornar función para eliminar listener
      return () => window.removeEventListener('hashchange', handleHashChange);
    } catch (e) {
      console.error('Error setting up URL change listener:', e);
      return () => {}; // Función vacía como fallback
    }
  }
}