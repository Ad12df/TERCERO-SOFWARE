# 📚 BiblioTech

> **Portal de Biblioteca Digital Colaborativa** — Plataforma Full-Stack para la gestión, lectura y moderación de libros digitales, construida con Node.js, Express, Sequelize, PostgreSQL y Supabase Storage.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-blue)](https://sequelize.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E.svg)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://web.dev/progressive-web-apps/)
[![Android](https://img.shields.io/badge/Android-TWA-3DDC84.svg)](https://developer.android.com/training/wearables/apps/twa)

## 🎯 Propósito del Portal

**BiblioTech** es un portal web de biblioteca digital colaborativa cuyo objetivo es permitir a una comunidad de usuarios descubrir, leer y valorar libros digitales en formato PDF directamente desde el navegador. El portal combina un catálogo público navegable con un sistema de roles y moderación que garantiza la calidad del contenido:

- **Catálogo público** de libros digitales con portadas y PDFs almacenados en la nube
- **Lector PDF integrado** en el navegador (PDF.js) con seguimiento de progreso
- **Sistema de roles** con tres niveles: `admin`, `escritor` y `user`
- **Moderación de contenido**: los libros subidos por escritores requieren aprobación de un administrador antes de ser visibles
- **Gestión personal**: listas de lectura ("Mi Lista") e historial de libros leídos
- **Sistema comunitario**: reseñas con puntuación de estrellas y comentarios de discusión
- **Preferencias personalizables**: tema visual, idioma, tamaño de letra y notificaciones

## 🚀 Demo

- **Frontend (Web/PWA)**: https://tercero-sofware.vercel.app/
- **Backend API**: https://tercero-sofware.onrender.com/api
- **App Android (TWA)**: APK generada con Bubblewrap — package `app.vercel.tercero_sofware.twa`

---

## ✨ Características Principales

### 🔐 Sistema de Autenticación y Roles
- Registro e inicio de sesión con email y contraseña
- Contraseñas cifradas con bcrypt (10 rondas de salt)
- Tokens de autenticación (Base64 con id, email y role del usuario)
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
| Service Worker (`sw.js`) | Cache offline con estrategia network-first |
| Iconos PWA (`icon-192.png`, `icon-512.png`) | Iconos instalables (192px y 512px, maskable) |
| Bubblewrap CLI | Generación de APK Android a partir de la PWA (TWA) |
| Digital Asset Links (`.well-known/assetlinks.json`) | Verificación de propiedad para fullscreen nativo en Android |

---

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** versión 18 o superior
- **PostgreSQL** versión 16 o superior
- **npm** o **yarn** (gestor de paquetes)

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
```

> **Nota:** Si usas Neon (PostgreSQL cloud), activa `DB_SSL=true` para la conexión.
> Las claves de Supabase se usan para subir portadas y PDFs a los buckets `portadas` y `pdfs`.

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
│       │   ├── auth.js       # Endpoints de autenticación
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
│       │   └── userSettings.js # Modelo de preferencias
│       ├── routes/
│       │   ├── index.js      # Router principal (/api)
│       │   ├── auth.js       # Rutas de autenticación
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
│       │   └── users.js      # Lógica de usuarios
│       └── utils/
│           └── password.js   # Utilidades de contraseña
│
└── frontend/                 # Interfaz Web (PWA)
    ├── index.html             # Login / Registro
    ├── books.html             # Dashboard / Catálogo
    ├── book-detail.html       # Detalle de libro + reseñas + comentarios
    ├── reader.html            # Lector de PDF
    ├── settings.html          # Configuración de usuario
    ├── my-list.html           # Mi Lista de lectura
    ├── read-books.html        # Historial de libros leídos
    ├── manifest.json          # Web App Manifest (PWA)
    ├── sw.js                  # Service Worker (cache offline)
    ├── icon-192.png           # Icono PWA 192x192 (maskable)
    ├── icon-512.png           # Icono PWA 512x512 (maskable)
    ├── .well-known/
    │   └── assetlinks.json    # Digital Asset Links (TWA fullscreen Android)
    ├── css/
    │   ├── style.css          # Estilos principales
    │   ├── book-detail.css    # Estilos detalle libro
    │   ├── reader.css         # Estilos lector PDF
    │   └── settings.css       # Estilos configuración
    └── js/
        ├── api.js             # Configuración API + auth helpers
        ├── login.js           # Lógica de autenticación
        ├── books.js           # Lógica del catálogo
        ├── bookDetail.js      # Lógica detalle libro
        ├── reader.js          # Lógica del lector PDF
        ├── settings.js        # Lógica de configuración
        ├── myList.js          # Lógica de Mi Lista
        └── readBooks.js       # Lógica de libros leídos
```

---

---

## 🔌 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

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
| **Control de acceso por roles (RBAC)** | Middleware `authorize(...roles)` con 3 roles | ✅ Implementado |
| **Cabeceras HTTP seguras** | Helmet con defaults | ✅ Implementado |
| **CORS** | Whitelist: URL de Vercel + `localhost:5500` | ✅ Implementado |
| **Validación de entrada** | Verificación de email único, contraseña mín. 6 caracteres | ✅ Implementado |
| **Variables de entorno** | Credenciales DB y claves en `.env` | ✅ Implementado |
| **Exclusión de password** | El campo `password` nunca se incluye en respuestas JSON | ✅ Implementado |
| **Límite de subida** | Multer con límite de 50 MB por archivo | ✅ Implementado |
| **Almacenamiento de archivos** | Supabase Storage (buckets "portadas" y "pdfs") | ✅ Implementado |

> ⚠️ **Advertencia de seguridad — Tokens:** Los tokens actuales son una codificación Base64 simple de un JSON con `id`, `email` y `role`. **No son JWT firmados**, no tienen firma criptográfica ni fecha de expiración (`exp`). Cualquiera con el token puede decodificarlo y modificar su contenido. Para producción se recomienda migrar a JWT firmados con secreto y expiración.
>
> ⚠️ **Advertencia de seguridad — Claves Supabase:** La `SERVICE_ROLE_KEY` de Supabase está actualmente hardcodeada en `config/supabase.js`. Debería moverse a variables de entorno (`SUPABASE_SERVICE_KEY`).
>
> ⚠️ **Advertencia de seguridad — Rutas legacy:** El router `routes/user/index.js` (CRUD de usuarios) no tiene middleware de autenticación. Debería protegerse o eliminarse si no se usa.

---

## 🎨 Vistas de la Aplicación

### Login (`index.html`)
Formulario de inicio de sesión y registro con diseño moderno tipo "píldora". Incluye validación de email y contraseña. Redirecciona al dashboard tras autenticarse.

### Dashboard (`books.html`)
- Sidebar con navegación
- Catálogo de libros en formato grid
- Tabs: **Libros**, **Mi Lista**, **Leídos**
- Barra de búsqueda
- Perfil de usuario en la esquina superior

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

---

## 📝 Flujo de Capas (Backend)

```
Petición HTTP
    → Routes      (define URL y método: GET, POST, PUT, DELETE)
    → Controllers (procesa req/res, códigos de estado HTTP)
    → Services    (reglas de negocio, cifrado)
    → Models      (consultas a PostgreSQL vía Sequelize)
    → PostgreSQL  (almacenamiento de datos)
```

---

## 🔧 Scripts del Backend

| Comando | Acción |
|---------|--------|
| `npm run dev` | Desarrollo con nodemon (recarga automática) |
| `npm start` | Producción (`node src/server.js`) |
| `node src/scripts/cleanupBooks.js` | Borra todos los libros y reseñas (solo para pruebas) |
| `npm test` | No configurado |

---

## ❓ Solución de Problemas

| Problema | Posible causa | Solución |
|----------|---------------|----------|
| `Database connection failed` | PostgreSQL apagado o credenciales incorrectas | Revisar `.env` y que el servicio PostgreSQL esté activo |
| El frontend no carga datos | Backend no corriendo | Ejecutar `npm run dev` en `backend/` |
| Error CORS o `fetch` bloqueado | Abrir HTML como `file://` | Usar `npx serve frontend` o Live Server |
| Puerto 3000 en uso | Otra app usa el puerto | Cambiar `PORT` en `.env` y `API_URL` en el frontend |
| APK muestra `404: NOT_FOUND` | URL incorrecta en `twa-manifest.json` | Verificar que `host` sea `tercero-sofware.vercel.app` (con una sola "f") |
| APK muestra barra de navegador | `assetlinks.json` no accesible o SHA-256 incorrecto | Verificar `https://tercero-sofware.vercel.app/.well-known/assetlinks.json` y que el SHA-256 coincida con el keystore |
| APK no se instala (INSTALL_FAILED) | Firma diferente a la versión anterior | Desinstalar la app anterior primero: `adb uninstall app.vercel.tercero_sofware.twa` |
| `bubblewrap build` pide contraseña | Es normal — la necesita para firmar la APK | Usar `159753` para keystore y key |

---

## � Configuración PWA y App Móvil (Android TWA)

El frontend está configurado como **Progressive Web App (PWA)** y se ha empaquetado como **Trusted Web Activity (TWA)** para generar una APK nativa de Android mediante [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap).

### Archivos PWA

| Archivo | Descripción |
|---------|-------------|
| `frontend/manifest.json` | Manifest con `display: standalone`, `theme_color: #1E4B65`, iconos maskable 192px y 512px |
| `frontend/sw.js` | Service Worker con estrategia **network-first** (cache `bibliotech-v1`) |
| `frontend/icon-192.png` | Icono instalable 192×192 |
| `frontend/icon-512.png` | Icono instalable 512×512 |

Todos los HTML incluyen:
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#1E4B65">`
- Registro del Service Worker (`navigator.serviceWorker.register('/sw.js')`)

### Digital Asset Links (`.well-known/assetlinks.json`)

Para que la TWA se abra en **modo pantalla completa nativo** (sin barra de navegador), Android verifica la propiedad del sitio mediante Digital Asset Links:

- **Ubicación**: `frontend/.well-known/assetlinks.json` → accesible en `https://tercero-sofware.vercel.app/.well-known/assetlinks.json`
- **Contenido**: JSON con `package_name` (`app.vercel.tercero_sofware.twa`) y `sha256_cert_fingerprints` del keystore de firma
- **SHA-256 actual**: `1D:79:EB:EB:4C:FE:DD:67:09:C6:76:97:67:9E:07:B3:02:3C:9C:70:88:C4:11:81:C9:E3:FA:73:2E:3D:F0:E0`

> Si regeneras el keystore, debes extraer el nuevo SHA-256 y actualizar este archivo.

### Generar/Actualizar la APK con Bubblewrap

**Requisitos previos:**
- Java JDK 17+
- Bubblewrap CLI instalado: `npm install -g @bubblewrap/cli`
- Keystore en `bibliotech-twa/android.keystore` (alias `android`, contraseña `159753`)

**Pasos:**

```powershell
# 1. Subir cambios del frontend a GitHub (Vercel despliega automáticamente)
cd c:\Users\javie\OneDrive\Documentos\GitHub\TERCERO-SOFWARE
git add .
git commit -m "descripción del cambio"
git push

# 2. Esperar 1-2 min a que Vercel despliegue...

# 3. Actualizar y reconstruir la APK
cd c:\Users\javie\OneDrive\Documentos\GitHub\bibliotech-twa
bubblewrap update
bubblewrap build
# (pedirá contraseña del keystore: 159753 y del key: 159753)

# 4. Instalar en el teléfono (conectado por USB con depuración activada)
& "C:\Users\javie\.bubblewrap\android_sdk\platform-tools\adb.exe" install -r "C:\Users\javie\OneDrive\Documentos\GitHub\bibliotech-twa\app-release-signed.apk"
```

> **Nota:** Si solo cambiaste contenido del frontend (HTML/CSS/JS) y ya está en Vercel, **no necesitas reconstruir la APK** — la TWA carga el contenido desde la web. Solo reconstruye si cambiaste algo en `twa-manifest.json` (URL, iconos, package name, etc.).

> **Cache de Android:** Si la barra de navegador sigue apareciendo tras instalar, ve a *Ajustes → Aplicaciones → BiblioTech → Almacenamiento → Borrar caché* y vuelve a abrir la app.

---

## �📝 Notas de Desarrollo

- El backend crea automáticamente todas las tablas en la base de datos al iniciar (`sequelize.sync({ alter: true })`)
- El rol `admin` puede crear/editar/eliminar libros directamente; `escritor` puede crear libros pero quedan `PENDIENTE` hasta aprobación
- Las reseñas recalculan automáticamente la puntuación media del libro mediante hooks (`afterCreate`, `afterUpdate`, `afterDestroy`)
- Los tokens **no expiran** (son codificación Base64 sin `exp`)
- Las preferencias del usuario se crean automáticamente al registrarse
- Los archivos (portadas y PDFs) se suben a **Supabase Storage** mediante Multer con `memoryStorage`
- La descarga de PDFs se realiza a través de un endpoint proxy del backend que obtiene el archivo del bucket de Supabase
- El script `cleanupBooks.js` borra todos los libros y reseñas — usar solo en entornos de prueba

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
