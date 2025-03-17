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
    this.theme = 'light';
    
    // Referencia al elemento DOM principal
    this.appElement = null;
    
    // Para debounce de operaciones costosas
    this.updateCombinationsDebounce = null;
    
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
    
    // Cargar tema guardado
    this.loadSavedTheme();
    
    // Cargar colores iniciales (desde URL o valores por defecto)
    this.loadInitialColors();
    
    this.log('Aplicación iniciada correctamente');
  }
  
  /**
   * Renderiza la estructura base de la interfaz de usuario
   */
  renderBaseUI() {
    // Estructura básica de la aplicación
    this.appElement.innerHTML = `
      <div class="container">
        <div id="sidebar" class="sidebar">
          <div class="sidebar-content">
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
                Opciones
              </h2>
              <div class="input-group">
                <label for="text-input">Texto de Prueba</label>
                <textarea id="text-input" placeholder="Ingresa texto para previsualizar">Color Combinator</textarea>
              </div>
              
              <div class="input-group">
                <label for="coolors-url">URL de Coolors</label>
                <input type="text" id="coolors-url" placeholder="https://coolors.co/ff5252-4caf50-2196f3">
                <button id="import-coolors" class="button secondary" disabled>
                  <span class="material-symbols-outlined">download</span> Importar
                </button>
              </div>
              
              <div class="actions">
                <button id="export-coolors" class="button outline">
                  <span class="material-symbols-outlined">link</span> Exportar URL
                </button>
                <button id="toggle-theme" class="button icon-only" aria-label="Cambiar tema">
                  <span id="theme-icon" class="material-symbols-outlined">dark_mode</span>
                </button>
              </div>
            </section>
          </div>
        </div>
        
        <div id="main-content" class="main-content">
          <div id="combinations-container" class="combinations-container"></div>
        </div>
      </div>
      
      <div id="color-edit-modal" class="modal">
        <!-- Modal para edición de colores (se implementará más adelante) -->
      </div>
      
      <div id="notifications" class="notifications"></div>
    `;
  }
  
  /**
   * Configura listeners de eventos para la aplicación
   */
  setupEventListeners() {
    // Evento para añadir nuevo color
    const addColorBtn = document.getElementById('add-color');
    if (addColorBtn) {
      addColorBtn.addEventListener('click', this.debounce(() => {
        this.addRandomColor();
      }, 300));
    }
    
    // Evento para cambiar de tema
    const themeToggleBtn = document.getElementById('toggle-theme');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', this.debounce(() => {
        this.toggleTheme();
      }, 200));
    }
    
    // Eventos para importar/exportar
    const importBtn = document.getElementById('import-coolors');
    if (importBtn) {
      importBtn.addEventListener('click', this.debounce(() => {
        this.importCoolorsUrl();
      }, 300));
    }
    
    const exportBtn = document.getElementById('export-coolors');
    if (exportBtn) {
      exportBtn.addEventListener('click', this.debounce(() => {
        this.exportCoolorsUrl();
      }, 300));
    }
    
    // Actualizar combinaciones al cambiar el texto (con debounce)
    const textInput = document.getElementById('text-input');
    if (textInput) {
      textInput.addEventListener('input', this.debounce(() => {
        this.updateCombinations();
      }, 300));
    }
    
    // Validar URL de Coolors
    const coolorsUrlInput = document.getElementById('coolors-url');
    if (coolorsUrlInput) {
      coolorsUrlInput.addEventListener('input', (e) => {
        this.validateCoolorsUrl(e.target.value);
      });
    }
    
    // Escuchar eventos de actualización de colores (desde URLService)
    window.addEventListener('colors-updated', (event) => {
      if (event.detail && Array.isArray(event.detail)) {
        this.colors = event.detail;
        this.renderColorPalette();
        this.debouncedUpdateCombinations();
      }
    });
  }
  
  /**
   * Carga el tema guardado o detecta preferencia del sistema
   */
  loadSavedTheme() {
    const savedTheme = localStorage.getItem('colorCombinator.theme');
    
    if (savedTheme) {
      this.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.theme = 'dark';
    }
    
    // Aplicar tema
    document.body.classList.toggle('dark-theme', this.theme === 'dark');
    
    // Actualizar icono
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.textContent = this.theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
  }
  
  /**
   * Carga los colores iniciales, ya sea desde la URL o valores por defecto
   */
  loadInitialColors() {
    // Si ya tenemos colores en la URL, URLService ya los habrá cargado
    if (this.urlService.currentColors.length > 0) {
      this.colors = this.urlService.currentColors;
    } else {
      // Cargar colores por defecto
      this.colors = this.config.defaultColors.map(hex => new Color(hex));
      
      // Actualizar URL
      this.urlService.updateURL(this.colors);
    }
    
    // Renderizar paleta y combinaciones
    this.renderColorPalette();
    this.updateCombinations();
  }
  
  /**
   * Renderiza la paleta de colores
   */
  renderColorPalette() {
    const paletteElement = document.getElementById('color-palette');
    if (!paletteElement) return;
    
    // Limpiar paleta actual
    paletteElement.innerHTML = '';
    
    // Renderizar cada color
    this.colors.forEach((color, index) => {
      const colorElement = document.createElement('div');
      colorElement.className = 'color-item';
      colorElement.dataset.index = index;
      colorElement.style.backgroundColor = color.hex;
      
      colorElement.innerHTML = `
        <div class="color-item-actions">
          <button class="icon-button edit-color" title="Editar color" aria-label="Editar color">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="icon-button remove-color" title="Eliminar color" aria-label="Eliminar color">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
        <div class="color-item-value">${color.hex}</div>
      `;
      
      // Añadir eventos (con delegación para mejor rendimiento)
      colorElement.addEventListener('click', (e) => {
        if (e.target.closest('.edit-color')) {
          this.editColor(index);
        } else if (e.target.closest('.remove-color')) {
          this.removeColor(index);
        }
      });
      
      paletteElement.appendChild(colorElement);
    });
  }
  
  /**
   * Actualiza las combinaciones de colores con debounce para rendimiento
   */
  debouncedUpdateCombinations() {
    if (this.updateCombinationsDebounce) {
      clearTimeout(this.updateCombinationsDebounce);
    }
    
    this.updateCombinationsDebounce = setTimeout(() => {
      this.updateCombinations();
    }, 100);
  }
  
  /**
   * Actualiza las combinaciones de colores
   */
  updateCombinations() {
    // Implementación básica - esta función crecerá mucho más
    const container = document.getElementById('combinations-container');
    const text = document.getElementById('text-input').value || 'Color Combinator';
    
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Si no hay suficientes colores, mostrar mensaje
    if (this.colors.length < 2) {
      container.innerHTML = '<div class="empty-state">Añade al menos dos colores para ver combinaciones</div>';
      return;
    }
    
    // Optimización: crear un fragmento para todas las tarjetas
    const fragment = document.createDocumentFragment();
    
    // Limitar número máximo de combinaciones para rendimiento
    const maxCombinations = 30;
    let combinationCount = 0;
    
    // Generar combinaciones para cada par de colores
    for (let i = 0; i < this.colors.length && combinationCount < maxCombinations; i++) {
      for (let j = 0; j < this.colors.length && combinationCount < maxCombinations; j++) {
        if (i !== j) {
          const bgColor = this.colors[i];
          const textColor = this.colors[j];
          
          this.createCombinationCard(fragment, bgColor, textColor, text);
          combinationCount++;
        }
      }
    }
    
    // Añadir todas las tarjetas de una vez
    container.appendChild(fragment);
  }
  
  /**
   * Crea una tarjeta de combinación de colores
   */
  createCombinationCard(container, bgColor, textColor, content) {
    // Crear elemento de combinación
    const combination = document.createElement('div');
    combination.className = 'combination-card';
    combination.style.backgroundColor = bgColor.hex;
    
    // Calcular contraste (optimización: usar el método de Color si está disponible)
    const contrastRatio = bgColor.contrastRatio 
      ? bgColor.contrastRatio(textColor)
      : this.calculateContrastRatio(bgColor.hex, textColor.hex);
      
    const isAANormal = contrastRatio >= 4.5;
    const isAAANormal = contrastRatio >= 7.0;
    
    combination.innerHTML = `
      <div class="combination-text" style="color: ${textColor.hex}">${content}</div>
      <div class="combination-info">
        <div class="color-codes">
          <span class="bg-color">BG: ${bgColor.hex}</span>
          <span class="text-color">Text: ${textColor.hex}</span>
        </div>
        <div class="contrast-info">
          <span class="contrast-ratio">Contraste: ${contrastRatio.toFixed(2)}:1</span>
          <div class="wcag-badges">
            <span class="wcag-badge ${isAANormal ? 'pass' : 'fail'}">AA</span>
            <span class="wcag-badge ${isAAANormal ? 'pass' : 'fail'}">AAA</span>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(combination);
  }
  
  /**
   * Calcula el ratio de contraste entre dos colores (WCAG 2.1)
   */
  calculateContrastRatio(color1, color2) {
    const getLuminance = (color) => {
      // Convertir hex a RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      // Calcular luminancia relativa
      const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
      
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };
    
    const L1 = getLuminance(color1);
    const L2 = getLuminance(color2);
    
    // Calcular ratio
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }
  
  /**
   * Añade un color aleatorio a la paleta
   */
  addRandomColor() {
    // Generar color aleatorio en HSL para mejor diversidad
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 30) + 70; // 70-100% saturación
    const l = Math.floor(Math.random() * 30) + 35; // 35-65% luminosidad
    
    // Convertir HSL a hex
    // (Implementación simplificada, en el futuro usar la clase Color)
    const newColor = this.hslToHex(h, s, l);
    
    // Añadir a la lista de colores
    this.colors.push(new Color(newColor));
    
    // Actualizar UI y URL
    this.renderColorPalette();
    this.debouncedUpdateCombinations();
    this.urlService.updateURL(this.colors);
  }
  
  /**
   * Edita un color existente
   */
  editColor(index) {
    // Versión simplificada para la primera fase
    // Reemplazar con editor completo en fases futuras
    const newValue = prompt('Ingresa un nuevo valor hexadecimal:', this.colors[index].hex);
    
    if (newValue) {
      try {
        this.colors[index] = new Color(newValue);
        this.renderColorPalette();
        this.debouncedUpdateCombinations();
        this.urlService.updateURL(this.colors);
      } catch(e) {
        this.showNotification('Error', 'Formato de color inválido', 'error');
      }
    }
  }
  
  /**
   * Elimina un color de la paleta
   */
  removeColor(index) {
    if (this.colors.length <= 2) {
      this.showNotification('No se puede eliminar', 'Se necesitan al menos dos colores', 'warning');
      return;
    }
    
    this.colors.splice(index, 1);
    this.renderColorPalette();
    this.debouncedUpdateCombinations();
    this.urlService.updateURL(this.colors);
  }
  
  /**
   * Importa colores desde una URL de Coolors
   */
  importCoolorsUrl() {
    const urlInput = document.getElementById('coolors-url');
    const url = urlInput.value.trim();
    
    if (!this.validateCoolorsUrl(url)) {
      this.showNotification('Error de importación', 'URL inválida', 'error');
      return;
    }
    
    try {
      // Extraer colores de la URL
      const urlSegments = url.split('/');
      const colorString = urlSegments[urlSegments.length - 1];
      
      // Limpiar posibles parámetros
      const cleanColorString = colorString.split('?')[0].split('#')[0];
      
      // Separar colores
      const colorCodes = cleanColorString.split('-');
      
      // Validar y convertir
      const newColors = [];
      
      for (const code of colorCodes) {
        if (code && code.length) {
          const hex = code.startsWith('#') ? code : `#${code}`;
          
          try {
            newColors.push(new Color(hex));
          } catch(e) {
            console.error('Color inválido:', code, e);
          }
        }
      }
      
      if (newColors.length === 0) {
        this.showNotification('Error', 'No se encontraron colores válidos', 'error');
        return;
      }
      
      // Actualizar paleta
      this.colors = newColors;
      this.renderColorPalette();
      this.debouncedUpdateCombinations();
      this.urlService.updateURL(this.colors);
      
      // Limpiar input y mostrar notificación
      urlInput.value = '';
      document.getElementById('import-coolors').disabled = true;
      
      this.showNotification(
        'Importación exitosa', 
        `Se importaron ${newColors.length} colores`,
        'success'
      );
      
    } catch(e) {
      console.error('Error al importar:', e);
      this.showNotification('Error', 'No se pudieron importar los colores', 'error');
    }
  }
  
  /**
   * Exporta la paleta actual como URL de Coolors
   */
  exportCoolorsUrl() {
    if (this.colors.length === 0) {
      this.showNotification('Error', 'No hay colores para exportar', 'error');
      return;
    }
    
    // Crear URL en formato Coolors
    const colorString = this.colors.map(c => c.hex.substring(1)).join('-');
    const url = `https://coolors.co/${colorString}`;
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(url)
      .then(() => {
        this.showNotification(
          'URL copiada', 
          'La URL de Coolors se ha copiado al portapapeles',
          'success'
        );
      })
      .catch(err => {
        // Mostrar la URL en caso de error
        this.showNotification('URL generada', url, 'info');
      });
  }
  
  /**
   * Valida el formato de una URL de Coolors
   */
  validateCoolorsUrl(url) {
    const isValid = url && 
      (url.includes('coolors.co/') || /^[0-9A-Fa-f#]+-[0-9A-Fa-f#]+/.test(url));
    
    // Actualizar estado del botón de importación
    const importButton = document.getElementById('import-coolors');
    if (importButton) {
      importButton.disabled = !isValid;
    }
    
    return isValid;
  }
  
  /**
   * Cambia entre tema claro y oscuro
   */
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    
    // Actualizar clase en el body
    document.body.classList.toggle('dark-theme', this.theme === 'dark');
    
    // Actualizar icono
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.textContent = this.theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
    
    // Guardar preferencia
    localStorage.setItem('colorCombinator.theme', this.theme);
  }
  
  /**
   * Muestra una notificación
   */
  showNotification(title, message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;
    
    const id = Date.now();
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.id = `notification-${id}`;
    
    // Seleccionar icono según tipo
    let icon;
    switch (type) {
      case 'success':
        icon = 'check_circle';
        break;
      case 'error':
        icon = 'error';
        break;
      case 'warning':
        icon = 'warning';
        break;
      default:
        icon = 'info';
        break;
    }
    
    notification.innerHTML = `
      <div class="notification-icon">
        <span class="material-symbols-outlined">${icon}</span>
      </div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" aria-label="Cerrar notificación">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;
    
    container.appendChild(notification);
    
    // Configurar botón de cierre
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.closeNotification(id);
    });
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
      this.closeNotification(id);
    }, 5000);
  }
  
  /**
   * Cierra una notificación
   */
  closeNotification(id) {
    const notification = document.getElementById(`notification-${id}`);
    if (notification) {
      notification.classList.add('closing');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }
  
  /**
   * Convierte HSL a Hex
   */
  hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c/2;
    
    let r, g, b;
    
    if (h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (h < 180) {
      [r, g, b] = [0, c, x];
    } else if (h < 240) {
      [r, g, b] = [0, x, c];
    } else if (h < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }
    
    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
    
    return `#${r}${g}${b}`;
  }
  
  /**
   * Función de debounce para limitar la frecuencia de llamadas a funciones
   */
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  /**
   * Registra mensajes de depuración
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[ColorCombinator]', ...args);
    }
  }
}