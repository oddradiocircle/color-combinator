/**
 * @fileoverview Punto de entrada principal de la aplicación Color Combinator
 * @author Daniel Gómez (oddradiocircle)
 */

import { config } from './config.js';
import { serviceLocator } from './core/service-locator.js';
import { eventBus } from './core/event-bus.js';

// Servicios
import { ThemeService } from './services/theme-service.js';
import { ExportService } from './services/export-service.js';
import { WcagService } from './services/wcag-service.js';
import { UrlService } from './services/url-service.js';

// Modelos
import { PaletteModel } from './models/palette-model.js';

// Componentes
import { NotificationManager } from './components/notification.js';

/**
 * Aplicación principal Color Combinator
 */
class ColorCombinatorApp {
  constructor() {
    // Crear servicios
    this._initServices();
    
    // Crear modelos
    this._initModels();
    
    // Crear componentes
    this._initComponents();
    
    // Configurar eventos globales
    this._setupEvents();
  }
  
  /**
   * Inicializa la aplicación
   */
  init() {
    // Inicializar tema
    serviceLocator.get('theme').init();
    
    // Cargar datos iniciales (desde URL o localStorage)
    this._loadInitialData();
  }
  
  /**
   * Inicializa los servicios de la aplicación
   * @private
   */
  _initServices() {
    // Registrar servicios en el localizador
    serviceLocator.register('theme', new ThemeService());
    serviceLocator.register('export', new ExportService());
    serviceLocator.register('wcag', new WcagService());
    serviceLocator.register('url', new UrlService());
  }
  
  /**
   * Inicializa los modelos de datos
   * @private
   */
  _initModels() {
    // Crear modelo para la paleta
    this.paletteModel = new PaletteModel();
  }
  
  /**
   * Inicializa los componentes de UI
   * @private
   */
  _initComponents() {
    // Gestor de notificaciones
    this.notificationManager = new NotificationManager(
      document.getElementById('notification-container') || 
      this._createNotificationContainer()
    );
  }

  /**
   * Crea un contenedor para notificaciones si no existe
   * @private
   * @returns {HTMLElement} Contenedor creado
   */
  _createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
  }
  
  /**
   * Configura elementos adicionales de UI
   * @private
   */
  _setupUIElements() {
    // Esta función se implementaría en mayor detalle para la versión completa
    console.log('Setting up UI elements - placeholder for modular version');
  }
  
  /**
   * Configura eventos globales
   * @private
   */
  _setupEvents() {
    // Escuchar cambios en el historial
    eventBus.on('history:updated', data => {
      const undoBtn = document.getElementById('undo-button');
      if (undoBtn) {
        undoBtn.disabled = !data.canUndo;
      }
    });
    
    // Escuchar cambios en la URL
    const urlService = serviceLocator.get('url');
    urlService.listenForUrlChanges(colors => {
      // Cargar colores desde URL
      this.paletteModel.setColors(colors.map(hex => ({ color: hex })));
      
      // Mostrar notificación
      eventBus.emit('notification', {
        title: 'Paleta cargada',
        message: `Se cargaron ${colors.length} colores desde la URL`,
        type: 'success'
      });
    });
    
    // Escuchar cambios en el modelo de la paleta para actualizar URL
    eventBus.on('palette:updated', colors => {
      // Guardar en localStorage
      this.paletteModel.saveToStorage();
      
      // Actualizar URL
      urlService.updateUrlWithColors(colors);
    });
  }
  
  /**
   * Carga datos iniciales
   * @private
   */
  _loadInitialData() {
    // Intentar cargar desde URL primero
    const urlService = serviceLocator.get('url');
    const colorsFromUrl = urlService.getColorsFromUrl();
    
    if (colorsFromUrl && colorsFromUrl.length > 0) {
      // Convertir a objetos de color para el modelo
      const colorObjects = colorsFromUrl.map(hex => ({ color: hex }));
      
      // Establecer en el modelo
      this.paletteModel.setColors(colorObjects);
      
      // Mostrar notificación
      eventBus.emit('notification', {
        title: 'Paleta cargada',
        message: `Se cargaron ${colorsFromUrl.length} colores desde la URL`,
        type: 'success'
      });
    } else {
      // Intentar cargar desde localStorage
      const loaded = this.paletteModel.loadFromStorage();
      
      if (loaded) {
        // Actualizar URL con los colores cargados
        urlService.updateUrlWithColors(this.paletteModel.getColors());
      } else {
        // Usar colores iniciales
        this.paletteModel.setColors(config.initialColors.map(hex => ({ color: hex })));
        
        // Actualizar URL con los colores iniciales
        urlService.updateUrlWithColors(this.paletteModel.getColors());
      }
    }
  }
}

// Iniciar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar mensaje para verificar que estamos usando la versión modular
  console.log('Loading Color Combinator (Modular Version)');
  
  const app = new ColorCombinatorApp();
  app.init();
  
  // Notificación de inicio
  eventBus.emit('notification', {
    title: 'Color Combinator',
    message: 'Aplicación inicializada correctamente (Versión modular)',
    type: 'success'
  });
});