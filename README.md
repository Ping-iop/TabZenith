# 🚀 TabZenith — AI Executive Tab OS & Mindspace Manager

<div align="center">

![TabZenith Banner](https://img.shields.io/badge/TabZenith-v1.0.6-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-10%2F10%20Passing-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

**El Sistema Operativo Definitivo para la Gestión de Pestañas, Curaduría de Enlaces, Clasificación Semántica Local con IA y Optimización de Memoria RAM.**

[Instalación Rápida](#-instalación-en-el-navegador) •
[Características Principales](#-características-destacadas) •
[Arquitectura del Sistema](#-arquitectura-y-diseño-técnico) •
[Compatibilidad](#-compatibilidad-de-navegadores) •
[Desarrollo](#-desarrollo-local)

</div>

---

## 🌟 ¿Qué es TabZenith?

En entornos de trabajo intensivo, los desarrolladores e investigadores suelen acumular **docenas o cientos de pestañas abiertas**, provocando:
1. **Saturación de RAM y CPU** que ralentiza todo el sistema operativo.
2. **Ceguera cognitiva**: Pérdida de contexto, pestañas duplicadas y enlaces olvidados.
3. **Colapso al restaurar sesiones**: Abrir 100 pestañas a la vez satura la red y la memoria.

**TabZenith** resuelve este problema combinando la arquitectura nativa de grupos de Chromium, algoritmos de **clasificación semántica local en CPU (Laya Core / MARP)**, congelamiento agresivo de memoria RAM (`chrome.tabs.discard`), deduplicación canónica inteligente con historial de deshacer (**Undo**) y una interfaz ejecutiva moderna basada en **Diseño Atómico**.

---

## ⚡ Características Destacadas

### 🎯 1. Navegación Instantánea "Ir a la Pestaña"
- **Salto Directo sin Recargas**: Haz clic en el título de cualquier pestaña o en el botón de acceso rápido para activar la pestaña abierta y enfocar su ventana en Chrome automáticamente (`chrome.tabs.update` + `chrome.windows.update`).
- Integrado en todas las vistas: **Grupos y Pestañas**, **Data Grid Gerencial**, **Resultados de Búsqueda**, **Pestañas Fijadas** y **Favoritos**.

### ❄️ 2. Congelamiento Inteligente de Memoria RAM (Tab Discarding)
- Libera hasta un **95% de memoria RAM** en pestañas inactivas sin cerrarlas ni perder su historial de navegación.
- **Restauración de Sesión Segura**: Cuando restauras sesiones guardadas masivas, todas las pestañas se crean en **estado congelado** (`discarded: true`), evitando que el navegador consuma gigabytes de RAM al iniciar.
- **Monitor de RAM en Tiempo Real**: Estimación en vivo del consumo de memoria por cada grupo individual y global (`~MB / GB`).

### 🔄 3. Deduplicación Inteligente & Historial Deshacer (Undo)
- **Normalización Canónica de URL**: Limpia parámetros espía y de rastreo (`utm_*`, `fbclid`, `gclid`, `si`) pero **preserva fielmente parámetros esenciales de contenido** (ej. IDs de video de YouTube `?v=...`, consultas de búsqueda `?q=...`, rutas de documentación).
- **Historial de Pestañas Cerradas con Undo**: Cada deduplicación o cierre accidental se registra en la vista de *Pestañas Cerradas*, permitiendo restaurar pestañas individuales o masivas con un solo clic.

### 🧠 4. Clasificación Semántica Local con Laya Core en CPU
- **Zero VRAM / 100% Local**: Inferencia ultra-rápida (~130ms) ejecutada enteramente en CPU.
- **Taxonomía MARP**: Agrupa automáticamente por categorías semánticas:
  - 💻 `Desarrollo / Frontend / Backend`
  - 🔬 `Investigación / Papers / IA`
  - 🎨 `Diseño / UI / UX`
  - 📊 `Finanzas / Gestión / Analítica`
  - 🎬 `Multimedia / Entretenimiento`
- **Agrupación en 1-Clic**: Opción de agrupar pestañas en la barra nativa de Chrome por **Dominio** o por **Temática de IA**.

### 💾 5. Sesiones (Stash) Multinivel
- Guarda el estado completo de tus ventanas y grupos con persistencia de doble capa (**Chrome Storage Sync/Local** + **IndexedDB Dexie**).
- Restaura sesiones completas, grupos específicos o pestañas individuales.
- Grupos colapsables y organización visual de sesiones pasadas.

### 📥 6. Inbox de Curaduría & Triage Diferido
- Pega textos o listas masivas de enlaces; el extractor automático limpia y deduplica URLs en segundos.
- **Filtros por Fecha**: Consulta enlaces añadidos *Hoy*, *Ayer*, *Últimos 7 días*, *Últimos 30 días* o mediante un *Selector de Rango Personalizado*.
- **Exportación Gerencial**: Descarga listas de enlaces estructurados a formato **Markdown** para Obsidian, Notion o tu base de conocimiento.

### 🌐 7. Internacionalización Dinámica (i18n)
- Soporte completo para 4 idiomas con selector interactivo:
  - 🇪🇸 **Español**
  - 🇺🇸 **English**
  - 🇷🇺 **Русский**
  - 🇨🇳 **中文**
- Persistencia automática de idioma en almacenamiento local.

### 📖 8. Manual de Documentación Integrado
- Modal interactivo de ayuda accesible desde el menú general lateral derecho con explicaciones detalladas de cada función, atajo y recomendación de uso.

---

## 🏛️ Arquitectura y Diseño Técnico

TabZenith ha sido construido bajo los principios de **Clean Architecture**, **S.O.L.I.D.** y **Atomic Design**:

```
src/
├── core/                         # 🧠 Reglas de Negocio y Lógica Pura (Blind & Decoupled)
│   ├── domain/                   # Entidades, tipos inmutables (TabItem, TabGroup, Session)
│   ├── ports/                    # Interfaces/Contratos (IBrowserTabsPort, ISessionStoragePort...)
│   ├── adapters/                 # Implementaciones de infraestructura (Chrome API, Mock, Dexie)
│   ├── services/                 # Servicios de dominio (UrlCleanerService, LayaClassifierService)
│   ├── hooks/                    # React Custom Hooks desacoplados (useTabs, useSessions, useSmartSearch...)
│   ├── i18n/                     # Diccionarios de traducción y contexto i18n
│   └── tests/                    # Pruebas unitarias completas con Vitest
│
├── ui/                           # 🎨 Capa Visual (Atomic Design System - Dumb UI)
│   ├── tokens/                   # Variables de diseño semánticas (colores de Chrome, espaciados)
│   ├── atoms/                    # Card, Button, Input, EmptyState, Badge
│   ├── molecules/                # TabItemRow, ContextMenu, LanguageSelector, DomainBadge
│   └── organisms/                # ExecutiveKpiGrid, TabGroupList, ExecutiveDataGrid, ClosedTabsView...
│
├── dashboard/                    # 🖥️ Aplicación de Panel Completo (Executive Command Center)
├── popup/                        # ⚡ Extensión Popup Rápida
└── background/                   # ⚙️ Service Worker MV3
```

### Principios Arquitectónicos Aplicados:
1. **Separación Estricta de Responsabilidades (SoC):** Los componentes visuales no conocen la API de Chrome; interactúan a través de puertos e inyección de dependencias.
2. **Inmutabilidad por Defecto:** Las colecciones de pestañas y estados se tratan como inmutables para evitar efectos secundarios en ejecuciones asíncronas.
3. **Diseño Atómico Resiliente:** Manejo de estados de carga, vacíos, errores y textos extensos sin desbordamientos visuales.

---

## 🌐 Compatibilidad de Navegadores

TabZenith utiliza APIs avanzadas de **Chromium Manifest V3**:

| Navegador | Compatibilidad | Grupos Nativos | Congelamiento RAM | Notas |
| :--- | :---: | :---: | :---: | :--- |
| **Google Chrome** | 🟢 **100%** | ✅ Sí | ✅ Sí | Soporte completo y recomendado. |
| **Microsoft Edge** | 🟢 **100%** | ✅ Sí | ✅ Sí | Soporte completo nativo Chromium. |
| **Brave** | 🟢 **100%** | ✅ Sí | ✅ Sí | Soporte completo. |
| **Opera / Opera GX** | 🟢 **100%** | ✅ Sí | ✅ Sí | Compatible con Chromium MV3. |
| **Vivaldi** | 🟢 **100%** | ✅ Sí | ✅ Sí | Compatible con grupos y pestañas. |
| **Arc** | 🟢 **100%** | ✅ Sí | ✅ Sí | Compatible en entornos Chromium. |
| **Mozilla Firefox** | 🟡 **Parcial** | ❌ No | ⚠️ Limitado | Firefox **no implementa** la API `chrome.tabGroups` en WebExtensions. |
| **Apple Safari** | 🔴 **No soportado** | ❌ No | ❌ No | Requiere port específico en Xcode y carece de Tab Groups API. |

---

## 🚀 Instalación en el Navegador

### Opción 1: Desde la compilación lista para producción
1. Clona este repositorio o descarga el código fuente:
   ```bash
   git clone https://github.com/Ping-iop/TabZenith.git
   ```
2. Instala las dependencias y genera la carpeta `dist`:
   ```bash
   npm install
   npm run build
   ```
3. Abre tu navegador basado en Chromium (Google Chrome, Edge, Brave, etc.) y navega a:
   ```
   chrome://extensions/
   ```
4. Activa el interruptor **Modo de desarrollador** en la esquina superior derecha.
5. Haz clic en el botón **Cargar descomprimida** (*Load unpacked*).
6. Selecciona la carpeta `dist` del proyecto:
   ```
   <ruta-del-proyecto>/dist
   ```
7. ¡Listo! Puedes anclar **TabZenith** a tu barra de herramientas.

> **Tip Ejecutivo:** Puedes abrir el Dashboard Gerencial en cualquier momento presionando el atajo de teclado configurado (`Ctrl+Shift+U`) o abriendo:
> `chrome-extension://<id-de-tu-extension>/dashboard.html`

---

## 💻 Desarrollo Local

Para contribuir o personalizar TabZenith en tu entorno local:

```bash
# 1. Clonar el repositorio
git clone https://github.com/Ping-iop/TabZenith.git
cd TabZenith

# 2. Instalar dependencias
npm install

# 3. Iniciar entorno de desarrollo interactivo
npm run dev

# 4. Ejecutar la suite de pruebas unitarias
npx vitest run

# 5. Generar build de producción optimizado
npm run build
```

---

## 🔒 Privacidad y Seguridad (Zero-Telemetry)

- **100% On-Device**: Toda la información de navegación, historial de sesiones y enlaces curados se almacena localmente en tu equipo mediante IndexedDB (`Dexie.js`) y `chrome.storage.local`.
- **Sin Servidores Externos**: No se recopilan métricas, no hay analítica en la nube ni envío de URLs a servidores de terceros.
- **Inferencia de IA en CPU**: Laya Core opera de manera local, garantizando que tus datos de navegación nunca salgan de tu máquina.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT** — consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
Desarrollado con arquitectura de sistemas de alta resiliencia para potenciar la productividad y el enfoque mental.
</div>
