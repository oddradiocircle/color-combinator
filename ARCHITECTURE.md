# Arquitectura Modular para Color Combinator v2.0

## Estructura de Directorios
```
js/
├── core/
│   ├── domain/       # Modelos de negocio (Color, Palette)
│   ├── application/  # Casos de uso centrales
│   └── infrastructure/ # Implementaciones abstractas
└── modules/
    └── color-combinations/ # Algoritmos específicos
```

## Principios de Diseño AI-Friendly
1. **Modularidad Estricta**: Cada componente es un paquete independiente
2. **Interfaces Estables**: Contratos bien definidos entre capas
3. **Inyección de Dependencias**: Configuración centralizada para swaps de implementación
4. **Documentación Embebida**: TypeScript con JSDoc para contexto de IA
5. **Patrones de Actualización**: 
   - Adapter Pattern para nuevas versiones
   - Strategy Pattern para algoritmos intercambiables