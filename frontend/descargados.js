// Redirección para usuarios de escritorio en descargados.html
window.onload = function() {
    if (window.matchMedia && window.matchMedia('(min-width: 1025px)').matches) {
        window.location.href = 'books.html';
    }
    // Resto de la lógica para cargar libros guardados localmente
    // ... existent code ...
};