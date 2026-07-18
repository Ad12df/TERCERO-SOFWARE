// ==========================================================================
// LÓGICA DE CONTROL DEL DASHBOARD - GESTIÓN DE LIBROS (BIBLIOTECH)
// ==========================================================================

let editId = null;
let books = [];
let activeGenre = 'Todos'; // Género actualmente seleccionado para filtrar

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar perfil de usuario
    initializeProfile();
    // Cargar biblioteca (con datos de prueba por defecto)
    loadBooks();
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
 * Carga los libros de localStorage. Si no hay ninguno, inserta datos de prueba.
 */
function loadBooks() {
    const storedBooks = localStorage.getItem("bibliotech_books");
    
    if (storedBooks) {
        books = JSON.parse(storedBooks);
    } else {
        // Libros de prueba iniciales (con por lo menos uno tal como pide el usuario)
        books = [
            {
                id: 1,
                title: "Cien años de soledad",
                author: "Gabriel García Márquez",
                genre: "Realismo Mágico",
                year: 1967,
                available: true,
                synopsis: "La saga de la familia Buendía a lo largo de siete generaciones, en el pueblo ficticio de Macondo, con elementos de realismo mágico que mezclan lo cotidiano con lo extraordinario.",
                rating: 4.8,
                comments: [
                    { author: "María García", text: "Una obra maestra del realismo mágico. La forma en que García Márquez maneja el tiempo es simplemente fascinante.", date: "2024-01-15T10:30:00Z" },
                    { author: "Carlos Ruiz", text: "Me costó un poco al principio pero luego no pude soltar el libro. Recomendado al 100%.", date: "2024-02-20T15:45:00Z" }
                ],
                notes: ""
            },
            {
                id: 2,
                title: "Don Quijote de la Mancha",
                author: "Miguel de Cervantes",
                genre: "Clásico",
                year: 1605,
                available: true,
                synopsis: "Las aventuras de un hidalgo que enloquece leyendo libros de caballerías y decide convertirse en caballero andante, acompañado por su escudero Sancho Panza.",
                rating: 4.5,
                comments: [
                    { author: "Ana Martínez", text: "Un clásico que todo el mundo debería leer al menos una vez en la vida.", date: "2024-01-08T09:15:00Z" }
                ],
                notes: ""
            },
            {
                id: 3,
                title: "El Principito",
                author: "Antoine de Saint-Exupéry",
                genre: "Infantil / Fantasía",
                year: 1943,
                available: false,
                synopsis: "Un piloto cae en el desierto del Sahara y allí encuentra a un pequeño príncipe de otro planeta, con quien entabla una profunda amistad mientras descubre los secretos de la vida.",
                rating: 4.9,
                comments: [
                    { author: "Laura Sánchez", text: "Parece un libro infantil pero tiene capas profundas de significado. Me encanta releerlo.", date: "2024-03-01T14:20:00Z" },
                    { author: "Pedro López", text: "Mi libro favorito desde que era niño. Las ilustraciones son perfectas.", date: "2024-03-10T11:00:00Z" }
                ],
                notes: ""
            },
            {
                id: 4,
                title: "Ficciones",
                author: "Jorge Luis Borges",
                genre: "Ficción / Filosofía",
                year: 1944,
                available: true,
                synopsis: "Colección de cuentos que exploran temas como laberintos, bibliotecas infinitas, libros que contienen todos los libros posibles, y la naturaleza misma de la ficción.",
                rating: 4.7,
                comments: [],
                notes: ""
            }
        ];
        saveToStorage();
    }
    
    renderBooks(books);
}

/**
 * Guarda el arreglo de libros actual en localStorage
 */
function saveToStorage() {
    localStorage.setItem("bibliotech_books", JSON.stringify(books));
}

/**
 * Renderiza la colección de libros en la grid de la interfaz
 * @param {Array} booksList - Lista de libros a renderizar
 */
