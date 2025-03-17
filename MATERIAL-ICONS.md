# Uso de Material Design Icons en Color Combinator

## Introducción

Color Combinator utiliza [Material Symbols de Google](https://fonts.google.com/icons) para una experiencia visual consistente. Estos iconos están diseñados para ser claros, minimalistas y fácilmente reconocibles.

## Configuración

Los iconos se cargan mediante Google Fonts. La configuración está incluida en el `index.html`:

```html
<!-- Material Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

Esta configuración permite usar los iconos con distintas propiedades de tamaño, peso, relleno y gradiente.

## Uso Básico

Para usar un icono Material en la aplicación:

```html
<span class="material-symbols-outlined">name_of_icon</span>
```

Donde `name_of_icon` es el nombre del icono específico de Material Symbols.

## Iconos Utilizados en la Aplicación

| Funcionalidad | Icono | Código | Descripción |
|---------------|-------|--------|-------------|
| Paleta | `palette` | `<span class="material-symbols-outlined">palette</span>` | Para secciones relacionadas con colores |
| Tipografía | `text_fields` | `<span class="material-symbols-outlined">text_fields</span>` | Para configuración de texto |
| Selector de color | `colorize` | `<span class="material-symbols-outlined">colorize</span>` | Para herramientas de selección de color |
| Exportar | `ios_share` | `<span class="material-symbols-outlined">ios_share</span>` | Para funciones de compartir/exportar |
| Menú | `menu` | `<span class="material-symbols-outlined">menu</span>` | Botón de menú móvil |
| Cerrar | `close` | `<span class="material-symbols-outlined">close</span>` | Para cerrar paneles/modales |
| Ayuda | `help` | `<span class="material-symbols-outlined">help</span>` | Para información de ayuda |
| Añadir | `add` | `<span class="material-symbols-outlined">add</span>` | Para añadir nuevos elementos |
| Copiar | `content_copy` | `<span class="material-symbols-outlined">content_copy</span>` | Para copiar al portapapeles |
| Eliminar | `delete` | `<span class="material-symbols-outlined">delete</span>` | Para eliminar elementos |
| Descargar | `download` | `<span class="material-symbols-outlined">download</span>` | Para importar/descargar |
| Enlace | `link` | `<span class="material-symbols-outlined">link</span>` | Para generar URLs |
| Deshacer | `undo` | `<span class="material-symbols-outlined">undo</span>` | Para deshacer acciones |
| Modo oscuro | `dark_mode` | `<span class="material-symbols-outlined">dark_mode</span>` | Para activar tema oscuro |
| Modo claro | `light_mode` | `<span class="material-symbols-outlined">light_mode</span>` | Para activar tema claro |
| Auto-corregir | `auto_fix` | `<span class="material-symbols-outlined">auto_fix</span>` | Para corregir contrastes |
| Visibilidad | `visibility` | `<span class="material-symbols-outlined">visibility</span>` | Para vista previa |
| Éxito | `check_circle` | `<span class="material-symbols-outlined">check_circle</span>` | Para confirmación |
| Error | `error` | `<span class="material-symbols-outlined">error</span>` | Para notificaciones de error |
| Info | `info` | `<span class="material-symbols-outlined">info</span>` | Para notificaciones informativas |

## Personalización

Los iconos pueden personalizarse con CSS:

```css
.material-symbols-outlined {
  /* Propiedades opcionales */
  font-variation-settings:
    'FILL' 1,      /* 0 para hueco, 1 para relleno */
    'wght' 400,    /* Peso: 100 a 700 */
    'GRAD' 0,      /* Gradiente: -50 a 200 */
    'opsz' 24;     /* Tamaño óptico: 20 a 48 */
    
  /* Propiedades estándar */
  font-size: 24px;
  color: var(--primary-color);
}
```

### Variaciones Comunes

- **Iconos rellenos:** `font-variation-settings: 'FILL' 1`
- **Iconos ligeros:** `font-variation-settings: 'wght' 200`
- **Iconos pesados:** `font-variation-settings: 'wght' 600`

## Consideraciones de Accesibilidad

Al usar iconos, siempre:

1. Incluir texto asociado o un atributo `aria-label` para lectores de pantalla
2. Mantener un tamaño mínimo de 24px para asegurar visibilidad
3. Usar suficiente contraste entre el icono y el fondo

## Explorador de Iconos

Para explorar todos los íconos disponibles, visita:
https://fonts.google.com/icons

## Ejemplos de Implementación

### Botón con Icono

```html
<button class="button primary">
  <span class="material-symbols-outlined">add</span>
  Añadir Color
</button>
```

### Iconos en Notificaciones

```html
<div class="notification success">
  <span class="material-symbols-outlined">check_circle</span>
  <div class="notification-content">
    <div class="notification-title">Operación exitosa</div>
    <div class="notification-message">El color se ha añadido correctamente</div>
  </div>
</div>
```

### Icono con Tooltip

```html
<span class="icon-with-tooltip">
  <span class="material-symbols-outlined">help</span>
  <span class="tooltip">Información de ayuda</span>
</span>
```
