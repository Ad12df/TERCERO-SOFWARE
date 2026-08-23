/**
 * ============================================================
 * Click y Lee — Lógica de "Restablecer contraseña"
 * ============================================================
 *
 * Flujo:
 *  1. El usuario llega desde el enlace del correo:
 *       reset-password.html?token=xxxx
 *  2. Se extrae el token de la URL y se coloca en un campo oculto.
 *  3. El usuario escribe y confirma su nueva contraseña.
 *  4. Se envía POST /api/auth/reset-password con { token, newPassword }
 *  5. Si todo es correcto, se redirige a index.html para iniciar sesión.
 *
 * Seguridad:
 *  - Se usa textContent para evitar XSS
 *  - Se previene el doble envío del formulario
 *  - Se valida que las contraseñas coincidan en el cliente
 *  - Se valida la longitud mínima (6 caracteres)
 *  - El token nunca se muestra al usuario
 * ============================================================
 */

(function () {
  "use strict";

  // ─── Referencias del DOM ────────────────────────────────────
  const form = document.getElementById("resetPasswordForm");
  const tokenInput = document.getElementById("token");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const btnSpinner = document.getElementById("btnSpinner");
  const formMessage = document.getElementById("formMessage");

  // ─── Configuración de la API ─────────────────────────────────
  //    Se usa la variable global definida en api.js (cargado antes en el HTML).
  //    Si por algún motivo no existiera, se usa un fallback hardcoded.
  //    Nota: no se puede usar window.API_URL porque api.js declara const
  //    (no se asigna a window en scripts clásicos). Se accede directamente
  //    a la variable global mediante eval indirecto para evitar el TDZ.
  var API_BASE = (function () {
    try {
      return API_URL; // Variable global de api.js
    } catch (e) {
      return "https://tercero-sofware.onrender.com/api";
    }
  })();

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
    btnText.textContent = loading ? "Procesando…" : "Restablecer contraseña";
    btnSpinner.hidden = !loading;
  }

  /**
   * Obtiene el valor de un parámetro de la URL.
   * @param {string} name - Nombre del parámetro
   * @returns {string|null}
   */
  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // ─── Inicialización: extraer token de la URL ────────────────

  var token = getQueryParam("token");

  if (!token) {
    showMessage(
      "Enlace inválido. Solicita un nuevo enlace de recuperación.",
      "error"
    );
    submitBtn.disabled = true;
    form.style.pointerEvents = "none";
  } else {
    tokenInput.value = token;
  }

  // ─── Manejador del formulario ────────────────────────────────

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessage();

    // ─── Prevenir doble envío ──────────────────────────────────
    if (isSubmitting) return;

    // ─── Validar que exista el token ──────────────────────────
    if (!tokenInput.value) {
      showMessage("Token no encontrado. Solicita un nuevo enlace.", "error");
      return;
    }

    // ─── Validar contraseñas ──────────────────────────────────
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!newPassword) {
      showMessage("Por favor, ingresa tu nueva contraseña.", "error");
      newPasswordInput.focus();
      return;
    }

    if (newPassword.length < 6) {
      showMessage("La contraseña debe tener al menos 6 caracteres.", "error");
      newPasswordInput.focus();
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Las contraseñas no coinciden.", "error");
      confirmPasswordInput.focus();
      return;
    }

    // ─── Enviar solicitud al backend ──────────────────────────
    setLoading(true);

    try {
      const response = await fetch(API_BASE + "/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenInput.value,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage("¡Contraseña actualizada correctamente!", "success");
        form.reset();
        // Redirigir al login después de 2 segundos
        setTimeout(function () {
          window.location.href = "index.html";
        }, 2000);
      } else {
        showMessage(
          data.message || "No se pudo restablecer la contraseña.",
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
  newPasswordInput.addEventListener("input", clearMessage);
  confirmPasswordInput.addEventListener("input", clearMessage);
})();
