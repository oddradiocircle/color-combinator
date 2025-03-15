# Color Combinator

Una herramienta interactiva para explorar combinaciones de colores y verificar su conformidad con los estándares de accesibilidad web WCAG.

## Características

- Crea paletas de colores personalizadas
- Visualiza todas las combinaciones posibles entre colores
- Verifica el contraste según WCAG AA y AAA
- Genera correcciones automáticas para mejorar accesibilidad
- Compatibilidad total con URLs de Coolors
- Persistencia de estado en localStorage y URL
- Tema claro/oscuro y personalización de colores
- Diseño responsive para dispositivos móviles y de escritorio

## Uso

Puedes acceder a Color Combinator en: [https://colorcombinator.gomezpadilla.com/](https://colorcombinator.gomezpadilla.com/)

### URLs Compartibles

La aplicación usa URLs simples para compartir paletas, en un formato compatible con Coolors:

```
https://colorcombinator.gomezpadilla.com/#FF5252-4CAF50-2196F3-FFC107-9C27B0
```

También puedes copiar paletas desde Coolors.co e importarlas directamente.

## Desarrollo Local

Para ejecutar Color Combinator en tu entorno local:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/oddradiocircle/color-combinator.git
   cd color-combinator
   ```

2. Inicia un servidor local. Puedes usar Python:
   ```bash
   python -m http.server
   ```
   O con Node.js:
   ```bash
   npx serve
   ```

3. Abre tu navegador en `http://localhost:8000`

4. Si encuentras algún problema, puedes usar el panel de diagnóstico que aparece en la esquina inferior derecha para inicializar manualmente la aplicación.

## Arquitectura Modular

Color Combinator está construido con una arquitectura modular basada en ES Modules, siguiendo los principios de separación de responsabilidades y componentes reutilizables:

### Estructura de directorios

```
color-combinator/
├── css/
│   └── styles.css
├── js/
│   ├── app.js                 # Punto de entrada principal
│   ├── app-fix.js             # Versión alternativa con mejor manejo de errores
│   ├── config.js              # Configuración centralizada
│   ├── core/                  # Infraestructura central 
│   │   ├── event-bus.js       # Sistema de eventos
│   │   ├── component.js       # Clase base de componentes
│   │   └── service-locator.js # Gestor de dependencias
│   ├── models/                # Modelos de datos
│   │   ├── color-model.js     # Modelo para un color
│   │   └── palette-model.js   # Modelo para una paleta
│   ├── services/              # Servicios de la aplicación
│   │   ├── theme-service.js   # Gestión del tema
│   │   ├── export-service.js  # Exportación de paletas
│   │   ├── wcag-service.js    # Cálculos de accesibilidad
│   │   └── url-service.js     # Manejo de URL
│   ├── components/            # Componentes UI
│   │   ├── color-palette.js   # Paleta de colores
│   │   ├── color-picker.js    # Selector de color
│   │   └── notification.js    # Sistema de notificaciones
│   └── utils/                 # Funciones utilitarias
│       ├── color-utils.js     # Utilidades de color
│       ├── dom-utils.js       # Manipulación del DOM
│       └── storage-utils.js   # Persistencia en localStorage
├── debug.js                   # Script de diagnóstico
├── index.html
├── LICENSE
└── README.md
```

### Tecnologías

- JavaScript moderno (ES6+)
- Módulos ES nativos
- HTML5 y CSS3
- Metodología basada en componentes
- Patrón Observer para comunicación entre componentes
- Patrón Singleton para servicios compartidos

### Características de la arquitectura

- **Modularidad**: Cada parte tiene una responsabilidad clara y bien definida
- **Desacoplamiento**: Componentes independientes que se comunican mediante eventos
- **Extensibilidad**: Fácil añadir nuevos componentes o servicios
- **Mantenibilidad**: Código organizado y bien documentado
- **Reutilización**: Componentes y utilidades reutilizables

## Solución de problemas

Si la aplicación no funciona correctamente:

1. **Verifica la consola del navegador** para errores
2. **Usa el panel de diagnóstico** en la esquina inferior derecha
3. **Inicializa manualmente** la aplicación con el botón correspondiente
4. Asegúrate de **no estar usando `file://`** para acceder a la aplicación
5. **Borra la caché** del navegador si actualizaste recientemente

## Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Haz fork del repositorio
2. Crea una rama para tu función (`git checkout -b feature/nueva-funcion`)
3. Haz commit de tus cambios (`git commit -m 'Añade nueva función'`)
4. Haz push a la rama (`git push origin feature/nueva-funcion`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.