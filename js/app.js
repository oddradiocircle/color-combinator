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
    
    // Cargar tema guardado
    this.loadSavedTheme();
    
    // Renderizar la estructura básica de la UI
    this.renderBaseUI();
    
    // Configurar eventos
    this.setupEventListeners();
    
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
                <button id="toggle-theme" class="button icon-only" title="Cambiar tema">
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
   * Carga el tema guardado del usuario
   */
  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem('colorCombinator.theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        this.theme = savedTheme;
        if (this.theme === 'dark') {
          document.body.classList.add('dark-theme');
        }
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Si el sistema usa tema oscuro, lo usamos por defecto
        this.theme = 'dark';
        document.body.classList.add('dark-theme');
      }
    } catch (error) {
      console.error('Error al cargar tema:', error);
      // Usar tema claro por defecto
      this.theme = 'light';
    }
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
    document.getElementById('toggle-theme').addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Eventos para importar/exportar
    document.getElementById('import-coolors').addEventListener('click', () => {
      this.importCoolorsUrl();
    });
    
    document.getElementById('export-coolors').addEventListener('click', () => {
      this.exportCoolorsUrl();
    });
    
    // Actualizar combinaciones al cambiar el texto
    document.getElementById('text-input').addEventListener('input', () => {
      this.updateCombinations();
    });
    
    // Validar URL de Coolors
    document.getElementById('coolors-url').addEventListener('input', (e) => {
      this.validateCoolorsUrl(e.target.value);
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
          <button class="icon-button edit-color" title="Editar color">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="icon-button remove-color" title="Eliminar color">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
        <div class="color-item-value">${color.hex}</div>
      `;
      
      // Añadir eventos
      colorElement.querySelector('.edit-color').addEventListener('click', () => {
        this.editColor(index);
      });
      
      colorElement.querySelector('.remove-color').addEventListener('click', () => {
        this.removeColor(index);
      });
      
      paletteElement.appendChild(colorElement);
    });
  }
  
  /**
   * Actualiza las combinaciones de colores
   */
  updateCombinations() {
    // Implementación básica - esta función crecerá mucho más
    const container = document.getElementById('combinations-container');
    const text = document.getElementById('text-input').value || 'Color Combinator';
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Si no hay suficientes colores, mostrar mensaje
    if (this.colors.length < 2) {
      container.innerHTML = '<div class="empty-state">Añade al menos dos colores para ver combinaciones</div>';
      return;
    }
    
    // Generar combinaciones para cada par de colores
    for (let i = 0; i < this.colors.length; i++) {
      for (let j = 0; j < this.colors.length; j++) {
        if (i !== j) {
          const bgColor = this.colors[i];
          const textColor = this.colors[j];
          
          this.createCombinationCard(container, bgColor, textColor, text);
        }
      }
    }
  }
  
  /**
   * Crea una tarjeta de combinación de colores
   */
  createCombinationCard(container, bgColor, textColor, content) {
    // Crear elemento de combinación
    const combination = document.createElement('div');
    combination.className = 'combination-card';
    combination.style.backgroundColor = bgColor.hex;
    
    // Calcular contraste
    const contrastRatio = this.calculateContrastRatio(bgColor.hex, textColor.hex);
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
    this.updateCombinations();
    this.urlService.updateURL(this.colors);
    
    // Guardar en localStorage
    this.saveColorsToStorage();
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
        this.updateCombinations();
        this.urlService.updateURL(this.colors);
        this.saveColorsToStorage();
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
    this.updateCombinations();
    this.urlService.updateURL(this.colors);
    this.saveColorsToStorage();
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
      this.updateCombinations();
      this.urlService.updateURL(this.colors);
      this.saveColorsToStorage();
      
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
    try {
      localStorage.setItem('colorCombinator.theme', this.theme);
    } catch (error) {
      console.error('Error al guardar tema:', error);
    }
  }
  
  /**
   * Guarda los colores actuales en localStorage
   */
  saveColorsToStorage() {
    try {
      // Convertir colores a formato serializable
      const serializableColors = this.colors.map(color => ({
        hex: color.hex,
        name: color.name || ''
      }));
      
      // Guardar en localStorage
      localStorage.setItem('colorCombinator.colors', JSON.stringify(serializableColors));
    } catch (error) {
      console.error('Error al guardar colores:', error);
    }
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
    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'warning') icon = 'warning';
    
    notification.innerHTML = `
      <div class="notification-icon">
        <span class="material-symbols-outlined">${icon}</span>
      </div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">
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
   * Registra mensajes de depuración
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[ColorCombinator]', ...args);
    }
  }
}