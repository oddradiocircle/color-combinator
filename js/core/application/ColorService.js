import { Color } from '../domain/Color.js';
import APIAdapter from '../infrastructure/APIAdapter.js';

export class ColorService {
  constructor(apiClient = new APIAdapter()) {
    this.apiClient = apiClient;
    this.legacyAdapter = APIAdapter.createLegacyAdapter();
  }

  /**
   * Convierte colores al formato legacy HSLuv
   * @param {Object} colorData - Datos de color en formato moderno
   * @returns {Array} Valores en formato HSLuv legacy
   */
  convertToLegacyFormat(colorData) {
    const { hue, saturation, lightness } = colorData;
    return this.legacyAdapter.hsluvToRgb(
      Math.round(hue * 100),
      Math.round(saturation * 100),
      Math.round(lightness * 100)
    );
  }

  async generateCombination(baseColor) {
    const color = new Color(baseColor);
    if (!color.isValid()) {
      throw new Error('Color hexadecimal inválido');
    }
    
    try {
      const combinations = await this.apiClient.get('/combinations', { 
        color: color.hex,
        model: 'hsl'
      });
      return this._normalizeCombinations(combinations);
    } catch (error) {
      throw new Error('Error al generar combinaciones: ' + error.message);
    }
  }

  _normalizeCombinations(rawData) {
    return rawData.map(combination => ({
      base: combination.base,
      analogous: combination.analogous,
      monochromatic: combination.monochromatic,
      triad: combination.triad
    }));
  }
}