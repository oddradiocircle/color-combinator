# Uso de Material Icons en Color Combinator

## Referencia Rápida

Color Combinator utiliza los [Material Symbols](https://fonts.google.com/icons) de Google para iconografía consistente en toda la aplicación.

## Configuración

Los iconos ya están configurados en el archivo `index.html` mediante el siguiente enlace:

```html
<!-- Material Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

## Cómo Usar

Para utilizar un icono en HTML, usar el siguiente formato:

```html
<span class="material-symbols-outlined">nombre_del_icono</span>
```

Por ejemplo:
```html
<span class="material-symbols-outlined">add</span>
```

## Iconos Comunes

Los iconos más utilizados en Color Combinator son:

| Icono | Nombre | Descripción |
|-------|--------|-------------|
| ✏️ | edit | Editar color |
| 🗑️ | delete | Eliminar color |
| ➕ | add | Añadir color |
| ✓ | check | Confirmar acción |
| ✖️ | close | Cerrar o cancelar |
| 📋 | content_copy | Copiar al portapapeles |
| 🌙 | dark_mode | Cambiar a tema oscuro |
| ☀️ | light_mode | Cambiar a tema claro |
| 🎨 | palette | Paleta de colores |
| 🔧 | settings | Configuración |
| 🔍 | visibility | Ver en modo lightbox |
| 💬 | help | Ayuda o información |
| 📊 | analytics | Análisis de contraste |
| 🧩 | extension | Importar/exportar |
| 🔄 | sync | Sincronizar |
| ⚠️ | warning | Advertencia |
| ✅ | check_circle | Éxito |
| ❌ | error | Error |
| ℹ️ | info | Información |

## Personalización

Los iconos pueden personalizarse mediante CSS. Por ejemplo, para cambiar color y tamaño:

```css
.material-symbols-outlined {
  font-size: 24px;
  color: var(--primary-color);
}
```

## Consideraciones de Accesibilidad

Al usar iconos:

1. Añadir siempre texto alternativo o tooltips para usuarios con lectores de pantalla
2. Mantener un contraste adecuado para visibilidad
3. Usar tamaños apropiados (mínimo 24px para interacción táctil)

### Ejemplo de implementación accesible:

```html
<button aria-label="Añadir color" title="Añadir color">
  <span class="material-symbols-outlined">add</span>
</button>
```

## Documentación Oficial

Para más iconos y opciones de personalización, consultar la [documentación oficial de Material Symbols](https://fonts.google.com/icons).
