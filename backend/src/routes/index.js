const router = require("express").Router();

const authRoutes = require("./auth");
const userRoutes = require("./user");
const bookRoutes = require("./books");

// ─── Rutas de autenticación ──────────────────────────────────
router.use("/auth", authRoutes);

// ─── Rutas de usuario ────────────────────────────────────────
router.use("/user", userRoutes);

// ─── Rutas de libros ─────────────────────────────────────────
router.use("/books", bookRoutes);

// ─── Rutas legacy (mantener compatibilidad) ───────────────────
const userLegacyRoutes = require("./user/");
router.use("/user", userLegacyRoutes);

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Running",
  });
});

module.exports = router;
