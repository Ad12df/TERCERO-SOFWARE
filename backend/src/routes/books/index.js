const router = require("express").Router();
const BookController = require("../../controllers/books");
const { authenticate, authorize } = require("../../middleware/auth");
const { uploadBookFiles } = require("../../config/cloudinary");

// ─── Rutas de libros ─────────────────────────────────────────

// GET /api/books - Obtener todos los libros (público)
router.get("/", BookController.getBooks);

// GET /api/books/:id - Obtener un libro por ID (público)
router.get("/:id", BookController.getBookById);

// POST /api/books - Crear un libro
// ⚠️ El middleware de Multer va ANTES del controlador
// Acepta campos múltiples: 'foto' (portada) y 'pdf' (documento)
// ⚠️ TEMPORAL: Se quitó authorize("admin") para pruebas locales con Cloudinary
router.post(
  "/",
  authenticate, // 👈 Verifica que el usuario esté autenticado
  // authorize("admin"), // 👈 DESACTIVADO TEMPORALMENTE — cualquier usuario puede crear libros
  uploadBookFiles, // 👈 Multer procesa los archivos (foto + pdf)
  BookController.createBook
);

// PUT /api/books/:id - Actualizar un libro
router.put(
  "/:id",
  authenticate,
  uploadBookFiles,
  BookController.updateBook
);

// DELETE /api/books/:id - Eliminar un libro (solo admin)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  BookController.deleteBook
);

module.exports = router;
