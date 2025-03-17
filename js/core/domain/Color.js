class Color {
  constructor(hex) {
    if (!Color.isValidHex(hex)) {
      throw new Error(`Invalid color code: ${hex}`);
    }
    this.hex = Color.normalizeHex(hex);
  }

  static isValidHex(hex) {
    return /^#?([0-9A-F]{3}){1,2}$/i.test(hex);
  }

  static normalizeHex(hex) {
    const cleanHex = hex.replace(/^#/, '').toUpperCase();
    return `#${cleanHex.padStart(6, '0')}`;
  }

  toRGB() {
    const hex = this.hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  toString() {
    return this.hex;
  }
}
/**
 * Representa un color en el espacio HEX
 * @class
 */
export class Color {
  #hex;
  #name;

  /**
   * @param {string} hex - Formato hexadecimal válido (3/6/8 dígitos)
   * @param {string} name - Nombre descriptivo
   */
  constructor(hex, name = '') {
    if (!Color.validateHex(hex)) {
      throw new Error(`Formato HEX inválido: ${hex}`);
    }
    
    this.#hex = Color.normalizeHex(hex);
    this.#name = name;
  }

  static validateHex(hex) {
    return /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex);
  }

  static normalizeHex(hex) {
    const cleanHex = hex.replace(/^#/, '');
    switch (cleanHex.length) {
      case 3: return `#${cleanHex.split('').map(c => c + c).join('')}`; // Expandir 3 a 6 dígitos
      case 6: return `#${cleanHex}`; // HEX estándar sin alpha
      case 8: return `#${cleanHex}`; // HEX con alpha
      default: throw new Error(`Formato HEX inválido: ${hex}`);
    }
  }

  isValid() {
    return Color.validateHex(this.#hex);
  }

  /**
   * Calcula relación de contraste WCAG 2.1
   * @param {Color} otherColor
   * @returns {number} Ratio de contraste
   */
  contrastRatio(otherColor) {
    const lum1 = this.luminance();
    const lum2 = otherColor.luminance();
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  }

  /**
   * Calcula luminancia relativa (WCAG 2.1)
   * @returns {number}
   */
  luminance() {
    const rgb = this.rgbComponents();
    const [r, g, b] = rgb.map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  rgbComponents() {
    const hex = this.#hex.slice(1);
    return [
      parseInt(hex.substr(0, 2), 16),
      parseInt(hex.substr(2, 2), 16),
      parseInt(hex.substr(4, 2), 16)
    ];
  }

  toJSON() {
    return {
      hex: this.#hex,
      name: this.#name
    };
  }

  get hex() { return this.#hex; }
  get name() { return this.#name; }
}