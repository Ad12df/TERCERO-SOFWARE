// ==========================================================================
// UI GLOBAL — BiblioTech
// Funciones compartidas por todas las vistas con dashboard-layout.
// Este archivo DEBE cargarse antes que los scripts específicos de cada página
// para garantizar que toggleSidebar() y utilidades de UI existan en scope.
// ==========================================================================

(function (global) {
    "use strict";

    function getSidebar() {
        return document.getElementById("sidebar") || document.querySelector(".sidebar");
    }

    function getOverlay() {
        return document.getElementById("sidebar-overlay");
    }

    /**
     * Alterna el menú lateral en móviles.
     * Busca #sidebar (con fallback a .sidebar) y alterna .active.
     * Hace lo propio con #sidebar-overlay si existe.
     * Expuesta en window.toggleSidebar para que los atributos
     * onclick="toggleSidebar()" inline del HTML la encuentren.
     */
    global.toggleSidebar = function () {
        const sidebar = getSidebar();
        if (!sidebar) return;
        sidebar.classList.toggle("active");

        const overlay = getOverlay();
        if (overlay) {
            overlay.classList.toggle("active");
            overlay.setAttribute(
                "aria-hidden",
                String(!overlay.classList.contains("active"))
            );
        }
    };

    function bindMenuToggle() {
        const btn = document.getElementById("menuToggle");
        if (!btn || btn.dataset.uiBound === "1") return;
        btn.dataset.uiBound = "1";
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            if (typeof global.toggleSidebar === "function") {
                global.toggleSidebar();
            }
        });
    }

    function bindOverlayClose() {
        const overlay = getOverlay();
        if (!overlay || overlay.dataset.uiBound === "1") return;
        overlay.dataset.uiBound = "1";
        overlay.addEventListener("click", function () {
            if (typeof global.toggleSidebar === "function") {
                global.toggleSidebar();
            }
        });
    }

    function bindEscapeClose() {
        if (document.documentElement.dataset.uiEscapeBound === "1") return;
        document.documentElement.dataset.uiEscapeBound = "1";
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            const sidebar = getSidebar();
            if (sidebar && sidebar.classList.contains("active")) {
                if (typeof global.toggleSidebar === "function") {
                    global.toggleSidebar();
                }
            }
        });
    }

    function initUI() {
        bindMenuToggle();
        bindOverlayClose();
        bindEscapeClose();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initUI);
    } else {
        initUI();
    }
})(window);
