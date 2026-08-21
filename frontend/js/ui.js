// ==========================================================================
// UI GLOBAL — BiblioTech
// Lógica simple para toggle de menú lateral y marca de enlace activo.
// ==========================================================================

(function (global) {
  "use strict";

  // ------------------------------------------------------------------
  // 1. Función principal de toggle — expuesta globalmente de inmediato
  //    para que los atributos onclick="toggleSidebar()" inline del HTML
  //    la encuentren sin depender de DOMContentLoaded.
  // ------------------------------------------------------------------
  global.toggleSidebar = function () {
    const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (sidebar) sidebar.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active");
  };

  // ------------------------------------------------------------------
  // 2. Marcar visualmente la opción del menú que corresponde a la
  //    página actual mediante la clase .active.
  // ------------------------------------------------------------------
  function normalizePath(path) {
    if (!path) return "";
    const clean = path.split("?")[0].split("#")[0];
    const name = clean.split("/").pop().trim().toLowerCase();
    return name || "books.html";
  }

  function setActiveLink() {
    const current = normalizePath(window.location.pathname);

    // Sidebar: enlaces de navegación principales (con href)
    const menuLinks = document.querySelectorAll(".sidebar a.menu-item[href]");
    menuLinks.forEach((link) => {
      link.classList.remove("active");
      const target = normalizePath(link.getAttribute("href") || "");
      if (target === current) {
        link.classList.add("active");
      }
    });

    // Fallback especial: ruta raíz "/" o "index.html" del dashboard → libros
    if (!current || current === "index.html") {
      const librosLink = document.getElementById("menu-libros");
      if (librosLink) librosLink.classList.add("active");
    }
  }

  // ------------------------------------------------------------------
  // 3. Init: adjuntar listeners que faltan y marcar enlace activo
  //    (el botón hamburguesa ya usa onclick="toggleSidebar()" inline,
  //     así que NO añadimos un addEventListener para no doblar toggle).
  // ------------------------------------------------------------------
  function initUI() {
    // a) Overlay para cerrar al tocar fuera del sidebar en móvil
    const overlay = document.getElementById("sidebar-overlay");
    if (overlay && !overlay.dataset.uiBound) {
      overlay.dataset.uiBound = "true";
      overlay.addEventListener("click", function () {
        if (typeof global.toggleSidebar === "function") {
          global.toggleSidebar();
        }
      });
    }

    // b) Tecla Escape para cerrar el sidebar cuando está abierto
    if (document.documentElement.dataset.uiEscapeBound !== "true") {
      document.documentElement.dataset.uiEscapeBound = "true";
      document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
        const ov = document.getElementById("sidebar-overlay");
        if (sidebar && sidebar.classList.contains("active")) {
          sidebar.classList.remove("active");
          if (ov) ov.classList.remove("active");
        }
      });
    }

    // c) Marcar la opción de menú activa según la URL actual
    setActiveLink();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI);
  } else {
    initUI();
  }
})(window);
