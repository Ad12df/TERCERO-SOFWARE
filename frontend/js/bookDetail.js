// ==========================================================================
// PÁGINA DE DETALLE DE LIBRO - BIBLIOTECH
// ==========================================================================

let selectedBookId = null;
let currentBook = null; // Almacena el libro actual obtenido de la API

// ─── INICIALIZACIÓN ────────────────────────────────────────────────────────

/**
 * Inicializa la página de detalle leyendo el ID de la URL
 * y obtiene los datos del libro desde la API
 */
async function initializeDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    const detailPage = document.getElementById('bookDetailPage');

    if (!bookId) {
        if (detailPage) {
            detailPage.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #666;">
                    <h2>No se especificó un libro</h2>
                    <p style="margin-top: 16px;">
                        <a href="books.html" style="color: #1E4B65; text-decoration: underline;">Volver al catálogo</a>
                    </p>
                </div>
            `;
        }
        return;
    }

    selectedBookId = parseInt(bookId);

    try {
        // Obtener el libro desde la API
        const response = await fetch(`${API_URL}/books/${bookId}`);

        if (!response.ok) {
            if (response.status === 404) {
                if (detailPage) {
                    detailPage.innerHTML = `
                        <div style="text-align: center; padding: 60px; color: #666;">
                            <h2>Libro no encontrado</h2>
                            <p style="margin-top: 16px;">
                                <a href="books.html" style="color: #1E4B65; text-decoration: underline;">Volver al catálogo</a>
                            </p>
                        </div>
                    `;
                }
            } else {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return;
        }

        const result = await response.json();

        // El backend devuelve { success: true, data: book }
        // Algunos endpoints pueden devolver el libro directamente
        const book = result.data || result;

        // Guardar el libro actual para usar en openReader()
        currentBook = book;

        // Mostrar los datos del libro
        showBookDetail(book);

        // Verificar estado de Mi Lista
        checkMyListStatus();

        // Cargar notas guardadas de localStorage
        const notesKey = `bibliotech_notes_${book.id}`;
        const savedNotes = localStorage.getItem(notesKey);
        const notesTextarea = document.getElementById("detailNotes");
        if (notesTextarea && savedNotes) {
            notesTextarea.value = savedNotes;
        }

        // Cargar comentarios guardados de localStorage
        const commentsKey = `bibliotech_comments_${book.id}`;
        const savedComments = JSON.parse(localStorage.getItem(commentsKey) || "[]");
        renderComments(savedComments);

    } catch (error) {
        console.error('❌ Error al cargar el libro:', error);
        const detailPage = document.getElementById('bookDetailPage');
        if (detailPage) {
            detailPage.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #666;">
                    <h2>Error al cargar el libro</h2>
                    <p style="margin-top: 16px; color: #999;">${escapeHtml(error.message)}</p>
                    <p style="margin-top: 16px;">
                        <a href="books.html" style="color: #1E4B65; text-decoration: underline;">Volver al catálogo</a>
                    </p>
                </div>
            `;
        }
    }
}

/**
 * Muestra la información completa del libro en la página
 * @param {Object} book - Objeto del libro (formato backend)
 */
