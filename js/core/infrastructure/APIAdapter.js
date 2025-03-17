export class APIAdapter {
  constructor(baseURL = 'https://api.color-comb.com/v2') {
    this.baseURL = baseURL;
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
export default class APIAdapter {
  constructor(baseURL = 'https://api.color-combinations.com/v1') {
    this.baseURL = baseURL;
  }

  async get(endpoint, params = {}) {
    // Implementación mock temporal
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          base: params.color,
          analogous: ['#ff0000', '#00ff00', '#0000ff'],
          monochromatic: ['#ff3333', '#ff6666', '#ff9999'],
          triad: ['#ff0000', '#ffff00', '#00ffff']
        });
      }, 500);
    });
  }

  async post(endpoint, data) {
    throw new Error('Método no implementado');
  }

  // Legacy HSLuv Converter Adapter
  static createLegacyAdapter() {
    return {
      hsluvToRgb: (h, s, l) => {
        // Implementación mock temporal basada en la versión archive
        return [
          Math.round(h * 2.55),
          Math.round(s * 2.55),
          Math.round(l * 2.55)
        ];
      }
    };
  }
}