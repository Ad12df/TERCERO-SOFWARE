// ==========================================================================
// LÓGICA DE CONTROL DEL DASHBOARD - GESTIÓN DE LIBROS (BIBLIOTECH)
// ==========================================================================

let editId = null;
let books = [];
let activeGenre = 'Todos';

document.addEventListener("DOMContentLoaded", () => {
    if (!isAuthenticated()) {
        window.location.href = "index.html";
        return;
    }
    initializeProfile();
    loadBooks();
});

/**
 * Recupera el usuario logueado desde localStorage y actualiza la UI
 */
function initializeProfile() {
    const user = getUserData();
    const profileEmail = document.getElementById("profileEmail");
    const avatarLetter = document.getElementById("avatarLetter");
    const profileName = document.getElementById("profileName");

    if (user) {
        profileEmail.textContent = user.email;
        profileName.textContent = user.name || user.email;
        avatarLetter.textContent = (user.name || user.email).charAt(0).toUpperCase();
        if (user.role === "admin") {
            const adminBadge = document.getElementById("adminBadge");
            if (adminBadge) adminBadge.style.display = "inline-block";
        }
        return;
    }
    profileEmail.textContent = "visitante@bibliotech.com";
    profileName.textContent = "Visitante";
    avatarLetter.textContent = "V";
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
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #e74c3c;">
                <p style="font-size: 1.2rem; font-weight: 600;">Error al cargar los libros</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">${error.message}</p>
            </div>
        `;
    }
}

/**
 * Renderiza la colección de libros en la grid de la interfaz
 * Usa los nombres de campo del backend: nombre, autor, categoria, foto, pdf_url, etc.
 * @param {Array} booksList - Lista de libros a renderizar
 */
function renderBooks(booksList) {
    const grid = document.getElementById("booksGrid");
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
        const coverStyle = book.foto
            ? `background-image: url('${book.foto}'); background-size: cover; background-position: center;`
            : "";

        card.innerHTML = `
            <div class="book-card-header">
                <span class="book-badge disponible">Disponible</span>
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
                <h4 class="book-title">${book.nombre}</h4>
                <p class="book-author">por ${book.autor || "Autor desconocido"}</p>
                <div class="book-meta">
                    <span>ID: <strong>#${book.id}</strong></span>
                    ${book.puntuacion_media ? `<span>★ <strong>${book.puntuacion_media}</strong></span>` : ""}
                </div>
                <div class="book-actions">
                    <button class="book-btn book-btn-edit" onclick="event.stopPropagation(); editBook(${book.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>Editar</span>
                    </button>
                    <button class="book-btn book-btn-delete" onclick="event.stopPropagation(); deleteBook(${book.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        <span>Eliminar</span>
                    </button>
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
 * Filtra los libros por texto de búsqueda y género activo
 */
function filterBooks() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();

    let filtered = books;

    if (activeGenre !== 'Todos') {
        filtered = filtered.filter(book => book.categoria === activeGenre);
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
 * Filtra los libros por género seleccionado
 * @param {string} genre - Género a filtrar ('Todos' para mostrar todos)
 */
function filterByGenre(genre) {
    activeGenre = genre;
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        if (btn.getAttribute('data-genre') === genre) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    filterBooks();
}

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
    editId = null;
    document.getElementById("modalTitle").textContent = "Registrar Nuevo Libro";
    document.getElementById("bookForm").reset();
    document.getElementById("serverError").style.display = "none";
    document.getElementById("uploadStatus").style.display = "none";
    updateFileLabel(document.getElementById("bookCover"), "coverLabel");
    updateFileLabel(document.getElementById("bookPdf"), "pdfLabel");
    document.getElementById("bookModal").classList.add("active");
}

/**
 * Abre el modal para editar un libro existente — carga datos desde el backend
 * @param {number} id - ID del libro a editar
 */
async function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    editId = id;
    document.getElementById("modalTitle").textContent = "Editar Libro";
    document.getElementById("serverError").style.display = "none";
    document.getElementById("uploadStatus").style.display = "none";

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
 * Usa FormData para enviar archivos a Cloudinary
 */
async function saveBook() {
    const title = document.getElementById("bookTitle").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const genre = document.getElementById("bookGenre").value.trim();
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

    setUploadStatus(isEdit ? "Actualizando libro..." : "Subiendo archivos a Cloudinary...", true);

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

