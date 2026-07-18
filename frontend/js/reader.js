/**
 * reader.js - Controlador del Lector de PDF (Theater Mode)
 * BiblioTech - Lector cinematográfico basado en PDF.js (Mozilla)
 */

(function() {
    'use strict';

    // ===================================
    // CONFIGURACIÓN DE PDF.js
    // ===================================
    if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    // ===================================
    // ESTADO DEL LECTOR
    // ===================================
    const state = {
        bookId: null,
        book: null,
        pdfDoc: null,
        currentPage: 1,
        totalPages: 0,
        scale: 1.0,
        renderTask: null,
        isFullscreen: false,
        isLoading: true,
        fitMode: 'width', // 'width' | 'height' | 'page'
        hideTimer: null,
        preferences: {
            theme: 'dark',
            fontSize: 100
        }
    };

    // ===================================
    // ELEMENTOS DEL DOM
    // ===================================
    const elements = {
        // Header
        btnBack: document.getElementById('btnBack'),
        readerTitle: document.getElementById('readerTitle'),
        pageIndicator: document.getElementById('pageIndicator'),
        currentPage: document.getElementById('currentPage'),
        totalPages: document.getElementById('totalPages'),
        btnSettings: document.getElementById('btnSettings'),

        // PDF Viewer
        pdfViewer: document.getElementById('pdfViewer'),
        pdfCanvas: document.getElementById('pdfCanvas'),
        pdfPlaceholder: document.getElementById('pdfPlaceholder'),

        // Controls
        controlsPill: document.getElementById('controlsPill'),
        btnPrev: document.getElementById('btnPrev'),
        btnNext: document.getElementById('btnNext'),
        btnFullscreen: document.getElementById('btnFullscreen'),
        btnFit: document.getElementById('btnFit'),
        btnInfo: document.getElementById('btnInfo'),

        // Info Modal
        infoModal: document.getElementById('infoModal'),
        btnCloseModal: document.getElementById('btnCloseModal'),
        infoBookTitle: document.getElementById('infoBookTitle'),
        infoBookAuthor: document.getElementById('infoBookAuthor'),
        infoTotalPages: document.getElementById('infoTotalPages'),
        infoLastRead: document.getElementById('infoLastRead'),
        infoProgressFill: document.getElementById('infoProgressFill'),
        infoProgressText: document.getElementById('infoProgressText'),

        // Settings Modal
        settingsModal: document.getElementById('settingsModal'),
        btnCloseSettings: document.getElementById('btnCloseSettings'),
        themeButtons: document.querySelectorAll('.theme-btn'),
        btnFontDecrease: document.getElementById('btnFontDecrease'),
        btnFontIncrease: document.getElementById('btnFontIncrease'),
        fontSizeValue: document.getElementById('fontSizeValue'),

        // Toast
        toastNotification: document.getElementById('toastNotification'),
        toastMessage: document.getElementById('toastMessage')
    };

    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        state.bookId = urlParams.get('id');

        if (!state.bookId) {
            showToast('Error: No se especificó el libro');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            return;
        }

        loadPreferences();
        loadBook();
        setupEventListeners();
        setupAutoHide();
    }

    // ===================================
    // CARGAR DATOS DEL LIBRO
    // ===================================
    function loadBook() {
        const books = JSON.parse(localStorage.getItem('bibliotech_books') || '[]');
        state.book = books.find(b => b.id == state.bookId);

        if (!state.book) {
            state.book = {
                id: state.bookId,
                title: 'El Título del Libro',
                author: 'Autor Desconocido',
                totalPages: 0,
                currentPage: 1,
                lastRead: new Date().toISOString()
            };
        }

        updateBookInfo();

        if (state.book.currentPage) {
            state.currentPage = state.book.currentPage;
        }

        loadPDF();
    }

    function updateBookInfo() {
        elements.readerTitle.textContent = state.book.title || 'Sin título';
        elements.currentPage.textContent = state.currentPage;
        elements.totalPages.textContent = state.book.totalPages || state.totalPages || '...';

        elements.infoBookTitle.textContent = state.book.title || 'Sin título';
        elements.infoBookAuthor.textContent = state.book.author || 'Autor desconocido';
        elements.infoTotalPages.textContent = state.book.totalPages || state.totalPages || '?';

        updateProgress();
    }

    function updateProgress() {
        const total = state.totalPages || state.book.totalPages || 1;
        const current = state.currentPage;
        const percentage = Math.round((current / total) * 100);

        elements.infoProgressFill.style.width = percentage + '%';
        elements.infoProgressText.textContent = percentage + '% completado';

        if (state.book.lastRead) {
            elements.infoLastRead.textContent = formatTimeAgo(new Date(state.book.lastRead));
        }
    }

    // ===================================
    // CARGAR PDF CON PDF.js
    // ===================================
    function loadPDF() {
        if (!window.pdfjsLib) {
            showToast('Error: PDF.js no está disponible');
            return;
        }

        const loadingTask = pdfjsLib.getDocument('prueba.pdf');

        loadingTask.promise.then(function(pdf) {
            state.pdfDoc = pdf;
            state.totalPages = pdf.numPages;
            state.book.totalPages = pdf.numPages;

            // Actualizar UI con el total real de páginas
            elements.totalPages.textContent = state.totalPages;
            elements.infoTotalPages.textContent = state.totalPages;
            updateProgress();

            // Asegurar que la página actual esté dentro del rango
            if (state.currentPage > state.totalPages) {
                state.currentPage = 1;
            }

            // Ocultar placeholder y renderizar primera página
            elements.pdfPlaceholder.style.display = 'none';
            renderPage(state.currentPage);
        }).catch(function(error) {
            console.error('Error al cargar el PDF:', error);
            elements.pdfPlaceholder.querySelector('.placeholder-title').textContent = 'Error al cargar';
            elements.pdfPlaceholder.querySelector('.placeholder-subtitle').textContent = 'No se pudo abrir el documento';
            showToast('Error al cargar el documento');
        });
    }

    // ===================================
    // RENDERIZAR PÁGINA EN CANVAS
    // ===================================
    function renderPage(pageNum) {
        if (!state.pdfDoc) return;

        // Cancelar render anterior si existe
        if (state.renderTask) {
            state.renderTask.cancel();
        }

        state.pdfDoc.getPage(pageNum).then(function(page) {
            const canvas = elements.pdfCanvas;
            const ctx = canvas.getContext('2d');

            // Calcular escala según el modo de ajuste
            const viewport = page.getViewport({ scale: 1.0 });
            const containerW = elements.pdfViewer.clientWidth;
            const containerH = elements.pdfViewer.clientHeight;

            let scale;
            if (state.fitMode === 'width') {
                scale = containerW / viewport.width;
            } else if (state.fitMode === 'height') {
                scale = containerH / viewport.height;
            } else {
                // 'page' - ajustar a la página completa
                scale = Math.min(containerW / viewport.width, containerH / viewport.height);
            }

            // Limitar escala mínima
            scale = Math.max(0.25, scale);
            state.scale = scale;

            const renderViewport = page.getViewport({ scale: scale });

            // Ajustar canvas al viewport del navegador (HiDPI)
            const outputScale = window.devicePixelRatio || 1;
            canvas.width = Math.floor(renderViewport.width * outputScale);
            canvas.height = Math.floor(renderViewport.height * outputScale);
            canvas.style.width = Math.floor(renderViewport.width) + 'px';
            canvas.style.height = Math.floor(renderViewport.height) + 'px';

            const renderContext = {
                canvasContext: ctx,
                viewport: renderViewport,
                transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
            };

            state.renderTask = page.render(renderContext);

            state.renderTask.promise.then(function() {
                state.isLoading = false;
                state.currentPage = pageNum;
                elements.currentPage.textContent = pageNum;
                saveProgress();
                updateProgress();
            }).catch(function(err) {
                if (err.name !== 'RenderingCancelledException') {
                    console.warn('Error de renderizado:', err);
                }
            });
        });
    }

    // ===================================
    // NAVEGACIÓN
    // ===================================
    function goToPage(pageNum) {
        const total = state.totalPages || state.book.totalPages || 1;

        if (pageNum < 1) pageNum = 1;
        if (pageNum > total) pageNum = total;

        if (pageNum === state.currentPage) return;

        renderPage(pageNum);
        showToast(`Página ${pageNum} de ${total}`);
    }

    function nextPage() {
        goToPage(state.currentPage + 1);
    }

    function prevPage() {
        goToPage(state.currentPage - 1);
    }

    // ===================================
    // MODO DE AJUSTE (FIT)
    // ===================================
    function toggleFitMode() {
        const modes = ['width', 'height', 'page'];
        const labels = {
            'width': 'Ajustar a ancho',
            'height': 'Ajustar a alto',
            'page': 'Página completa'
        };
        const currentIdx = modes.indexOf(state.fitMode);
        state.fitMode = modes[(currentIdx + 1) % modes.length];
        showToast(labels[state.fitMode]);
        renderPage(state.currentPage);
    }

    // ===================================
    // PANTALLA COMPLETA
    // ===================================
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                state.isFullscreen = true;
                updateFullscreenButton();
            }).catch(() => {
                showToast('No se pudo entrar en pantalla completa');
            });
        } else {
            document.exitFullscreen().then(() => {
                state.isFullscreen = false;
                updateFullscreenButton();
            });
        }
    }

    function updateFullscreenButton() {
        const iconExpand = elements.btnFullscreen.querySelector('.icon-expand');
        const iconCollapse = elements.btnFullscreen.querySelector('.icon-collapse');

        if (state.isFullscreen) {
            iconExpand.style.display = 'none';
            iconCollapse.style.display = 'block';
            elements.btnFullscreen.classList.add('active');
        } else {
            iconExpand.style.display = 'block';
            iconCollapse.style.display = 'none';
            elements.btnFullscreen.classList.remove('active');
        }
    }

    // ===================================
    // AUTO-HIDE HEADER Y CONTROLES
    // ===================================
    function setupAutoHide() {
        let hideTimer = null;

        function showControls() {
            elements.btnBack.closest('.reader-header').classList.remove('hidden');
            elements.controlsPill.classList.remove('hidden');

            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                // No ocultar si hay un modal abierto
                if (!elements.infoModal.classList.contains('active') &&
                    !elements.settingsModal.classList.contains('active')) {
                    elements.btnBack.closest('.reader-header').classList.add('hidden');
                    elements.controlsPill.classList.add('hidden');
                }
            }, 3000);
        }

        document.addEventListener('mousemove', showControls);
        document.addEventListener('touchstart', showControls, { passive: true });

        // Mostrar controles inicialmente
        showControls();
    }

    // ===================================
    // MODALES
    // ===================================
    function openInfoModal() {
        elements.infoModal.classList.add('active');
    }

    function closeInfoModal() {
        elements.infoModal.classList.remove('active');
    }

    function openSettingsModal() {
        elements.settingsModal.classList.add('active');
    }

    function closeSettingsModal() {
        elements.settingsModal.classList.remove('active');
    }

    // ===================================
    // TEMAS
    // ===================================
    function setTheme(theme) {
        state.preferences.theme = theme;

        document.body.classList.remove('reader-dark', 'reader-light', 'reader-sepia', 'reader-darker');

        switch (theme) {
            case 'light':
                document.body.classList.add('reader-light');
                break;
            case 'sepia':
                document.body.classList.add('reader-sepia');
                break;
            case 'darker':
                document.body.classList.add('reader-darker');
                break;
            default:
                document.body.classList.add('reader-dark');
        }

        elements.themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        savePreferences();
        showToast(`Tema: ${getThemeName(theme)}`);
    }

    function getThemeName(theme) {
        const names = {
            'dark': 'Oscuro',
            'darker': 'Negro Profundo',
            'sepia': 'Sepia',
            'light': 'Claro'
        };
        return names[theme] || 'Oscuro';
    }

    // ===================================
    // TAMAÑO DE FUENTE (ZOOM)
    // ===================================
    function changeFontSize(delta) {
        state.preferences.fontSize = Math.max(50, Math.min(200, state.preferences.fontSize + delta));
        elements.fontSizeValue.textContent = state.preferences.fontSize + '%';

        // Aplicar zoom al renderizado del PDF
        const baseScale = state.scale || 1.0;
        const zoomFactor = state.preferences.fontSize / 100;
        state.scale = baseScale * zoomFactor;

        savePreferences();
        renderPage(state.currentPage);
        showToast(`Zoom: ${state.preferences.fontSize}%`);
    }

    // ===================================
    // PERSISTENCIA
    // ===================================
    function saveProgress() {
        if (state.book) {
            state.book.currentPage = state.currentPage;
            state.book.lastRead = new Date().toISOString();
            state.book.totalPages = state.totalPages || state.book.totalPages;

            const books = JSON.parse(localStorage.getItem('bibliotech_books') || '[]');
            const index = books.findIndex(b => b.id == state.bookId);

            if (index >= 0) {
                books[index] = state.book;
            } else {
                books.push(state.book);
            }

            localStorage.setItem('bibliotech_books', JSON.stringify(books));
        }
    }

    function savePreferences() {
        localStorage.setItem('bibliotech_preferences', JSON.stringify(state.preferences));
    }

    function loadPreferences() {
        const saved = localStorage.getItem('bibliotech_preferences');
        if (saved) {
            try {
                state.preferences = { ...state.preferences, ...JSON.parse(saved) };
                setTheme(state.preferences.theme);
                elements.fontSizeValue.textContent = state.preferences.fontSize + '%';
            } catch (e) {
                console.warn('Error cargando preferencias:', e);
            }
        }
    }

    // ===================================
    // TOAST NOTIFICATIONS
    // ===================================
    function showToast(message) {
        elements.toastMessage.textContent = message;
        elements.toastNotification.classList.add('active');

        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(() => {
            elements.toastNotification.classList.remove('active');
        }, 2500);
    }

    // ===================================
    // UTILIDADES
    // ===================================
    function formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Hace un momento';
        if (minutes < 60) return `Hace ${minutes} minutos`;
        if (hours < 24) return `Hace ${hours} horas`;
        if (days === 1) return 'Ayer';
        if (days < 7) return `Hace ${days} días`;
        if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
        return date.toLocaleDateString('es-ES');
    }

    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        // Navegación
        elements.btnPrev.addEventListener('click', prevPage);
        elements.btnNext.addEventListener('click', nextPage);

        // Pantalla completa
        elements.btnFullscreen.addEventListener('click', toggleFullscreen);

        // Ajustar a pantalla (toggle entre modos)
        elements.btnFit.addEventListener('click', toggleFitMode);

        // Info modal
        elements.btnInfo.addEventListener('click', openInfoModal);
        elements.btnCloseModal.addEventListener('click', closeInfoModal);
        elements.infoModal.addEventListener('click', (e) => {
            if (e.target === elements.infoModal) closeInfoModal();
        });

        // Settings modal
        elements.btnSettings.addEventListener('click', openSettingsModal);
        elements.btnCloseSettings.addEventListener('click', closeSettingsModal);
        elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) closeSettingsModal();
        });

        // Temas
        elements.themeButtons.forEach(btn => {
            btn.addEventListener('click', () => setTheme(btn.dataset.theme));
        });

        // Tamaño de fuente
        elements.btnFontDecrease.addEventListener('click', () => changeFontSize(-10));
        elements.btnFontIncrease.addEventListener('click', () => changeFontSize(10));

        // Volver atrás → book-detail.html
        elements.btnBack.addEventListener('click', () => {
            saveProgress();
            window.location.href = `book-detail.html?id=${state.bookId}`;
        });

        // Teclado
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    prevPage();
                    break;
                case 'ArrowRight':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    nextPage();
                    break;
                case 'Home':
                    goToPage(1);
                    break;
                case 'End':
                    goToPage(state.totalPages || state.book?.totalPages || 1);
                    break;
                case 'Escape':
                    if (elements.infoModal.classList.contains('active')) {
                        closeInfoModal();
                    } else if (elements.settingsModal.classList.contains('active')) {
                        closeSettingsModal();
                    } else if (state.isFullscreen) {
                        toggleFullscreen();
                    }
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen();
                    break;
            }
        });

        // Fullscreen change
        document.addEventListener('fullscreenchange', () => {
            state.isFullscreen = !!document.fullscreenElement;
            updateFullscreenButton();
        });

        // Click en el visor para mostrar/ocultar controles
        elements.pdfViewer.addEventListener('click', (e) => {
            if (e.target === elements.pdfCanvas || e.target === elements.pdfViewer) {
                elements.controlsPill.classList.toggle('hidden');
            }
        });

        // Gestos táctiles (swipe)
        let touchStartX = 0;
        let touchEndX = 0;

        elements.pdfViewer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        elements.pdfViewer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const diff = touchStartX - touchEndX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextPage();
                } else {
                    prevPage();
                }
            }
        }

        // Re-renderizar al cambiar el tamaño de ventana
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (state.pdfDoc) {
                    renderPage(state.currentPage);
                }
            }, 300);
        });
    }

    // ===================================
    // INICIAR
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();