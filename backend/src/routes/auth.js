const router = require("express").Router();
const AuthController = require("../controllers/auth");

// ─── Rutas de autenticación ──────────────────────────────────

// POST /api/auth/register - Registrar usuario
router.post("/register", AuthController.register);

// POST /api/auth/login - Iniciar sesión
router.post("/login", AuthController.login);

// GET /api/auth/me - Obtener usuario actual (con token)
router.get("/me", AuthController.me);

module.exports = router;