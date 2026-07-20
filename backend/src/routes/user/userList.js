const router = require("express").Router();
const UserListController = require("../../controllers/userList");
const { authenticate } = require("../../middleware/auth");

// GET /api/lists — Obtener todos los libros de la lista del usuario
router.get("/", authenticate, UserListController.getUserList);

// GET /api/lists/check/:bookId — Verificar si un libro está en la lista
router.get("/check/:bookId", authenticate, UserListController.checkBook);

// POST /api/lists/add — Añadir un libro a la lista
router.post("/add", authenticate, UserListController.addBook);

// DELETE /api/lists/remove/:bookId — Quitar un libro de la lista
router.delete("/remove/:bookId", authenticate, UserListController.removeBook);

module.exports = router;