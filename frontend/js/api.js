// URL base del backend en Render (HTTPS obligatorio para evitar contenido mixto en Vercel)
// El prefijo /api coincide con app.use("/api", routes) del backend
const API_URL = "https://tercero-sofware.onrender.com/api";

/**
 * Obtiene el token de autenticación del localStorage
 * @returns {string|null} El token de autenticación o null si no existe
 */
function getAuthToken() {
  return localStorage.getItem("token");
}

/**
 * Obtiene los datos del usuario del localStorage
 * @returns {object|null} Los datos del usuario o null si no existe
 */
function getUserData() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si el usuario está autenticado
 */
function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Cierra la sesión del usuario
 */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

/**
 * Realiza una petición fetch con el token de autenticación
 * @param {string} url - URL de la petición
 * @param {object} options - Opciones de fetch
 * @returns {Promise} Promesa con la respuesta
 */
async function authFetch(url, options = {}) {
  const token = getAuthToken();
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return fetch(url, options);
}