function showBookDetail(book) {
    // ── Campos del backend → frontend ──
    // nombre → bookTitle
    // autor → bookAuthor
    // descripcion → synopsisText
    // foto → cover image
    // pdf_url → openReader()
    // categoria → categoryBadge / categoryPill
    // puntuacion_media → rating
    // total_resenas → ratingVotes
    // createdAt → metaDate
    // updatedAt → metaUpdate

    // Llenar información básica
    const bookTitleEl = document.getElementById("bookTitle");
    if (bookTitleEl) bookTitleEl.textContent = book.nombre || "Sin título";

    const bookAuthorEl = document.getElementById("bookAuthor");
    if (bookAuthorEl) bookAuthorEl.textContent = book.autor ? `por ${book.autor}` : "Autor desconocido";

    // Imagen de portada (foto de Cloudinary)
    const bookCover = document.getElementById("bookCover");
    if (bookCover) {
        if (book.foto) {
            bookCover.style.backgroundImage = `url(${book.foto})`;
            bookCover.style.backgroundSize = "cover";
            bookCover.style.backgroundPosition = "center";
            console.log("🖼️ Portada configurada:", book.foto);
        } else {
            bookCover.style.backgroundImage = "none";
            bookCover.style.backgroundColor = "#e0e0e0";
            console.warn("⚠️ El libro no tiene foto de portada");
        }
    }

    // Sinopsis
    const synopsisEl = document.getElementById("synopsisText");
    if (synopsisEl) {
        synopsisEl.textContent = book.descripcion || "Sinopsis no disponible.";
    }

    // Metadatos
    const metaAuthor = document.getElementById("metaAuthor");
    if (metaAuthor) metaAuthor.textContent = book.autor || "-";

    const metaDate = document.getElementById("metaDate");
    if (metaDate) metaDate.textContent = book.createdAt ? formatDate(book.createdAt) : "-";

    const metaUpdate = document.getElementById("metaUpdate");
    if (metaUpdate) metaUpdate.textContent = book.updatedAt ? formatDate(book.updatedAt) : "-";

    const metaLanguage = document.getElementById("metaLanguage");
    if (metaLanguage) metaLanguage.textContent = "Español";

    // Categoría
    const categoryBadge = document.getElementById("categoryBadge");
    if (categoryBadge) categoryBadge.textContent = book.categoria || "Ficción";

    const categoryPill = document.getElementById("categoryPill");
    if (categoryPill) categoryPill.textContent = book.categoria || "Ficción";

    // Tags (el backend no tiene tags, dejar vacío)
    const tagsContainer = document.getElementById("tagsContainer");
    if (tagsContainer) tagsContainer.innerHTML = '';

    // Estado (disponible si tiene pdf_url)
    const statusBadge = document.getElementById("statusBadge");
    if (statusBadge) {
        const hasPdf = !!book.pdf_url;
        statusBadge.innerHTML = `<span class="status-dot"></span>${hasPdf ? "Disponible" : "Sin PDF"}`;
    }

    // Calificación
    const rating = book.puntuacion_media || 0;
    updateStarDisplay(rating);

    const ratingNumber = document.getElementById("ratingNumber");
    if (ratingNumber) ratingNumber.textContent = rating.toFixed(1);

    const ratingScore = document.getElementById("ratingScore");
    if (ratingScore) ratingScore.textContent = rating.toFixed(1);

    const ratingBarFill = document.getElementById("ratingBarFill");
    if (ratingBarFill) ratingBarFill.style.width = `${(rating / 5) * 100}%`;

    const ratingVotes = document.getElementById("ratingVotes");
    if (ratingVotes) ratingVotes.textContent = `${book.total_resenas || 0} votos`;
    
    const ratingUsers = document.getElementById("ratingUsers");
    if (ratingUsers) ratingUsers.textContent = `${book.total_resenas || 0} usuarios`;
    
    // Visitas (el backend no proporciona contador de visitas)
    const visitsCounter = document.getElementById("visitsCounter");
    if (visitsCounter) visitsCounter.textContent = `0 visitas`;
    
    // Comentarios (se cargan desde localStorage en initializeDetailPage)
    
    // Cargar sugerencias
    loadSuggestions(book);
}

/**
 * Actualiza la visualización de las estrellas
 * @param {number} rating - Valor de 0 a 5
 */
function updateStarDisplay(rating) {
    const stars = document.querySelectorAll(".star-large");
    stars.forEach((star, index) => {
        if (index < Math.round(rating)) {
            star.classList.add("filled");
        } else {
            star.classList.remove("filled");
        }
    });
}

/**
 * Renderiza los comentarios del libro
 * @param {Array} comments - Lista de comentarios
 */
function renderComments(comments) {
    const container = document.getElementById("commentsList");
    const countEl = document.getElementById("commentsCount");
    
    if (countEl) {
        countEl.textContent = `${comments.length} comentario${comments.length !== 1 ? 's' : ''}`;
    }
    
    if (!container) return;
    
    if (comments.length === 0) {
        container.innerHTML = `
            <div class="empty-comments">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>Aún no hay comentarios. ¡Sé el primero en opinar!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-avatar">${(comment.author || "A").charAt(0).toUpperCase()}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.author || "Anónimo")}</span>
                    <span class="comment-date">${formatDate(comment.date)}</span>
                </div>
                <p class="comment-text">${escapeHtml(comment.text)}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Guarda las notas personales del libro en localStorage
 */
function saveBookNotes() {
    if (!currentBook?.id) {
        console.error("❌ No hay libro actual para guardar notas");
        return;
    }
    
    const notes = document.getElementById("detailNotes").value;
    const notesKey = `bibliotech_notes_${currentBook.id}`;
    localStorage.setItem(notesKey, notes);
    console.log("📝 Notas guardadas para libro", currentBook.id);
    
    // Feedback visual
    const btn = document.querySelector(".btn-save-notes");
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ¡Guardado!
    `;
    btn.style.background = "#27ae60";
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = "";
    }, 1500);
}

