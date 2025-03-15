/**
 * @fileoverview Versión corregida del punto de entrada principal de la aplicación Color Combinator
 * @author Daniel Gómez (oddradiocircle)
 */

// Importaciones básicas
import { config } from './config.js';
import { serviceLocator } from './core/service-locator.js';
import { eventBus } from './core/event-bus.js';

// Servicios - importaciones con manejo de errores
let ThemeService, ExportService, WcagService, UrlService;
try {
  const ThemeServiceModule = await import('./services/theme-service.js');
  const ExportServiceModule = await import('./services/export-service.js');
  const WcagServiceModule = await import('./services/wcag-service.js');
  const UrlServiceModule = await import('./services/url-service.js');
  
  ThemeService = ThemeServiceModule.ThemeService;
  ExportService = ExportServiceModule.ExportService;
  WcagService = WcagServiceModule.WcagService;
  UrlService = UrlServiceModule.UrlService;
} catch (error) {
  console.error('Error al cargar servicios:', error);
}

// Modelos
let PaletteModel;
try {
  const PaletteModelModule = await import('./models/palette-model.js');
  PaletteModel = PaletteModelModule.PaletteModel;
} catch (error) {
  console.error('Error al cargar modelos:', error);
}

// Componentes
let NotificationManager, ColorPalette;
try {
  const NotificationManagerModule = await import('./components/notification.js');
  const ColorPaletteModule = await import('./components/color-palette.js');
  
  NotificationManager = NotificationManagerModule.NotificationManager;
  ColorPalette = ColorPaletteModule.ColorPalette;
} catch (error) {
  console.error('Error al cargar componentes:', error);
}

/**
 * Aplicación principal Color Combinator con importaciones asincrónicas
 */
class ColorCombinatorApp {
  constructor() {
    // Comprobar que todos los módulos se cargaron correctamente
    if (!ThemeService || !ExportService || !WcagService || !UrlService || 
        !PaletteModel || !NotificationManager || !ColorPalette) {
      console.error('No se pudieron cargar todos los módulos necesarios');
      this.showErrorNotification('Error de carga', 'No se pudieron cargar todos los módulos. Por favor, recarga la página.');
      return;
    }
    
    console.log('Todos los módulos cargados correctamente, iniciando aplicación...');
    
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
    try {
      // Inicializar tema
      serviceLocator.get('theme').init();
      
      // Cargar datos iniciales (desde URL o localStorage)
      this._loadInitialData();
      
      // Configurar elementos UI
      this._setupUIElements();
      
      // Mostrar notificación de inicio exitoso
      this.showSuccessNotification('Color Combinator', 'Aplicación inicializada correctamente (Versión modular)');
      
      return true;
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
      this.showErrorNotification('Error de inicialización', 'No se pudo inicializar la aplicación. Consulta la consola para más detalles.');
      return false;
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
      this.showErrorNotification('Error de servicios', 'No se pudieron inicializar los servicios.');
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
      this.showErrorNotification('Error de modelos', 'No se pudieron inicializar los modelos de datos.');
    }
  }
  
  /**
   * Inicializa los componentes de UI
   * @private
   */
  _initComponents() {
    try {
      // Gestor de notificaciones
      this.notificationManager = new NotificationManager(
        document.getElementById('notification-container') || 
        this._createNotificationContainer()
      );
      
      // Componente de paleta
      const colorInputs = document.getElementById('color-inputs');
      if (!colorInputs) {
        throw new Error('No se encontró el elemento #color-inputs');
      }
      
      this.colorPalette = new ColorPalette(
        colorInputs,
        {
          allowRemove: true,
          minColors: config.ui.minColors,
          onColorsChange: this._handlePaletteChange.bind(this)
        }
      );
    } catch (error) {
      console.error('Error al inicializar componentes:', error);
      this.showErrorNotification('Error de componentes', 'No se pudieron inicializar los componentes de UI.');
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
      console.error('Error al manejar cambio de paleta:', error);
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
      console.error('Error al manejar cambio de texto:', error);
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
      console.error('Error al abrir/cerrar menú móvil:', error);
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
      console.error('Error al editar color:', error);
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
    console.log('Loading Color Combinator (Modular Version - FIX)');
    
    const app = new ColorCombinatorApp();
    app.init();
  } catch (error) {
    console.error('Error crítico al iniciar la aplicación:', error);
    
    // Notificación de error
    eventBus.emit('notification', {
      title: 'Error crítico',
      message: 'No se pudo iniciar la aplicación. Por favor, recarga la página.',
      type: 'error'
    });
  }
});

// Exportar la clase para poder usarla desde el debug
export { ColorCombinatorApp };