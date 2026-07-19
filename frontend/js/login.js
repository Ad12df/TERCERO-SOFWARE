// ==========================================================================
// LÓGICA DE CONTROL DEL LOGIN Y REGISTRO (CON TRANSICIÓN DESLIZANTE SUAVE)
// ==========================================================================

// Elementos de la interfaz recuperados del DOM
const authWrapper = document.getElementById("authWrapper");
const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const goToRegister = document.getElementById("goToRegister");
const goToLogin = document.getElementById("goToLogin");
const forgotPassword = document.getElementById("forgotPassword");

/**
 * Función para alternar la vista hacia el formulario de REGISTRO (Crear Cuenta)
 * @param {Event} event - Objeto del evento de clic
 */
function switchToRegister(event) {
  if (event) event.preventDefault(); // Evita la recarga por defecto de los enlaces

  // Activa la clase deslizante en el contenedor principal (Desktop)
  authWrapper.classList.add("right-panel-active");
  
  // Alterna clases activas de los paneles internos (útil en diseño móvil y accesibilidad)
  loginPanel.classList.remove("active");
  registerPanel.classList.add("active");

  // Limpia los mensajes anteriores para ofrecer una interfaz limpia
  clearMessages();
}

/**
 * Función para alternar la vista hacia el formulario de LOGIN (Iniciar Sesión)
 * @param {Event} event - Objeto del evento de clic
 */
function switchToLogin(event) {
  if (event) event.preventDefault(); // Evita la recarga por defecto de los enlaces

  // Remueve la clase deslizante en el contenedor principal (Desktop)
  authWrapper.classList.remove("right-panel-active");
  
  // Alterna clases activas de los paneles internos (útil en diseño móvil y accesibilidad)
  loginPanel.classList.add("active");
  registerPanel.classList.remove("active");

  // Limpia los mensajes anteriores para ofrecer una interfaz limpia
  clearMessages();
}

/**
 * Función auxiliar para limpiar todos los mensajes de error/éxito de la pantalla
 */
function clearMessages() {
  document.getElementById("loginMessage").textContent = "";
  document.getElementById("loginMessage").classList.remove("success");
  document.getElementById("registerMessage").textContent = "";
  document.getElementById("registerMessage").classList.remove("success");
}

/**
 * Función para mostrar retroalimentación en forma de mensajes en la pantalla
 * @param {string} elementId - ID del elemento HTML donde renderizar el mensaje
 * @param {string} text - Texto del mensaje a desplegar
 * @param {boolean} isSuccess - Especifica si el mensaje es de éxito (true) o error (false)
 */
function showMessage(elementId, text, isSuccess = false) {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.classList.toggle("success", isSuccess);
}

/**
 * Función asíncrona para iniciar sesión conectando con el backend
 */
async function login() {
  const contact = document.getElementById("loginContact").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Validación de campos completos en el formulario de login
  if (!contact || !password) {
    showMessage("loginMessage", "Complete los campos");
    return;
  }

  try {
    // Solicitud POST hacia el endpoint de login del backend
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: contact,
        password: password,
      }),
    });

    const data = await response.json();

    // Verificación del estado de respuesta del servidor
    if (!response.ok) {
      showMessage("loginMessage", data.message || "Error al iniciar sesión");
      return;
    }

    // Login exitoso - el backend responde con { success, message, data: { id, name, email, role } }
    // Si el backend no envía token, se genera uno simulado en Base64 (mismo formato que usa el backend)
    // para que el frontend no se rompa al buscar data.token y authFetch pueda adjuntarlo en cabeceras.
    const userData = data.data || data.user || data;
    const token =
      data.token ||
      btoa(
        JSON.stringify({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          iat: Date.now(),
        }),
      );

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      }),
    );

    // Redirección hacia el gestor de libros/biblioteca una vez logueado
    window.location.href = "books.html";
  } catch {
    // Manejo de errores de conexión de red
    showMessage("loginMessage", "No se pudo conectar con el servidor");
  }
}

/**
 * Función asíncrona para registrar un usuario nuevo conectando con el backend
 */
async function register() {
  const name = document.getElementById("registerName").value.trim();
  const contact = document.getElementById("registerContact").value.trim();
  const password = document.getElementById("registerPassword").value;

  // Validación de campos completos en el formulario de registro
  if (!name || !contact || !password) {
    showMessage("registerMessage", "Complete todos los campos");
    return;
  }

  // Validación de longitud mínima de contraseña
  if (password.length < 6) {
    showMessage("registerMessage", "La contraseña debe tener al menos 6 caracteres");
    return;
  }

  try {
    // Solicitud POST hacia el endpoint de registro del backend
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: contact,
        password: password,
      }),
    });

    const data = await response.json();

    // Verificación del estado de respuesta del servidor
    if (!response.ok) {
      showMessage("registerMessage", data.message || "Error al registrar");
      return;
    }

    // Registro completado satisfactoriamente
    showMessage("registerMessage", "Cuenta creada. Inicia sesión.", true);

    // Limpieza de campos del formulario
    document.getElementById("registerName").value = "";
    document.getElementById("registerContact").value = "";
    document.getElementById("registerPassword").value = "";

    // Temporizador para alternar fluidamente a la pantalla de Login automáticamente
    setTimeout(() => {
      switchToLogin();
      document.getElementById("loginContact").value = contact;
    }, 1200);
  } catch {
    // Manejo de errores de conexión de red
    showMessage("registerMessage", "No se pudo conectar con el servidor");
  }
}

// Registro de eventos para intercambiar pantallas con clics
goToRegister.addEventListener("click", switchToRegister);
goToLogin.addEventListener("click", switchToLogin);

// Mensaje preliminar para la recuperación de contraseña
forgotPassword.addEventListener("click", (event) => {
  event.preventDefault();
  showMessage("loginMessage", "Función disponible próximamente");
});

// Listener de redimensionamiento de pantalla para mantener una sincronización correcta de clases de estado activo
window.addEventListener("resize", () => {
  const showingRegister = authWrapper.classList.contains("right-panel-active");
  loginPanel.classList.toggle("active", !showingRegister);
  registerPanel.classList.toggle("active", showingRegister);
});
