const AuthService = require("../services/auth");

class AuthController {
  // ─── POST /api/auth/register ────────────────────────────────
  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validaciones básicas
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Nombre, email y contraseña son requeridos",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
        });
      }

      const user = await AuthService.register({ name, email, password, role });

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: user,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Error al registrar usuario",
      });
    }
  }

  // ─── POST /api/auth/login ────────────────────────────────────
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email y contraseña son requeridos",
        });
      }

      const user = await AuthService.login({ email, password });

      res.json({
        success: true,
        message: "Login exitoso",
        data: user,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Error al iniciar sesión",
      });
    }
  }

  // ─── GET /api/auth/me ────────────────────────────────────────
  static async me(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token no proporcionado",
        });
      }

      const decoded = AuthService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });
      }

      const { User } = require("../models");
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al obtener usuario",
      });
    }
  }
}

module.exports = AuthController;