// Script de diagnóstico para Color Combinator
console.log('🔍 Iniciando diagnóstico...');

// Verificar el entorno de ejecución
console.log('Verificando entorno de ejecución:');
console.log('- Location:', window.location.href);
console.log('- Protocol:', window.location.protocol);
console.log('- CORS compatible:', window.location.protocol !== 'file:');

// Función para inicializar manualmente la aplicación usando la versión corregida
window.initApp = async function() {
  console.log('🚀 Iniciando aplicación manualmente con app-fix.js...');
  
  try {
    // Intentar cargar la versión corregida de la aplicación
    const AppFixModule = await import('./js/app-fix.js');
    const { ColorCombinatorApp } = AppFixModule;
    
    if (!ColorCombinatorApp) {
      console.error('❌ No se pudo cargar la clase ColorCombinatorApp');
      return false;
    }
    
    // Crear e inicializar la aplicación
    const app = new ColorCombinatorApp();
    const initResult = app.init();
    
    console.log('✅ Aplicación inicializada correctamente');
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