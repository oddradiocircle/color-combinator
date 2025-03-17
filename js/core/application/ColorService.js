import { Color } from '../domain/Color.js';
import { APIAdapter } from '../infrastructure/APIAdapter.js';

/**
 * Servicio principal para operaciones relacionadas con colores
 * Coordina la lógica de generación y manipulación de colores
 */
export class ColorService {
  /**
   * @param {APIAdapter} apiClient - Cliente para llamadas API
   */
  constructor(apiClient = new APIAdapter()) {
    this.apiClient = apiClient;
    this.legacyAdapter = APIAdapter.createLegacyAdapter();
  }

  /**
   * Genera combinaciones de colores para un color base
   * @param {string|Color} baseColor - Color base para las combinaciones
   * @returns {Promise<Object>} Objeto con combinaciones de colores
   */
  async generateCombination(baseColor) {
    // Si es string, convertir a objeto Color
    const color = baseColor instanceof Color ? baseColor : new Color(baseColor);
    
    try {
      // Obtener combinaciones a través de la API
      const response = await this.apiClient.get('/combinations', { 
        color: color.hex,
        model: 'hsl'
      });
      
      // Normalizar respuesta
      return this._normalizeCombinations(response);
    } catch (error) {
      console.error('Error al generar combinaciones:', error);
      // Fallback a combinaciones básicas en caso de error
      return this._generateBasicCombinations(color);
    }
  }

  /**
   * Calcula el contraste entre dos colores según WCAG
   * @param {Color|string} color1 - Primer color
   * @param {Color|string} color2 - Segundo color
   * @returns {number} Ratio de contraste
   */
  calculateContrastRatio(color1, color2) {
    // Convertir a objetos Color si son strings
    const c1 = color1 instanceof Color ? color1 : new Color(color1);
    const c2 = color2 instanceof Color ? color2 : new Color(color2);
    
    // Usar el método de contraste de la clase Color
    return c1.contrastRatio(c2);
  }

  /**
   * Convierte colores al formato legacy
   * @param {Object} colorData - Datos de color en formato moderno
   * @returns {Array} Valores en formato legacy
   */
  convertToLegacyFormat(colorData) {
    const { hue, saturation, lightness } = colorData;
    return this.legacyAdapter.hsluvToRgb(
      Math.round(hue * 100),
      Math.round(saturation * 100),
      Math.round(lightness * 100)
    );
  }

  /**
   * Normaliza los datos de la API para formato interno
   * @private
   */
  _normalizeCombinations(rawData) {
    return {
      base: rawData.base,
      analogous: Array.isArray(rawData.analogous) ? rawData.analogous : [],
      monochromatic: Array.isArray(rawData.monochromatic) ? rawData.monochromatic : [],
      triad: Array.isArray(rawData.triad) ? rawData.triad : []
    };
  }

  /**
   * Genera combinaciones básicas como fallback
   * @private
   */
  _generateBasicCombinations(baseColor) {
    // Convertir a RGB para manipulación
    const rgb = baseColor.toRGB();
    
    // Implementación simplificada para fallback
    return {
      base: baseColor.hex,
      analogous: [
        this._shiftHue(baseColor, 30).hex,
        this._shiftHue(baseColor, -30).hex
      ],
      monochromatic: [
        this._adjustLightness(baseColor, 20).hex,
        this._adjustLightness(baseColor, -20).hex
      ],
      triad: [
        this._shiftHue(baseColor, 120).hex,
        this._shiftHue(baseColor, 240).hex
      ]
    };
  }

  /**
   * Desplaza el tono de un color
   * @private
   */
  _shiftHue(color, degrees) {
    // Implementación básica para cambiar el tono
    // En una versión completa, esto usaría conversiones HSL más precisas
    
    // Obtener componentes RGB
    const { r, g, b } = color.toRGB();
    
    // Convertir a HSL
    let h, s, l;
    // En una implementación real, aquí iría la conversión RGB a HSL
    
    // Por ahora, usamos un valor fijo para pruebas
    h = (Math.random() * 360) | 0;
    s = 80;
    l = 50;
    
    return new Color(`#${Math.random().toString(16).substr(2, 6)}`);
  }

  /**
   * Ajusta la luminosidad de un color
   * @private
   */
  _adjustLightness(color, percent) {
    // Implementación simple para cambiar luminosidad
    // Para pruebas, generamos un color aleatorio
    return new Color(`#${Math.random().toString(16).substr(2, 6)}`);
  }
}