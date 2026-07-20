// ==========================================================================
// LÓGICA DE CONTROL DEL DASHBOARD - GESTIÓN DE LIBROS (BIBLIOTECH)
// ==========================================================================

let editId = null;
let books = [];
let activeTags = []; // Array de categorías seleccionadas (multi-selección)

// ==========================================================================
// CATÁLOGO GLOBAL DE CATEGORÍAS
// Lista maestra usada para el dropdown de filtros y el selector del formulario
// ==========================================================================
const CATEGORIES = [
    "Arqueología", "Arquitectura", "Arte", "Astrología", "Astronomía",
    "Autoayuda", "Autobiográfico", "Aventuras", "Biografía", "Biología",
    "Bélico", "Ciencia", "Ciencia ficción", "Ciencias exactas",
    "Ciencias naturales", "Ciencias sociales", "Cine", "Cinematografía",
    "Clásico", "Comunicación", "Costumbrista", "Crítica",
    "Crítica y teoría literaria", "Crónica", "Crónicas", "Cuentos",
    "Cultura", "Cómic", "Deporte", "Deportes", "Deportes y juegos",
    "Dibujo", "Diccionarios y enciclopedias", "Didáctico", "Distopía",
    "Divulgación", "Divulgación científica", "Drama", "Ecología",
    "Economía", "Educación", "Ensayo", "Erótico", "Esoterismo",
    "Espectáculos", "Espionaje", "Espiritualidad", "Fantasía",
    "Fantástico", "Ficción", "Filosofía", "Filosófico", "Fotografía",
    "Física", "Gastronomía", "Geografía", "Guion", "Historia",
    "Histórico", "Hogar", "Humor", "Idiomas", "Infantil",
    "Infantil y juvenil", "Informática", "Interactivo", "Intriga",
    "Juegos", "Juvenil", "Magia", "Manuales y cursos", "Matemáticas",
    "Medicina", "Medieval", "Memorias", "Misterio", "Mitos", "Musical",
    "Música", "Nazis", "Negocios", "No Ficción", "Novela",
    "Novela Negra", "Novela del Oeste", "Obras completas", "Otros",
    "Padres e hijos", "Periodismo", "Pintura", "Poesía", "Policial",
    "Policíaco", "Política", "Psicología", "Psicológico",
    "Publicaciónes periódicas", "Química", "Realista",
    "Recetas de cocina", "Recopilación", "Referencia", "Relato",
    "Religión", "Romántico", "Salud y Bienestar", "Sexualidad",
    "Sociología", "Sátira", "Teatro", "Tecnología", "Terror",
    "Terrorismo", "Thriller", "Ucronía", "Viajes"
];

document.addEventListener("DOMContentLoaded", () => {
    if (!isAuthenticated()) {
        window.location.href = "index.html";
        return;
    }
    initializeProfile();
    applyRoleVisibility();
    populateCategorySelect();
    loadBooks();
    // Si el usuario es admin, cargar el contador de solicitudes pendientes
    if (getUserRole() === "admin") {
        loadModerationCounts();
    }
});

/**
 * Devuelve el rol del usuario autenticado ("admin", "escritor", "user")
 * o null si no hay sesión.
 */
function getUserRole() {
    const user = getUserData();
    return user ? ((user.role || "user").toLowerCase()) : null;
}

/**
 * Recupera el usuario logueado desde localStorage y actualiza la UI
 */
function initializeProfile() {
    const user = getUserData();
    const profileEmail = document.getElementById("profileEmail");
    const avatarLetter = document.getElementById("avatarLetter");
    const profileName = document.getElementById("profileName");

    // En algunas páginas (ej. book-detail.html) estos elementos no existen
    if (!profileEmail && !avatarLetter && !profileName) return;

    if (user) {
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileName) profileName.textContent = user.name || user.email;
        if (avatarLetter) avatarLetter.textContent = (user.name || user.email).charAt(0).toUpperCase();
        if (String(user.role).toLowerCase() === "admin") {
            const adminBadge = document.getElementById("adminBadge");
            if (adminBadge) adminBadge.style.display = "inline-block";
        }
        return;
    }
    if (profileEmail) profileEmail.textContent = "visitante@bibliotech.com";
    if (profileName) profileName.textContent = "Visitante";
    if (avatarLetter) avatarLetter.textContent = "V";
}

/**
 * Aplica la visibilidad de los botones de cabecera según el rol del usuario:
 *  - ADMIN:    ve únicamente "📬 Solicitudes"
 *  - ESCRITOR:  ve únicamente "+ Añadir Libro"
 *  - USUARIO:  no ve ningún botón de cabecera
 */
