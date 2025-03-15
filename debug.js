// Script de diagnóstico para Color Combinator
console.log('🔍 Iniciando diagnóstico...');

// Verificar si las importaciones funcionan
try {
  import('./js/config.js')
    .then(module => {
      console.log('✅ Módulo config.js cargado correctamente');
      
      // Intentar cargar los demás módulos en secuencia
      return import('./js/core/event-bus.js');
    })
    .then(module => {
      console.log('✅ Módulo event-bus.js cargado correctamente');
      const { eventBus } = module;
      
      // Probar el event bus
      eventBus.on('test', data => console.log('Evento de prueba recibido:', data));
      eventBus.emit('test', { message: 'Esto funciona' });
      
      return import('./js/core/service-locator.js');
    })
    .then(module => {
      console.log('✅ Módulo service-locator.js cargado correctamente');
      return import('./js/core/component.js');
    })
    .then(module => {
      console.log('✅ Módulo component.js cargado correctamente');
      return import('./js/components/notification.js');
    })
    .then(module => {
      console.log('✅ Módulo notification.js cargado correctamente');
      return import('./js/components/color-picker.js');
    })
    .then(module => {
      console.log('✅ Módulo color-picker.js cargado correctamente');
      return import('./js/components/color-palette.js');
    })
    .then(module => {
      console.log('✅ Módulo color-palette.js cargado correctamente');
      return import('./js/utils/dom-utils.js');
    })
    .then(module => {
      console.log('✅ Módulo dom-utils.js cargado correctamente');
      return import('./js/utils/color-utils.js');
    })
    .then(module => {
      console.log('✅ Módulo color-utils.js cargado correctamente');
      
      // Verificamos elementos DOM críticos
      const colorInputs = document.getElementById('color-inputs');
      console.log('Elemento color-inputs:', colorInputs);
      
      // Intentamos cargar app.js
      return import('./js/app.js');
    })
    .then(module => {
      console.log('✅ Módulo app.js cargado correctamente');
    })
    .catch(error => {
      console.error('❌ Error al cargar módulos:', error);
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
    });
} catch (error) {
  console.error('❌ Error en el nivel superior:', error);
}

// Función para inicializar manualmente si todo falla
window.initApp = async function() {
  console.log('Iniciando manualmente...');
  
  try {
    const configModule = await import('./js/config.js');
    const eventBusModule = await import('./js/core/event-bus.js');
    const serviceLocatorModule = await import('./js/core/service-locator.js');
    
    const { config } = configModule;
    const { eventBus } = eventBusModule;
    const { serviceLocator } = serviceLocatorModule;
    
    // Cargar servicios
    const ThemeServiceModule = await import('./js/services/theme-service.js');
    const ExportServiceModule = await import('./js/services/export-service.js');
    const WcagServiceModule = await import('./js/services/wcag-service.js');
    const UrlServiceModule = await import('./js/services/url-service.js');
    
    serviceLocator.register('theme', new ThemeServiceModule.ThemeService());
    serviceLocator.register('export', new ExportServiceModule.ExportService());
    serviceLocator.register('wcag', new WcagServiceModule.WcagService());
    serviceLocator.register('url', new UrlServiceModule.UrlService());
    
    // Inicializar tema
    serviceLocator.get('theme').init();
    
    // Cargar modelos
    const PaletteModelModule = await import('./js/models/palette-model.js');
    const paletteModel = new PaletteModelModule.PaletteModel();
    
    // Cargar componentes
    const NotificationManagerModule = await import('./js/components/notification.js');
    const ColorPaletteModule = await import('./js/components/color-palette.js');
    
    // Crear componentes
    const notificationContainer = document.getElementById('notification-container') || 
      document.createElement('div');
    if (!notificationContainer.id) {
      notificationContainer.id = 'notification-container';
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
    }
    
    const notificationManager = new NotificationManagerModule.NotificationManager(notificationContainer);
    
    // Mostrar notificación de diagnóstico
    eventBus.emit('notification', {
      title: 'Diagnóstico',
      message: 'Inicialización manual ejecutada correctamente',
      type: 'info'
    });
    
    const colorInputs = document.getElementById('color-inputs');
    if (colorInputs) {
      const colorPalette = new ColorPaletteModule.ColorPalette(
        colorInputs,
        {
          allowRemove: true,
          minColors: config.ui.minColors,
          onColorsChange: (data) => {
            console.log('Cambio en paleta:', data);
            
            // Actualizar modelo según el tipo de cambio
            switch (data.type) {
              case 'add':
                // Ya está manejado por el componente
                break;
              case 'remove':
                paletteModel.removeColor(data.color.id);
                break;
              case 'update':
                paletteModel.updateColor(data.color.id, data.color.color);
                break;
            }
          }
        }
      );
      
      // Cargar colores iniciales
      const initialColors = config.initialColors.map(hex => ({ color: hex }));
      paletteModel.setColors(initialColors);
      colorPalette.setColors(paletteModel.getColors());
      
      console.log('✅ Componentes inicializados correctamente');
    } else {
      console.error('❌ No se encontró el elemento #color-inputs');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en la inicialización manual:', error);
    return false;
  }
};

// Verificar si hay errores de CORS
console.log('Verificando entorno de ejecución:');
console.log('- Location:', window.location.href);
console.log('- Protocol:', window.location.protocol);
console.log('- CORS compatible:', window.location.protocol !== 'file:');

// Comprobación de la estructura DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM completamente cargado');
  console.log('Elementos críticos:');
  console.log('- color-inputs:', document.getElementById('color-inputs'));
  console.log('- sidebar:', document.getElementById('sidebar'));
  console.log('- notification-container:', document.getElementById('notification-container'));
});