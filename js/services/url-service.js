/**
 * @fileoverview Servicio para gestión de URLs y parámetros
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
    // Verificar si hay un fragmento en la URL
    const hash = window.location.hash;
    if (!hash || hash.length <= 1) return null;
    
    try {
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
   * @param {Array<ColorModel>} colors - Colores para incluir en la URL
   */
  updateUrlWithColors(colors) {
    if (!colors || colors.length === 0) return;
    
    // Obtener solo los valores de color sin el #
    const colorValues = colors.map(color => 
      color.hex.substring(1).toUpperCase()
    ).join('-');
    
    // Crear la URL en formato Coolors (usando hash)
    const newUrl = window.location.pathname + '#' + colorValues;
    
    // Actualizar URL sin recargar
    history.replaceState({}, '', newUrl);
  }
  
  /**
   * Configura un listener para cambios en el hash de la URL
   * @param {Function} callback - Función a llamar cuando cambia el hash
   * @returns {Function} Función para eliminar el listener
   */
  listenForUrlChanges(callback) {
    const handleHashChange = () => {
      const colors = this.getColorsFromUrl();
      if (colors && colors.length > 0) {
        callback(colors);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Retornar función para eliminar listener
    return () => window.removeEventListener('hashchange', handleHashChange);
  }
}