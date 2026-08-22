// URL base del backend en Render (HTTPS obligatorio para evitar contenido mixto en Vercel)
// El prefijo /api coincide con app.use("/api", routes) del backend
// ✅ CORRECTO:
const API_URL = "https://tercero-sofware.onrender.com/api"; // URL corregida al dominio original sin la 't' adicional

// ===================================
// DETECCIÓN DE PLATAFORMA (Capacitor)
// ===================================
// Detecta si la app corre dentro del APK de Capacitor (Android)
const isNativeApp = typeof window.Capacitor !== 'undefined' &&
                    window.Capacitor.isNativeAvailable === true;

// ===================================
// ESTADO DE CONEXIÓN
// ===================================
const OfflineQueue = {
  KEY: 'bibliotech_offline_queue',

  init() {
    window.addEventListener('online', () => {
      console.log('🌐 Conexión restaurada — procesando cola offline');
      this.processQueue();
    });
    // Procesar cola al cargar si hay conexión
    if (navigator.onLine) {
      this.processQueue();
    }
  },

  enqueue(request) {
    const queue = JSON.parse(localStorage.getItem(this.KEY) || '[]');
    queue.push({
      ...request,
      timestamp: Date.now()
    });
    localStorage.setItem(this.KEY, JSON.stringify(queue));
    console.log(`📥 Petición encolada offline (${queue.length} en cola)`);
  },

  async processQueue() {
    const queue = JSON.parse(localStorage.getItem(this.KEY) || '[]');
    if (queue.length === 0) return;

    console.log(`🔄 Procesando ${queue.length} peticiones pendientes...`);
    const remaining = [];

    for (const item of queue) {
      try {
        const opts = {
          method: item.method,
          headers: item.headers || {}
        };
        if (item.body) opts.body = JSON.stringify(item.body);
        if (item.headers && item.headers['Content-Type']) {
          opts.headers['Content-Type'] = item.headers['Content-Type'];
        }

        const response = await fetch(item.url, opts);
        if (!response.ok) {
          console.warn(`⚠️ Petición encolada falló (${response.status}):`, item.url);
          remaining.push(item);
        } else {
          console.log('✅ Petición sincronizada:', item.url);
        }
      } catch (err) {
        console.warn('⚠️ Error al procesar petición encolada:', err);
        remaining.push(item);
      }
    }

    localStorage.setItem(this.KEY, JSON.stringify(remaining));
    if (remaining.length === 0 && queue.length > 0) {
      console.log('✅ Cola offline vaciada completamente');
    }
  }
};

/**
 * Verifica si hay conexión a internet
 * @returns {boolean} True si hay conexión
 */
function isOnline() {
  return navigator.onLine;
}

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
  localStorage.removeItem("avatarPhoto");
  localStorage.removeItem("bibliotech_offline_queue");
  window.location.href = "index.html";
}

/**
 * Realiza una petición fetch con el token de autenticación
 * Si no hay conexión y es una petición de escritura, la encola para procesarla al reconectar
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

  if (!navigator.onLine && options.method && options.method !== 'GET') {
    try {
      OfflineQueue.enqueue({
        url: url,
        method: options.method,
        headers: options.headers || {},
        body: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : null
      });
    } catch (qErr) {
      console.warn('⚠️ No se pudo encolar la petición offline:', qErr);
    }
    return new Response(JSON.stringify({ success: true, offline: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    return await fetch(url, options);
  } catch (networkErr) {
    console.error(`❌ Fallo de red en authFetch (${url}):`, networkErr.message);
    return new Response(JSON.stringify({
      success: false,
      message: networkErr.message || 'Error de conexión. Inténtalo de nuevo.'
    }), {
      status: 0,
      statusText: 'Network Error',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ===================================
// INICIALIZACIÓN
// ===================================
OfflineQueue.init();
