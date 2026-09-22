# 🚀 TabZenith - AI Executive Tab & Mindspace Manager

> **El Centro de Mando Definitivo para la Gestión Inteligente de Pestañas, Curaduría Diferida y Optimización de RAM con Laya Core en CPU.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Manifest](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-success.svg)
![AI Engine](https://img.shields.io/badge/AI%20Classifier-Laya%20Core%20(CPU)-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🌟 ¿Qué es TabZenith?

**TabZenith** transforma el caos de cientos de pestañas abiertas en un flujo de trabajo ejecutivo estructurado y sin esfuerzo. Integra clasificación semántica local en CPU con **Laya Core / MARP** (sin consumo de VRAM ni servicios de pago), congelamiento de memoria RAM y un panel especializado de curaduría de enlaces por rangos de fecha.

---

## ⚡ Características Principales

### 1. 📊 Dashboard Gerencial (Executive Command Center)
- **KPIs en Tiempo Real**: Memoria RAM ahorrada (MB/GB), conteo de pestañas activas vs. pausadas y tasa de curaduría.
- **Distribución Taxonómica Laya**: Visualización del balance temático de tu atención (`Código`, `Investigación`, `Web & UI`, `Multimedia`, `Finanzas`, etc.).
- **Data Grid Interactivo**: Tabla de alta densidad con selección múltiple por casillas, filtrado instantáneo y exportación a Markdown para Obsidian o Notion.

### 2. ❄️ Congelamiento de Pestañas (Tab Discarding)
- Libera hasta el **95% de la memoria RAM** de pestañas inactivas sin cerrarlas ni perder su historial mediante la API nativa de Chromium.

### 3. 🧠 Clasificación Inteligente con Laya Core en CPU
- Analiza títulos y URLs en ~130ms utilizando el modelo local en CPU.
- Agrupa y colorea automáticamente tus pestañas en Chrome con la paleta de colores oficial.

### 4. 🖱️ Menús Contextuales y Organización Completa
- Clic derecho o menú de 3 puntos sobre cualquier pestaña para moverla entre grupos existentes, crear nuevos grupos, renombrar, cambiar color o suspenderla.

### 5. 📥 Panel de Curaduría de Enlaces (Inbox con Filtro por Fechas)
- Pega textos o listas de URLs masivas; el limpiador inteligente remueve parámetros de rastreo (`utm_...`, `fbclid`, `si`) y deduplica enlaces.
- Filtra por rangos de fecha: *Hoy*, *Ayer*, *Últimos 7 días*, *Últimos 30 días* o *Rango Personalizado*.
- Flujo de Triage acelerado: abrir, marcar revisado, archivar o eliminar.

---

## 🛠️ Instalación en Google Chrome

1. Abre Google Chrome y ve a `chrome://extensions/`.
2. Activa el interruptor **Modo de desarrollador** (arriba a la derecha).
3. Haz clic en el botón **Cargar descomprimida** (*Load unpacked*).
4. Selecciona la carpeta `dist` de este repositorio:
   ```
   C:\Users\GPAMD\Documents\PoyectosTabs\dist
   ```
5. ¡Listo! El icono de **TabZenith** aparecerá en tu barra de extensiones.

---

## 💻 Desarrollo Local

Para correr el Dashboard Gerencial en modo desarrollo local:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Correr suite de pruebas unitarias
npx vitest run
```

---

## 🔒 Privacidad y Rendimiento
- **100% Local**: Tus pestañas y enlaces se almacenan de forma privada en tu equipo usando IndexedDB (Dexie.js).
- **Zero VRAM Overhead**: Inferencia optimizada en CPU con Laya Core.