function applyRoleVisibility() {
    const role = getUserRole();
    const currentRole = String(role).toLowerCase();
    const btnRequests = document.getElementById("btnRequests");
    const btnAddBook = document.getElementById("btnAddBook");

    // Por defecto, ocultar ambos
    if (btnRequests) btnRequests.style.display = "none";
    if (btnAddBook) btnAddBook.style.display = "none";

    if (currentRole === "admin") {
        // Admin: ve Solicitudes y también puede Añadir Libro
        if (btnRequests) btnRequests.style.display = "inline-flex";
        if (btnAddBook) btnAddBook.style.display = "inline-flex";
    } else if (currentRole === "escritor") {
        // Escritor: solo Añadir Libro
        if (btnAddBook) btnAddBook.style.display = "inline-flex";
    }
    // user: no ve ninguno
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
 * Carga los libros desde el backend (API)
 */
async function loadBooks() {
    const grid = document.getElementById("booksGrid");
    if (!grid) {
        console.error("❌ booksGrid no encontrado en el DOM");
        return;
    }
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #888;">
            <div class="spinner" style="margin: 0 auto 16px;"></div>
            <p>Cargando biblioteca...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/books`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al cargar los libros");
        }

        books = data.data || [];
        renderBooks(books);
    } catch (error) {
        console.error("❌ Error al cargar libros:", error);
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #e74c3c;">
                    <p style="font-size: 1.2rem; font-weight: 600;">Error al cargar los libros</p>
                    <p style="font-size: 0.9rem; margin-top: 8px;">${error.message}</p>
                </div>
            `;
        }
    }
}

/**
 * Renderiza la colección de libros en la grid de la interfaz
 * Usa los nombres de campo del backend: nombre, autor, categoria, foto, pdf_url, etc.
 * @param {Array} booksList - Lista de libros a renderizar
 */
