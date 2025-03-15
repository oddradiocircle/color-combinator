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
    try {
      // Crear servicios
      this._initServices();
      
      // Crear modelos
      this._initModels();
      
      // Crear componentes
      this._initComponents();
      
      // Configurar eventos globales
      this._setupEvents();
      
      // Corrección para SVG viewBox (bug-fix)
      this._fixSvgViewbox();
    } catch (error) {
      console.error('Error en el constructor de ColorCombinatorApp:', error);
      this.showErrorNotification('Error de inicialización', 'No se pudo inicializar la aplicación correctamente.');
    }
  }
  
  /**
   * Muestra una notificación de éxito
   */
  showSuccessNotification(title, message) {
    eventBus.emit('notification', {
      title: title,
      message: message,
      type: 'success'
    });
  }
  
  /**
   * Muestra una notificación de error
   */
  showErrorNotification(title, message) {
    eventBus.emit('notification', {
      title: title,
      message: message,
      type: 'error'
    });
  }
  
  /**
   * Inicializa la aplicación
   */
  init() {
    try {
      // Inicializar tema
      serviceLocator.get('theme').init();
      
      // Cargar datos iniciales (desde URL o localStorage)
      this._loadInitialData();
      
      // Configurar elementos UI
      this._setupUIElements();
      
      // Notificación de inicio
      this.showSuccessNotification('Color Combinator', 'Aplicación inicializada correctamente (Versión modular)');
      
      return true;
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
      this.showErrorNotification('Error de inicialización', 'No se pudo inicializar la aplicación correctamente.');
      return false;
    }
  }
  
  /**
   * Corrige problemas de SVG viewBox que usan porcentajes
   * @private
   */
  _fixSvgViewbox() {
    try {
      // Inyectar un parche CSS que oculta los errores de manera global
      const style = document.createElement('style');
      style.textContent = `
        /* Corrección para SVGs con viewBox inválido */
        svg[viewBox*="%"] {
          viewBox: 0 0 100 4 !important;
        }
      `;
      document.head.appendChild(style);
      
      // Redefinir el setter del atributo viewBox
      try {
        // Solo funciona en navegadores modernos
        const svgProto = SVGSVGElement.prototype;
        const originalSetAttr = svgProto.setAttribute;
        
        svgProto.setAttribute = function(name, value) {
          if (name === 'viewBox' && typeof value === 'string' && value.includes('%')) {
            // Reemplazar porcentajes con valores numéricos
            const newVal = value.replace(/(\\d+)%/g, (match, p1) => parseInt(p1, 10));
            return originalSetAttr.call(this, name, newVal);
          }
          return originalSetAttr.call(this, name, value);
        };
      } catch (e) {
        console.warn('SVG viewBox fix: Could not patch SVGElement.prototype', e);
      }
      
      // Corrección inicial para SVGs existentes
      document.querySelectorAll('svg[viewBox*="%"]').forEach(svg => {
        const viewBox = svg.getAttribute('viewBox');
        if (viewBox) {
          const newViewBox = viewBox.replace(/(\\d+)%/g, (match, p1) => parseInt(p1, 10));
          svg.setAttribute('viewBox', newViewBox);
        }
      });
      
      // Configurar un MutationObserver para SVGs futuros
      const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => {
              if (node.tagName === 'svg') {
                this._checkAndFixSVG(node);
              } else if (node.querySelectorAll) {
                node.querySelectorAll('svg').forEach(svg => {
                  this._checkAndFixSVG(svg);
                });
              }
            });
          }
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } catch (error) {
      console.error('Error en _fixSvgViewbox:', error);
    }
  }
  
  /**
   * Verifica y corrige atributos viewBox en elementos SVG
   * @private
   * @param {SVGElement} svg - Elemento SVG a corregir
   */
  _checkAndFixSVG(svg) {
    try {
      const viewBox = svg.getAttribute('viewBox');
      if (viewBox && viewBox.includes('%')) {
        // Reemplazar porcentajes con valores numéricos
        const newViewBox = viewBox.replace(/(\\d+)%/g, (match, p1) => {
          return parseInt(p1, 10);
        });
        svg.setAttribute('viewBox', newViewBox);
        console.log('SVG viewBox corregido:', viewBox, '->', newViewBox);
      }
    } catch (error) {
      console.error('Error en _checkAndFixSVG:', error);
    }
  }
  
  /**
   * Inicializa los servicios de la aplicación
   * @private
   */
  _initServices() {
    try {
      // Registrar servicios en el localizador
      serviceLocator.register('theme', new ThemeService());
      serviceLocator.register('export', new ExportService());
      serviceLocator.register('wcag', new WcagService());
      serviceLocator.register('url', new UrlService());
    } catch (error) {
      console.error('Error al inicializar servicios:', error);
      throw new Error('No se pudieron inicializar los servicios: ' + error.message);
    }
  }
  
  /**
   * Inicializa los modelos de datos
   * @private
   */
  _initModels() {
    try {
      // Crear modelo para la paleta
      this.paletteModel = new PaletteModel();
    } catch (error) {
      console.error('Error al inicializar modelos:', error);
      throw new Error('No se pudieron inicializar los modelos: ' + error.message);
    }
  }
  
  /**
   * Inicializa los componentes de UI
   * @private
   */
  _initComponents() {
    try {
      // Gestor de notificaciones
      const notificationContainer = document.getElementById('notification-container');
      this.notificationManager = new NotificationManager(
        notificationContainer || this._createNotificationContainer()
      );
      
      // Componente de paleta
      const colorInputsContainer = document.getElementById('color-inputs');
      if (!colorInputsContainer) {
        console.error('No se encontró el elemento #color-inputs');
        throw new Error('No se encontró el contenedor de color-inputs');
      }
      
      this.colorPalette = new ColorPalette(
        colorInputsContainer,
        {
          allowRemove: true,
          minColors: config.ui.minColors,
          onColorsChange: this._handlePaletteChange.bind(this)
        }
      );
    } catch (error) {
      console.error('Error al inicializar componentes:', error);
      throw new Error('No se pudieron inicializar los componentes: ' + error.message);
    }
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
    try {
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
    } catch (error) {
      console.error('Error al configurar elementos UI:', error);
    }
  }
  
  /**
   * Configura eventos globales
   * @private
   */
  _setupEvents() {
    try {
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
        this.showSuccessNotification('Paleta cargada', `Se cargaron ${colors.length} colores desde la URL`);
      });
      
      // Escuchar cambios en el modelo de la paleta para actualizar URL
      eventBus.on('palette:updated', colors => {
        // Guardar en localStorage
        this.paletteModel.saveToStorage();
        
        // Actualizar URL
        urlService.updateUrlWithColors(colors);
      });
    } catch (error) {
      console.error('Error al configurar eventos:', error);
    }
  }
  
  /**
   * Carga datos iniciales
   * @private
   */
  _loadInitialData() {
    try {
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
        this.showSuccessNotification('Paleta cargada', `Se cargaron ${colorsFromUrl.length} colores desde la URL`);
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
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  }
  
  /**
   * Maneja cambios en la paleta
   * @private
   * @param {Object} data - Datos del cambio
   */
  _handlePaletteChange(data) {
    try {
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
    } catch (error) {
      console.error('Error al manejar cambio en paleta:', error);
    }
  }
  
  /**
   * Maneja clic en botón de exportar URL de Coolors
   * @private
   */
  _handleExportCoolors() {
    try {
      const exportService = serviceLocator.get('export');
      exportService.copyColoorsUrl(this.paletteModel.getColors());
    } catch (error) {
      console.error('Error al exportar URL de Coolors:', error);
      this.showErrorNotification('Error de exportación', 'No se pudo generar la URL de Coolors.');
    }
  }
  
  /**
   * Maneja clic en botón de exportar URL de la app
   * @private
   */
  _handleExportAppUrl() {
    try {
      const exportService = serviceLocator.get('export');
      exportService.copyAppUrl(this.paletteModel.getColors());
    } catch (error) {
      console.error('Error al exportar URL de la app:', error);
      this.showErrorNotification('Error de exportación', 'No se pudo generar la URL de la aplicación.');
    }
  }
  
  /**
   * Maneja clic en botón de copiar paleta
   * @private
   */
  _handleExportClipboard() {
    try {
      const exportService = serviceLocator.get('export');
      exportService.copyColorsAsText(this.paletteModel.getColors());
    } catch (error) {
      console.error('Error al copiar colores al portapapeles:', error);
      this.showErrorNotification('Error de exportación', 'No se pudieron copiar los colores al portapapeles.');
    }
  }
  
  /**
   * Maneja clic en botón de deshacer
   * @private
   */
  _handleUndo() {
    try {
      // Deshacer en el modelo
      const undone = this.paletteModel.undo();
      
      if (undone) {
        // Actualizar UI
        this.colorPalette.setColors(this.paletteModel.getColors());
        
        // Notificar
        this.showSuccessNotification('Acción deshecha', 'Se ha restaurado el estado anterior');
      }
    } catch (error) {
      console.error('Error al deshacer acción:', error);
    }
  }
  
  /**
   * Maneja cambios en el campo de texto
   * @private
   * @param {Event} e - Evento de input
   */
  _handleTextInput(e) {
    try {
      const html = e.target.value;
      
      // Guardar en localStorage
      localStorage.setItem(config.storage.keys.previewText, html);
    } catch (error) {
      console.error('Error al manejar entrada de texto:', error);
    }
  }
  
  /**
   * Maneja clic en botón de cambio de tema
   * @private
   */
  _handleThemeToggle() {
    try {
      const themeService = serviceLocator.get('theme');
      themeService.toggleTheme();
    } catch (error) {
      console.error('Error al cambiar tema:', error);
    }
  }
  
  /**
   * Maneja cambios en el color de fondo para tema claro
   * @private
   * @param {Event} e - Evento de input
   */
  _handleLightBgColor(e) {
    try {
      const color = e.target.value;
      const themeService = serviceLocator.get('theme');
      themeService.setLightBgColor(color);
    } catch (error) {
      console.error('Error al cambiar color de fondo claro:', error);
    }
  }
  
  /**
   * Maneja cambios en el color de fondo para tema oscuro
   * @private
   * @param {Event} e - Evento de input
   */
  _handleDarkBgColor(e) {
    try {
      const color = e.target.value;
      const themeService = serviceLocator.get('theme');
      themeService.setDarkBgColor(color);
    } catch (error) {
      console.error('Error al cambiar color de fondo oscuro:', error);
    }
  }
  
  /**
   * Maneja importación desde Coolors
   * @private
   */
  _handleImportCoolors() {
    try {
      const coolorsUrlInput = document.getElementById('coolors-url');
      const url = coolorsUrlInput.value.trim();
      
      if (!url) return;
      
      const exportService = serviceLocator.get('export');
      const colors = exportService.importFromCoolorsUrl(url);
      
      if (!colors || colors.length === 0) {
        this.showErrorNotification('Error de importación', 'No se encontraron colores válidos en la URL');
        return;
      }
      
      // Convertir a objetos de color
      const colorObjects = colors.map(hex => ({ color: hex }));
      
      // Actualizar modelo
      this.paletteModel.setColors(colorObjects);
      
      // Actualizar UI
      this.colorPalette.setColors(this.paletteModel.getColors());
      
      // Notificar
      this.showSuccessNotification('Paleta importada', `Se importaron ${colors.length} colores de Coolors`);
      
      // Limpiar campo
      coolorsUrlInput.value = '';
      document.getElementById('import-coolors').disabled = true;
    } catch (error) {
      console.error('Error al importar de Coolors:', error);
      this.showErrorNotification('Error de importación', 'No se pudo importar la paleta de Coolors.');
    }
  }
  
  /**
   * Maneja el toggle del menú móvil
   * @private
   */
  _handleMobileMenuToggle() {
    try {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      const button = document.getElementById('mobile-menu-toggle');
      const icon = button.querySelector('.material-symbols-outlined');
      
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
      
      // Cambiar icono
      icon.textContent = sidebar.classList.contains('open') ? 'close' : 'menu';
    } catch (error) {
      console.error('Error al manejar menú móvil:', error);
    }
  }
  
  /**
   * Maneja el cierre del menú móvil
   * @private
   */
  _handleCloseMobileMenu() {
    try {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      const button = document.getElementById('mobile-menu-toggle');
      const icon = button.querySelector('.material-symbols-outlined');
      
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      icon.textContent = 'menu';
    } catch (error) {
      console.error('Error al cerrar menú móvil:', error);
    }
  }
  
  /**
   * Maneja solicitudes de edición de color
   * @private
   * @param {Object} data - Datos del evento
   */
  _handleEditColor(data) {
    try {
      // Esta función implementaría la lógica para abrir el modal de edición
      console.log('Editar color:', data);
      
      // Placeholder - esta funcionalidad requeriría implementar un componente Modal
      this.showSuccessNotification('Función en desarrollo', 
        `Edición de ${data.mode === 'background' ? 'fondo' : 'texto'} en progreso`);
    } catch (error) {
      console.error('Error al manejar edición de color:', error);
    }
  }
  
  /**
   * Maneja solicitudes de corrección de contraste
   * @private
   * @param {Object} data - Datos del evento
   */
  _handleFixContrast(data) {
    try {
      // Esta función implementaría la lógica para corrección automática de contraste
      console.log('Corregir contraste:', data);
      
      // Placeholder - esta funcionalidad requeriría implementación adicional
      this.showSuccessNotification('Función en desarrollo', 'Corrección de contraste en progreso');
    } catch (error) {
      console.error('Error al corregir contraste:', error);
    }
  }
}