function renderBooks(booksList) {
    const grid = document.getElementById("booksGrid");
    grid.innerHTML = "";

    if (booksList.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">
                <p style="font-size: 1.2rem; font-weight: 600;">No se encontraron libros</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Haz clic en "Añadir Libro" para registrar uno nuevo.</p>
            </div>
        `;
        return;
    }

    booksList.forEach((book, index) => {
        const availabilityClass = book.available ? "disponible" : "no-disponible";
        const availabilityText = book.available ? "Disponible" : "Prestado";
        
        const card = document.createElement("div");
        card.className = "book-card";
        // Aplicar delay escalonado para la animación de entrada
        card.style.animationDelay = `${index * 0.08}s`;
        card.innerHTML = `
            <div class="book-card-header">
                <span class="book-badge ${availabilityClass}">${availabilityText}</span>
                <div class="book-cover-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${book.genre}</span>
                </div>
            </div>
            <div class="book-card-body">
                <h4 class="book-title">${book.title}</h4>
                <p class="book-author">por ${book.author}</p>
                <div class="book-meta">
                    <span>Publicado: <strong>${book.year}</strong></span>
                    <span>ID: #<strong>${book.id}</strong></span>
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
    
    // Filtrar por género si no es "Todos"
    if (activeGenre !== 'Todos') {
        filtered = filtered.filter(book => book.genre === activeGenre);
    }
    
    // Filtrar por texto de búsqueda
    if (query) {
        filtered = filtered.filter(book => 
            book.title.toLowerCase().includes(query) || 
            book.author.toLowerCase().includes(query) || 
            book.genre.toLowerCase().includes(query)
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
    
    // Actualizar botones activos visualmente
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        if (btn.getAttribute('data-genre') === genre) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Aplicar el filtro combinado (género + búsqueda)
    filterBooks();
}

/**
 * Abre el modal para añadir un nuevo libro
 */
function openAddModal() {
    editId = null;
    document.getElementById("modalTitle").textContent = "Registrar Nuevo Libro";
    document.getElementById("bookForm").reset();
    document.getElementById("bookModal").classList.add("active");
}

/**
 * Abre el modal para editar un libro existente
 * @param {number} id - ID del libro a editar
 */
function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    editId = id;
    document.getElementById("modalTitle").textContent = "Editar Libro";
    document.getElementById("bookTitle").value = book.title;
    document.getElementById("bookAuthor").value = book.author;
    document.getElementById("bookGenre").value = book.genre;
    document.getElementById("bookYear").value = book.year;
    
    document.getElementById("bookModal").classList.add("active");
}

/**
 * Cierra el modal de formulario
 */
function closeModal() {
    document.getElementById("bookModal").classList.remove("active");
    document.getElementById("bookForm").reset();
    editId = null;
}

/**
 * Guarda (crea o actualiza) un libro
 */
function saveBook() {
    const title = document.getElementById("bookTitle").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const genre = document.getElementById("bookGenre").value.trim();
    const year = parseInt(document.getElementById("bookYear").value);

    if (!title || !author || !genre || !year) {
        alert("Por favor, complete todos los campos requeridos.");
        return;
    }

    if (editId) {
        // Edición de libro existente
        const index = books.findIndex(b => b.id === editId);
        if (index !== -1) {
            books[index].title = title;
            books[index].author = author;
            books[index].genre = genre;
            books[index].year = year;
        }
    } else {
        // Creación de nuevo libro
        const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
        books.push({
            id: newId,
            title,
            author,
            genre,
            year,
            available: true // Disponible por defecto al registrarse
        });
    }

    saveToStorage();
    renderBooks(books);
    closeModal();
}

/**
 * Elimina un libro de la lista con confirmación previa
 * @param {number} id - ID del libro a eliminar
 */
function deleteBook(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este libro?")) {
        books = books.filter(b => b.id !== id);
        saveToStorage();
        renderBooks(books);
        if (selectedBookId === id) {
            closeBookDetail();
        }
    }
}

/**
 * Cambia la pestaña activa en la barra lateral
 * @param {string} tabName - Nombre de la pestaña seleccionada
 */
function switchTab(tabName) {
    // Si es configuración, redirigir a settings.html
    if (tabName === 'configuracion') {
        window.location.href = 'settings.html';
        return;
    }

    // Limpiar clases activas en los ítems del menú de la barra lateral
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => item.classList.remove("active"));

    // Establecer elemento activo basado en el atributo onclick de la UI
    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    // Actualizar título de la sección superior (Topbar)
    const titles = {
        'libros': 'Catálogo de Libros',
        'prestamos': 'Gestión de Préstamos',
        'usuarios': 'Control de Usuarios y Lectores',
        'configuracion': 'Configuración'
    };

    document.getElementById("currentSectionTitle").textContent = titles[tabName] || "Dashboard";

    // Si cambiamos a Libros, recargamos la colección
    if (tabName === 'libros') {
        renderBooks(books);
    } else {
        // Para las otras secciones estáticas, mostramos un placeholder bien diseñado
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

/**
 * Borra la sesión local y redirige al login
 */
function logout() {
    localStorage.removeItem("user");
}