function renderBooks(booksList) {
    const grid = document.getElementById("booksGrid");
    if (!grid) {
        console.error("❌ booksGrid no encontrado en el DOM");
        return;
    }
    grid.innerHTML = "";

    if (!booksList || booksList.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #888;">
                <p style="font-size: 1.2rem; font-weight: 600;">No se encontraron libros</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Haz clic en "Añadir Libro" para registrar uno nuevo.</p>
            </div>
        `;
        return;
    }

    booksList.forEach((book, index) => {
        const card = document.createElement("div");
        card.className = "book-card";
        card.style.animationDelay = `${index * 0.08}s`;

        // Usar foto del backend o placeholder
        const coverContent = book.foto
            ? `<img src="${book.foto}" alt="Portada de ${book.nombre}" class="book-cover-img" loading="lazy">`
            : `
                <div class="book-cover-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                </div>
            `;

        const category = book.categoria || "Sin categoría";

        card.innerHTML = `
            <div class="book-card-header">
                <span class="book-badge disponible">Disponible</span>
                ${coverContent}
            </div>
            <div class="book-card-body">
                <span class="category-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    ${category}
                </span>
                <h4 class="book-title">${book.nombre}</h4>
                <p class="book-author">por ${book.autor || "Autor desconocido"}</p>
                <div class="book-meta">
                    <span>ID: <strong>#${book.id}</strong></span>
                    ${book.puntuacion_media ? `<span>★ <strong>${book.puntuacion_media}</strong></span>` : ""}
                </div>
                <div class="book-actions">
                    ${renderBookCardActions(book)}
                </div>
            </div>
        `;
        card.addEventListener("click", () => {
            window.location.href = 'book-detail.html?id=' + book.id;
        });
        grid.appendChild(card);
    });
}

/**
 * Genera el HTML de los botones de acción de cada tarjeta de libro
 * según el rol del usuario autenticado:
 *  - ADMIN:    [✏️ Editar] + [🗑️ Eliminar]
 *  - ESCRITOR: [➕ Añadir a Mi Lista] + [📖 Leer]
 *  - USUARIO:  [➕ Añadir a Mi Lista] + [📖 Leer]
 * @param {Object} book - El libro a renderizar
 * @returns {string} HTML de los botones
 */
function renderBookCardActions(book) {
    const role = getUserRole();

    const addToListBtn = `
        <button class="book-btn book-btn-add-list" onclick="event.stopPropagation(); addBookToMyList(${book.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Añadir a Mi Lista</span>
        </button>
    `;

    const readBtn = `
        <button class="book-btn book-btn-read" onclick="event.stopPropagation(); readBook(${book.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <span>Leer</span>
        </button>
    `;

    const editBtn = `
        <button class="book-btn book-btn-edit" onclick="event.stopPropagation(); editBook(${book.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Editar</span>
        </button>
    `;

    const deleteBtn = `
        <button class="book-btn book-btn-delete" onclick="event.stopPropagation(); deleteBook(${book.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>Eliminar</span>
        </button>
    `;

    if (role === "admin") {
        return editBtn + deleteBtn;
    }
    // escritor y user ven los mismos botones en las tarjetas
    return addToListBtn + readBtn;
}

/**
 * Añade un libro a la lista personal del usuario (Mi Lista)
 * @param {number} bookId - ID del libro a añadir
 */
async function addBookToMyList(bookId) {
    const token = getAuthToken();
    if (!token) {
        alert("Debes iniciar sesión para añadir libros a tu lista.");
        return;
    }
    try {
        const response = await authFetch(`${API_URL}/user/userList`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookId })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "No se pudo añadir el libro a tu lista.");
        }
        alert("✅ Libro añadido a tu lista.");
    } catch (error) {
        console.error("❌ Error al añadir a Mi Lista:", error);
        alert(error.message || "No se pudo añadir el libro. Intenta de nuevo.");
    }
}

/**
 * Redirige al lector de PDF para leer un libro
 * @param {number} bookId - ID del libro a leer
 */
function readBook(bookId) {
    window.location.href = `reader.html?id=${bookId}`;
}

/**
 * Filtra los libros por texto de búsqueda y tags activos (multi-selección)
 */
function filterBooks() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();

    let filtered = books;

    // Filtrar por categorías seleccionadas (OR entre tags)
    if (activeTags.length > 0) {
        filtered = filtered.filter(book => {
            const cat = book.categoria || "Sin categoría";
            return activeTags.includes(cat);
        });
    }

    if (query) {
        filtered = filtered.filter(book =>
            (book.nombre && book.nombre.toLowerCase().includes(query)) ||
            (book.autor && book.autor.toLowerCase().includes(query)) ||
            (book.categoria && book.categoria.toLowerCase().includes(query))
        );
    }

    renderBooks(filtered);
}

/**
 * Obtiene todas las categorías disponibles para mostrar en los filtros.
 * Combina el catálogo global (CATEGORIES) con cualquier categoría extra
 * que exista en los libros cargados desde el backend, para no perder
 * categorías históricas que no estén en la lista maestra.
 * @returns {Array} Lista de categorías únicas ordenadas alfabéticamente
 */
function getAvailableCategories() {
    const cats = new Set(CATEGORIES);
    books.forEach(book => {
        if (book.categoria) {
            cats.add(book.categoria);
        }
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * Rellena el <select> de categoría del formulario de añadir/editar libro
 * con todas las categorías del catálogo global.
 */
function populateCategorySelect() {
    const select = document.getElementById("bookGenre");
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = `<option value="">Selecciona una categoría...</option>` +
        CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join("");

    // Conservar el valor seleccionado si ya estaba elegido (edición)
    if (currentValue) {
        select.value = currentValue;
    }
}

/**
 * Renderiza los tags de categorías dentro del dropdown de filtros
 */
function renderFilterTags() {
    const list = document.getElementById("filterTagsList");
    if (!list) return;

    const categories = getAvailableCategories();

    if (categories.length === 0) {
        list.innerHTML = `<p style="color:#888; font-size:0.85rem; padding:8px 0;">No hay categorías disponibles.</p>`;
        return;
    }

    list.innerHTML = categories.map(cat => {
        const selected = activeTags.includes(cat);
        return `
            <button class="filter-tag ${selected ? "selected" : ""}" data-category="${cat}" onclick="toggleTagFilter('${cat.replace(/'/g, "\\'")}')">
                ${selected ? `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                ` : ""}
                <span>${cat}</span>
            </button>
        `;
    }).join("");
}

/**
 * Alterna la apertura/cierre del dropdown de filtros
 * @param {Event} event - Evento del clic
 */
function toggleFilterDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById("filterDropdown");
    const overlay = document.getElementById("filterDropdownOverlay");
    const toggleBtn = document.getElementById("filterToggleBtn");
    if (!dropdown) return;

    const isOpen = dropdown.classList.contains("open");
    if (isOpen) {
        closeFilterDropdown();
    } else {
        renderFilterTags();
        updateFilterBadge();
        dropdown.classList.add("open");
        overlay.classList.add("show");
        toggleBtn.classList.add("active");
    }
}

/**
 * Cierra el dropdown de filtros
 */
function closeFilterDropdown() {
    const dropdown = document.getElementById("filterDropdown");
    const overlay = document.getElementById("filterDropdownOverlay");
    const toggleBtn = document.getElementById("filterToggleBtn");
    if (dropdown) dropdown.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
    if (toggleBtn && activeTags.length === 0) toggleBtn.classList.remove("active");
}

/**
 * Alterna la selección de un tag de categoría (multi-selección)
 * @param {string} category - Categoría a alternar
 */
function toggleTagFilter(category) {
    const idx = activeTags.indexOf(category);
    if (idx > -1) {
        activeTags.splice(idx, 1);
    } else {
        activeTags.push(category);
    }
    renderFilterTags();
    updateFilterBadge();
    filterBooks();
}

/**
 * Limpia todos los filtros de categoría seleccionados
 */
function clearFilters() {
    activeTags = [];
    renderFilterTags();
    updateFilterBadge();
    filterBooks();
}

/**
 * Actualiza el badge contador y el texto del footer del dropdown
 */
function updateFilterBadge() {
    const badge = document.getElementById("filterCountBadge");
    const countText = document.getElementById("selectedCountText");
    const clearBtn = document.getElementById("filterClearBtn");
    const toggleBtn = document.getElementById("filterToggleBtn");
    const count = activeTags.length;

    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = "inline-flex";
        } else {
            badge.style.display = "none";
        }
    }

    if (countText) {
        countText.textContent = count === 0
            ? "0 categorías seleccionadas"
            : count === 1
                ? "1 categoría seleccionada"
                : `${count} categorías seleccionadas`;
    }

    if (clearBtn) {
        clearBtn.disabled = count === 0;
    }

    if (toggleBtn) {
        if (count > 0) {
            toggleBtn.classList.add("active");
        } else {
            toggleBtn.classList.remove("active");
        }
    }
}

// Cerrar el dropdown al hacer clic fuera o al presionar Escape
document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("filterDropdown");
    const wrapper = document.querySelector(".filter-dropdown-wrapper");
    if (dropdown && dropdown.classList.contains("open") && wrapper && !wrapper.contains(e.target)) {
        closeFilterDropdown();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeFilterDropdown();
    }
});

/**
 * Actualiza el label del input de archivo cuando se selecciona un archivo
 * @param {HTMLInputElement} input - El input file
 * @param {string} labelId - ID del label a actualizar
 */
function updateFileLabel(input, labelId) {
    const label = document.getElementById(labelId);
    if (!label) return;

    const preview = labelId === "coverLabel"
        ? document.getElementById("coverPreview")
        : document.getElementById("pdfPreview");

    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const fileSize = (file.size / (1024 * 1024)).toFixed(2);
        label.classList.add("has-file");
        label.querySelector("span").textContent = file.name;
        label.querySelector("small").textContent = `${fileSize} MB`;

        if (preview) {
            preview.style.display = "flex";
            preview.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; flex-shrink:0;">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="file-name">${file.name}</span>
                <span style="color:#9CA3AF; margin-left:auto;">${fileSize} MB</span>
            `;
        }
    } else {
        label.classList.remove("has-file");
        const isCover = labelId === "coverLabel";
        label.querySelector("span").textContent = isCover ? "Subir portada" : "Subir PDF";
        label.querySelector("small").textContent = isCover ? "(JPG, PNG — máx. 5 MB)" : "(PDF — máx. 50 MB)";

        if (preview) {
            preview.style.display = "none";
            preview.innerHTML = "";
        }
    }
}

