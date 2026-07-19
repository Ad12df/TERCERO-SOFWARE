const router = require("express").Router();
const UserController = require("../controllers/user");

// ─── Rutas de usuario ─────────────────────────────────────────

// GET /api/user/settings - Obtener configuraciones
router.get("/settings", UserController.getSettings);

// PUT /api/user/settings - Actualizar configuraciones
router.put("/settings", UserController.updateSettings);

// GET /api/user/profile - Obtener perfil
router.get("/profile", UserController.getProfile);

// PUT /api/user/profile - Actualizar perfil
router.put("/profile", UserController.updateProfile);

module.exports = router;