/**
 * Envía un nuevo comentario y lo guarda en localStorage
 */
function submitComment() {
    if (!currentBook?.id) {
        console.error("❌ No hay libro actual para añadir comentario");
        return;
    }
    
    const input = document.getElementById("commentInput");
    if (!input) return;
    
    const text = input.value.trim();
    
    if (!text) {
        showToast("Por favor, escribe un comentario.", "warning");
        return;
    }
    
    // Obtener nombre de usuario
    const userStr = localStorage.getItem("user");
    let authorName = "Anónimo";
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.name) {
                authorName = user.name;
            } else if (user && user.email) {
                authorName = user.email.split("@")[0];
            }
        } catch (e) {
            console.error("Error al parsear el usuario:", e);
        }
    }
    
    // Guardar comentario en localStorage por libro
    const commentsKey = `bibliotech_comments_${currentBook.id}`;
    const comments = JSON.parse(localStorage.getItem(commentsKey) || "[]");
    
    comments.push({
        author: authorName,
        text: text,
        date: new Date().toISOString()
    });
    
    localStorage.setItem(commentsKey, JSON.stringify(comments));
    console.log("💬 Comentario guardado para libro", currentBook.id);
    
    renderComments(comments);
    input.value = "";
    showToast("Comentario añadido", "success");
}

/**
 * Carga las sugerencias de libros relacionados desde la API
 * @param {Object} currentBook - Libro actual
 */
