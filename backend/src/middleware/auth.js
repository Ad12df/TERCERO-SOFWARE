const { User } = require("../models");

// ─── Middleware de autenticación ─────────────────────────────
// Verifica que el token esté presente y sea válido
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado",
      });
    }

    // Decodificar token simple (base64)
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    } catch {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    req.user = decoded; // Adjunta el usuario decodificado al request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Error de autenticación",
    });
  }
};

// ─── Middleware de autorización por rol ───────────────────────
// Verifica que el usuario tenga el rol requerido (ej: 'admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
