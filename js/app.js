import { ColorService } from './core/application/ColorService.js';
import { APIAdapter } from './core/infrastructure/APIAdapter.js';
import { URLService } from './services/url-service.js';

// Initialize core components
const apiAdapter = new APIAdapter();
const colorService = new ColorService(apiAdapter);
const urlService = new URLService();

// Handle color updates
window.addEventListener('colors-updated', (event) => {
  const colors = event.detail;
  // Update UI with new colors
  document.dispatchEvent(new CustomEvent('update-palette', {
    detail: colors
  }));
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  if (urlService.currentColors.length > 0) {
    document.dispatchEvent(new CustomEvent('update-palette', {
      detail: urlService.currentColors
    }));
  }
});