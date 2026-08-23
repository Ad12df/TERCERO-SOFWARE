// ==========================================================================
// DESCARGADOS — BiblioTech (Solo APK)
// ==========================================================================

let downloadedBooks = [];

// Claves de almacenamiento local
const DOWNLOADED_KEY = "bibliotech_downloaded_books"; // libros marcados como descargados
const PROGRESS_KEY = "bibliotech_books";              // progreso de lectura local
const PDF_DB_NAME = "bibliotech_pdf_cache";           // IndexedDB con los PDFs cacheados
const PDF_STORE = "pdfs";

document.addEventListener("DOMContentLoaded", () => {
    if (!isAuthenticated()) {
        window.location.href = "index.html";
        return;
    }
    initializeProfile();
    loadDownloadedBooks();
});

/**
 * Recupera el usuario logueado desde localStorage y actualiza la UI
 */
function initializeProfile() {
    const user = getUserData();
    const profileEmail = document.getElementById("profileEmail");
    const profileName = document.getElementById("profileName");

    if (user) {
        if (profileEmail) profileEmail.textContent = user.email || "";
        if (profileName) profileName.textContent = user.name || user.email || "";
    } else {
        if (profileEmail) profileEmail.textContent = "visitante@bibliotech.com";
        if (profileName) profileName.textContent = "Visitante";
    }

    if (typeof window.renderGlobalAvatar === "function") {
        window.renderGlobalAvatar();
    }
}

/**
 * Cierra la sesión del usuario y redirige al login
 */
function logout() {
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("avatarPhoto");
        localStorage.removeItem("bibliotech_offline_queue");
    } catch (e) {
        console.warn("Error al limpiar sesión:", e);
    }
    window.location.replace("index.html");
}

/**
 * Carga los libros descargados localmente.
 * Combina la lista de libros descargados (localStorage) con el progreso
 * de lectura guardado y verifica qué PDFs existen realmente en IndexedDB.
 */
async function loadDownloadedBooks() {
    const grid = document.getElementById("downloadedGrid");
    if (!grid) return;

    try {
        // 1. Lista de libros marcados como descargados
        let downloaded = [];
        try {
            downloaded = JSON.parse(localStorage.getItem(DOWNLOADED_KEY)) || [];
        } catch (e) {
            downloaded = [];
        }

        // 2. Progreso de lectura local (para mostrar % y última página)
        let progress = [];
        try {
            progress = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || [];
        } catch (e) {
            progress = [];
        }

        // 3. IDs de PDFs realmente cacheados en IndexedDB
        const cachedIds = await getCachedPdfIds();

        // Si no hay nada descargado, mostrar estado vacío
        if (downloaded.length === 0) {
            renderEmpty("Aún no has descargado ningún libro. Descarga un libro para leerlo sin conexión.");
            return;
        }

        // Combinar datos: progreso + estado de caché
        downloadedBooks = downloaded.map((book) => {
            const prog = progress.find((p) => String(p.id) === String(book.id));
            return {
                ...book,
                currentPage: prog ? prog.currentPage : 0,
                totalPages: prog ? prog.totalPages : 0,
                lastRead: prog ? prog.lastRead : null,
                hasPdf: cachedIds.has(String(book.id)),
            };
        });

        renderDownloadedBooks(downloadedBooks);
    } catch (err) {
        console.error("❌ Error cargando Descargados:", err);
        renderError("No se pudieron cargar tus libros descargados");
    }
}

/**
 * Obtiene los IDs de los libros cuyo PDF está cacheado en IndexedDB.
 * @returns {Promise<Set<string>>} Conjunto de IDs con PDF disponible
 */
function getCachedPdfIds() {
    return new Promise((resolve) => {
        if (typeof indexedDB === "undefined") {
            resolve(new Set());
            return;
        }
        const request = indexedDB.open(PDF_DB_NAME, 1);
        request.onerror = () => resolve(new Set());
        request.onsuccess = () => {
            const db = request.result;
            try {
                const tx = db.transaction(PDF_STORE, "readonly");
                const store = tx.objectStore(PDF_STORE);
                const keysReq = store.getAllKeys();
                keysReq.onsuccess = () => {
                    const ids = new Set();
                    (keysReq.result || []).forEach((key) => {
                        // Las claves tienen la forma 'pdf_cache_book_<id>'
                        const match = String(key).match(/pdf_cache_book_(.+)$/);
                        if (match) ids.add(match[1]);
                    });
                    resolve(ids);
                };
                keysReq.onerror = () => resolve(new Set());
            } catch (e) {
                resolve(new Set());
            }
        };
    });
}

/**
 * Renderiza la lista de libros descargados
 * @param {Array} books - Lista de libros descargados
 */
