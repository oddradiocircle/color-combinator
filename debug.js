// Script de diagnóstico para Color Combinator
console.log('🔍 Iniciando diagnóstico...');

// Verificar el entorno de ejecución
console.log('Verificando entorno de ejecución:');
console.log('- Location:', window.location.href);
console.log('- Protocol:', window.location.protocol);
console.log('- CORS compatible:', window.location.protocol !== 'file:');

// Función para inicializar manualmente la aplicación con los componentes corregidos
window.initApp = async function() {
  console.log('🚀 Iniciando aplicación manualmente con componentes corregidos...');
  
  try {
    // Importar versiones corregidas
    const ConfigModule = await import('./js/config.js');
    const EventBusModule = await import('./js/core/event-bus.js');
    const ServiceLocatorModule = await import('./js/core/service-locator.js');
    const ComponentModule = await import('./js/core/component.js');
    const ColorUtilsModule = await import('./js/utils/color-utils-fixed.js');
    const DomUtilsModule = await import('./js/utils/dom-utils.js');
    const StorageUtilsModule = await import('./js/utils/storage-utils.js');
    
    // Importar versiones corregidas de componentes
    const NotificationModule = await import('./js/components/notification.js');
    const ColorPickerModule = await import('./js/components/color-picker-fixed.js');
    
    // Importar servicios
    const ThemeServiceModule = await import('./js/services/theme-service.js');
    const ExportServiceModule = await import('./js/services/export-service.js');
    const WcagServiceModule = await import('./js/services/wcag-service.js');
    const UrlServiceModule = await import('./js/services/url-service.js');
    
    // Importar modelos
    const PaletteModelModule = await import('./js/models/palette-model.js');
    
    const { config } = ConfigModule;
    const { eventBus } = EventBusModule;
    const { serviceLocator } = ServiceLocatorModule;
    const { ColorPicker } = ColorPickerModule;
    const { NotificationManager } = NotificationModule;
    
    // Crear panel de notificaciones
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notification-container';
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
    }
    
    const notificationManager = new NotificationManager(notificationContainer);
    
    // Crear servicios
    serviceLocator.register('theme', new ThemeServiceModule.ThemeService());
    serviceLocator.register('export', new ExportServiceModule.ExportService());
    serviceLocator.register('wcag', new WcagServiceModule.WcagService());
    serviceLocator.register('url', new UrlServiceModule.UrlService());
    
    // Aplicar tema
    serviceLocator.get('theme').init();
    
    // Generar colores de ejemplo
    const generateRandomColor = ColorUtilsModule.generateRandomColor;
    
    // Crear modelo de paleta
    const paletteModel = new PaletteModelModule.PaletteModel();
    
    // Añadir colores de ejemplo
    const colors = [
      {color: '#FF5252', id: 'color-1'},
      {color: '#4CAF50', id: 'color-2'},
      {color: '#2196F3', id: 'color-3'},
      {color: '#FFC107', id: 'color-4'}
    ];
    
    // Eliminar elementos viejos
    const colorInputsContainer = document.getElementById('color-inputs');
    if (colorInputsContainer) {
      // Limpiar el contenedor
      colorInputsContainer.innerHTML = '';
      
      // Crear nuevos color pickers con la versión corregida
      colors.forEach(colorData => {
        const colorContainer = document.createElement('div');
        colorContainer.className = 'color-container';
        colorInputsContainer.appendChild(colorContainer);
        
        const colorPicker = new ColorPicker(colorContainer, colorData);
      });
      
      // Añadir botón de agregar color
      const addButton = document.createElement('button');
      addButton.id = 'add-color';
      addButton.className = 'full-width';
      addButton.innerHTML = `
        <span class="material-symbols-outlined">add</span>
        Agregar Color
      `;
      
      addButton.addEventListener('click', () => {
        const colorContainer = document.createElement('div');
        colorContainer.className = 'color-container';
        colorInputsContainer.insertBefore(colorContainer, addButton);
        
        const colorPicker = new ColorPicker(colorContainer, {
          color: generateRandomColor(),
          id: `color-${Date.now()}`
        });
      });
      
      colorInputsContainer.appendChild(addButton);
    }
    
    // Notificar éxito
    eventBus.emit('notification', {
      title: 'Inicialización manual',
      message: 'La aplicación se ha inicializado correctamente con componentes corregidos',
      type: 'success'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error en la inicialización manual:', error);
    console.error('Detalles del error:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
};

// Verificar si hay errores específicos cargando los módulos básicos
try {
  import('./js/config.js')
    .then(module => {
      console.log('✅ Módulo config.js cargado correctamente');
      
      // Intentar cargar los demás módulos core en secuencia
      return import('./js/core/event-bus.js');
    })
    .then(module => {
      console.log('✅ Módulo event-bus.js cargado correctamente');
      return import('./js/core/service-locator.js');
    })
    .then(module => {
      console.log('✅ Módulo service-locator.js cargado correctamente');
      return import('./js/core/component.js');
    })
    .then(module => {
      console.log('✅ Módulo component.js cargado correctamente');
      
      // Verificar utils
      return import('./js/utils/dom-utils.js');
    })
    .then(module => {
      console.log('✅ Módulo dom-utils.js cargado correctamente');
      return import('./js/utils/color-utils.js');
    })
    .then(module => {
      console.log('✅ Módulo color-utils.js cargado correctamente');
      
      // Verificar la versión corregida
      return import('./js/utils/color-utils-fixed.js');
    })
    .then(module => {
      console.log('✅ Módulo color-utils-fixed.js cargado correctamente');
      
      // Verificar componentes
      return import('./js/components/notification.js');
    })
    .then(module => {
      console.log('✅ Módulo notification.js cargado correctamente');
      
      // Verificamos elementos DOM críticos
      const colorInputs = document.getElementById('color-inputs');
      console.log('Elemento color-inputs:', colorInputs ? '✅ Encontrado' : '❌ No encontrado');
      const sidebar = document.getElementById('sidebar');
      console.log('Elemento sidebar:', sidebar ? '✅ Encontrado' : '❌ No encontrado');
      
      console.log('Diagnóstico básico completado. Si la aplicación no funciona, usa el botón "Inicializar manualmente".');
    })
    .catch(error => {
      console.error('❌ Error al cargar módulos:', error);
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
      console.log('Recomendación: Usa el botón "Inicializar manualmente" para intentar cargar la versión corregida.');
    });
} catch (error) {
  console.error('❌ Error en el nivel superior:', error);
}

// Comprobación de la estructura DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM completamente cargado');
  console.log('Elementos críticos:');
  console.log('- color-inputs:', document.getElementById('color-inputs') ? '✅ OK' : '❌ No encontrado');
  console.log('- sidebar:', document.getElementById('sidebar') ? '✅ OK' : '❌ No encontrado');
  console.log('- notification-container:', document.getElementById('notification-container') ? '✅ OK' : '❌ No encontrado');
  console.log('- main:', document.getElementById('main') ? '✅ OK' : '❌ No encontrado');
});