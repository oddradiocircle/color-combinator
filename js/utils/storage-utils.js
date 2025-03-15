/**
 * @fileoverview Utilidades para manejo de almacenamiento local
 * @author Daniel Gómez (oddradiocircle)
 */

/**
 * Guarda un valor en localStorage
 * @param {string} key - Clave
 * @param {*} value - Valor (será convertido a JSON si no es string)
 * @returns {boolean} true si se guardó correctamente
 */
export function saveToStorage(key, value) {
  try {
    const valueToStore = typeof value === 'string' 
      ? value 
      : JSON.stringify(value);
    
    localStorage.setItem(key, valueToStore);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

/**
 * Obtiene un valor desde localStorage
 * @param {string} key - Clave
 * @param {boolean} parse - Indica si se debe intentar parsear como JSON
 * @returns {*} Valor almacenado o null si no existe
 */
export function getFromStorage(key, parse = true) {
  try {
    const value = localStorage.getItem(key);
    
    if (value === null) {
      return null;
    }
    
    if (parse) {
      try {
        return JSON.parse(value);
      } catch (e) {
        // Si no es JSON válido, retornar como string
        return value;
      }
    }
    
    return value;
  } catch (error) {
    console.error('Error getting from localStorage:', error);
    return null;
  }
}

/**
 * Elimina un valor de localStorage
 * @param {string} key - Clave a eliminar
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

/**
 * Verifica si existe una clave en localStorage
 * @param {string} key - Clave a verificar
 * @returns {boolean} true si existe
 */
export function existsInStorage(key) {
  return localStorage.getItem(key) !== null;
}