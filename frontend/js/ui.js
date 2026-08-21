// ==========================================================================
// UI GLOBAL — BiblioTech
// Lógica simple para toggle de menú lateral en dispositivos móviles.
// ==========================================================================

(function (global) {
  "use strict";

  // Función principal expuesta globalmente
  global.toggleSidebar = function () {
    const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (sidebar) sidebar.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active");
  };

  function initUI() {
    // 1. Clic directo en botón hamburguesa si existe
    const menuToggle = document.getElementById("menuToggle") || document.querySelector(".menu-toggle");
    if (menuToggle && !menuToggle.dataset.bound) {
      menuToggle.dataset.bound = "true";
      menuToggle.addEventListener("click", function (e) {
        e.preventDefault();
        global.toggleSidebar();
      });
    }

    // 2. Clic en el overlay para cerrar
    const overlay = document.getElementById("sidebar-overlay");
    if (overlay && !overlay.dataset.bound) {
      overlay.dataset.bound = "true";
      overlay.addEventListener("click", function () {
        global.toggleSidebar();
      });
    }

    // 3. Tecla Escape para cerrar
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
        const overlay = document.getElementById("sidebar-overlay");
        if (sidebar && sidebar.classList.contains("active")) {
          sidebar.classList.remove("active");
          if (overlay) overlay.classList.remove("active");
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI);
  } else {
    initUI();
  }
})(window);