// Iniciar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Mostrar mensaje para verificar que estamos usando la versión modular
    console.log('Loading Color Combinator (Modular Version)');
    
    // Crear y inicializar la aplicación
    const app = new ColorCombinatorApp();
    const initResult = app.init();
    
    if (!initResult) {
      console.warn('Aplicación inicializada con errores. Algunas funciones podrían no estar disponibles.');
    }
  } catch (error) {
    console.error('Error crítico al iniciar la aplicación:', error);
    
    // Notificación de error global
    eventBus.emit('notification', {
      title: 'Error crítico',
      message: 'No se pudo iniciar la aplicación. Por favor, recarga la página.',
      type: 'error'
    });
    
    // Intenta mostrar un mensaje de error visible en el DOM
    try {
      const errorContainer = document.createElement('div');
      errorContainer.style.position = 'fixed';
      errorContainer.style.top = '20px';
      errorContainer.style.left = '50%';
      errorContainer.style.transform = 'translateX(-50%)';
      errorContainer.style.padding = '15px';
      errorContainer.style.backgroundColor = '#f44336';
      errorContainer.style.color = 'white';
      errorContainer.style.borderRadius = '4px';
      errorContainer.style.zIndex = '9999';
      errorContainer.textContent = 'Error al iniciar la aplicación. Por favor, recarga la página.';
      document.body.appendChild(errorContainer);
    } catch (e) {
      // Si no se puede mostrar el mensaje de error, al menos intentamos que quede en la consola
    }
  }
});