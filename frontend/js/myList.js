// ==========================================================================
// MI LISTA — BiblioTech
// ==========================================================================

let myList = [];

document.addEventListener("DOMContentLoaded", () => {
    if (!isAuthenticated()) {
        window.location.href = "index.html";
        return;
    }
    initializeProfile();
    loadMyList();
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
 * Carga la lista personal del usuario desde la API
 */
async function loadMyList() {
    const grid = document.getElementById("myListGrid");
    if (!grid) return;

    const token = localStorage.getItem('token');
    if (!token) {
        renderEmpty("Inicia sesión para ver tu lista");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/lists`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.message || "Error al cargar la lista");
        }

        myList = json.data || [];
        renderMyList(myList);
    } catch (err) {
        console.error("❌ Error cargando Mi Lista:", err);
        renderError("No se pudo cargar tu lista");
    }
}

/**
 * Renderiza la lista de libros guardados
 * @param {Array} books - Lista de libros
 */
function renderMyList(books) {
    const grid = document.getElementById("myListGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (!books || books.length === 0) {
        renderEmpty("Tu lista está vacía. ¡Añade libros desde su detalle!");
        return;
    }

    books.forEach((book, index) => {
        const card = document.createElement("div");
        card.className = "book-card";
        card.style.animationDelay = `${index * 0.08}s`;

        const coverStyle = book.foto
            ? `background-image: url('${book.foto}'); background-size: cover; background-position: center;`
            : "";

        const progreso = book.progreso_porcentaje || 0;
        const progressBar = createProgressBar(progreso);

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
            </div>
            <div class="book-card-body">
                <h4 class="book-title">${escapeHtml(book.nombre)}</h4>
                <p class="book-author">por ${escapeHtml(book.autor || "Autor desconocido")}</p>
                <div class="book-meta">
                    ${book.puntuacion_media ? `<span>★ <strong>${book.puntuacion_media}</strong></span>` : ""}
                    ${book.total_resenas ? `<span>${book.total_resenas} reseñas</span>` : ""}
                </div>
                ${progressBar}
                <div class="book-actions">
                    <button class="book-btn book-btn-edit" onclick="openReader(${book.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                        <span>${progreso > 0 ? "Continuar" : "Leer"}</span>
                    </button>
                    <button class="book-btn book-btn-delete" onclick="removeFromList(${book.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>Quitar</span>
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
 * Crea una barra de progreso HTML para mostrar el progreso de lectura
 * @param {number} porcentaje - Porcentaje de progreso (0-100)
 * @returns {string} HTML de la barra de progreso
 */
function createProgressBar(porcentaje) {
    const pct = Math.min(100, Math.max(0, Number(porcentaje) || 0));
    const label = pct === 0 ? "Sin iniciar" : pct === 100 ? "Completado" : `${pct}% leído`;
    const color = pct === 100 ? "#22c55e" : pct > 0 ? "#14b8a6" : "#6b7280";

    return `
        <div class="mini-progress-container" style="margin-top: 8px;">
            <div class="mini-progress-track">
                <div class="mini-progress-fill" style="width: ${pct}%; background: ${color};"></div>
            </div>
            <span class="mini-progress-label">${label}</span>
        </div>
    `;
}

/**
 * Quita un libro de Mi Lista
 * @param {number} bookId - ID del libro a quitar
 */
async function removeFromList(bookId) {
    if (!confirm("¿Quitar este libro de tu lista?")) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/lists/remove/${bookId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (json.success) {
            showToast("Eliminado de Mi Lista");
            // Eliminar del array local y re-renderizar
            myList = myList.filter(b => b.id !== bookId);
            renderMyList(myList);
        } else {
            showToast(json.message || "No se pudo quitar el libro", "error");
        }
    } catch (err) {
        console.error("❌ Error al quitar de la lista:", err);
        showToast("Error de conexión", "error");
    }
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
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3>Tu lista está vacía</h3>
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