// ==========================================================================
// UI GLOBAL — BiblioTech
// ÚNICA FUENTE DE VERDAD del sidebar y marcado de enlace activo.
// No definir toggleSidebar ni listeners de menú en ningún otro script.
// ==========================================================================

(function (global) {
    "use strict";

    // ------------------------------------------------------------------
    // 1. Función de toggle — expuesta globalmente de inmediato.
    // ------------------------------------------------------------------
    global.toggleSidebar = function () {
        const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
        const overlay = document.getElementById("sidebar-overlay");
        if (sidebar) sidebar.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
    };

    // ------------------------------------------------------------------
    // 2. Normalización de rutas para marcar enlace activo.
    // ------------------------------------------------------------------
    function normalizePath(path) {
        if (!path) return "";
        const clean = path.split("?")[0].split("#")[0];
        const name = clean.split("/").pop().trim().toLowerCase();
        return name || "books.html";
    }

    function setActiveLink() {
        const current = normalizePath(window.location.pathname);

        // Limpiar .active de todos los enlaces del menú
        const menuLinks = document.querySelectorAll(".sidebar a.menu-item[href]");
        menuLinks.forEach((link) => link.classList.remove("active"));

        // Asignar .active solo al que coincida
        menuLinks.forEach((link) => {
            const target = normalizePath(link.getAttribute("href") || "");
            if (target === current) link.classList.add("active");
        });

        // Fallback: ruta raíz o index.html → marcar libros
        if (!current || current === "index.html") {
            const librosLink = document.getElementById("menu-libros");
            if (librosLink) librosLink.classList.add("active");
        }
    }

    // ------------------------------------------------------------------
    // 3. Delegación de eventos EN EL DOCUMENTO (único listener global)
    //    Captura clic en botón hamburguesa (#menuToggle / .menu-toggle)
    //    y clic en overlay (#sidebar-overlay) sin importar cuándo se
    //    rendericen (incluso si el DOM es dinámico).
    // ------------------------------------------------------------------
    function bindDelegatedEvents() {
        if (document.documentElement.dataset.uiDelegatedBound === "true") return;
        document.documentElement.dataset.uiDelegatedBound = "true";

        document.addEventListener("click", function (e) {
            const toggleBtn = e.target.closest("#menuToggle, .menu-toggle");
            const overlay = e.target.closest("#sidebar-overlay");

            if (toggleBtn) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof global.toggleSidebar === "function") {
                    global.toggleSidebar();
                }
            } else if (overlay) {
                if (typeof global.toggleSidebar === "function") {
                    global.toggleSidebar();
                }
            }
        });
    }

    // ------------------------------------------------------------------
    // 4. Tecla Escape para cerrar el sidebar cuando está abierto.
    // ------------------------------------------------------------------
    function bindEscapeClose() {
        if (document.documentElement.dataset.uiEscapeBound === "true") return;
        document.documentElement.dataset.uiEscapeBound = "true";

        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
            const overlay = document.getElementById("sidebar-overlay");
            if (sidebar && sidebar.classList.contains("active")) {
                sidebar.classList.remove("active");
                if (overlay) overlay.classList.remove("active");
            }
        });
    }

    // ------------------------------------------------------------------
    // 5. Init global.
    // ------------------------------------------------------------------
    function initUI() {
        bindDelegatedEvents();
        bindEscapeClose();
        setActiveLink();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initUI);
    } else {
        initUI();
    }
})(window);
