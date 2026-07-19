const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// ─── Rutas ────────────────────────────────────────────────────
const routes = require("./routes");

const app = express();

// ─── 1. Configuración CORS ────────────────────────────────────
// ⚠️ REEMPLAZA 'TU_URL_DE_VERCEL' con tu URL de Vercel
const VERCEL_URL = "https://tercero-sofware.vercel.app";

app.use(
  cors({
    origin: VERCEL_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ─── 2. Middlewares esenciales ─────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// ─── 3. Ruta raíz de control ──────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "¡Backend de la librería corriendo con éxito en Render!",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

// ─── 4. Rutas de la API ────────────────────────────────────────
app.use("/api", routes);

// ─── 5. Manejo de errores 404 ────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

module.exports = app;
