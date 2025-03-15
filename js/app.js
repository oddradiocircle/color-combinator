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
import { ColorPalette } from './components/color-palette.js';

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
    
    // Configurar elementos UI
    this._setupUIElements();
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
    
    // Componente de paleta
    this.colorPalette = new ColorPalette(
      document.getElementById('color-inputs'),
      {
        allowRemove: true,
        minColors: config.ui.minColors,
        onColorsChange: this._handlePaletteChange.bind(this)
      }
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
    // Botones de exportación
    const exportCoolorsBtn = document.getElementById('export-coolors');
    if (exportCoolorsBtn) {
      exportCoolorsBtn.addEventListener('click', this._handleExportCoolors.bind(this));
    }
    
    const exportAppUrlBtn = document.getElementById('export-app-url');
    if (exportAppUrlBtn) {
      exportAppUrlBtn.addEventListener('click', this._handleExportAppUrl.bind(this));
    }
    
    const exportClipboardBtn = document.getElementById('export-clipboard');
    if (exportClipboardBtn) {
      exportClipboardBtn.addEventListener('click', this._handleExportClipboard.bind(this));
    }
    
    // Botón de deshacer
    const undoBtn = document.getElementById('undo-button');
    if (undoBtn) {
      undoBtn.addEventListener('click', this._handleUndo.bind(this));
    }
    
    // Campo de texto para previsualización
    const textInput = document.getElementById('text-input');
    if (textInput) {
      textInput.addEventListener('input', this._handleTextInput.bind(this));
    }
    
    // Botón de tema
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', this._handleThemeToggle.bind(this));
    }
    
    // Colores de tema
    const lightBgColorInput = document.getElementById('light-bg-color');
    if (lightBgColorInput) {
      lightBgColorInput.addEventListener('input', this._handleLightBgColor.bind(this));
    }
    
    const darkBgColorInput = document.getElementById('dark-bg-color');
    if (darkBgColorInput) {
      darkBgColorInput.addEventListener('input', this._handleDarkBgColor.bind(this));
    }
    
    // Importación de Coolors
    const coolorsUrlInput = document.getElementById('coolors-url');
    const importCoolorsBtn = document.getElementById('import-coolors');
    
    if (coolorsUrlInput && importCoolorsBtn) {
      coolorsUrlInput.addEventListener('input', () => {
        // Validar URL de Coolors
        const isValid = coolorsUrlInput.value.trim() && coolorsUrlInput.value.includes('coolors.co');
        importCoolorsBtn.disabled = !isValid;
      });
      
      importCoolorsBtn.addEventListener('click', this._handleImportCoolors.bind(this));
    }
    
    // Menú móvil
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (mobileMenuToggle && sidebarOverlay) {
      mobileMenuToggle.addEventListener('click', this._handleMobileMenuToggle.bind(this));
      sidebarOverlay.addEventListener('click', this._handleCloseMobileMenu.bind(this));
    }
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
    
    // Escuchar eventos de edición de color
    eventBus.on('edit:color', this._handleEditColor.bind(this));
    
    // Escuchar eventos de corrección de contraste
    eventBus.on('fix:contrast', this._handleFixContrast.bind(this));
    
    // Escuchar cambios en la URL
    const urlService = serviceLocator.get('url');
    urlService.listenForUrlChanges(colors => {
      // Cargar colores desde URL
      this.paletteModel.setColors(colors.map(hex => ({ color: hex })));
      
      // Actualizar UI
      this.colorPalette.setColors(this.paletteModel.getColors());
      
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
      
      // Actualizar UI
      this.colorPalette.setColors(this.paletteModel.getColors());
      
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
        // Actualizar componente de paleta
        this.colorPalette.setColors(this.paletteModel.getColors());
      } else {
        // Usar colores iniciales
        this.paletteModel.setColors(config.initialColors.map(hex => ({ color: hex })));
        this.colorPalette.setColors(this.paletteModel.getColors());
      }
      
      // Actualizar URL con los colores cargados
      urlService.updateUrlWithColors(this.paletteModel.getColors());
    }
    
    // Cargar texto guardado para previsualización
    const savedText = localStorage.getItem(config.storage.keys.previewText);
    const textInput = document.getElementById('text-input');
    
    if (savedText && textInput) {
      textInput.value = savedText;
    }
  }
  
  /**
   * Maneja cambios en la paleta
   * @private
   * @param {Object} data - Datos del cambio
   */
  _handlePaletteChange(data) {
    // Actualizar modelo según el tipo de cambio
    switch (data.type) {
      case 'add':
        // Ya está manejado por el componente
        break;
      case 'remove':
        this.paletteModel.removeColor(data.color.id);
        break;
      case 'update':
        this.paletteModel.updateColor(data.color.id, data.color.color);
        break;
    }
  }
  
  /**
   * Maneja clic en botón de exportar URL de Coolors
   * @private
   */
  _handleExportCoolors() {
    const exportService = serviceLocator.get('export');
    exportService.copyColoorsUrl(this.paletteModel.getColors());
  }
  
  /**
   * Maneja clic en botón de exportar URL de la app
   * @private
   */
  _handleExportAppUrl() {
    const exportService = serviceLocator.get('export');
    exportService.copyAppUrl(this.paletteModel.getColors());
  }
  
  /**
   * Maneja clic en botón de copiar paleta
   * @private
   */
  _handleExportClipboard() {
    const exportService = serviceLocator.get('export');
    exportService.copyColorsAsText(this.paletteModel.getColors());
  }
  
  /**
   * Maneja clic en botón de deshacer
   * @private
   */
  _handleUndo() {
    // Deshacer en el modelo
    const undone = this.paletteModel.undo();
    
    if (undone) {
      // Actualizar UI
      this.colorPalette.setColors(this.paletteModel.getColors());
      
      // Notificar
      eventBus.emit('notification', {
        title: 'Acción deshecha',
        message: 'Se ha restaurado el estado anterior',
        type: 'info'
      });
    }
  }
  
  /**
   * Maneja cambios en el campo de texto
   * @private
   * @param {Event} e - Evento de input
   */
  _handleTextInput(e) {
    const html = e.target.value;
    
    // Guardar en localStorage
    localStorage.setItem(config.storage.keys.previewText, html);
  }
  
  /**
   * Maneja clic en botón de cambio de tema
   * @private
   */
  _handleThemeToggle() {
    const themeService = serviceLocator.get('theme');
    themeService.toggleTheme();
  }
  
  /**
   * Maneja cambios en el color de fondo para tema claro
   * @private
   * @param {Event} e - Evento de input
   */
  _handleLightBgColor(e) {
    const color = e.target.value;
    const themeService = serviceLocator.get('theme');
    themeService.setLightBgColor(color);
  }
  
  /**
   * Maneja cambios en el color de fondo para tema oscuro
   * @private
   * @param {Event} e - Evento de input
   */
  _handleDarkBgColor(e) {
    const color = e.target.value;
    const themeService = serviceLocator.get('theme');
    themeService.setDarkBgColor(color);
  }
  
  /**
   * Maneja importación desde Coolors
   * @private
   */
  _handleImportCoolors() {
    const coolorsUrlInput = document.getElementById('coolors-url');
    const url = coolorsUrlInput.value.trim();
    
    if (!url) return;
    
    const exportService = serviceLocator.get('export');
    const colors = exportService.importFromCoolorsUrl(url);
    
    if (!colors || colors.length === 0) {
      eventBus.emit('notification', {
        title: 'Error de importación',
        message: 'No se encontraron colores válidos en la URL',
        type: 'error'
      });
      return;
    }
    
    // Convertir a objetos de color
    const colorObjects = colors.map(hex => ({ color: hex }));
    
    // Actualizar modelo
    this.paletteModel.setColors(colorObjects);
    
    // Actualizar UI
    this.colorPalette.setColors(this.paletteModel.getColors());
    
    // Notificar
    eventBus.emit('notification', {
      title: 'Paleta importada',
      message: `Se importaron ${colors.length} colores de Coolors`,
      type: 'success'
    });
    
    // Limpiar campo
    coolorsUrlInput.value = '';
    document.getElementById('import-coolors').disabled = true;
  }
  
  /**
   * Maneja el toggle del menú móvil
   * @private
   */
  _handleMobileMenuToggle() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const button = document.getElementById('mobile-menu-toggle');
    const icon = button.querySelector('.material-symbols-outlined');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
    
    // Cambiar icono
    icon.textContent = sidebar.classList.contains('open') ? 'close' : 'menu';
  }
  
  /**
   * Maneja el cierre del menú móvil
   * @private
   */
  _handleCloseMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const button = document.getElementById('mobile-menu-toggle');
    const icon = button.querySelector('.material-symbols-outlined');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    icon.textContent = 'menu';
  }
  
  /**
   * Maneja solicitudes de edición de color
   * @private
   * @param {Object} data - Datos del evento
   */
  _handleEditColor(data) {
    // Esta función implementaría la lógica para abrir el modal de edición
    console.log('Editar color:', data);
    
    // Placeholder - esta funcionalidad requeriría implementar un componente Modal
    eventBus.emit('notification', {
      title: 'Función en desarrollo',
      message: `Edición de ${data.mode === 'background' ? 'fondo' : 'texto'} en progreso`,
      type: 'info'
    });
  }
  
  /**
   * Maneja solicitudes de corrección de contraste
   * @private
   * @param {Object} data - Datos del evento
   */
  _handleFixContrast(data) {
    // Esta función implementaría la lógica para corrección automática de contraste
    console.log('Corregir contraste:', data);
    
    // Placeholder - esta funcionalidad requeriría implementación adicional
    eventBus.emit('notification', {
      title: 'Función en desarrollo',
      message: 'Corrección de contraste en progreso',
      type: 'info'
    });
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