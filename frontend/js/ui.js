// ==========================================================================
// UI GLOBAL — BiblioTech
// Funciones compartidas por todas las vistas con dashboard-layout.
// window.toggleSidebar se expone de inmediato (sin dependencias) para que
// los atributos onclick="toggleSidebar()" inline del HTML la encuentren.
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
     * Expone inmediatamente en window.toggleSidebar, sin dependencias.
     */
    global.toggleSidebar = function () {
        const sidebar = getSidebar();
        const overlay = getOverlay();
        if (sidebar) sidebar.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
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

    /**
     * Listener delegado al documento: captura clics en cualquier botón
     * con clase .menu-toggle o con un atributo onclick que invoque toggleSidebar(),
     * sin importar en qué página esté el usuario ni cuándo se renderice el botón.
     */
    function bindDelegatedMenuToggle() {
        if (document.documentElement.dataset.uiDelegatedBound === "1") return;
        document.documentElement.dataset.uiDelegatedBound = "1";
        document.addEventListener("click", function (e) {
            const target = e.target;
            if (!(target instanceof Element)) return;
            const trigger = target.closest(".menu-toggle, [onclick*='toggleSidebar'], [data-toggle='sidebar']");
            if (!trigger) return;
            e.preventDefault();
            if (typeof global.toggleSidebar === "function") {
                global.toggleSidebar();
            }
        });
    }

    function initUI() {
        bindMenuToggle();
        bindOverlayClose();
        bindEscapeClose();
        bindDelegatedMenuToggle();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initUI);
    } else {
        initUI();
    }
})(window);
