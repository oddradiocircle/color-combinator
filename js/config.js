/**
 * @fileoverview Configuración centralizada para Color Combinator
 * @author Daniel Gómez (oddradiocircle)
 */

export const config = {
  // Colores iniciales predeterminados
  initialColors: [
    '#FF5252',  // Rojo
    '#4CAF50',  // Verde
    '#2196F3',  // Azul
    '#FFC107',  // Amarillo
    '#9C27B0'   // Púrpura
  ],
  
  // Estándares WCAG
  wcag: {
    AA_NORMAL_TEXT: 4.5,
    AA_LARGE_TEXT: 3.0,
    AAA_NORMAL_TEXT: 7.0,
    AAA_LARGE_TEXT: 4.5
  },
  
  // Configuración de UI
  ui: {
    notificationDuration: 5000,
    maxHistorySteps: 20,
    minColors: 2
  },
  
  // Almacenamiento local
  storage: {
    keys: {
      colors: 'colorCombinator.colors',
      theme: 'colorCombinator.theme',
      previewText: 'colorCombinator.previewText',
      formats: 'colorCombinator.colorFormats',
      lightBgColor: 'colorCombinator.lightBgColor',
      darkBgColor: 'colorCombinator.darkBgColor'
    }
  },
  
  // URLs de servicios externos
  services: {
    coolorsBaseUrl: 'https://coolors.co/'
  }
};