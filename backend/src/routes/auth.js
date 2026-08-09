const router = require("express").Router();
const AuthController = require("../controllers/auth");

// ─── Rutas de autenticación ──────────────────────────────────

// POST /api/auth/register - Registrar usuario
router.post("/register", AuthController.register);

// POST /api/auth/login - Iniciar sesión
router.post("/login", AuthController.login);

// GET /api/auth/me - Obtener usuario actual (con token)
router.get("/me", AuthController.me);

// POST /api/auth/forgot-password - Solicitar enlace de recuperación
router.post("/forgot-password", AuthController.forgotPassword);

// POST /api/auth/reset-password - Restablecer contraseña con token
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;