/**
 * Abre el modal para añadir un nuevo libro
 */
function openAddModal() {
    // Tanto ESCRITOR como ADMIN pueden añadir libros
    const currentRole = String(getUserRole()).toLowerCase();
    if (currentRole !== "escritor" && currentRole !== "admin") {
        alert("No tienes permisos para añadir libros.");
        return;
    }
    editId = null;
    document.getElementById("modalTitle").textContent = "Registrar Nuevo Libro";
    document.getElementById("bookForm").reset();
    document.getElementById("serverError").style.display = "none";
    document.getElementById("uploadStatus").style.display = "none";
    populateCategorySelect();
    updateFileLabel(document.getElementById("bookCover"), "coverLabel");
    updateFileLabel(document.getElementById("bookPdf"), "pdfLabel");
    document.getElementById("bookModal").classList.add("active");
}

/**
 * Abre el modal para editar un libro existente — carga datos desde el backend
 * @param {number} id - ID del libro a editar
 */
async function editBook(id) {
    // Solo ADMIN puede editar libros
    if (getUserRole() !== "admin") {
        alert("No tienes permisos para editar libros.");
        return;
    }
    const book = books.find(b => b.id === id);
    if (!book) return;

    editId = id;
    document.getElementById("modalTitle").textContent = "Editar Libro";
    document.getElementById("serverError").style.display = "none";
    document.getElementById("uploadStatus").style.display = "none";

    // Repoblar el select con el catálogo completo antes de seleccionar
    populateCategorySelect();

    // Rellenar campos con datos del backend
    document.getElementById("bookTitle").value = book.nombre || "";
    document.getElementById("bookAuthor").value = book.autor || "";
    document.getElementById("bookGenre").value = book.categoria || "";
    document.getElementById("bookAddress").value = book.direccion || "";
    document.getElementById("bookDescription").value = book.descripcion || "";

    updateFileLabel(document.getElementById("bookCover"), "coverLabel");
    updateFileLabel(document.getElementById("bookPdf"), "pdfLabel");

    document.getElementById("bookModal").classList.add("active");
}

