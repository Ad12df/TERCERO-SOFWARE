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
const VERCEL_URL = "https://tercero-sofware.vercel.app"; // 👈 Coloca aquí tu URL de Vercel

// Lista de orígenes permitidos (Vercel + localhost para desarrollo + APK Capacitor)
const allowedOrigins = [
  VERCEL_URL,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://localhost:8080",
  // Capacitor iOS
  "capacitor://localhost",
  // Capacitor Android con androidScheme: "https"
  "https://localhost",
  // Capacitor Android con androidScheme: "http" (fallback)
  "http://localhost",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite:
      //  - peticiones sin origen (curl, Postman, WebView Android que no envía Origin)
      //  - cualquier subdominio de vercel (previews de deploy)
      //  - los orígenes de la lista explícita
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https:\/\/tercero-sofware.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      console.warn(`[CORS] Origen bloqueado: ${origin}`);
      return callback(new Error("No permitido por CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // 👈 Permite envío de credenciales/cookies
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
