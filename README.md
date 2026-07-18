# 📚 BiblioTech

> Sistema de Gestión de Biblioteca — Aplicación Full-Stack con Node.js, Express, Sequelize y PostgreSQL.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-blue)](https://sequelize.org/)

---

## 📖 Descripción del Proyecto

**BiblioTech** es una aplicación web full-stack para la gestión integral de una biblioteca. Permite a los usuarios autenticarse, explorar un catálogo de libros, ver detalles, gestionar su lista de lectura personal y leer documentos PDF directamente en el navegador.

El sistema sigue una arquitectura **cliente-servidor** clara:

- **Backend**: API REST con Node.js, Express y Sequelize (PostgreSQL)
- **Frontend**: Aplicación web con HTML5, CSS3 y JavaScript vanilla

El backend **no sirve** las páginas HTML; solo expone datos en JSON. El frontend **no tiene** base de datos propia; solo consume la API mediante `fetch`. Esta separación facilita escalar, desplegar por partes y, en el futuro, añadir una app móvil u otro cliente sin tocar el servidor.

---

## ✨ Características Principales

### 🔐 Autenticación de Usuarios
- Registro e inicio de sesión con email y contraseña
- Contraseñas cifradas con bcrypt (10 rondas de salt)
- Sesiones simuladas con localStorage

### 📚 Catálogo de Libros
- Visualización del catálogo completo de libros
- Vista detallada de cada libro (título, autor, descripción, portada)
- Búsqueda y filtrado de libros

### 📖 Lector de PDF
- Visor de documentos PDF integrado con PDF.js
- Navegación por páginas (anterior/siguiente)
- Modo pantalla completa
- Indicador de progreso de lectura

### 📋 Gestión Personal
- **Mi Lista**: Libros guardados para leer después
- **Leídos**: Historial de libros completados
- Perfil de usuario con avatar e información

### ⚙️ Configuración
- Preferencias de lectura
- Tema visual (claro/oscuro)
- Gestión de cuenta

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
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bibliotech
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
```

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
│       ├── server.js         # Punto de entrada del servidor
│       ├── config/
│       │   └── database.js   # Configuración de Sequelize
│       ├── controllers/
│       │   └── index.js     # Controladores de la API
│       ├── middleware/       # Middlewares personalizados
│       ├── models/
│       │   ├── index.js     # Modelos cargados
│       │   └── users.js     # Modelo de usuarios
│       ├── routes/
│       │   ├── index.js     # Rutas principales (/api)
│       │   └── user/
│       │       └── index.js # Rutas de usuarios
│       ├── services/
│       │   └── users.js     # Lógica de negocio
│       └── utils/
│           └── password.js  # Utilidades de cifrado
│
└── frontend/                 # Interfaz Web
    ├── index.html            # Login / Registro
    ├── books.html            # Dashboard / Catálogo de libros
    ├── book-detail.html      # Detalle de libro
    ├── reader.html           # Lector de PDF
    ├── settings.html         # Configuración
    ├── css/
    │   ├── style.css         # Estilos principales
    │   ├── book-detail.css   # Estilos detalle libro
    │   ├── reader.css        # Estilos lector PDF
    │   └── settings.css      # Estilos configuración
    └── js/
        ├── api.js            # Configuración de la API
        ├── login.js          # Lógica de autenticación
        ├── books.js          # Lógica del catálogo
        ├── bookDetail.js     # Lógica detalle libro
        ├── reader.js         # Lógica del lector PDF
        └── settings.js       # Lógica de configuración
```

---

## 🔌 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/users/register` | Registrar nuevo usuario |
| POST | `/api/users/login` | Iniciar sesión |
| GET | `/api/users/profile` | Obtener perfil del usuario |
| PUT | `/api/users/profile` | Actualizar perfil |

### Catálogo de Libros

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/books` | Listar todos los libros |
| GET | `/api/books/:id` | Obtener detalle de un libro |
| POST | `/api/books` | Crear nuevo libro (admin) |
| PUT | `/api/books/:id` | Actualizar libro (admin) |
| DELETE | `/api/books/:id` | Eliminar libro (admin) |

### Lista Personal

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/user-books` | Obtener libros del usuario |
| POST | `/api/user-books` | Agregar libro a la lista |
| PUT | `/api/user-books/:id` | Marcar como leído |
| DELETE | `/api/user-books/:id` | Quitar de la lista |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/` | Verificar que la API responde |

---

## 🗄️ Modelo de Datos

### Tabla `users`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | INTEGER | Clave primaria, autoincremental |
| `name` | STRING | Nombre del usuario (obligatorio) |
| `email` | STRING | Email único (obligatorio) |
| `password` | TEXT | Hash bcrypt (nunca texto plano) |
| `createdAt` | TIMESTAMP | Automático (Sequelize) |
| `updatedAt` | TIMESTAMP | Automático (Sequelize) |

---

## 🔒 Seguridad

- Contraseñas cifradas con **bcrypt** (10 rondas de salt)
- Cabeceras HTTP seguras con **Helmet**
- CORS configurado para permitir peticiones del frontend
- Validación de datos en todos los endpoints
- Variables de entorno para datos sensibles
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
- Portada y metadatos
- Botón para abrir el lector de PDF

### Lector PDF (`reader.html`)
- Visor de documentos PDF con PDF.js
- Controles de navegación por páginas
- Modo pantalla completa
- Indicador de página actual / total
- Barra de control flotante

### Configuración (`settings.html`)
- Preferencias de lectura
- Cambio de tema
- Gestión de cuenta

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

## 🤝 Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-funcion`)
3. Realiza tus cambios y haz commit (`git commit -m 'Agregar nueva función'`)
4. Haz push a la rama (`git push origin feature/nueva-funcion`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia **ISC**.

---

## 👤 Autor

Desarrollado como proyecto de tercero de Software.

---

<p align="center">
  <strong>BiblioTech</strong> — Gestión inteligente de bibliotecas
</p>