/**
 * Cierra el modal de formulario
 */
function closeModal() {
    document.getElementById("bookModal").classList.remove("active");
    document.getElementById("bookForm").reset();
    document.getElementById("serverError").style.display = "none";
    document.getElementById("uploadStatus").style.display = "none";
    editId = null;
}

/**
 * Muestra/oculta el estado de subida con spinner
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} show - true = mostrar, false = ocultar
 */
function setUploadStatus(message, show) {
    const el = document.getElementById("uploadStatus");
    if (show) {
        el.innerHTML = `<div class="spinner"></div><span>${message}</span>`;
        el.style.display = "flex";
    } else {
        el.style.display = "none";
        el.innerHTML = "";
    }
}

/**
 * Muestra el mensaje de error del servidor
 * @param {string} message - Mensaje de error
 */
function showServerError(message) {
    const el = document.getElementById("serverError");
    el.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px; flex-shrink:0;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${message}</span>
    `;
    el.style.display = "flex";
}

/**
 * Guarda (crea o actualiza) un libro conectando con el backend
 * Usa FormData para enviar archivos a Supabase Storage
 */
async function saveBook() {
    // Solo ADMIN (edición) o ESCRITOR (nuevo) pueden guardar libros
    const role = getUserRole();
    const currentRole = String(role).toLowerCase();
    if (currentRole !== "admin" && currentRole !== "escritor") {
        alert("No tienes permisos para guardar libros.");
        return;
    }
    const title = document.getElementById("bookTitle").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const genre = document.getElementById("bookGenre").value;
    const address = document.getElementById("bookAddress").value.trim();
    const description = document.getElementById("bookDescription").value.trim();
    const coverFile = document.getElementById("bookCover").files[0];
    const pdfFile = document.getElementById("bookPdf").files[0];

    // Validación básica
    if (!title || !author) {
        showServerError("Por favor, completa al menos el título y el autor.");
        return;
    }

    const saveBtn = document.getElementById("saveButton");
    const saveBtnText = document.getElementById("saveButtonText");

    saveBtn.disabled = true;
    saveBtnText.textContent = editId ? "Actualizando..." : "Guardando y Subiendo Archivos...";
    document.getElementById("serverError").style.display = "none";

    const formData = new FormData();
    formData.append("nombre", title);
    formData.append("autor", author);
    if (genre) formData.append("categoria", genre);
    if (address) formData.append("direccion", address);
    if (description) formData.append("descripcion", description);
    if (coverFile) formData.append("foto", coverFile);
    if (pdfFile) formData.append("pdf", pdfFile);

    const token = getAuthToken();
    const isEdit = !!editId;
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `${API_URL}/books/${editId}` : `${API_URL}/books`;

    setUploadStatus(isEdit ? "Actualizando libro..." : "Subiendo archivos a Supabase...", true);

    try {
        const response = await fetch(url, {
            method,
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Error del servidor (${response.status})`);
        }

        // Recargar la lista completa desde el backend
        await loadBooks();
        closeModal();

    } catch (error) {
        console.error("❌ Error al guardar libro:", error);
        showServerError(error.message || "No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
        saveBtn.disabled = false;
        saveBtnText.textContent = "Guardar Libro";
        setUploadStatus("", false);
    }
}

/**
 * Elimina un libro del backend con confirmación
 * @param {number} id - ID del libro a eliminar
 */
