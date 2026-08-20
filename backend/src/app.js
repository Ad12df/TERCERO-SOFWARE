const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// ─── Rutas ────────────────────────────────────────────────────
const routes = require("./routes");

const app = express();

// ─── 1. Configuración CORS ────────────────────────────────────
// ⚠️ REEMPLAZA la URL de abajo con tu URL de Vercel
//    Ejemplo: "https://mi-libreria.vercel.app"
const VERCEL_URL = "https://tercero-sofware.onrender.com"; // 👈 Coloca aquí tu URL de Vercel

// Lista de orígenes permitidos (Vercel + localhost para desarrollo)
const allowedOrigins = [
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  "https://tercero-sofware.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // 1. Si no hay origin (ej. llamadas servidor-a-servidor o algunas apps nativas) -> Permitir
      if (!origin) return callback(null, true);

      // 2. Si viene de capacitor, localhost en cualquier puerto/protocolo o Render -> Permitir
      if (
        origin.includes('localhost') ||
        origin.includes('capacitor://') ||
        origin.includes('tercero-sofware.onrender.com') ||
        origin.includes('tercero-sofware.vercel.app')
      ) {
        return callback(null, true);
      }

      // Si no coincide con ninguno, denegar
      return callback(new Error('No permitido por CORS'));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── 2. Middlewares esenciales ─────────────────────────────────
// ⚠️ express.json() DEBE ir ANTES de declarar las rutas
app.use(helmet());
app.use(express.json({ limit: "50mb" })); // 👈 Parsea bodies JSON
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
