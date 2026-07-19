const { UserSetting, User } = require("../models");

class UserController {
  // ─── GET /api/user/settings ─────────────────────────────────
  static async getSettings(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token no proporcionado",
        });
      }

      const AuthService = require("../services/auth");
      const decoded = AuthService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });
      }

      let settings = await UserSetting.findOne({
        where: { user_id: decoded.id },
      });

      // Si no existe, crear con valores por defecto
      if (!settings) {
        settings = await UserSetting.create({
          user_id: decoded.id,
        });
      }

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al obtener configuraciones",
      });
    }
  }

  // ─── PUT /api/user/settings ─────────────────────────────────
  static async updateSettings(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token no proporcionado",
        });
      }

      const AuthService = require("../services/auth");
      const decoded = AuthService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });
      }

      const { tema, idioma, notificaciones, tamano_letra } = req.body;

      // Campos permitidos para actualizar
      const updateData = {};
      if (tema !== undefined) updateData.tema = tema;
      if (idioma !== undefined) updateData.idioma = idioma;
      if (notificaciones !== undefined) updateData.notificaciones = notificaciones;
      if (tamano_letra !== undefined) updateData.tamano_letra = tamano_letra;

      const [updated] = await UserSetting.update(updateData, {
        where: { user_id: decoded.id },
        returning: true,
      });

      if (!updated) {
        // Crear si no existe
        const newSettings = await UserSetting.create({
          user_id: decoded.id,
          ...updateData,
        });
        return res.json({
          success: true,
          message: "Configuración creada",
          data: newSettings,
        });
      }

      const settings = await UserSetting.findOne({
        where: { user_id: decoded.id },
      });

      res.json({
        success: true,
        message: "Configuración actualizada",
        data: settings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al actualizar configuraciones",
      });
    }
  }

  // ─── GET /api/user/profile ──────────────────────────────────
  static async getProfile(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token no proporcionado",
        });
      }

      const AuthService = require("../services/auth");
      const decoded = AuthService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });
      }

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
        message: error.message || "Error al obtener perfil",
      });
    }
  }

  // ─── PUT /api/user/profile ──────────────────────────────────
  static async updateProfile(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token no proporcionado",
        });
      }

      const AuthService = require("../services/auth");
      const decoded = AuthService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });
      }

      const { name, email } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      await User.update(updateData, {
        where: { id: decoded.id },
      });

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      res.json({
        success: true,
        message: "Perfil actualizado",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al actualizar perfil",
      });
    }
  }
}

module.exports = UserController;