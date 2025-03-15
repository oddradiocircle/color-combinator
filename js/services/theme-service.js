/**
 * @fileoverview Servicio para gestión del tema de la aplicación
 * @author Daniel Gómez (oddradiocircle)
 */

import { config } from '../config.js';
import { getFromStorage, saveToStorage } from '../utils/storage-utils.js';
import { eventBus } from '../core/event-bus.js';

/**
 * Gestiona el tema de la aplicación (claro/oscuro)
 */
export class ThemeService {
  constructor() {
    this.currentTheme = 'light'; // Tema por defecto
    this.lightBgColor = '#ffffff';
    this.darkBgColor = '#1a1a1c';
  }
  
  /**
   * Inicializa el servicio, cargando preferencias guardadas
   */
  init() {
    this._loadSavedTheme();
    this._loadSavedColors();
    this._initSystemThemeListener();
  }
  
  /**
   * Cambia entre tema claro y oscuro
   * @returns {string} Nuevo tema actual
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return this.currentTheme;
  }
  
  /**
   * Establece un tema específico
   * @param {string} theme - 'light' o 'dark'
   */
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      return false;
    }
    
    this.currentTheme = theme;
    
    // Actualizar la clase en el body
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    // Guardar preferencia
    saveToStorage(config.storage.keys.theme, theme);
    
    // Emitir evento
    eventBus.emit('theme:change', { theme });
    
    return true;
  }
  
  /**
   * Establece el color de fondo para el tema claro
   * @param {string} color - Color en formato hex
   */
  setLightBgColor(color) {
    this.lightBgColor = color;
    document.documentElement.style.setProperty('--light-bg-color', color);
    saveToStorage(config.storage.keys.lightBgColor, color);
    eventBus.emit('theme:colors:change', { light: color, dark: this.darkBgColor });
  }
  
  /**
   * Establece el color de fondo para el tema oscuro
   * @param {string} color - Color en formato hex
   */
  setDarkBgColor(color) {
    this.darkBgColor = color;
    document.documentElement.style.setProperty('--dark-bg-color', color);
    saveToStorage(config.storage.keys.darkBgColor, color);
    eventBus.emit('theme:colors:change', { light: this.lightBgColor, dark: color });
  }
  
  /**
   * @returns {string} Tema actual ('light' o 'dark')
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  /**
   * Carga el tema guardado en localStorage
   * @private
   */
  _loadSavedTheme() {
    const savedTheme = getFromStorage(config.storage.keys.theme, false);
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Usar preferencia del sistema si no hay tema guardado
      this.setTheme('dark');
    }
  }
  
  /**
   * Carga colores de tema guardados
   * @private
   */
  _loadSavedColors() {
    const lightBgColor = getFromStorage(config.storage.keys.lightBgColor, false);
    const darkBgColor = getFromStorage(config.storage.keys.darkBgColor, false);
    
    if (lightBgColor) {
      this.lightBgColor = lightBgColor;
      document.documentElement.style.setProperty('--light-bg-color', lightBgColor);
    }
    
    if (darkBgColor) {
      this.darkBgColor = darkBgColor;
      document.documentElement.style.setProperty('--dark-bg-color', darkBgColor);
    }
  }
  
  /**
   * Configura listener para cambios en el tema del sistema
   * @private
   */
  _initSystemThemeListener() {
    if (window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Listener para cambios en la preferencia del sistema
      const handleChange = e => {
        // Solo cambiar automáticamente si no hay preferencia guardada
        if (!getFromStorage(config.storage.keys.theme, false)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      };
      
      // Añadir listener según navegador (compatibilidad)
      if (darkModeMediaQuery.addEventListener) {
        darkModeMediaQuery.addEventListener('change', handleChange);
      } else if (darkModeMediaQuery.addListener) {
        // Para navegadores antiguos
        darkModeMediaQuery.addListener(handleChange);
      }
    }
  }
}