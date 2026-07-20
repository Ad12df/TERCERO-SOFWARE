const router = require("express").Router();
const ModerationController = require("../../controllers/moderation");
const { authenticate, authorize } = require("../../middleware/auth");

// ─── Rutas de moderación (solo admin) ────────────────────────

// GET /api/moderation/counts - Obtener conteos de solicitudes pendientes
router.get("/counts", authenticate, authorize("admin"), ModerationController.getCounts);

// ─── Rutas de libros pendientes ───────────────────────────────

// GET /api/moderation/books/pending - Obtener libros pendientes
router.get(
  "/books/pending",
  authenticate,
  authorize("admin"),
  ModerationController.getPendingBooks
);

// PUT /api/moderation/books/:id/approve - Aprobar un libro
router.put(
  "/books/:id/approve",
  authenticate,
  authorize("admin"),
  ModerationController.approveBook
);

// PUT /api/moderation/books/:id/reject - Rechazar un libro
router.put(
  "/books/:id/reject",
  authenticate,
  authorize("admin"),
  ModerationController.rejectBook
);

// PUT /api/moderation/books/approve-all - Aprobar todos los libros pendientes
router.put(
  "/books/approve-all",
  authenticate,
  authorize("admin"),
  ModerationController.approveAllBooks
);

// PUT /api/moderation/books/reject-all - Rechazar todos los libros pendientes
router.put(
  "/books/reject-all",
  authenticate,
  authorize("admin"),
  ModerationController.rejectAllBooks
);

// ─── Rutas de solicitudes de escritor ────────────────────────

// GET /api/moderation/writer-requests - Obtener solicitudes de ascenso
router.get(
  "/writer-requests",
  authenticate,
  authorize("admin"),
  ModerationController.getWriterRequests
);

// POST /api/moderation/writer-requests - Crear solicitud de ascenso (usuario autenticado)
router.post(
  "/writer-requests",
  authenticate,
  ModerationController.createWriterRequest
);

// PUT /api/moderation/writer-requests/:id/approve - Aprobar solicitud
router.put(
  "/writer-requests/:id/approve",
  authenticate,
  authorize("admin"),
  ModerationController.approveWriterRequest
);

// PUT /api/moderation/writer-requests/:id/reject - Rechazar solicitud
router.put(
  "/writer-requests/:id/reject",
  authenticate,
  authorize("admin"),
  ModerationController.rejectWriterRequest
);

// PUT /api/moderation/writer-requests/approve-all - Aprobar todas las solicitudes
router.put(
  "/writer-requests/approve-all",
  authenticate,
  authorize("admin"),
  ModerationController.approveAllWriterRequests
);

// PUT /api/moderation/writer-requests/reject-all - Rechazar todas las solicitudes
router.put(
  "/writer-requests/reject-all",
  authenticate,
  authorize("admin"),
  ModerationController.rejectAllWriterRequests
);

module.exports = router;