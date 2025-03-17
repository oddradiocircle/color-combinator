/**
 * Adaptador para comunicación con APIs externas
 * Proporciona capa de abstracción para llamadas HTTP
 */
export class APIAdapter {
  /**
   * @param {string} baseURL - URL base para todas las peticiones
   */
  constructor(baseURL = 'https://api.color-combinations.com/v1') {
    this.baseURL = baseURL;
  }

  /**
   * Realiza una petición GET
   * @param {string} endpoint - Ruta relativa a la baseURL
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Respuesta parseada como JSON
   */
  async get(endpoint, params = {}) {
    try {
      // Durante desarrollo: usar simulación en lugar de API real
      return this.mockResponse(endpoint, params);
      
      // Implementación real para producción (comentada por ahora)
      /*
      const url = new URL(`${this.baseURL}${endpoint}`);
      
      // Añadir parámetros a la URL
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error API: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
      */
    } catch (error) {
      console.error('Error en solicitud GET:', error);
      throw error;
    }
  }

  /**
   * Realiza una petición POST
   * @param {string} endpoint - Ruta relativa a la baseURL
   * @param {Object} data - Datos a enviar en el cuerpo
   * @returns {Promise<Object>} Respuesta parseada como JSON
   */
  async post(endpoint, data = {}) {
    try {
      // Durante desarrollo: usar simulación
      return this.mockResponse(endpoint, data);
      
      // Implementación real para producción (comentada por ahora)
      /*
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Error API: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
      */
    } catch (error) {
      console.error('Error en solicitud POST:', error);
      throw error;
    }
  }

  /**
   * Genera respuestas simuladas para desarrollo
   * @private
   */
  mockResponse(endpoint, params) {
    // Simular latencia de red
    return new Promise((resolve) => {
      setTimeout(() => {
        if (endpoint === '/combinations') {
          resolve({
            base: params.color || '#FF0000',
            analogous: ['#FF3333', '#FF6666', '#FF9999'],
            monochromatic: ['#FF0000', '#CC0000', '#990000'],
            triad: ['#FF0000', '#00FF00', '#0000FF']
          });
        } else if (endpoint === '/convert') {
          resolve({
            success: true,
            result: params.color || '#FF0000'
          });
        } else {
          resolve({
            success: false,
            message: 'Endpoint no soportado en mock'
          });
        }
      }, 300); // 300ms de latencia simulada
    });
  }

  /**
   * Crea un adaptador para compatibilidad con versiones antiguas
   * @static
   */
  static createLegacyAdapter() {
    return {
      hsluvToRgb: (h, s, l) => {
        // Implementación simplificada para compatibilidad
        return [
          Math.round(h * 2.55),
          Math.round(s * 2.55),
          Math.round(l * 2.55)
        ];
      }
    };
  }
}