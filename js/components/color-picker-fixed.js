/**
 * @fileoverview Componente para seleccionar colores individuales (versión corregida)
 * @author Daniel Gómez (oddradiocircle)
 */

import { Component } from '../core/component.js';
import { formatColor, generateRandomColor } from '../utils/color-utils-fixed.js';
import { createElement } from '../utils/dom-utils.js';

export class ColorPicker extends Component {
  constructor(container, options = {}) {
    super(container, 'color-picker');
    
    // Validaciones para evitar errores
    if (!options) options = {};
    
    try {
      this.options = {
        color: options.color || generateRandomColor(),
        id: options.id || `color-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        alpha: options.alpha || 0,
        format: options.format || 'hex',
        showRemoveButton: options.showRemoveButton !== false,
        ...options
      };
      
      // Verificación adicional para asegurar que el color no sea null o undefined
      if (!this.options.color) {
        console.warn('Color en ColorPicker es inválido, usando valor predeterminado');
        this.options.color = '#FF5252';
      }
      
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Error al inicializar ColorPicker:', error);
      // Crear un mensaje de error visible
      this.container.innerHTML = '<div style="color: red;">Error al cargar componente</div>';
    }
  }
  
  render() {
    try {
      // Limpiar contenedor
      this.container.innerHTML = '';
      
      // Crear elementos del color picker
      const colorInput = createElement('div', {
        className: 'color-input',
        attributes: {
          'data-color-id': this.options.id
        }
      });
      
      // Color picker y contenedor
      const pickerContainer = createElement('div', {
        className: 'color-picker-container'
      });
      
      const colorPicker = createElement('input', {
        attributes: {
          type: 'color',
          value: this.options.color,
          'data-color-id': this.options.id
        }
      });
      
      pickerContainer.appendChild(colorPicker);
      
      // Valor del color y botón copiar
      const colorDetails = createElement('div', {
        className: 'color-details'
      });
      
      const valueContainer = createElement('div', {
        className: 'color-value'
      });
      
      // Usamos formatColor con validación
      let formattedColor;
      try {
        formattedColor = formatColor(this.options.color, this.options.format, this.options.alpha);
      } catch (error) {
        console.warn('Error al formatear color, usando hex:', error);
        formattedColor = this.options.color || '#000000';
      }
      
      const textInput = createElement('input', {
        attributes: {
          type: 'text',
          value: formattedColor,
          readonly: 'readonly'
        }
      });
      
      const copyButton = createElement('button', {
        className: 'copy-button',
        innerHTML: '<span class="material-symbols-outlined">content_copy</span>',
        attributes: {
          title: 'Copiar valor'
        }
      });
      
      valueContainer.appendChild(textInput);
      valueContainer.appendChild(copyButton);
      
      // Opciones de formato
      const formatOptions = createElement('div', {
        className: 'color-format-options'
      });
      
      const formatRow = createElement('div', {
        className: 'color-format-row'
      });
      
      const formats = ['hex', 'rgb', 'hsl'];
      formats.forEach(format => {
        const button = createElement('button', {
          className: `format-button ${format === this.options.format ? 'active' : ''}`,
          textContent: format.toUpperCase(),
          attributes: {
            'data-format': format,
            'data-color-id': this.options.id
          }
        });
        
        formatRow.appendChild(button);
      });
      
      formatOptions.appendChild(formatRow);
      
      // Acciones (copiar, eliminar)
      const actionsContainer = createElement('div', {
        className: 'color-actions'
      });
      
      const copyColorButton = createElement('button', {
        className: 'icon-only copy-color',
        innerHTML: '<span class="material-symbols-outlined">content_copy</span>',
        attributes: {
          title: 'Copiar color'
        }
      });
      
      actionsContainer.appendChild(copyColorButton);
      
      if (this.options.showRemoveButton) {
        const removeButton = createElement('button', {
          className: 'icon-only remove-color',
          innerHTML: '<span class="material-symbols-outlined">delete</span>',
          attributes: {
            title: 'Eliminar color'
          }
        });
        
        actionsContainer.appendChild(removeButton);
      }
      
      // Ensamblar todo
      colorDetails.appendChild(valueContainer);
      colorDetails.appendChild(formatOptions);
      
      colorInput.appendChild(pickerContainer);
      colorInput.appendChild(colorDetails);
      colorInput.appendChild(actionsContainer);
      
      this.container.appendChild(colorInput);
      
      // Animar entrada
      colorInput.style.opacity = '0';
      colorInput.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        colorInput.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        colorInput.style.opacity = '1';
        colorInput.style.transform = 'translateY(0)';
      }, 10);
    } catch (error) {
      console.error('Error al renderizar ColorPicker:', error);
      this.container.innerHTML = '<div style="color: red;">Error al renderizar</div>';
    }
  }
  
  bindEvents() {
    try {
      const colorPicker = this.container.querySelector('input[type="color"]');
      if (colorPicker) {
        colorPicker.addEventListener('input', this._handleColorChange.bind(this));
      }
      
      const copyButton = this.container.querySelector('.copy-button');
      if (copyButton) {
        copyButton.addEventListener('click', this._handleCopyValue.bind(this));
      }
      
      const copyColorButton = this.container.querySelector('.copy-color');
      if (copyColorButton) {
        copyColorButton.addEventListener('click', this._handleCopyValue.bind(this));
      }
      
      const removeButton = this.container.querySelector('.remove-color');
      if (removeButton) {
        removeButton.addEventListener('click', this._handleRemove.bind(this));
      }
      
      const formatButtons = this.container.querySelectorAll('.format-button');
      formatButtons.forEach(button => {
        button.addEventListener('click', this._handleFormatChange.bind(this));
      });
    } catch (error) {
      console.error('Error al asignar eventos en ColorPicker:', error);
    }
  }
  
  _handleColorChange(event) {
    try {
      this.options.color = event.target.value;
      
      // Actualizar visualización
      const textInput = this.container.querySelector('input[type="text"]');
      if (textInput) {
        textInput.value = formatColor(this.options.color, this.options.format, this.options.alpha);
      }
      
      // Emitir evento de cambio
      this.emit('color:change', {
        id: this.options.id,
        color: this.options.color,
        alpha: this.options.alpha,
        format: this.options.format
      });
    } catch (error) {
      console.error('Error al cambiar color:', error);
    }
  }
  
  _handleCopyValue(event) {
    try {
      const textInput = this.container.querySelector('input[type="text"]');
      if (!textInput) return;
      
      navigator.clipboard.writeText(textInput.value).then(() => {
        this.emit('notification', {
          title: 'Copiado al portapapeles',
          message: `Valor ${textInput.value} copiado`,
          type: 'success'
        });
      }).catch(err => {
        this.emit('notification', {
          title: 'Error al copiar',
          message: 'No se pudo copiar el valor',
          type: 'error'
        });
      });
    } catch (error) {
      console.error('Error al copiar valor:', error);
    }
  }
  
  _handleFormatChange(event) {
    try {
      const button = event.target.closest('.format-button');
      if (!button) return;
      
      this.options.format = button.dataset.format;
      
      // Actualizar botones
      this.container.querySelectorAll('.format-button').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      
      // Actualizar valor mostrado
      const textInput = this.container.querySelector('input[type="text"]');
      if (textInput) {
        textInput.value = formatColor(this.options.color, this.options.format, this.options.alpha);
      }
      
      // Emitir evento
      this.emit('color:format:change', {
        id: this.options.id,
        format: this.options.format
      });
    } catch (error) {
      console.error('Error al cambiar formato:', error);
    }
  }
  
  _handleRemove(event) {
    try {
      // Emitir evento de eliminación
      this.emit('color:remove', {
        id: this.options.id
      });
    } catch (error) {
      console.error('Error al eliminar color:', error);
    }
  }
  
  updateColor(color) {
    try {
      if (!color) {
        console.warn('updateColor recibió un color inválido');
        return;
      }
      
      this.options.color = color;
      
      // Actualizar picker
      const colorPicker = this.container.querySelector('input[type="color"]');
      if (colorPicker) {
        colorPicker.value = color;
      }
      
      // Actualizar texto
      const textInput = this.container.querySelector('input[type="text"]');
      if (textInput) {
        textInput.value = formatColor(color, this.options.format, this.options.alpha);
      }
    } catch (error) {
      console.error('Error al actualizar color:', error);
    }
  }
  
  getColorData() {
    return {
      id: this.options.id,
      color: this.options.color || '#000000',
      alpha: this.options.alpha || 0,
      format: this.options.format || 'hex'
    };
  }
}