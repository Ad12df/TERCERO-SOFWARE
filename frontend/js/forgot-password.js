/**
 * ============================================================
 * BiblioTech — Lógica de "Olvidé mi contraseña"
 * ============================================================
 *
 * Flujo:
 *  1. El usuario escribe su correo en forgot-password.html
 *  2. Se envía POST /api/auth/forgot-password
 *  3. El backend responde siempre con el mismo mensaje
 *     (anti-enumeración), exista o no el correo.
 *  4. Se muestra un mensaje de confirmación al usuario.
 *
 * Seguridad:
 *  - Se usa textContent para evitar XSS
 *  - Se previene el doble envío del formulario
 *  - Se valida el formato del correo en el cliente
 *  - No se revela si el correo existe o no
 * ============================================================
 */

(function () {
  "use strict";

  // ─── Referencias del DOM ────────────────────────────────────
  const form = document.getElementById("forgotPasswordForm");
  const emailInput = document.getElementById("email");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const btnSpinner = document.getElementById("btnSpinner");
  const formMessage = document.getElementById("formMessage");

  // ─── Configuración de la API ─────────────────────────────────
  //    Se obtiene desde api.js si está disponible, o se usa un fallback.
  const API_URL =
    (typeof API_URL !== "undefined" ? API_URL : null) ||
    "https://tercero-sofware.onrender.com/api";

  // ─── Estado de envío ────────────────────────────────────────
  let isSubmitting = false;

  // ─── Utilidades ─────────────────────────────────────────────

  /**
   * Muestra un mensaje en el contenedor de feedback.
   * Usa textContent para prevenir XSS.
   * @param {string} msg - Texto a mostrar
   * @param {"error"|"success"|"info"} type - Tipo de mensaje
   */
  function showMessage(msg, type) {
    formMessage.textContent = msg;
    formMessage.classList.remove("is-error", "is-success", "is-info");
    formMessage.classList.add("is-" + type);
  }

  /** Limpia el mensaje de feedback */
  function clearMessage() {
    formMessage.textContent = "";
    formMessage.classList.remove("is-error", "is-success", "is-info");
  }

  /**
   * Activa/desactiva el estado de carga del botón.
   * @param {boolean} loading - true para mostrar spinner, false para ocultar
   */
  function setLoading(loading) {
    isSubmitting = loading;
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
    btnText.textContent = loading ? "Enviando…" : "Enviar enlace";
    btnSpinner.hidden = !loading;
  }

  /**
   * Valida el formato de un correo electrónico.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // ─── Manejador del formulario ────────────────────────────────

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessage();

    // ─── Prevenir doble envío ──────────────────────────────────
    if (isSubmitting) return;

    // ─── Validar campo email ───────────────────────────────────
    const email = emailInput.value.trim();

    if (!email) {
      showMessage("Por favor, ingresa tu correo electrónico.", "error");
      emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("El formato del correo electrónico no es válido.", "error");
      emailInput.focus();
      return;
    }

    // ─── Enviar solicitud al backend ──────────────────────────
    setLoading(true);

    try {
      const response = await fetch(API_URL + "/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      // ─── Respuesta exitosa (siempre 200, anti-enumeración) ───
      if (response.ok) {
        showMessage(
          "Si el correo está registrado, recibirás un enlace de recuperación en breve.",
          "success"
        );
        form.reset();
      } else {
        // El backend puede devolver 400 por formato inválido
        showMessage(
          data.message || "Ocurrió un error. Inténtalo de nuevo.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error de red:", error);
      showMessage(
        "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  // ─── Inicialización ──────────────────────────────────────────
  form.addEventListener("submit", handleSubmit);

  // Limpiar mensaje al empezar a escribir
  emailInput.addEventListener("input", clearMessage);
})();
