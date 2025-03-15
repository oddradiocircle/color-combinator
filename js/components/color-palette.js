/**
 * @fileoverview Componente para gestionar la paleta de colores
 * @author Daniel Gómez (oddradiocircle)
 */

import { Component } from '../core/component.js';
import { ColorPicker } from './color-picker.js';
import { createElement, clearElement } from '../utils/dom-utils.js';
import { config } from '../config.js';

export class ColorPalette extends Component {
  constructor(container, options = {}) {
    super(container, 'color-palette');
    
    this.options = {
      colors: options.colors || [],
      allowRemove: options.allowRemove !== false,
      minColors: options.minColors || config.ui.minColors,
      ...options
    };
    
    this.colorPickers = [];
    
    this.render();
    this.bindEvents();
  }
  
  render() {
    clearElement(this.container);
    
    // Primero mostramos los selectores de color existentes
    this.options.colors.forEach(color => {
      this._addColorPickerElement(color);
    });
    
    // Luego añadimos el botón para agregar color
    const addButton = createElement('button', {
      id: 'add-color',
      className: 'full-width',
      innerHTML: `
        <span class="material-symbols-outlined">add</span>
        Agregar Color
      `
    });
    
    this.container.appendChild(addButton);
  }
  
  bindEvents() {
    // Botón para agregar color
    const addButton = this.container.querySelector('#add-color');
    addButton.addEventListener('click', this._handleAddColor.bind(this));
    
    // Escuchar eventos globales
    this.subscribe('color:change', this._handleColorChanged.bind(this));
    this.subscribe('color:remove', this._handleColorRemoved.bind(this));
    this.subscribe('color:format:change', this._handleFormatChanged.bind(this));
  }
  
  _addColorPickerElement(colorData) {
    // Crear contenedor para el color
    const colorContainer = createElement('div', {
      className: 'color-container'
    });
    
    // Determinar si se puede eliminar
    const canRemove = this.options.allowRemove && 
                     this.colorPickers.length >= this.options.minColors;
    
    // Crear color picker
    const colorPicker = new ColorPicker(colorContainer, {
      color: colorData.color,
      id: colorData.id,
      alpha: colorData.alpha || 0,
      format: colorData.format || 'hex',
      showRemoveButton: canRemove
    });
    
    // Añadir a la lista de pickers
    this.colorPickers.push(colorPicker);
    
    // Añadir al DOM antes del botón de agregar
    const addButton = this.container.querySelector('#add-color');
    this.container.insertBefore(colorContainer, addButton);
    
    return colorPicker;
  }
  
  _handleAddColor() {
    // Crear ID único para el color
    const colorId = `color-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Añadir el nuevo color
    const newColor = {
      id: colorId,
      color: null, // Generará un color aleatorio
      alpha: 0,
      format: 'hex'
    };
    
    const picker = this._addColorPickerElement(newColor);
    
    // Notificar cambio
    this._notifyColorsChanged('add', picker.getColorData());
  }
  
  _handleColorChanged(data) {
    // Buscar el picker correspondiente
    const pickerIndex = this.colorPickers.findIndex(p => p.options.id === data.id);
    if (pickerIndex === -1) return;
    
    // Actualizar datos del color
    this.colorPickers[pickerIndex].options.color = data.color;
    
    // Notificar cambio
    this._notifyColorsChanged('update', data);
  }
  
  _handleColorRemoved(data) {
    // No permitir eliminar si quedan pocos colores
    if (this.colorPickers.length <= this.options.minColors) {
      this.emit('notification', {
        title: 'No se puede eliminar',
        message: `Debes tener al menos ${this.options.minColors} colores`,
        type: 'error'
      });
      return;
    }
    
    // Buscar el picker
    const pickerIndex = this.colorPickers.findIndex(p => p.options.id === data.id);
    if (pickerIndex === -1) return;
    
    // Guardar datos para la notificación
    const colorData = this.colorPickers[pickerIndex].getColorData();
    
    // Eliminar el picker
    this.colorPickers[pickerIndex].destroy();
    const container = this.container.querySelector(`.color-container:nth-child(${pickerIndex + 1})`);
    
    // Animar salida
    container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    
    // Eliminar del DOM después de la animación
    setTimeout(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
      
      // Eliminar de la lista de pickers
      this.colorPickers.splice(pickerIndex, 1);
      
      // Notificar cambio
      this._notifyColorsChanged('remove', colorData);
      
      // Actualizar botones de eliminar
      this._updateRemoveButtons();
    }, 300);
  }
  
  _handleFormatChanged(data) {
    // Buscar el picker correspondiente
    const pickerIndex = this.colorPickers.findIndex(p => p.options.id === data.id);
    if (pickerIndex === -1) return;
    
    // Actualizar formato
    this.colorPickers[pickerIndex].options.format = data.format;
  }
  
  _updateRemoveButtons() {
    const canRemove = this.options.allowRemove && 
                    this.colorPickers.length > this.options.minColors;
    
    // Actualizar visibilidad de botones de eliminar
    this.colorPickers.forEach(picker => {
      const container = picker.container.closest('.color-container');
      const removeButton = container.querySelector('.remove-color');
      
      if (removeButton) {
        if (!canRemove) {
          removeButton.style.display = 'none';
        } else {
          removeButton.style.display = '';
        }
      }
    });
  }
  
  _notifyColorsChanged(action, colorData) {
    // Emitir evento con todos los datos
    this.emit('palette:change', {
      type: action,
      color: colorData,
      palette: this.getColors()
    });
    
    // Si hay callback, llamarlo
    if (typeof this.options.onColorsChange === 'function') {
      this.options.onColorsChange({
        type: action,
        color: colorData,
        palette: this.getColors()
      });
    }
  }
  
  getColors() {
    return this.colorPickers.map(picker => picker.getColorData());
  }
  
  setColors(colors) {
    if (!Array.isArray(colors) || colors.length < this.options.minColors) {
      return false;
    }
    
    // Destruir pickers actuales
    this.colorPickers.forEach(picker => picker.destroy());
    this.colorPickers = [];
    
    // Limpiar contenedor (excepto el botón de agregar)
    const addButton = this.container.querySelector('#add-color');
    clearElement(this.container);
    this.container.appendChild(addButton);
    
    // Añadir nuevos colores
    colors.forEach(color => {
      this._addColorPickerElement(color);
    });
    
    // Notificar cambio
    this.emit('palette:updated', this.getColors());
    
    return true;
  }
}