async function deleteBook(id) {
    // Solo ADMIN puede eliminar libros
    if (getUserRole() !== "admin") {
        alert("No tienes permisos para eliminar libros.");
        return;
    }
    if (!confirm("¿Estás seguro de que deseas eliminar este libro?")) return;

    const token = getAuthToken();
    if (!token) {
        alert("Debes iniciar sesión para eliminar libros.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/books/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Error del servidor (${response.status})`);
        }

        // Recargar la lista desde el backend
        await loadBooks();

    } catch (error) {
        console.error("❌ Error al eliminar libro:", error);
        alert(error.message || "No se pudo eliminar el libro. Intenta de nuevo.");
    }
}

/**
 * Cambia la pestaña activa en la barra lateral
 * @param {string} tabName - Nombre de la pestaña seleccionada
 */
function switchTab(tabName) {
    if (tabName === 'configuracion') {
        window.location.href = 'settings.html';
        return;
    }

    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => item.classList.remove("active"));

    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    const titles = {
        'libros': 'Catálogo de Libros',
        'prestamos': 'Gestión de Préstamos',
        'usuarios': 'Control de Usuarios y Lectores',
        'configuracion': 'Configuración'
    };

    document.getElementById("currentSectionTitle").textContent = titles[tabName] || "Dashboard";

    if (tabName === 'libros') {
        loadBooks();
    } else {
        const grid = document.getElementById("booksGrid");
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #1E4B65; background: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 64px; height: 64px; margin-bottom: 16px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 8px;">Sección en Desarrollo</h3>
                <p style="color: #666; max-width: 460px; margin: 0 auto; font-size: 0.95rem; line-height: 1.5;">Esta pestaña estará conectada con los endpoints correspondientes del backend próximamente. Por ahora, puedes gestionar plenamente el catálogo de libros.</p>
            </div>
        `;
    }
}

/**
 * Alterna el estado abierto/cerrado de la barra lateral en versión móvil
 */
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

// ==========================================================================
// MODERACIÓN — CENTRO DE SOLICITUDES (solo ADMIN)
// ==========================================================================

let currentModTab = "books"; // "books" | "writers"

/**
 * Carga los conteos de solicitudes pendientes y actualiza los badges
 */
async function loadModerationCounts() {
    try {
        const response = await authFetch(`${API_URL}/moderation/counts`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al cargar conteos");

        const pendingBooks = data.pendingBooks || 0;
        const pendingWriters = data.pendingWriters || 0;
        const total = pendingBooks + pendingWriters;

        // Badge del botón de cabecera
        const requestsBadge = document.getElementById("requestsBadge");
        if (requestsBadge) {
            if (total > 0) {
                requestsBadge.textContent = total;
                requestsBadge.style.display = "inline-flex";
            } else {
                requestsBadge.style.display = "none";
            }
        }

        // Badges de las pestañas
        const tabBooksBadge = document.getElementById("tabBooksBadge");
        if (tabBooksBadge) {
            if (pendingBooks > 0) {
                tabBooksBadge.textContent = pendingBooks;
                tabBooksBadge.style.display = "inline-flex";
            } else {
                tabBooksBadge.style.display = "none";
            }
        }

        const tabWritersBadge = document.getElementById("tabWritersBadge");
        if (tabWritersBadge) {
            if (pendingWriters > 0) {
                tabWritersBadge.textContent = pendingWriters;
                tabWritersBadge.style.display = "inline-flex";
            } else {
                tabWritersBadge.style.display = "none";
            }
        }
    } catch (error) {
        console.error("❌ Error al cargar conteos de moderación:", error);
    }
}

/**
 * Abre el modal del Centro de Moderación
 * Validación de permisos robusta e insensible a mayúsculas/minúsculas:
 * el rol llega como 'admin' (minúsculas) desde PostgreSQL, pero nos
 * protegemos frente a cualquier variación ('Admin', 'ADMIN', etc.).
 */
function openRequestsModal() {
    const userRole = getUserRole();
    if (String(userRole).toLowerCase() !== "admin") {
        // Sin alerta intrusiva: simplemente no abre el modal.
        console.warn("⛔ Acceso denegado al Centro de Moderación. Rol actual:", userRole);
        return;
    }
    const modal = document.getElementById("requestsModal");
    if (!modal) {
        console.error("❌ No se encontró el modal #requestsModal en el DOM");
        return;
    }
    modal.classList.add("active");
    currentModTab = "books";
    switchModTab("books");
}

/**
 * Cierra el modal del Centro de Moderación
 */
function closeRequestsModal() {
    const modal = document.getElementById("requestsModal");
    if (modal) modal.classList.remove("active");
}

/**
 * Cambia entre la pestaña de libros pendientes y solicitudes de escritor
 * @param {string} tab - "books" | "writers"
 */
function switchModTab(tab) {
    currentModTab = tab;

    // Actualizar botones de pestaña
    document.querySelectorAll(".mod-tab").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".mod-tab-content").forEach(c => c.classList.remove("active"));

    if (tab === "books") {
        document.getElementById("tabBooks").classList.add("active");
        document.getElementById("contentBooks").classList.add("active");
        loadPendingBooks();
    } else {
        document.getElementById("tabWriters").classList.add("active");
        document.getElementById("contentWriters").classList.add("active");
        loadWriterRequests();
    }
}

/**
 * Carga la lista de libros pendientes de aprobación
 */
async function loadPendingBooks() {
    const list = document.getElementById("pendingBooksList");
    if (!list) return;
    list.innerHTML = `<div class="mod-loading">Cargando libros pendientes...</div>`;

    try {
        const response = await authFetch(`${API_URL}/moderation/books/pending`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al cargar libros pendientes");

        const pending = data.data || [];
        if (pending.length === 0) {
            list.innerHTML = renderModEmpty("No hay solicitudes pendientes en este momento.");
            return;
        }

        list.innerHTML = pending.map(book => {
            const writerName = book.Writer?.name || book.Writer?.email || book.writer_name || "Escritor desconocido";
            const writerEmail = book.Writer?.email || book.writer_email || "";
            const created = book.createdAt || book.created_at || book.fecha;
            const formattedDate = created ? new Date(created).toLocaleDateString("es-ES", {
                day: "2-digit", month: "short", year: "numeric"
            }) : "";
            return `
            <div class="request-card-horizontal">
                <div class="request-card-left">
                    ${book.foto
                        ? `<img src="${book.foto}" alt="${book.nombre}" class="request-card-cover">`
                        : `<div class="request-card-cover-placeholder"><i class="fas fa-file-pdf"></i></div>`}
                </div>
                <div class="request-card-body">
                    <p class="request-card-title">${book.nombre}</p>
                    <span class="request-card-badge">${book.categoria || "Sin categoría"}</span>
                    <p class="request-card-requester">
                        <i class="fas fa-user"></i> ${writerName}${writerEmail ? ` · ${writerEmail}` : ""}
                    </p>
                    ${formattedDate ? `<p class="request-card-date"><i class="fas fa-calendar"></i> ${formattedDate}</p>` : ""}
                </div>
                <div class="request-card-actions">
                    <button class="btn-pill btn-pill-success" title="Aprobar" onclick="approveBook(${book.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-pill btn-pill-danger" title="Rechazar" onclick="rejectBook(${book.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        }).join("");
    } catch (error) {
        console.error("❌ Error al cargar libros pendientes:", error);
        list.innerHTML = `<div class="mod-empty"><p style="color:#EF4444;">${error.message}</p></div>`;
    }
}