function renderDownloadedBooks(books) {
    const grid = document.getElementById("downloadedGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (!books || books.length === 0) {
        renderEmpty("Aún no has descargado ningún libro. Descarga un libro para leerlo sin conexión.");
        return;
    }

    books.forEach((book, index) => {
        const card = document.createElement("div");
        card.className = "horizontal-book-card";
        card.style.animationDelay = `${index * 0.08}s`;

        const coverHtml = book.foto
            ? `<img src="${book.foto}" alt="${escapeHtml(book.nombre)}">`
            : `<div class="hbc-cover-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
            </div>`;

        // Barra de progreso si hay progreso guardado
        const progressHtml = book.totalPages > 0
            ? `<div class="hbc-progress">
                <div class="hbc-progress-bar">
                    <div class="hbc-progress-fill" style="width: ${Math.min(100, Math.round((book.currentPage / book.totalPages) * 100))}%"></div>
                </div>
                <span class="hbc-progress-text">${Math.min(100, Math.round((book.currentPage / book.totalPages) * 100))}% · Pág. ${book.currentPage}/${book.totalPages}</span>
              </div>`
            : "";

        // Indicador de disponibilidad offline
        const offlineBadge = book.hasPdf
            ? `<span class="hbc-badge hbc-badge-online">● Disponible sin conexión</span>`
            : `<span class="hbc-badge hbc-badge-warning">PDF no disponible</span>`;

        card.innerHTML = `
            ${coverHtml}
            <div class="hbc-info">
                <h4 class="hbc-title">${escapeHtml(book.nombre)}</h4>
                <p class="hbc-author">por ${escapeHtml(book.autor || "Autor desconocido")}</p>
                ${book.categoria ? `<span class="hbc-category">${escapeHtml(book.categoria)}</span>` : ""}
                ${offlineBadge}
                ${progressHtml}
            </div>
            <div class="hbc-actions">
                <button class="book-btn book-btn-edit" onclick="openReader(${book.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <span>Leer</span>
                </button>
                <button class="book-btn book-btn-delete" onclick="removeDownload(${book.id})" title="Eliminar descarga">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        card.addEventListener("click", (e) => {
            if (!e.target.closest(".book-btn")) {
                window.location.href = `book-detail.html?id=${book.id}`;
            }
        });

        grid.appendChild(card);
    });
}

/**
 * Abre el lector con el libro seleccionado
 * @param {number} bookId - ID del libro
 */
function openReader(bookId) {
    window.location.href = `reader.html?id=${bookId}`;
}

/**
 * Elimina un libro de la lista de descargados (localStorage + IndexedDB)
 * @param {number} bookId - ID del libro
 */
async function removeDownload(bookId) {
    try {
        // 1. Quitar de la lista de descargados
        let downloaded = [];
        try {
            downloaded = JSON.parse(localStorage.getItem(DOWNLOADED_KEY)) || [];
        } catch (e) {
            downloaded = [];
        }
        downloaded = downloaded.filter((b) => String(b.id) !== String(bookId));
        localStorage.setItem(DOWNLOADED_KEY, JSON.stringify(downloaded));

        // 2. Eliminar el PDF cacheado de IndexedDB
        await deleteCachedPdf(bookId);

        showToast("Descarga eliminada");
        loadDownloadedBooks();
    } catch (err) {
        console.error("❌ Error eliminando descarga:", err);
        showToast("No se pudo eliminar la descarga");
    }
}

/**
 * Elimina el PDF de un libro de IndexedDB
 * @param {number} bookId - ID del libro
 * @returns {Promise<void>}
 */
function deleteCachedPdf(bookId) {
    return new Promise((resolve) => {
        if (typeof indexedDB === "undefined") {
            resolve();
            return;
        }
        const request = indexedDB.open(PDF_DB_NAME, 1);
        request.onerror = () => resolve();
        request.onsuccess = () => {
            const db = request.result;
            try {
                const tx = db.transaction(PDF_STORE, "readwrite");
                const store = tx.objectStore(PDF_STORE);
                store.delete(`pdf_cache_book_${bookId}`);
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch (e) {
                resolve();
            }
        };
    });
}

/**
 * Renderiza el estado vacío de la lista
 * @param {string} message - Mensaje a mostrar
 */
function renderEmpty(message) {
    const grid = document.getElementById("downloadedGrid");
    if (!grid) return;
    grid.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <h3>No hay libros descargados</h3>
            <p>${message}</p>
            <a href="books.html" class="btn-primary" style="margin-top: 16px; display: inline-block; padding: 10px 24px; background: var(--aqua-500); color: white; border-radius: var(--radius-md); text-decoration: none;">
                Explorar libros
            </a>
        </div>
    `;
}

/**
 * Renderiza el estado de error
 * @param {string} message - Mensaje de error
 */
function renderError(message) {
    const grid = document.getElementById("downloadedGrid");
    if (!grid) return;
    grid.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 */
function showToast(message) {
    const toast = document.getElementById("toastNotification");
    const toastMessage = document.getElementById("toastMessage");
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

/**
 * Escapa caracteres HTML para evitar inyección
 * @param {string} str - Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}