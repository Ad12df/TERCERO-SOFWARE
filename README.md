# 📚 BiblioTech

> Sistema de Gestión de Biblioteca — Aplicación Full-Stack con Node.js, Express, Sequelize y PostgreSQL.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-blue)](https://sequelize.org/)

## 🚀 Demo

- **Frontend**: https://tercero-sofware.vercel.app/
- **Backend API**: https://tercero-sofware.onrender.com/

---

## ✨ Características Principales

### 🔐 Sistema de Autenticación y Roles
- Registro e inicio de sesión con email y contraseña
- Contraseñas cifradas con bcrypt (10 rondas de salt)
- Tokens de autenticación personalizados (Base64)
- **Dos roles de usuario**: `admin` y `user`
- Permisos diferenciados según el rol

### ⚙️ Preferencias de Usuario
- Tema visual: claro / oscuro
- Selector de idioma
- Tamaño de letra personalizable
- Preferencias de notificaciones

### 📚 Catálogo de Libros
- Visualización del catálogo completo
- Vista detallada de cada libro (título, autor, descripción, portada)
- Búsqueda y filtrado de libros
- Gestión de libros (solo admin)

### ⭐ Sistema de Reseñas
- Reseñas con puntuación de 1-5 estrellas
- Recalculación automática de la puntuación media
- Historial de reseñas por libro

### 📖 Lector de PDF
- Visor de documentos PDF integrado con PDF.js
- Navegación por páginas (anterior/siguiente)
- Modo pantalla completa
- Indicador de progreso de lectura

### 📋 Gestión Personal
- **Mi Lista**: Libros guardados para leer después
- **Leídos**: Historial de libros completados
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

### Frontend

| Tecnología | Propósito |
|------------|-----------|
| HTML5 | Estructura semántica de páginas |
| CSS3 | Estilos modernos y responsivos |
| JavaScript (ES6+) | Lógica de aplicación sin frameworks |
| Fetch API | Comunicación con el backend |
| localStorage | Almacenamiento de sesión |
| PDF.js | Renderizado de documentos PDF |

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
```

> **Nota:** Si usas Neon (PostgreSQL cloud), activa `DB_SSL=true` para la conexión.

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
│       ├── app.js            # Configuración de Express
│       ├── server.js         # Punto de entrada
│       ├── config/
│       │   └── database.js   # Configuración de Sequelize + SSL
│       ├── controllers/
│       │   ├── auth.js       # Endpoints de autenticación
│       │   └── user.js       # Endpoints de usuario/configuración
│       ├── middleware/       # Middlewares personalizados
│       ├── models/
│       │   ├── index.js      # Modelos y relaciones
│       │   ├── users.js      # Modelo de usuarios (bcrypt)
│       │   ├── books.js      # Modelo de libros
│       │   ├── reviews.js    # Modelo de reseñas
│       │   └── userSettings.js # Modelo de preferencias
│       ├── routes/
│       │   ├── index.js      # Router principal (/api)
│       │   ├── auth/         # Rutas de autenticación
│       │   │   └── index.js
│       │   └── user/         # Rutas de usuario
│       │       └── index.js
│       ├── services/
│       │   └── auth.js       # Lógica de autenticación
│       └── utils/
│           └── password.js   # Utilidades de contraseña
│
└── frontend/                 # Interfaz Web
    ├── index.html             # Login / Registro
    ├── books.html             # Dashboard / Catálogo
    ├── book-detail.html       # Detalle de libro
    ├── reader.html            # Lector de PDF
    ├── settings.html          # Configuración de usuario
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
        └── settings.js        # Lógica de configuración
```

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
| GET | `/api/books` | Listar todos los libros | No |
| GET | `/api/books/:id` | Obtener detalle de un libro | No |
| POST | `/api/books` | Crear nuevo libro | Admin |
| PUT | `/api/books/:id` | Actualizar libro | Admin |
| DELETE | `/api/books/:id` | Eliminar libro | Admin |

---

### Reseñas (`/api/reviews`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/reviews/book/:bookId` | Reseñas de un libro | No |
| POST | `/api/reviews` | Crear reseña | Sí |
| PUT | `/api/reviews/:id` | Actualizar reseña | Dueño |
| DELETE | `/api/reviews/:id` | Eliminar reseña | Dueño/Admin |

---

### Lista Personal (`/api/user-books`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/user-books` | Obtener libros del usuario | Sí |
| POST | `/api/user-books` | Agregar libro a la lista | Sí |
| PUT | `/api/user-books/:id` | Marcar como leído | Sí |
| DELETE | `/api/user-books/:id` | Quitar de la lista | Sí |

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
| `role` | ENUM | `admin` o `user` (default: `user`) |
| `createdAt` | TIMESTAMP | Automático (Sequelize) |
| `updatedAt` | TIMESTAMP | Automático (Sequelize) |

### Tabla `user_settings`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria, autoincremental |
| `user_id` | INTEGER | FK a users (único) |
| `tema` | STRING | `claro` o `oscuro` (default: `oscuro`) |
| `idioma` | STRING | Código ISO (default: `es`) |
| `notificaciones` | BOOLEAN | Notificaciones habilitadas |
| `tamano_letra` | INTEGER | Tamaño en px (default: 16) |
| `createdAt` | TIMESTAMP | Automático |
| `updatedAt` | TIMESTAMP | Automático |

### Tabla `books`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | Clave primaria |
| `nombre` | STRING | Título del libro |
| `autor` | STRING | Autor del libro |
| `direccion` | STRING | Ubicación/estante |
| `foto` | TEXT | URL de la portada |
| `pdf_url` | TEXT | URL del PDF |
| `descripcion` | TEXT | Descripción del libro |
| `puntuacion_media` | FLOAT | Promedio de reseñas (0-5) |
| `total_resenas` | INTEGER | Cantidad de reseñas |
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

> **Nota:** Las tablas se crean automáticamente al iniciar el servidor gracias a `sequelize.sync({ alter: true })`.

---

## 🔒 Seguridad

- **Contraseñas**: cifradas con **bcrypt** (10 rondas de salt)
- **Tokens**: codificados en Base64 (contienen userId, role, exp)
- **Cabeceras**: HTTP seguras con **Helmet**
- **CORS**: configurado para dominios específicos
- **Validación**: de datos en todos los endpoints
- **Variables de entorno**: para datos sensibles
- El campo `password` **nunca** se incluye en las respuestas JSON

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
- Tamaño de letra
- Preferencias de notificaciones

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
| `npm test` | No configurado |

---

## ❓ Solución de Problemas

| Problema | Posible causa | Solución |
|----------|---------------|----------|
| `Database connection failed` | PostgreSQL apagado o credenciales incorrectas | Revisar `.env` y que el servicio PostgreSQL esté activo |
| El frontend no carga datos | Backend no corriendo | Ejecutar `npm run dev` en `backend/` |
| Error CORS o `fetch` bloqueado | Abrir HTML como `file://` | Usar `npx serve frontend` o Live Server |
| Puerto 3000 en uso | Otra app usa el puerto | Cambiar `PORT` en `.env` y `API_URL` en el frontend |

---

## 📝 Notas de Desarrollo

- El backend crea automáticamente todas las tablas en la base de datos al iniciar
- El rol `admin` es necesario para crear/editar/eliminar libros
- Las reseñas recalculan automáticamente la puntuación media del libro
- Los tokens expiran después de 7 días
- Las preferencias del usuario se crean automáticamente al registrarse

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
  <strong>BiblioTech</strong> — Gestión inteligente de bibliotecas
</p>
