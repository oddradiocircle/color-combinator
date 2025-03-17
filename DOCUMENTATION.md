# Documentación Completa del Proyecto Color Combinator

## Índice
1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Estado Actual](#2-estado-actual)
3. [Arquitectura Objetivo](#3-arquitectura-objetivo)
4. [Plan de Migración](#4-plan-de-migración)
5. [Guía Técnica](#5-guía-técnica)
6. [Funcionalidades Principales](#6-funcionalidades-principales)
7. [Flujos de Usuario](#7-flujos-de-usuario)
8. [API y Servicios](#8-api-y-servicios)
9. [Consideraciones de Seguridad](#9-consideraciones-de-seguridad)
10. [Roadmap Futuro](#10-roadmap-futuro)

## 1. Visión General del Proyecto

**Color Combinator** es una aplicación web que permite a diseñadores y desarrolladores crear, explorar y validar combinaciones de colores para garantizar la accesibilidad según los estándares WCAG. La aplicación proporciona herramientas para generar paletas de colores, comprobar ratios de contraste y compartir combinaciones mediante URLs.

**Objetivos principales:**
- Facilitar la creación de diseños web accesibles
- Proporcionar validación WCAG en tiempo real
- Permitir compartir paletas de colores fácilmente
- Ofrecer funciones avanzadas de edición de color

## 2. Estado Actual

El proyecto está en proceso de migración de una arquitectura monolítica a una arquitectura modular:

### Versión Original (Monolítica)
- Ubicada en el directorio `archives/`
- Funcional y completa
- Un único archivo JS principal (`app.js`, ~53KB)
- Sin separación clara de responsabilidades
- Difícil de mantener y expandir

### Versión Modularizada (En Desarrollo)
- Branch `coolors-url-feature`
- Estructura arquitectónica definida
- Componentes básicos implementados
- No funcional todavía
- Falta la migración de funcionalidades clave

## 3. Arquitectura Objetivo

La aplicación sigue una arquitectura modular inspirada en los principios de Clean Architecture/Arquitectura Hexagonal:

### Capas Principales
```
js/
├── core/
│   ├── domain/        # Entidades y modelos de negocio
│   │   └── Color.js   # Representación y manipulación de colores
│   ├── application/   # Casos de uso y lógica de aplicación
│   │   └── ColorService.js
│   └── infrastructure/ # Adaptadores para servicios externos
│       └── APIAdapter.js
├── modules/           # Funcionalidades específicas organizadas por dominio
│   └── color-combinations/ 
│       └── index.js   # Algoritmos para generar combinaciones
├── services/          # Servicios transversales
│   └── url-service.js # Manejo de URLs para compartir paletas
├── ui/                # Componentes de interfaz de usuario (por implementar)
│   ├── ColorPalette.js
│   ├── CombinationGrid.js
│   └── ColorEditor.js
└── app.js             # Punto de entrada y configuración
```

### Principios de Diseño
1. **Bajo acoplamiento**: Componentes independientes unidos por interfaces
2. **Alta cohesión**: Cada módulo con responsabilidad única y clara
3. **Inversión de dependencia**: Capas superiores no dependen de detalles de implementación
4. **Comunicación basada en eventos**: Componentes se comunican vía eventos del DOM

## 4. Plan de Migración

### Fase 1: Estructura y Fundamentos
- [x] Definir arquitectura general
- [x] Implementar servicios básicos (URLService)
- [x] Diseñar modelo de dominio (Color.js)
- [ ] Crear clase App principal

### Fase 2: Componentes UI Esenciales
- [ ] Migrar sistema de paleta de colores
- [ ] Implementar grid de combinaciones
- [ ] Desarrollar renderizado básico
- [ ] Integrar manejo de eventos

### Fase 3: Funcionalidades Clave
- [ ] Migrar sistema de cálculo de combinaciones
- [ ] Implementar validación WCAG
- [ ] Migrar funcionalidad de tema claro/oscuro
- [ ] Habilitar persistencia de estado

### Fase 4: Características Avanzadas
- [ ] Migrar editor de colores
- [ ] Implementar funcionalidades de exportación
- [ ] Completar integración con API
- [ ] Migrar corrector de contraste

### Fase 5: Refinamiento
- [ ] Optimizar rendimiento
- [ ] Mejorar experiencia móvil
- [ ] Implementar pruebas unitarias
- [ ] Realizar auditoría de accesibilidad

## 5. Guía Técnica

### Estructura de Archivos
```
color-combinator/
├── .gitignore           # Archivos ignorados por git
├── ARCHITECTURE.md      # Documentación de arquitectura
├── LICENSE              # Licencia GPL V3
├── README.md            # Documentación principal
├── archives/            # Versión original de referencia
├── css/                 # Estilos CSS
│   └── styles.css
├── index.html           # Punto de entrada HTML
├── js/                  # Lógica JavaScript (estructura descrita anteriormente)
├── package-lock.json    # Dependencias exactas
└── package.json         # Configuración del proyecto
```

### Tecnologías Utilizadas
- **Frontend**: JavaScript ES6+, HTML5, CSS3
- **Herramientas**: NPM, Live Server
- **Empaquetado**: Importaciones ES Modules nativas
- **Dependencias**: CRC-32 (para URLs legacy)

### Convenciones de Código
- **Estilo**: Camelcase para variables y funciones, PascalCase para clases
- **Módulos**: ES Modules con import/export
- **Clases**: Uso de clases ES6 con propiedades privadas (#)
- **Comentarios**: JSDoc para documentación de API

## 6. Funcionalidades Principales

### Gestión de Paletas
- Generación de colores aleatorios
- Añadir/eliminar colores de la paleta
- Copiar valores de color

### Combinaciones de Colores
- Generación automática de combinaciones para cada par
- Visualización en tarjetas con muestra de texto
- Cálculo de ratios de contraste

### Edición de Colores
- Selector visual de colores
- Conversiones entre formatos (HEX, RGB, HSL)
- Editor avanzado con previsualización

### Validación WCAG
- Cálculo de luminosidad relativa
- Validación AA y AAA para texto normal y grande
- Sugerencia de correcciones para contrastes insuficientes

### Importación/Exportación
- URLs compatibles con Coolors
- Copiar paleta al portapapeles
- Importación desde Coolors

### Preferencias de Usuario
- Tema claro/oscuro
- Persistencia de estado
- Texto personalizable para pruebas

## 7. Flujos de Usuario

### Flujo Principal
1. Usuario accede a la aplicación
2. Se carga paleta inicial o desde URL
3. Se generan combinaciones de colores
4. Se muestran tarjetas con contrastes y validación

### Edición de Colores
1. Usuario hace clic en un color
2. Se abre modal de edición
3. Se previsualiza la edición en tiempo real
4. Se actualiza la paleta al confirmar

### Importación de Paleta
1. Usuario pega URL de Coolors
2. Sistema valida formato
3. Se extraen colores y reemplazan la paleta actual
4. Se regeneran combinaciones

### Exportación y Compartir
1. Usuario hace clic en exportar
2. Sistema genera URL compatible con Coolors
3. Se copia al portapapeles o actualiza la URL del navegador

## 8. API y Servicios

### Estado de URL
**URLService**: Maneja la sincronización entre estado de la aplicación y la URL

```javascript
// Importar colores desde URL
parseURL() {
  const params = new URLSearchParams(window.location.search);
  const colorParam = params.get('colors');
  this.currentColors = colorParam 
    ? colorParam.split('-').map(c => new Color(c))
    : [];
  // Notificar a la aplicación
  window.dispatchEvent(new CustomEvent('colors-updated', {
    detail: this.currentColors
  }));
}

// Exportar colores a URL
updateURL(colors) {
  const colorString = colors.map(c => c.toString().replace('#', '')).join('-');
  const newURL = `${window.location.pathname}?colors=${colorString}`;
  window.history.pushState({}, '', newURL);
}
```

### Servicio de Colores
**ColorService**: Coordina operaciones relacionadas con colores

```javascript
// Generación de combinaciones
async generateCombination(baseColor) {
  const color = new Color(baseColor);
  if (!color.isValid()) {
    throw new Error('Color hexadecimal inválido');
  }
  
  // Obtener combinaciones de API o algoritmo local
  const combinations = await this.apiClient.get('/combinations', { 
    color: color.hex,
    model: 'hsl'
  });
  return this._normalizeCombinations(combinations);
}
```

### Eventos del Sistema
La comunicación entre componentes se realiza mediante eventos customizados:

- `colors-updated`: Notifica cambios en la paleta de colores
- `theme-changed`: Notifica cambios en el tema visual
- `contrast-check`: Solicita verificación de contraste
- `update-palette`: Actualiza la interfaz con nuevos colores

## 9. Consideraciones de Seguridad

### Validación de Entrada
- Sanitización de entradas de usuario
- Validación estricta de formatos de color
- Prevención de inyección en la generación de HTML

### Limitaciones Técnicas
- No se utiliza almacenamiento sensible
- La aplicación es completamente frontend
- Función hash CRC-32 para verificación (no para seguridad)

## 10. Roadmap Futuro

Una vez completada la migración, se planean las siguientes mejoras:

### Mejoras Técnicas
- Implementación de pruebas unitarias y E2E
- Optimización del rendimiento (memoización, WorkerThreads)
- Progressive Web App (PWA) con modo offline

### Nuevas Funcionalidades
- Generación de paletas basadas en IA
- Exportación a formatos de diseño (Figma, Sketch)
- Análisis avanzado de armonía de colores
- Paletas para daltonismo y otras discapacidades visuales

### Integración
- Plugins para frameworks de diseño
- API pública para generación de paletas
- Integración con más herramientas de diseño

---

Este documento sirve como guía completa para el desarrollo y migración del proyecto Color Combinator. Puede actualizarse a medida que evolucione el proyecto.