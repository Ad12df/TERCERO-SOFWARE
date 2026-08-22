# 📚 BiblioTech

> **Portal de Biblioteca Digital Colaborativa** — Plataforma Full-Stack para la gestión, lectura y moderación de libros digitales, construida con Node.js, Express, Sequelize, PostgreSQL y Supabase Storage.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-blue)](https://sequelize.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E.svg)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://web.dev/progressive-web-apps/)
[![Capacitor](https://img.shields.io/badge/Capacitor-6.x-119DEF.svg)](https://capacitorjs.com/)
[![Android](https://img.shields.io/badge/Android-APK-3DDC84.svg)](https://developer.android.com/)

---

## � Nuevas Funcionalidades

Funcionalidades añadidas recientemente al proyecto:

| Funcionalidad | Descripción | Módulos afectados |
|---------------|-------------|-------------------|
| **Recuperación de contraseña** | Solicitud de restablecimiento por email con token + formulario de nueva contraseña | `forgot-password.html`, `reset-password.html`, `nodemailer`, `PasswordReset` model |
| **Página de Descargados** | Vista dedicada a libros descargados para lectura offline | `descargados.html`, `descargados.js` |
| **UI centralizada** | Sidebar y navegación global unificados en `ui.js` con delegación de eventos | `js/ui.js`, todos los HTML del dashboard |
| **Service Worker robusto** | Filtros de seguridad para esquemas no HTTP y métodos no GET; `skipWaiting` + `clients.claim` | `sw.js` |
| **Modal de Moderación rediseñado** | Interfaz moderna con tabs, acciones en lote y empty states optimizados | `books.html`, CSS del modal |

---

## �� Propósito del Portal

**BiblioTech** es un portal web de biblioteca digital colaborativa cuyo objetivo es permitir a una comunidad de usuarios descubrir, leer y valorar libros digitales en formato PDF directamente desde el navegador. El portal combina un catálogo público navegable con un sistema de roles y moderación que garantiza la calidad del contenido:

- **Catálogo público** de libros digitales con portadas y PDFs almacenados en la nube
- **Lector PDF integrado** en el navegador (PDF.js) con seguimiento de progreso
- **Sistema de roles** con tres niveles: `admin`, `escritor` y `user`
- **Moderación de contenido**: los libros subidos por escritores requieren aprobación de un administrador antes de ser visibles
- **Gestión personal**: listas de lectura ("Mi Lista") e historial de libros leídos
- **Sistema comunitario**: reseñas con puntuación de estrellas y comentarios de discusión
- **Preferencias personalizables**: tema visual, idioma, tamaño de letra y notificaciones
- **Recuperación de contraseña** vía email con tokens de un solo uso

---

## 🚀 Demo

- **Frontend (Web/PWA)**: https://tercero-sofware.vercel.app/
- **Backend API**: https://tercero-sofware.onrender.com/api
- **App Android (Capacitor)**: APK nativa con `com.bibliotech.app` (soporte offline + acceso al sistema de archivos)

---

## ✨ Características Principales

### 🔐 Sistema de Autenticación y Roles
- Registro e inicio de sesión con email y contraseña
- Contraseñas cifradas con bcrypt (10 rondas de salt)
- Tokens de autenticación (Base64 con id, email y role del usuario)
- **Recuperación de contraseña**: envío de email con enlace firmado (token expirable) y formulario de restablecimiento
- **Tres roles de usuario**:
  - `admin` — Acceso total: gestión de libros, moderación, aprobación/rechazo de contenido y solicitudes de escritor
  - `escritor` — Puede subir libros (quedan en estado PENDIENTE hasta aprobación) y solicitar ascenso de rol
  - `user` — Usuario lector: navega el catálogo, lee PDFs, crea listas personales y deja reseñas/comentarios
- Permisos diferenciados según el rol mediante middleware de autorización

### 🛡️ Sistema de Moderación
- Los libros subidos por escritores quedan en estado `PENDIENTE`
- Los administradores pueden aprobar o rechazar libros individualmente o en lote
- Flujo de solicitudes de ascenso: los usuarios pueden solicitar ser `escritor` y los admins aprueban o rechazan
- Panel de moderación con conteos de elementos pendientes
- Modal "Centro de Moderación" rediseñado: tabs, acciones globales (aprobar/rechazar todo) y empty states optimizados

### ⚙️ Preferencias de Usuario
- Tema visual: claro / oscuro
- Selector de idioma
- Tamaño de letra personalizable (pequeño, mediano, grande)
- Preferencias de notificaciones
- Configuración creada automáticamente al registrarse

### 📚 Catálogo de Libros
- Visualización del catálogo completo (solo libros APROBADOS)
- Vista detallada de cada libro (título, autor, categoría, descripción, portada)
- Búsqueda y filtrado de libros
- Gestión de libros: admin (crear/editar/eliminar directo) y escritor (crear, sujeto a moderación)
- Portadas y PDFs almacenados en **Supabase Storage**

### ⭐ Sistema de Reseñas
- Reseñas con puntuación de 1-5 estrellas
- Recalculación automática de la puntuación media del libro (hooks afterCreate/afterUpdate/afterDestroy)
- Historial de reseñas por libro

### 💬 Sistema de Comentarios
- Comentarios de discusión en la página de detalle de cada libro
- Asociados a usuario y libro con eliminación en cascada

### 📖 Lector de PDF
- Visor de documentos PDF integrado con PDF.js
- Navegación por páginas (anterior/siguiente)
- Modo pantalla completa
- Indicador de progreso de lectura (porcentaje)
- Descarga de PDF mediante endpoint proxy del backend

### 📋 Gestión Personal
- **Mi Lista**: Libros guardados para leer después (`/api/lists`)
- **Leídos**: Historial de libros completados (`/api/lists/read`)
- **Descargados**: Libros descargados localmente para lectura offline (`descargados.html`)
- Verificación de si un libro ya está en la lista personal
- Perfil de usuario con nombre y badge de rol

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18+ | Entorno de ejecución |
| Express | 5.x | Servidor HTTP y rutas |
| Sequelize | 6.x | ORM para base de datos |
| PostgreSQL | 16+ | Base de datos relacional |
| bcrypt | 6.x | Cifrado de contraseñas |
| cors | 2.x | Peticiones cross-origin |
| helmet | 8.x | Cabeceras de seguridad HTTP |
| morgan | 1.x | Logging de peticiones HTTP |
| dotenv | 17.x | Variables de entorno |
| nodemon | 3.x | Recarga automática en desarrollo |
| multer | 2.x | Subida de archivos (portadas y PDFs) |
| nodemailer | 9.x | Envío de emails (recuperación de contraseña) |
| @supabase/supabase-js | 2.x | Cliente de Supabase Storage |
| axios | 1.x | Peticiones HTTP (proxy de descarga) |
| pg / pg-hstore | 2.x | Driver PostgreSQL para Sequelize |

### Frontend

| Tecnología | Propósito |
|------------|-----------|
| HTML5 | Estructura semántica de páginas |
| CSS3 | Estilos modernos y responsivos |
| JavaScript (ES6+) | Lógica de aplicación sin frameworks |
| Fetch API | Comunicación con el backend |
| localStorage | Almacenamiento de sesión |
| PDF.js | Renderizado de documentos PDF |

### PWA y App Móvil

| Tecnología | Propósito |
|------------|----------|
| Web App Manifest (`manifest.json`) | Metadatos de la PWA (nombre, iconos, tema, display standalone) |
| Service Worker (`sw.js`) | Cache offline con estrategia network-first + filtros de seguridad |
| Iconos PWA (`icon-192.png`, `icon-512.png`) | Iconos instalables (192px y 512px, maskable) |
| **Capacitor 6.x** | Runtime nativo para empaquetar el frontend como APK Android (WebView nativa + plugins) |
| **@capacitor/filesystem** | Plugin para acceder al sistema de archivos del dispositivo (guardar PDFs offline) |
| Android Studio SDK | Compilación y firma de la APK nativa |

---

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** versión 18 o superior
- **PostgreSQL** versión 16 o superior
- **npm** o **yarn** (gestor de paquetes)
- **SMTP / servicio de email** (opcional, solo si usas recuperación de contraseña: configurar variables en `.env`)

---

## 🚀 Instalación y Ejecución

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd TERCERO-SOFWARE
```

### 2. Configurar la Base de Datos

1. Asegúrate de que PostgreSQL esté ejecutándose
2. Crea una base de datos llamada `bibliotech`:

```sql
CREATE DATABASE bibliotech;
```

### 3. Configurar el Backend

```bash
cd backend
npm install
```

Crea el archivo de variables de entorno:

```bash
# Windows (PowerShell)
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Edita el archivo `.env` con tu configuración:

```env
PORT=3000
DB_HOST=tu-host
DB_PORT=5432
DB_NAME=neondb
DB_USER=tu-usuario
DB_PASSWORD=tu-contraseña
DB_SSL=true
FRONTEND_URL=http://localhost:5500
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-service-role-key

# ── Email (Recuperación de contraseña) ──
SMTP_HOST=smtp.ejemplo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-correo@ejemplo.com
SMTP_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM="BiblioTech <no-reply@ejemplo.com>"
```

> **Nota:** Si usas Neon (PostgreSQL cloud), activa `DB_SSL=true` para la conexión.
> Las claves de Supabase se usan para subir portadas y PDFs a los buckets `portadas` y `pdfs`.

> ⚠️ **Email opcional:** Las variables de `SMTP_*` solo son necesarias para habilitar la recuperación de contraseña. Si no se configuran, el endpoint `/forgot-password` devolverá un error informativo.

### 4. Iniciar el Servidor

```bash
# Desarrollo (con recarga automática)
npm run dev

# Producción
npm start
```

El servidor se ejecutará en `http://localhost:3000`

### 5. Ejecutar el Frontend

El frontend puede ejecutarse de varias formas:

**Opción A — Servidor estático:**
```bash
npx serve frontend
```

**Opción B — Live Server (VS Code):**
Clic derecho en `index.html` → "Open with Live Server"

**Opción C — Servidor HTTP de Python:**
```bash
cd frontend
python -m http.server 5500
# Accede a http://localhost:5500
```

---

## 🏗️ Estructura del Proyecto

```
TERCERO-SOFWARE/
├── README.md                 # Este archivo
├── APK_README.md             # Notas específicas de compilación de la APK
├── package.json              # Scripts y dependencias de Capacitor (raíz)
├── package-lock.json
├── capacitor.config.json     # Configuración de Capacitor (appId, webDir, androidScheme)
│
├── backend/                  # API REST (Node.js + Express)
│   ├── package.json
│   └── src/
│       ├── app.js            # Configuración de Express (helmet, cors, morgan)
│       ├── server.js         # Punto de entrada (conexión DB → servidor)
│       ├── config/
│       │   ├── database.js   # Configuración de Sequelize + SSL (Neon)
│       │   ├── supabase.js   # Cliente de Supabase Storage (buckets)
│       │   └── cloudinary.js # Config de Cloudinary (legacy, no usado)
│       ├── controllers/
│       │   ├── auth.js       # Endpoints de autenticación + recuperación de contraseña
│       │   ├── books.js       # CRUD de libros + subida a Supabase
│       │   ├── download.js   # Proxy de descarga de PDFs
│       │   ├── moderation.js  # Aprobación/rechazo de libros y escritores
│       │   ├── user.js       # Perfil y preferencias
│       │   ├── userList.js   # Mi Lista y Leídos
│       │   └── index.js      # Exportación de controladores
│       ├── middleware/
│       │   └── auth.js       # authenticate, authorize, requireAdmin
│       ├── models/
│       │   ├── index.js      # Modelos y relaciones
│       │   ├── users.js      # Modelo de usuarios (bcrypt, 3 roles)
│       │   ├── books.js      # Modelo de libros (status, progreso)
│       │   ├── reviews.js    # Modelo de reseñas (hooks de recálculo)
│       │   ├── Comment.js    # Modelo de comentarios
│       │   ├── UserList.js   # Modelo de Mi Lista
│       │   ├── UserRead.js   # Modelo de libros leídos
│       │   ├── WriterRequest.js # Solicitudes de ascenso a escritor
│       │   ├── PasswordReset.js  # Tokens de recuperación de contraseña
│       │   └── userSettings.js # Modelo de preferencias
│       ├── routes/
│       │   ├── index.js      # Router principal (/api)
│       │   ├── auth.js       # Rutas de autenticación (register, login, forgot/reset password)
│       │   ├── moderation.js # Rutas de moderación (admin)
│       │   ├── user.js       # Rutas de usuario (legacy CRUD)
│       │   ├── books/
│       │   │   └── index.js  # Rutas de libros + reseñas + comentarios
│       │   └── user/
│       │       ├── index.js  # Rutas de perfil y preferencias
│       │       └── userList.js # Rutas de Mi Lista y Leídos
│       ├── scripts/
│       │   └── cleanupBooks.js # Script de limpieza (borra libros y reseñas)
│       ├── services/
│       │   ├── auth.js       # Lógica de autenticación (token Base64)
│       │   ├── users.js      # Lógica de usuarios
│       │   └── email.js      # Servicio de envío de emails (nodemailer)
│       └── utils/
│           └── password.js   # Utilidades de contraseña
│
├── frontend/                 # Interfaz Web (PWA) — origen webDir para Capacitor
│   ├── index.html             # Login / Registro
│   ├── forgot-password.html   # Solicitar recuperación de contraseña
│   ├── reset-password.html    # Establecer nueva contraseña
│   ├── books.html             # Dashboard / Catálogo / Centro de Moderación
│   ├── book-detail.html       # Detalle de libro + reseñas + comentarios
│   ├── reader.html            # Lector de PDF
│   ├── settings.html          # Configuración de usuario
│   ├── my-list.html           # Mi Lista de lectura
│   ├── read-books.html        # Historial de libros leídos
│   ├── descargados.html       # Libros descargados (offline)
│   ├── manifest.json          # Web App Manifest (PWA)
│   ├── sw.js                  # Service Worker (cache offline + filtros de seguridad)
│   ├── icon-192.png           # Icono PWA 192x192 (maskable)
│   ├── icon-512.png           # Icono PWA 512x512 (maskable)
│   ├── prueba.pdf             # PDF de prueba
│   ├── .well-known/
│   │   └── assetlinks.json    # (Legacy) Digital Asset Links — no requerido con Capacitor
│   ├── css/
│   │   ├── style.css          # Estilos principales
│   │   ├── book-detail.css    # Estilos detalle libro
│   │   ├── reader.css         # Estilos lector PDF
│   │   ├── settings.css       # Estilos configuración
│   │   └── forgot-password.css # Estilos recuperación de contraseña
│   └── js/
│       ├── ui.js              # ⭐ UI global (sidebar, navegación) — FUENTE DE VERDAD ÚNICA
│       ├── api.js             # Configuración API + auth helpers
│       ├── login.js           # Lógica de autenticación
│       ├── books.js           # Lógica del catálogo y moderación
│       ├── bookDetail.js      # Lógica detalle libro
│       ├── reader.js          # Lógica del lector PDF
│       ├── settings.js        # Lógica de configuración
│       ├── myList.js          # Lógica de Mi Lista
│       ├── readBooks.js       # Lógica de libros leídos
│       ├── descargados.js     # Lógica de libros descargados (usa @capacitor/filesystem en Android)
│       ├── forgot-password.js # Lógica de solicitud de recuperación
│       └── reset-password.js  # Lógica de restablecimiento de contraseña
│
└── android/                   # Proyecto nativo Android (generado por Capacitor)
    ├── app/
    │   ├── build.gradle
    │   ├── proguard-rules.pro
    │   └── src/main/
    │       ├── AndroidManifest.xml    # Permisos (INTERNET, WRITE_EXTERNAL_STORAGE, etc.)
    │       ├── java/com/bibliotech/app/MainActivity.java
    │       ├── res/                   # Iconos launcher mipmap, splash screen, temas
    │       └── xml/file_paths.xml     # Configuración FileProvider para PDFs
    ├── build.gradle
    ├── settings.gradle
    ├── variables.gradle
    ├── gradle.properties
    ├── gradlew / gradlew.bat          # Wrapper de Gradle
    ├── capacitor.build.gradle
    ├── capacitor.settings.gradle
    └── gradle/wrapper/
```

---

## 📏 Convenciones de Desarrollo Frontend

Convenciones obligatorias para mantener consistencia en el proyecto:

### Orden de carga de scripts
```html
<!-- 1. UI global (siempre primero, con defer) -->
<script src="js/ui.js" defer></script>
<!-- 2. Configuración API y helpers -->
<script src="js/api.js"></script>
<!-- 3. Script específico de la página -->
<script src="js/books.js"></script>
```

### Estructura HTML obligatoria para páginas del dashboard
```html
<div class="dashboard-layout">
  <main class="main-content">
    <section class="dashboard-container">
      <!-- Contenido de la página -->
    </section>
  </main>
</div>
```

### UI centralizada en `ui.js`
- **Sidebar, botón hamburguesa, navegación activa y overlay** se gestionan **solo** desde `js/ui.js`.
- No redefinir `toggleSidebar` ni agregar `onclick` inline en los HTML del dashboard.
- La navegación activa se marca automáticamente comparando la ruta actual normalizada.

### Delegación de eventos
- Usar **delegación de eventos** en `document` para disparadores de UI (soporta DOM dinámico).
- Preferir `e.preventDefault()` sobre `e.stopPropagation()` en botones de menú para no interferir con la delegación global.

### Botones y formularios
- Todos los botones de acción deben usar `type="button"` para evitar envíos accidentales de formulario.

### Estilos visuales
- Modales: `border-radius: 16px`, sombras suaves.
- Contenedores de pestañas: fondo `#f1f5f9`.
- Iconos/SVG en **empty states de moderación**: tamaño máximo `64x64px`.

---

---

## 🔌 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |
| POST | `/api/auth/forgot-password` | Solicitar enlace de recuperación de contraseña por email | No |
| POST | `/api/auth/reset-password` | Restablecer contraseña con token recibido por email | No |

#### POST /api/auth/register

**Body:**
```json
{
  "name": "Nombre del usuario",
  "email": "correo@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Nombre del usuario",
    "email": "correo@ejemplo.com",
    "role": "user"
  }
}
```

#### POST /api/auth/login

**Body:**
```json
{
  "email": "correo@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Nombre del usuario",
    "email": "correo@ejemplo.com",
    "role": "user"
  }
}
```

#### GET /api/auth/me

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Nombre del usuario",
    "email": "correo@ejemplo.com",
    "role": "user"
  }
}
```

#### POST /api/auth/forgot-password

Solicita el envío de un email con un enlace para restablecer la contraseña.

**Body:**
```json
{
  "email": "correo@ejemplo.com"
}
```

**Respuesta (siempre exitosa, por seguridad):**
```json
{
  "success": true,
  "message": "Si el email existe, recibirás un enlace para restablecer tu contraseña."
}
```

#### POST /api/auth/reset-password

Restablece la contraseña usando el token recibido en el email.

**Body:**
```json
{
  "token": "token-de-64-caracteres",
  "password": "nueva-contraseña-segura123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Contraseña restablecida correctamente."
}
```

---

### Usuario (`/api/user`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/user/profile` | Obtener perfil | Sí |
| PUT | `/api/user/profile` | Actualizar perfil | Sí |
| GET | `/api/user/settings` | Obtener preferencias | Sí |
| PUT | `/api/user/settings` | Actualizar preferencias | Sí |

#### GET /api/user/profile

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "name": "Nombre del usuario",
    "email": "correo@ejemplo.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/user/profile

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Nuevo nombre"
}
```

#### GET /api/user/settings

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "success": true,
  "settings": {
    "tema": "oscuro",
    "idioma": "es",
    "notificaciones": true,
    "tamano_letra": 16
  }
}
```

#### PUT /api/user/settings

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "tema": "claro",
  "idioma": "es",
  "notificaciones": false,
  "tamano_letra": 18
}
```

---

### Catálogo de Libros (`/api/books`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/books` | Listar libros aprobados | No |
| GET | `/api/books/:id` | Obtener detalle de un libro | No |
| GET | `/api/books/:id/download` | Descargar PDF (proxy Supabase) | No |
| POST | `/api/books` | Crear nuevo libro (multipart) | Admin/Escritor |
| PUT | `/api/books/:id` | Actualizar libro | Admin |
| DELETE | `/api/books/:id` | Eliminar libro | Admin |
| PATCH | `/api/books/:id/progress` | Guardar progreso de lectura | Sí |

> **Nota:** Al crear un libro, `admin` lo publica como `APROBADO` directamente; `escritor` lo deja en `PENDIENTE` para moderación. La subida usa `multipart/form-data` con campos `foto` (portada) y `pdf` (documento).

---

### Reseñas (`/api/books/:id/reviews`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/books/:id/reviews` | Reseñas de un libro | No |
| POST | `/api/books/:id/reviews` | Crear reseña | Sí |
| PUT | `/api/reviews/:id` | Actualizar reseña | Dueño |
| DELETE | `/api/reviews/:id` | Eliminar reseña | Dueño/Admin |

> **Nota:** Tras crear, actualizar o eliminar una reseña, se recalcula automáticamente `puntuacion_media` y `total_resenas` del libro.

---

### Comentarios (`/api/books/:id/comments`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/books/:id/comments` | Listar comentarios de un libro | No |
| POST | `/api/books/:id/comments` | Crear comentario | Sí |
| DELETE | `/api/comments/:id` | Eliminar comentario | Dueño/Admin |

---

### Moderación (`/api/moderation`) — Solo Admin

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/moderation/counts` | Conteos de pendientes | Admin |
| GET | `/api/moderation/books/pending` | Libros pendientes de aprobación | Admin |
| PATCH | `/api/moderation/books/:id/approve` | Aprobar libro | Admin |
| PATCH | `/api/moderation/books/:id/reject` | Rechazar libro | Admin |
| PATCH | `/api/moderation/books/approve-all` | Aprobar todos los pendientes | Admin |
| PATCH | `/api/moderation/books/reject-all` | Rechazar todos los pendientes | Admin |
| GET | `/api/moderation/writer-requests` | Solicitudes de escritor pendientes | Admin |

---

### Listas Personales (`/api/lists`) — Autenticado

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/lists` | Obtener Mi Lista del usuario | Sí |
| GET | `/api/lists/read` | Obtener libros leídos | Sí |
| GET | `/api/lists/check/:bookId` | Verificar si un libro está en la lista | Sí |
| POST | `/api/lists/add` | Agregar libro a Mi Lista | Sí |
| DELETE | `/api/lists/remove/:bookId` | Quitar libro de Mi Lista | Sí |

---

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/` | Verificar que la API responde |

---

## 🗄️ Modelo de Datos

### Tabla `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria, autoincremental |
| `name` | STRING | Nombre del usuario (obligatorio) |
| `email` | STRING | Email único (obligatorio) |
| `password` | TEXT | Hash bcrypt (nunca texto plano) |
| `role` | ENUM | `admin`, `escritor` o `user` (default: `user`) |
| `createdAt` | TIMESTAMP | Automático (Sequelize) |
| `updatedAt` | TIMESTAMP | Automático (Sequelize) |

### Tabla `password_resets`

Tokens de un solo uso para recuperación de contraseña.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria, autoincremental |
| `user_id` | INTEGER | FK a users (el usuario que solicita recuperación) |
| `token` | STRING | Token único (hash) para verificar el enlace de email |
| `expires_at` | DATE | Fecha de expiración (ej: 1 hora después de la creación) |
| `used` | BOOLEAN | `true` si el token ya fue consumido (default: `false`) |
| `createdAt` | TIMESTAMP | Automático |
| `updatedAt` | TIMESTAMP | Automático |

> Índice único en `token`. Un token solo puede usarse una vez y expira tras el tiempo definido.

### Tabla `user_settings`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria, autoincremental |
| `user_id` | INTEGER | FK a users (único) |
| `tema` | ENUM | `claro` o `oscuro` (default: `oscuro`) |
| `idioma` | STRING | Código ISO (default: `es`) |
| `notificaciones` | BOOLEAN | Notificaciones habilitadas |
| `tamano_letra` | ENUM | `pequeño`, `mediano` o `grande` |
| `createdAt` | TIMESTAMP | Automático |
| `updatedAt` | TIMESTAMP | Automático |

### Tabla `books`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria |
| `nombre` | STRING | Título del libro |
| `autor` | STRING | Autor del libro |
| `categoria` | STRING | Categoría/género del libro |
| `foto` | TEXT | URL de la portada (Supabase bucket "portadas") |
| `pdf_url` | TEXT | URL del PDF (Supabase bucket "pdfs") |
| `descripcion` | TEXT | Descripción del libro |
| `status` | ENUM | `PENDIENTE` o `APROBADO` (default: `PENDIENTE`) |
| `puntuacion_media` | FLOAT | Promedio de reseñas (0-5) |
| `total_resenas` | INTEGER | Cantidad de reseñas |
| `progreso_porcentaje` | INTEGER | Progreso de lectura del usuario (0-100) |
| `fecha_ultima_lectura` | DATE | Fecha de última lectura |
| `created_by` | INTEGER | FK a users (creador) |
| `createdAt` | TIMESTAMP | Automático |
| `updatedAt` | TIMESTAMP | Automático |

### Tabla `reviews`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria |
| `contenido` | TEXT | Texto de la reseña |
| `puntuacion` | INTEGER | 1-5 estrellas |
| `user_id` | INTEGER | FK a users |
| `book_id` | INTEGER | FK a books |
| `createdAt` | TIMESTAMP | Automático |
| `updatedAt` | TIMESTAMP | Automático |

### Tabla `comments`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria |
| `contenido` | TEXT | Texto del comentario |
| `book_id` | INTEGER | FK a books |
| `user_id` | INTEGER | FK a users |
| `fecha_creacion` | TIMESTAMP | Fecha de creación |
| `createdAt` | TIMESTAMP | Automático |
| `updatedAt` | TIMESTAMP | Automático |

### Tabla `user_lists` (Mi Lista)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria |
| `user_id` | INTEGER | FK a users |
| `book_id` | INTEGER | FK a books |
| `createdAt` | TIMESTAMP | Automático |
| `updatedAt` | TIMESTAMP | Automático |

> Índice único en `(user_id, book_id)` — un libro no puede estar dos veces en la misma lista.

### Tabla `user_reads` (Libros Leídos)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria |
| `user_id` | INTEGER | FK a users |
| `book_id` | INTEGER | FK a books |
| `createdAt` | TIMESTAMP | Automático |
| `updatedAt` | TIMESTAMP | Automático |

> Índice único en `(user_id, book_id)`.

### Tabla `writer_requests` (Solicitudes de Escritor)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria |
| `user_id` | INTEGER | FK a users |
| `estado` | ENUM | `PENDIENTE`, `APROBADO` o `RECHAZADO` |
| `mensaje` | TEXT | Mensaje del usuario al solicitar |
| `createdAt` | TIMESTAMP | Automático |
| `updatedAt` | TIMESTAMP | Automático |

> **Nota:** Las tablas se crean automáticamente al iniciar el servidor gracias a `sequelize.sync({ alter: true })`.

---

## 🔒 Seguridad

| Medida | Implementación | Estado |
|--------|---------------|--------|
| **Cifrado de contraseñas** | bcrypt con 10 rondas de salt | ✅ Implementado |
| **Tokens de autenticación** | Codificación Base64 de JSON `{id, email, role}` | ⚠️ Ver nota |
| **Recuperación de contraseña** | Tokens de un solo uso con `expires_at` y flag `used` | ✅ Implementado |
| **Control de acceso por roles (RBAC)** | Middleware `authorize(...roles)` con 3 roles | ✅ Implementado |
| **Cabeceras HTTP seguras** | Helmet con defaults | ✅ Implementado |
| **CORS** | Whitelist: URL de Vercel + `localhost:5500` | ✅ Implementado |
| **Validación de entrada** | Verificación de email único, contraseña mín. 6 caracteres | ✅ Implementado |
| **Variables de entorno** | Credenciales DB, claves y SMTP en `.env` | ✅ Implementado |
| **Exclusión de password** | El campo `password` nunca se incluye en respuestas JSON | ✅ Implementado |
| **Límite de subida** | Multer con límite de 50 MB por archivo | ✅ Implementado |
| **Almacenamiento de archivos** | Supabase Storage (buckets "portadas" y "pdfs") | ✅ Implementado |
| **Service Worker hardening** | Filtros de protocolo (solo http/https) y método (solo GET) | ✅ Implementado |

> ⚠️ **Advertencia de seguridad — Tokens:** Los tokens actuales son una codificación Base64 simple de un JSON con `id`, `email` y `role`. **No son JWT firmados**, no tienen firma criptográfica ni fecha de expiración (`exp`). Cualquiera con el token puede decodificarlo y modificar su contenido. Para producción se recomienda migrar a JWT firmados con secreto y expiración.
>
> ⚠️ **Advertencia de seguridad — Claves Supabase:** La `SERVICE_ROLE_KEY` de Supabase está actualmente hardcodeada en `config/supabase.js`. Debería moverse a variables de entorno (`SUPABASE_SERVICE_KEY`).
>
> ⚠️ **Advertencia de seguridad — Rutas legacy:** El router `routes/user/index.js` (CRUD de usuarios) no tiene middleware de autenticación. Debería protegerse o eliminarse si no se usa.
>
> ⚠️ **Advertencia — SMTP:** Si no se configuran las variables `SMTP_*` en `.env`, el endpoint `/forgot-password` no puede enviar emails. Asegúrate de usar contraseñas de aplicación (no la contraseña principal de la cuenta) para servicios como Gmail.

---

## 🎨 Vistas de la Aplicación

### Login (`index.html`)
Formulario de inicio de sesión y registro con diseño moderno tipo "píldora". Incluye validación de email y contraseña. Redirecciona al dashboard tras autenticarse. Incluye enlace a "Olvidé mi contraseña".

### Recuperación de Contraseña (`forgot-password.html`)
Formulario para solicitar el envío de un enlace de recuperación por email. Muestra mensajes informativos (sin revelar si el email existe o no, por seguridad).

### Restablecimiento de Contraseña (`reset-password.html`)
Formulario para establecer una nueva contraseña. Valida el token recibido en la URL y solicita confirmación de la nueva contraseña.

### Dashboard (`books.html`)
- Sidebar con navegación (centralizado en `ui.js`)
- Catálogo de libros en formato grid
- Tabs: **Libros**, **Mi Lista**, **Leídos**
- Barra de búsqueda
- Perfil de usuario en la esquina superior
- **Centro de Moderación** (solo admin): modal rediseñado con tabs de libros pendientes y solicitudes de escritor, acciones en lote y empty states optimizados.

### Detalle del Libro (`book-detail.html`)
- Información completa del libro
- Lector de PDF embebido
- Sistema de reseñas con estrellas
- Promedio de puntuación visible

### Lector PDF (`reader.html`)
- Visor de documentos PDF con PDF.js
- Controles de navegación por páginas
- Modo pantalla completa
- Indicador de página actual / total
- Barra de control flotante

### Configuración (`settings.html`)
- Cambio de tema (claro/oscuro)
- Selector de idioma
- Tamaño de letra (pequeño, mediano, grande)
- Preferencias de notificaciones

### Mi Lista (`my-list.html`)
- Libros guardados para leer después
- Botón para quitar libros de la lista
- Acceso rápido al lector de PDF

### Libros Leídos (`read-books.html`)
- Historial de libros completados
- Estadísticas de lectura
- Re-acceso a libros ya leídos

### Descargados (`descargados.html`)
- Libros descargados localmente para lectura offline
- Gestión de archivos descargados
- Acceso sin conexión a los PDFs guardados

---

## 📝 Flujo de Capas (Backend)

```
Petición HTTP
    → Routes      (define URL y método: GET, POST, PUT, DELETE)
    → Controllers (procesa req/res, códigos de estado HTTP)
    → Services    (reglas de negocio, cifrado, envío de emails)
    → Models      (consultas a PostgreSQL vía Sequelize)
    → PostgreSQL  (almacenamiento de datos)
```

---

## 🔧 Scripts Disponibles

### Backend (`cd backend`)

| Comando | Acción |
|---------|--------|
| `npm run dev` | Desarrollo con nodemon (recarga automática) |
| `npm start` | Producción (`node src/server.js`) |
| `node src/scripts/cleanupBooks.js` | Borra todos los libros y reseñas (solo para pruebas) |
| `npm test` | No configurado |

### Capacitor / APK (en la raíz del proyecto)

| Comando | Acción |
|---------|--------|
| `npm install` | Instala Capacitor CLI, @capacitor/core, @capacitor/android y @capacitor/filesystem |
| `npm run copy` | Copia los assets de `frontend/` al proyecto Android (`cap copy android`) |
| `npm run sync` | Sincroniza dependencias + assets y plugins con Android (`cap sync android`) |
| `npm run open` | Abre el proyecto Android en Android Studio (`cap open android`) |
| `npm run build:apk` | Compila APK debug directamente con Gradle (`./gradlew assembleDebug`) |

---

## ❓ Solución de Problemas

| Problema | Posible causa | Solución |
|----------|---------------|----------|
| `Database connection failed` | PostgreSQL apagado o credenciales incorrectas | Revisar `.env` y que el servicio PostgreSQL esté activo |
| El frontend no carga datos | Backend no corriendo | Ejecutar `npm run dev` en `backend/` |
| Error CORS o `fetch` bloqueado | Abrir HTML como `file://` | Usar `npx serve frontend` o Live Server |
| Puerto 3000 en uso | Otra app usa el puerto | Cambiar `PORT` en `.env` y `API_URL` en el frontend |
| Service Worker: `TypeError chrome-extension://` | Extensiones de Chrome interceptan `fetch` | Ya resuelto en `sw.js`: filtra esquemas no HTTP antes de cachear |
| Sidebar no responde en página X | Falta cargar `ui.js` o hay un `onclick` inline duplicado | Ver orden de scripts y no redefinir `toggleSidebar` fuera de `ui.js` |
| `/forgot-password` no envía emails | Variables `SMTP_*` no configuradas en `.env` o credenciales inválidas | Revisar configuración SMTP y usar contraseña de aplicación |
| **Capacitor:** `cap: command not found` | No se instalaron dependencias de la raíz | Ejecutar `npm install` en la raíz del proyecto (no en `backend/`) |
| **Capacitor:** APK no carga el frontend | No se copiaron los assets | Ejecutar `npm run copy` (o `npm run sync`) antes de compilar |
| **Capacitor:** INSTALL_FAILED_VERSION_DOWNGRADE | Versión instalada > versión a instalar | Desinstalar app anterior: `adb uninstall com.bibliotech.app` |
| **Capacitor:** PDFs no se guardan en Android | Falta permiso WRITE_EXTERNAL_STORAGE o FileProvider mal configurado | Revisar `AndroidManifest.xml` y `res/xml/file_paths.xml` |
| **Capacitor:** Android Studio no detecta el SDK | ANDROID_SDK_ROOT no configurado | Definir variable de entorno o abrir el proyecto desde `npm run open` |

---

## 📱 Configuración PWA y App Móvil (Capacitor Android)

El frontend está configurado como **Progressive Web App (PWA)** y se empaqueta como **APK Android nativa** mediante [Capacitor 6](https://capacitorjs.com/). A diferencia de una TWA, Capacitor ejecuta el frontend dentro de un WebView nativo, permitiendo integración con plugins y acceso al sistema de archivos del dispositivo (ej: guardar PDFs offline).

### Archivos PWA

| Archivo | Descripción |
|---------|-------------|
| `frontend/manifest.json` | Manifest con `display: standalone`, `theme_color: #1E4B65`, iconos maskable 192px y 512px |
| `frontend/sw.js` | Service Worker con estrategia **network-first** (cache `bibliotech-v1`) + filtros de seguridad |
| `frontend/icon-192.png` | Icono instalable 192×192 |
| `frontend/icon-512.png` | Icono instalable 512×512 |

Todos los HTML incluyen:
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#1E4B65">`
- Registro del Service Worker (`navigator.serviceWorker.register('/sw.js')`)

### Service Worker — Seguridad y ciclo de vida

El `sw.js` incluye protecciones para evitar errores al interceptar peticiones no compatibles:

1. **Filtros previos a caché:**
   - Solo procesa peticiones con protocolo `http://` o `https://` (ignora `chrome-extension://`, `data:`, `capacitor://`, etc.)
   - Solo procesa peticiones de método `GET` (ignora `POST`, `PUT`, `PATCH`, `DELETE`)

2. **Exclusión de la API:**
   - Peticiones al host de Render (`tercero-sofware.onrender.com`) o rutas `/api/*` pasan directamente a `fetch`, sin tocar la caché.

3. **Ciclo de vida:**
   - `install` → `self.skipWaiting()`: activa el nuevo SW inmediatamente sin esperar.
   - `activate` → `clients.claim()`: toma control de todas las pestañas abiertas al momento.

4. **Robustez:**
   - `cache.put()` envuelto en `try/catch` con `await` para no romper la promesa si un recurso no se puede cachear (ej: sin `Content-Length`).

### Configuración de Capacitor

Archivo principal: `capacitor.config.json`

```json
{
  "appId": "com.bibliotech.app",
  "appName": "BiblioTech",
  "webDir": "frontend",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": false
  }
}
```

| Campo | Valor | Propósito |
|-------|-------|-----------|
| `appId` | `com.bibliotech.app` | Identificador único de la app Android (package name) |
| `appName` | `BiblioTech` | Nombre visible en el launcher |
| `webDir` | `frontend` | Carpeta de origen que Capacitor copia al proyecto Android |
| `server.androidScheme` | `https` | Esquema de URL para el WebView (usa `https` en lugar de `http`) |
| `android.allowMixedContent` | `false` | Bloquea contenido mixto (HTTP dentro de HTTPS) |

### Generar/Actualizar la APK con Capacitor

**Requisitos previos (una sola vez):**
- **Node.js 18+** (instalado en el sistema)
- **Java JDK 17+** (Android Studio lo incluye)
- **Android Studio** + Android SDK (API 24+) — variable `ANDROID_SDK_ROOT` configurada
- **Gradle** (viene incluido en el proyecto con `gradlew` wrapper)

**Dependencias del proyecto (raíz):**
```json
{
  "@capacitor/core": "^6.1.2",
  "@capacitor/android": "^6.2.1",
  "@capacitor/filesystem": "^6.0.4",
  "@capacitor/cli": "^6.2.1"
}
```

**Flujo completo (desde cero):**

```powershell
# ── 1. Instalar dependencias ──────────────────────────────
# En la RAÍZ del proyecto (NO en backend/)
cd c:\Users\javie\Documents\GitHub\TERCERO-SOFWARE
npm install

# (Solo si es la PRIMERA vez, sin carpeta android/)
# npx cap add android

# ── 2. Copiar frontend actualizado a Android ─────────────
# Cada cambio en HTML/CSS/JS requiere este paso antes de compilar
npm run copy       # o: npx cap copy android
# O si cambiaron dependencias/plugins:
npm run sync       # o: npx cap sync android

# ── 3. Compilar la APK ──────────────────────────────────
# Opción A: Abrir en Android Studio (interfaz gráfica)
npm run open       # o: npx cap open android
# → Dentro de Android Studio: Build → Build Bundle(s)/APK → Build APK(s)

# Opción B: Compilar APK debug por CLI con Gradle
npm run build:apk
# APK resultante: android/app/build/outputs/apk/debug/app-debug.apk

# ── 4. Instalar en el teléfono ──────────────────────────
# (Conectado por USB con depuración activada)
& adb devices    # Ver dispositivo conectado
& adb install -r "c:\Users\javie\Documents\GitHub\TERCERO-SOFWARE\android\app\build\outputs\apk\debug\app-debug.apk"
```

### Diferencia: Capacitor vs Bubblewrap/TWA

| Aspecto | **Capacitor (actual)** | Bubblewrap/TWA (anterior) |
|---------|-------------------------|---------------------------|
| Origen del contenido | Embebido en la APK (`webDir` → `www/`) | Cargado desde la web (Vercel) en tiempo real |
| **¿Necesita internet para abrir?** | ❌ No — funciona 100% offline | ✅ Sí — requiere conexión al dominio |
| Plugins nativos | ✅ `@capacitor/filesystem`, cámara, notificaciones, etc. | ❌ Limitado a APIs web |
| Plataformas | Android + **iOS** (si se agrega `ios/`) | Solo Android |
| Barra de navegador | ❌ Nunca aparece (WebView nativo) | ✅ Aparecía si fallaba `assetlinks.json` |
| Keystore / assetlinks | No requiere Digital Asset Links | Requiere `.well-known/assetlinks.json` + SHA-256 |
| Actualizar cambios | `npm run copy` + recompilar APK | Subir a Vercel (sin recompilar) |

> ⚠️ **Importante:** Con Capacitor, **cada cambio del frontend debe reflejarse con `npm run copy` antes de compilar**. La APK lleva los assets embebidos y no consulta Vercel al abrirse.

---

## 🧾�️ Notas de Desarrollo

- El backend crea automáticamente todas las tablas en la base de datos al iniciar (`sequelize.sync({ alter: true })`)
- El rol `admin` puede crear/editar/eliminar libros directamente; `escritor` puede crear libros pero quedan `PENDIENTE` hasta aprobación
- Las reseñas recalculan automáticamente la puntuación media del libro mediante hooks (`afterCreate`, `afterUpdate`, `afterDestroy`)
- Los tokens **no expiran** (son codificación Base64 sin `exp`)
- Las preferencias del usuario se crean automáticamente al registrarse
- Los archivos (portadas y PDFs) se suben a **Supabase Storage** mediante Multer con `memoryStorage`
- La descarga de PDFs se realiza a través de un endpoint proxy del backend que obtiene el archivo del bucket de Supabase
- El script `cleanupBooks.js` borra todos los libros y reseñas — usar solo en entornos de prueba
- **UI centralizada:** `js/ui.js` es la única fuente de verdad para sidebar, navegación activa y eventos de menú; no redefinir estas funciones en otros scripts
- **Service Worker:** El filtro de esquemas HTTP y métodos GET evita el error `Uncaught (in promise) TypeError` causado por extensiones de Chrome

---

## 🗺️ Roadmap (Planes futuros)

Funcionalidades y mejoras planeadas para versiones próximas:

| Prioridad | Tarea | Descripción |
|-----------|-------|-------------|
| 🔴 Alta | **Migrar tokens a JWT firmados** | Reemplazar Base64 por JWT con `secret`, `exp` (expiración) y `iat` (issued at). Middleware de verificación. |
| 🔴 Alta | **Mover SERVICE_ROLE_KEY a `.env`** | Eliminar hardcode en `config/supabase.js` y leer de variable de entorno. |
| 🟡 Media | **Proteger rutas legacy `/routes/user.js`** | Agregar middleware `authorize('admin')` o eliminar el CRUD legacy de usuarios. |
| 🟡 Media | **Rate limiting en auth** | Agregar `express-rate-limit` a `/login`, `/register`, `/forgot-password` para prevenir fuerza bruta. |
| 🟡 Media | **Validación avanzada de entrada** | Integrar `express-validator` o `zod` para validar esquemas de todos los endpoints. |
| 🟢 Baja | **PWA: Push notifications** | Implementar suscripción a notificaciones push con VAPID (Web Push Protocol). |
| 🟢 Baja | **Soporte offline extendido** | Cachear catálogo básico (libros aprobados) en IndexedDB para modo sin conexión. |
| 🟢 Baja | **Test suite** | Configurar Jest + Supertest para endpoints y Vitest para utilidades frontend. |

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crear una rama (`git checkout -b feature/nueva-funcion`)
3. Commit los cambios (`git commit -m 'Agregar nueva función'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Abrir un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

---

<p align="center">
  <strong>BiblioTech</strong> — Portal de Biblioteca Digital Colaborativa
</p>
