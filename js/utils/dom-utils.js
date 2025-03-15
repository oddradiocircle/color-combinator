/**
 * @fileoverview Utilidades para manipulación del DOM
 * @author Daniel Gómez (oddradiocircle)
 */

/**
 * Crea un elemento DOM con propiedades y atributos
 * @param {string} tag - Etiqueta HTML (div, span, button, etc)
 * @param {Object} options - Propiedades y atributos
 * @param {string} options.className - Clases CSS
 * @param {string} options.id - ID del elemento
 * @param {string} options.innerHTML - Contenido HTML
 * @param {string} options.textContent - Contenido de texto
 * @param {Object} options.attributes - Atributos HTML como objeto key-value
 * @param {Object} options.style - Estilos CSS como objeto key-value
 * @param {Object} options.events - Eventos como objeto {eventName: callback}
 * @param {Array} options.children - Array de nodos hijos
 * @returns {HTMLElement} Elemento creado
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  
  if (options.className) {
    element.className = options.className;
  }
  
  if (options.id) {
    element.id = options.id;
  }
  
  if (options.innerHTML !== undefined) {
    element.innerHTML = options.innerHTML;
  }
  
  if (options.textContent !== undefined) {
    element.textContent = options.textContent;
  }
  
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  if (options.style) {
    Object.entries(options.style).forEach(([key, value]) => {
      element.style[key] = value;
    });
  }
  
  if (options.events) {
    Object.entries(options.events).forEach(([event, callback]) => {
      element.addEventListener(event, callback);
    });
  }
  
  if (options.children) {
    options.children.forEach(child => {
      element.appendChild(child);
    });
  }
  
  return element;
}

/**
 * Elimina todos los hijos de un elemento
 * @param {HTMLElement} element - Elemento a limpiar
 */
export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Aplica una animación fade y retorna una promesa cuando finaliza
 * @param {HTMLElement} element - Elemento a animar
 * @param {string} type - 'in' o 'out'
 * @param {number} duration - Duración en ms
 * @param {Object} transform - Transformaciones CSS opcionales
 * @returns {Promise} Promesa que se resuelve cuando termina la animación
 */
export function fadeAnimation(element, type, duration = 300, transform = {}) {
  return new Promise(resolve => {
    // Configurar estado inicial
    element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    
    if (type === 'in') {
      element.style.opacity = '0';
      
      if (transform.initial) {
        element.style.transform = transform.initial;
      }
      
      // Pequeño timeout para asegurar que las propiedades iniciales se apliquen
      setTimeout(() => {
        element.style.opacity = '1';
        
        if (transform.final) {
          element.style.transform = transform.final;
        }
      }, 10);
    } else {
      element.style.opacity = '1';
      
      if (transform.initial) {
        element.style.transform = transform.initial;
      }
      
      // Aplicar fade out
      element.style.opacity = '0';
      
      if (transform.final) {
        element.style.transform = transform.final;
      }
    }
    
    // Resolver promesa cuando termina la transición
    setTimeout(resolve, duration + 50);
  });
}