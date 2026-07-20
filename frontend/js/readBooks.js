// ==========================================================================
// LEÍDOS — BiblioTech
// ==========================================================================

let readBooks = [];

document.addEventListener("DOMContentLoaded", () => {
    if (!isAuthenticated()) {
        window.location.href = "index.html";
        return;
    }
    initializeProfile();
    loadReadBooks();
});

/**
 * Recupera el usuario logueado desde localStorage y actualiza la UI
 */
function initializeProfile() {
    const user = getUserData();
    const profileEmail = document.getElementById("profileEmail");
    const avatarLetter = document.getElementById("avatarLetter");
    const profileName = document.getElementById("profileName");

    if (!profileEmail && !avatarLetter && !profileName) return;

    if (user) {
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileName) profileName.textContent = user.name || user.email;
        if (avatarLetter) avatarLetter.textContent = (user.name || user.email).charAt(0).toUpperCase();
        return;
    }
    if (profileEmail) profileEmail.textContent = "visitante@bibliotech.com";
    if (profileName) profileName.textContent = "Visitante";
    if (avatarLetter) avatarLetter.textContent = "V";
}

/**
 * Cierra la sesión del usuario y redirige al login
 */
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

/**
 * Carga la lista de libros leídos del usuario desde la API
 */
async function loadReadBooks() {
    const grid = document.getElementById("myListGrid");
    if (!grid) return;

    const token = localStorage.getItem('token');
    if (!token) {
        renderEmpty("Inicia sesión para ver tus libros leídos");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/lists/read`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.message || "Error al cargar los libros leídos");
        }

        readBooks = json.data || [];
        renderReadBooks(readBooks);
    } catch (err) {
        console.error("❌ Error cargando Leídos:", err);
        renderError("No se pudieron cargar tus libros leídos");
    }
}

/**
 * Renderiza la lista de libros leídos
 * @param {Array} books - Lista de libros
 */
function renderReadBooks(books) {
    const grid = document.getElementById("myListGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (!books || books.length === 0) {
        renderEmpty("Aún no has completado ningún libro. ¡Sigue leyendo!");
        return;
    }

    books.forEach((book, index) => {
        const card = document.createElement("div");
        card.className = "book-card";
        card.style.animationDelay = `${index * 0.08}s`;

        const coverStyle = book.foto
            ? `background-image: url('${book.foto}'); background-size: cover; background-position: center;`
            : "";

        card.innerHTML = `
            <div class="book-card-header">
                <div class="book-cover-placeholder" style="${coverStyle}">
                    ${!book.foto ? `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    ` : ""}
                    <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${book.categoria || "Sin categoría"}</span>
                </div>
                <div class="completed-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    100% Completado
                </div>
            </div>
            <div class="book-card-body">
                <h4 class="book-title">${escapeHtml(book.nombre)}</h4>
                <p class="book-author">por ${escapeHtml(book.autor || "Autor desconocido")}</p>
                <div class="book-meta">
                    ${book.puntuacion_media ? `<span>★ <strong>${book.puntuacion_media}</strong></span>` : ""}
                    ${book.total_resenas ? `<span>${book.total_resenas} reseñas</span>` : ""}
                </div>
                ${book.completado_el ? `<p class="completed-date">Completado el ${formatDate(book.completado_el)}</p>` : ""}
                <div class="book-actions">
                    <button class="book-btn book-btn-edit" onclick="openReader(${book.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                        <span>Releeer</span>
                    </button>
                </div>
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
 * Formatea una fecha ISO a formato legible
 * @param {string} dateString - Fecha ISO
 * @returns {string} Fecha formateada
 */
function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
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
 * Renderiza el estado vacío de la lista
 * @param {string} message - Mensaje a mostrar
 */
function renderEmpty(message) {
    const grid = document.getElementById("myListGrid");
    if (!grid) return;
    grid.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <h3>No hay libros leídos</h3>
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
    const grid = document.getElementById("myListGrid");
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
 * @param {string} type - Tipo de toast (success, warning, error)
 */
function showToast(message, type = "success") {
    const toast = document.getElementById("toastNotification");
    const toastMessage = document.getElementById("toastMessage");
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    const svg = toast.querySelector("svg");
    if (svg) {
        if (type === "success") {
            svg.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
        } else if (type === "warning") {
            svg.innerHTML = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>';
        } else {
            svg.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>';
        }
    }

    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} Texto seguro
 */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}