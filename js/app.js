import { ColorService } from './core/application/ColorService.js';
import { APIAdapter } from './core/infrastructure/APIAdapter.js';
import { URLService } from './services/url-service.js';
import { Color } from './core/domain/Color.js';

/**
 * Clase principal de la aplicación Color Combinator.
 * Coordina todos los servicios y componentes de la aplicación.
 */
export class App {
  /**
   * @param {Object} config - Configuración de la aplicación
   * @param {boolean} config.debug - Habilitar mensajes de depuración
   * @param {string[]} config.defaultColors - Lista de colores por defecto
   */
  constructor(config = {}) {
    this.config = {
      debug: false,
      defaultColors: ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'],
      ...config
    };
    
    // Inicializar servicios principales
    this.apiAdapter = new APIAdapter();
    this.colorService = new ColorService(this.apiAdapter);
    this.urlService = new URLService();
    
    // Estado de la aplicación
    this.colors = [];
    this.theme = this.loadThemePreference();
    
    // Referencia al elemento DOM principal
    this.appElement = null;
    
    this.log('App inicializada con configuración:', this.config);
  }
  
  /**
   * Inicializa la aplicación
   */
  init() {
    this.log('Iniciando aplicación...');
    
    // Obtener referencia al elemento principal
    this.appElement = document.getElementById('app');
    if (!this.appElement) {
      console.error('Error: No se encontró el elemento #app en el DOM');
      return;
    }
    
    // Renderizar la estructura básica de la UI
    this.renderBaseUI();
    
    // Configurar eventos
    this.setupEventListeners();
    
    // Cargar colores iniciales (desde URL o valores por defecto)
    this.loadInitialColors();
    
    // Aplicar tema
    this.applyTheme();
    
    this.log('Aplicación iniciada correctamente');
  }
  
  /**
   * Renderiza la estructura base de la interfaz de usuario
   */
  renderBaseUI() {
    // Estructura básica de la aplicación
    this.appElement.innerHTML = `
      <div class="container">
        <div id="sidebar-overlay"></div>
        
        <button id="mobile-menu-toggle" aria-label="Abrir menú">
            <span class="material-symbols-outlined">menu</span>
        </button>
        
        <div id="sidebar" class="sidebar">
          <div class="sidebar-content">
            <h1>Color Combinator</h1>
            <p class="version">v3.0</p>
            
            <section class="sidebar-section">
              <h2>
                <span class="material-symbols-outlined">palette</span>
                Paleta de Colores
              </h2>
              <div id="color-palette" class="color-palette"></div>
              <button id="add-color" class="button primary">
                <span class="material-symbols-outlined">add</span> Añadir Color
              </button>
            </section>
            
            <section class="sidebar-section">
              <h2>
                <span class="material-symbols-outlined">text_fields</span>
                Texto de Prueba
              </h2>
              <div class="input-group">
                <label for="text-input">Contenido HTML</label>
                <textarea id="text-input" placeholder="Ingresa texto para previsualizar">
                  <h1 class="poppins-bold">Color Combinator</h1>
                  <p class="poppins-regular">Explora combinaciones accesibles</p>
                </textarea>
              </div>
              
              <h2>
                <span class="material-symbols-outlined">ios_share</span>
                Importar/Exportar
              </h2>
              <div class="input-group">
                <label for="coolors-url">URL de Coolors</label>
                <input type="text" id="coolors-url" placeholder="https://coolors.co/ff5252-4caf50-2196f3">
                <button id="import-coolors" class="button secondary" disabled>
                  <span class="material-symbols-outlined">download</span> Importar
                </button>
              </div>
              
              <div class="actions">
                <button id="export-coolors" class="button outline">
                  <span class="material-symbols-outlined">link</span> Generar URL
                </button>
                <button id="export-clipboard" class="button outline">
                  <span class="material-symbols-outlined">content_copy</span> Copiar Paleta
                </button>
                <button id="undo-button" title="Deshacer último cambio" class="button icon-only" disabled>
                  <span class="material-symbols-outlined">undo</span>
                </button>
              </div>
            </section>
          </div>
        </div>
        
        <div id="main-content" class="main-content">
          <div id="combinations-container" class="combinations-container"></div>
        </div>
        
        <button id="theme-toggle" aria-label="Cambiar tema" class="button icon-only">
          <span class="material-symbols-outlined">dark_mode</span>
        </button>
      </div>
      
      <div id="color-edit-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Editar Color</h3>
            <button class="modal-close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="color-edit-preview">
            <div class="color-edit-bg">
              <span class="color-edit-label">Fondo</span>
              <span id="color-edit-preview-text">Color Combinator</span>
            </div>
            <div class="color-edit-text">
              <span class="color-edit-label">Texto</span>
              <span>Color Combinator</span>
            </div>
          </div>
          <div class="color-edit-controls">
            <label for="color-edit-picker">Color:</label>
            <input type="color" id="color-edit-picker" value="#000000">
            
            <div class="color-format-options">
              <div class="color-format-row">
                <button class="format-button active" data-format="hex">HEX</button>
                <button class="format-button" data-format="rgb">RGB</button>
                <button class="format-button" data-format="hsl">HSL</button>
              </div>
            </div>
            
            <input type="text" id="color-edit-value" value="#000000" readonly>
          </div>
          <div class="modal-actions">
            <button id="color-edit-save" class="button primary">
              <span class="material-symbols-outlined">check</span> Aplicar
            </button>
            <button id="color-edit-add" class="button success">
              <span class="material-symbols-outlined">add</span> Añadir a paleta
            </button>
            <button id="color-edit-cancel" class="button error">
              <span class="material-symbols-outlined">close</span> Cancelar
            </button>
          </div>
        </div>
      </div>
      
      <div id="notifications" class="notifications"></div>
      <div id="lightbox-overlay" class="lightbox-overlay"></div>
    `;
  }
  
  /**
   * Configura listeners de eventos para la aplicación
   */
  setupEventListeners() {
    // Evento para añadir nuevo color
    document.getElementById('add-color').addEventListener('click', () => {
      this.addRandomColor();
    });
    
    // Evento para cambiar de tema
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Eventos para importar/exportar
    document.getElementById('import-coolors').addEventListener('click', () => {
      this.importCoolorsUrl();
    });
    
    document.getElementById('export-coolors').addEventListener('click', () => {
      this.exportCoolorsUrl();
    });
    
    // Evento para copiar paleta al portapapeles
    document.getElementById('export-clipboard').addEventListener('click', () => {
      this.copyPaletteToClipboard();
    });
    
    // Actualizar combinaciones al cambiar el texto
    document.getElementById('text-input').addEventListener('input', () => {
      this.updateCombinations();
    });
    
    // Validar URL de Coolors
    document.getElementById('coolors-url').addEventListener('input', (e) => {
      this.validateCoolorsUrl(e.target.value);
    });
    
    // Móvil: toggle menu
    document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
      this.toggleMobileMenu();
    });
    
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
      this.closeMobileMenu();
    });
    
    // Modal de edición de color (eventos básicos)
    document.querySelector('.modal-close').addEventListener('click', () => {
      this.closeColorEditModal();
    });
    
    document.getElementById('color-edit-cancel').addEventListener('click', () => {
      this.closeColorEditModal();
    });
    
    // Escuchar eventos de actualización de colores (desde URLService)
    window.addEventListener('colors-updated', (event) => {
      if (event.detail && Array.isArray(event.detail)) {
        this.colors = event.detail;
        this.renderColorPalette();
        this.updateCombinations();
      }
    });
  }