/**
 * Carga la lista de solicitudes de ascenso a escritor
 */
async function loadWriterRequests() {
    const list = document.getElementById("writerRequestsList");
    if (!list) return;
    list.innerHTML = `<div class="mod-loading">Cargando solicitudes de escritor...</div>`;

    try {
        const response = await authFetch(`${API_URL}/moderation/writer-requests`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al cargar solicitudes");

        const requests = data.data || [];
        if (requests.length === 0) {
            list.innerHTML = renderModEmpty("No hay solicitudes pendientes en este momento.");
            return;
        }

        list.innerHTML = requests.map(req => {
            const fullName = req.User?.name || req.user_name || "Usuario #" + (req.user_id || req.id);
            const email = req.User?.email || req.user_email || "";
            const currentRole = req.User?.role || req.user_role || "user";
            const created = req.createdAt || req.created_at || req.fecha;
            const formattedDate = created ? new Date(created).toLocaleDateString("es-ES", {
                day: "2-digit", month: "short", year: "numeric"
            }) : "";
            return `
            <div class="request-card-horizontal">
                <div class="request-card-left">
                    <div class="request-card-cover-placeholder" style="border-radius:50%;">
                        <i class="fas fa-user-pen"></i>
                    </div>
                </div>
                <div class="request-card-body">
                    <p class="request-card-title">${fullName}</p>
                    <span class="request-card-badge">Solicitud #${req.id}</span>
                    <p class="request-card-requester">
                        <i class="fas fa-envelope"></i> ${email}
                    </p>
                    <span class="request-card-role">Rol actual: ${String(currentRole).toLowerCase()}</span>
                    ${formattedDate ? `<p class="request-card-date"><i class="fas fa-calendar"></i> ${formattedDate}</p>` : ""}
                </div>
                <div class="request-card-actions">
                    <button class="btn-pill btn-pill-success" title="Aprobar" onclick="approveWriterRequest(${req.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-pill btn-pill-danger" title="Rechazar" onclick="rejectWriterRequest(${req.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        }).join("");
    } catch (error) {
        console.error("❌ Error al cargar solicitudes de escritor:", error);
        list.innerHTML = `<div class="mod-empty"><p style="color:#EF4444;">${error.message}</p></div>`;
    }
}

/**
 * Genera el HTML del estado vacío de una lista de moderación
 * @param {string} message - Mensaje a mostrar
 * @returns {string} HTML
 */
function renderModEmpty(message) {
    return `
        <div class="mod-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p>${message}</p>
        </div>
    `;
}

/**
 * Aprueba un libro pendiente
 * @param {number} id - ID del libro
 */
async function approveBook(id) {
    if (!confirm("¿Aprobar este libro y publicarlo en el catálogo?")) return;
    try {
        const response = await authFetch(`${API_URL}/moderation/books/${id}/approve`, { method: "PUT" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al aprobar");
        await refreshAfterModeration();
    } catch (error) {
        console.error("❌ Error al aprobar libro:", error);
        alert(error.message);
    }
}

/**
 * Rechaza (elimina) un libro pendiente
 * @param {number} id - ID del libro
 */
async function rejectBook(id) {
    if (!confirm("¿Rechazar y eliminar este libro pendiente?")) return;
    try {
        const response = await authFetch(`${API_URL}/moderation/books/${id}/reject`, { method: "PUT" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al rechazar");
        await refreshAfterModeration();
    } catch (error) {
        console.error("❌ Error al rechazar libro:", error);
        alert(error.message);
    }
}

/**
 * Aprueba una solicitud de ascenso a escritor
 * @param {number} id - ID de la solicitud
 */
async function approveWriterRequest(id) {
    if (!confirm("¿Aprobar esta solicitud y ascender al usuario a escritor?")) return;
    try {
        const response = await authFetch(`${API_URL}/moderation/writer-requests/${id}/approve`, { method: "PUT" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al aprobar");
        await refreshAfterModeration();
    } catch (error) {
        console.error("❌ Error al aprobar solicitud:", error);
        alert(error.message);
    }
}

/**
 * Rechaza una solicitud de ascenso a escritor
 * @param {number} id - ID de la solicitud
 */
async function rejectWriterRequest(id) {
    if (!confirm("¿Rechazar esta solicitud de ascenso?")) return;
    try {
        const response = await authFetch(`${API_URL}/moderation/writer-requests/${id}/reject`, { method: "PUT" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al rechazar");
        await refreshAfterModeration();
    } catch (error) {
        console.error("❌ Error al rechazar solicitud:", error);
        alert(error.message);
    }
}

/**
 * Aprueba todos los elementos de la pestaña activa
 */
async function approveAllRequests() {
    const endpoint = currentModTab === "books"
        ? `${API_URL}/moderation/books/approve-all`
        : `${API_URL}/moderation/writer-requests/approve-all`;
    if (!confirm("¿Aprobar TODOS los elementos de esta pestaña?")) return;
    try {
        const response = await authFetch(endpoint, { method: "PUT" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al aprobar todo");
        await refreshAfterModeration();
    } catch (error) {
        console.error("❌ Error al aprobar todo:", error);
        alert(error.message);
    }
}

/**
 * Rechaza todos los elementos de la pestaña activa
 */
async function denyAllRequests() {
    const endpoint = currentModTab === "books"
        ? `${API_URL}/moderation/books/reject-all`
        : `${API_URL}/moderation/writer-requests/reject-all`;
    if (!confirm("¿Rechazar TODOS los elementos de esta pestaña?")) return;
    try {
        const response = await authFetch(endpoint, { method: "PUT" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al rechazar todo");
        await refreshAfterModeration();
    } catch (error) {
        console.error("❌ Error al rechazar todo:", error);
        alert(error.message);
    }
}

/**
 * Refresca las listas y conteos tras una acción de moderación
 */
async function refreshAfterModeration() {
    await loadModerationCounts();
    if (currentModTab === "books") {
        await loadPendingBooks();
    } else {
        await loadWriterRequests();
    }
    // Recargar el catálogo por si cambiaron los libros aprobados
    await loadBooks();
}

