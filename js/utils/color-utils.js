/**
 * @fileoverview Utilidades para manipulación y cálculo de colores
 * @author Daniel Gómez (oddradiocircle)
 */

/**
 * Convierte un color hexadecimal a formato RGB
 * @param {string} hex - Color en formato hexadecimal (#RRGGBB)
 * @returns {Object} Objeto con propiedades r, g, b
 */
export function hexToRgb(hex) {
  // Normalizar el valor hex
  hex = hex.replace(/^#/, '');
  
  // Convertir formato corto (#RGB) a formato largo (#RRGGBB)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Convierte valores RGB a formato hexadecimal
 * @param {number} r - Canal rojo (0-255)
 * @param {number} g - Canal verde (0-255)
 * @param {number} b - Canal azul (0-255)
 * @returns {string} Color en formato hexadecimal (#RRGGBB)
 */
export function rgbToHex(r, g, b) {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Convierte RGB a HSL
 * @param {number} r - Canal rojo (0-255)
 * @param {number} g - Canal verde (0-255)
 * @param {number} b - Canal azul (0-255)
 * @returns {Object} Objeto con propiedades h (0-360), s (0-100), l (0-100)
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convierte HSL a RGB
 * @param {number} h - Tono (0-360)
 * @param {number} s - Saturación (0-100)
 * @param {number} l - Luminosidad (0-100)
 * @returns {Object} Objeto con propiedades r, g, b (0-255)
 */
export function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Calcula la luminancia relativa de un color
 * @param {string} hex - Color en formato hexadecimal
 * @returns {number} Luminancia (0-1)
 */
export function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  
  const rsrgb = rgb.r / 255;
  const gsrgb = rgb.g / 255;
  const bsrgb = rgb.b / 255;
  
  const r = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
  const g = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
  const b = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calcula el ratio de contraste entre dos colores
 * @param {string} color1 - Primer color (formato hex)
 * @param {string} color2 - Segundo color (formato hex)
 * @returns {number} Ratio de contraste (1-21)
 */
export function calculateContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Genera un color aleatorio con buena saturación y luminosidad
 * @returns {string} Color en formato hexadecimal
 */
export function generateRandomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 30) + 70; // 70-100% saturación
  const l = Math.floor(Math.random() * 30) + 35; // 35-65% luminosidad
  
  const hslRgb = hslToRgb(h, s, l);
  return rgbToHex(hslRgb.r, hslRgb.g, hslRgb.b);
}

/**
 * Formatea un color en el formato especificado
 * @param {string} hexColor - Color en formato hexadecimal
 * @param {string} format - Formato deseado (hex, rgb, hsl, hexa, rgba, hsla)
 * @param {number} alpha - Valor alpha (0-100, donde 0 es opaco y 100 es transparente)
 * @returns {string} Color formateado
 */
export function formatColor(hexColor, format, alpha = 0) {
  const rgb = hexToRgb(hexColor);
  
  switch (format) {
    case 'hex':
      return hexColor.toUpperCase();
    case 'rgb':
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case 'rgba':
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(100 - alpha) / 100})`;
    case 'hsl': {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case 'hsla': {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${(100 - alpha) / 100})`;
    }
    case 'hexa':
      const alphaHex = Math.round((100 - alpha) * 255 / 100).toString(16).padStart(2, '0');
      return `${hexColor.toUpperCase()}${alphaHex}`;
    default:
      return hexColor.toUpperCase();
  }
}