function loadSuggestions(currentBook) {
    const container = document.getElementById("suggestionsGrid");
    if (!container) return;
    
    console.log("🔍 Cargando sugerencias para:", currentBook.nombre);
    
    fetch(`${API_URL}/books`)
        .then(res => res.json())
        .then(result => {
            const allBooks = result.data || result || [];
            console.log("📚 Total libros recibidos:", allBooks.length);
            
            // Filtrar por categoría, excluyendo el actual
            const suggestions = allBooks
                .filter(book => 
                    book.id !== currentBook.id && 
                    book.categoria === currentBook.categoria
                )
                .slice(0, 4);
            
            // Si no hay suficientes, completar con otros libros
            if (suggestions.length < 4) {
                const additionalBooks = allBooks
                    .filter(book => 
                        book.id !== currentBook.id && 
                        !suggestions.find(s => s.id === book.id)
                    )
                    .slice(0, 4 - suggestions.length);
                suggestions.push(...additionalBooks);
            }
            
            if (suggestions.length === 0) {
                container.innerHTML = '<p class="no-suggestions">No hay sugerencias disponibles</p>';
                return;
            }
            
            container.innerHTML = suggestions.map(book => `
                <a href="book-detail.html?id=${book.id}" class="mini-book-card">
                    <div class="mini-book-cover" style="${book.foto ? `background-image: url(${book.foto}); background-size: cover; background-position: center;` : `background: #e0e0e0`}">
                        ${!book.foto ? `<span class="mini-book-initial">${(book.nombre || "L").charAt(0)}</span>` : ""}
                    </div>
                    <div class="mini-book-info">
                        <h4 class="mini-book-title">${escapeHtml(book.nombre || "Sin título")}</h4>
                        <p class="mini-book-author">${escapeHtml(book.autor || "Autor")}</p>
                        <div class="mini-book-rating">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            <span>${(book.puntuacion_media || 0).toFixed(1)}</span>
                        </div>
                    </div>
                </a>
            `).join('');
            
            console.log("✅ Sugerencias renderizadas:", suggestions.length);
        })
        .catch(err => {
            console.error("❌ Error cargando sugerencias:", err);
            container.innerHTML = '<p class="no-suggestions">No se pudieron cargar las sugerencias</p>';
        });
}

/**
 * Verifica si el libro está en Mi Lista
 */
function checkMyListStatus() {
    const btn = document.getElementById('btnAddList');
    const btnText = document.getElementById('listBtnText');
    if (!btn || !btnText) return;
    
    const myList = JSON.parse(localStorage.getItem('bibliotech_my_list') || '[]');
    const isAdded = myList.includes(selectedBookId);
    
    if (isAdded) {
        btn.classList.add('added');
        btnText.textContent = 'En Mi Lista';
    } else {
        btn.classList.remove('added');
        btnText.textContent = 'Añadir a Mi Lista';
    }
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
    
    // Actualizar mensaje
    toastMessage.textContent = message;
    
    // Actualizar icono según el tipo
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
    
    // Mostrar con animación
    toast.classList.add("show");
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
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

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} dateString - Fecha ISO
 * @returns {string} Fecha formateada
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    initializeProfile();
    initializeDetailPage();
    
    // Configurar botón de enviar comentario
    const submitBtn = document.getElementById("submitComment");
    if (submitBtn) {
        submitBtn.addEventListener("click", submitComment);
    }
    
    // Permitir enviar con Enter
    const commentInput = document.getElementById("commentInput");
    if (commentInput) {
        commentInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitComment();
            }
        });
    }
});

/**
 * Recupera el usuario logueado desde localStorage y actualiza la UI
 */
function initializeProfile() {
    const userStr = localStorage.getItem("user");
    const profileEmail = document.getElementById("profileEmail");
    const avatarLetter = document.getElementById("avatarLetter");

    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.email) {
                profileEmail.textContent = user.email;
                avatarLetter.textContent = user.email.charAt(0).toUpperCase();
                return;
            }
        } catch (e) {
            console.error("Error al parsear el usuario:", e);
        }
    }
    // Valores por defecto
    profileEmail.textContent = "visitante@bibliotech.com";
    avatarLetter.textContent = "V";
}

/**
 * Cambia la pestaña activa en la barra lateral
 * @param {string} tabName - Nombre de la pestaña seleccionada
 */
function switchTab(tabName) {
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => item.classList.remove("active"));
    event.currentTarget.classList.add("active");
    
    const titles = {
        'prestamos': 'Gestión de Préstamos',
        'usuarios': 'Control de Usuarios y Lectores',
        'configuracion': 'Ajustes del Sistema'
    };
    document.getElementById("currentSectionTitle").textContent = titles[tabName] || "Dashboard";
}

/**
 * Alterna el estado abierto/cerrado de la barra lateral en versión móvil
 */
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

/**
 * Borra la sesión local y redirige al login
 */
function logout() {
    localStorage.removeItem("user");
}

/**
 * Abre el lector de PDF (reader.html) pasando exclusivamente el ID del libro.
 * El lector se encarga de obtener el PDF vía el proxy del backend + IndexedDB.
 * NUNCA se debe usar directamente currentBook.pdf_url (Cloudinary da 401).
 */
function openReader() {
    console.log("🔍 openReader() llamado, currentBook:", currentBook);

    const bookId = currentBook?.id;

    if (!bookId) {
        console.error("❌ No se encontró el ID del libro actual:", currentBook);
        alert("Lo sentimos, no se pudo identificar el libro.");
        return;
    }

    // Validar que el libro tenga un PDF asociado (sin exponer la URL cruda)
    if (!currentBook?.pdf_url) {
        console.error("❌ El libro no tiene pdf_url asociada:", currentBook);
        alert("Lo sentimos, este libro aún no tiene un archivo PDF disponible.");
        return;
    }

    console.log("📖 Abriendo lector para libro ID:", bookId);
    // Redirige al lector pasando solo el ID por query string.
    // reader.js → loadBook() → loadPDF() → proxy backend + IndexedDB
    window.location.href = `reader.html?id=${bookId}`;
}

/**
 * Alterna la lista "Mi Lista" para el libro actual
 */
function toggleMyList() {
    const btn = document.getElementById('btnAddList');
    const btnText = document.getElementById('listBtnText');
    const isAdded = btn.classList.toggle('added');
    
    if (isAdded) {
        btnText.textContent = 'En Mi Lista';
        btn.classList.add('added');
    } else {
        btnText.textContent = 'Añadir a Mi Lista';
        btn.classList.remove('added');
    }
    
    // Guardar en localStorage
    const myList = JSON.parse(localStorage.getItem('bibliotech_my_list') || '[]');
    if (isAdded) {
        if (!myList.includes(selectedBookId)) {
            myList.push(selectedBookId);
        }
    } else {
        const index = myList.indexOf(selectedBookId);
        if (index > -1) {
            myList.splice(index, 1);
        }
    }
    localStorage.setItem('bibliotech_my_list', JSON.stringify(myList));
}