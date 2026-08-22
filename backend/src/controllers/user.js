const { UserSetting, User } = require("../models");
const bcrypt = require("bcrypt");

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

  // ─── PUT /api/user/password ─────────────────────────────────
  // Cambia la contraseña del usuario autenticado.
  // Recibe: { currentPassword, newPassword }
  static async changePassword(req, res) {
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

      const { currentPassword, newPassword } = req.body;

      // Validaciones básicas
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Debes proporcionar la contraseña actual y la nueva",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "La nueva contraseña debe tener al menos 6 caracteres",
        });
      }

      // Obtener usuario con la contraseña incluida
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      // Verificar contraseña actual
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "La contraseña actual es incorrecta",
        });
      }

      // Encriptar nueva contraseña (10 salts, igual que en registro)
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar en la base de datos
      await User.update(
        { password: hashedPassword },
        { where: { id: decoded.id } }
      );

      res.json({
        success: true,
        message: "Contraseña actualizada correctamente",
      });
    } catch (error) {
      console.error("❌ Error al cambiar contraseña:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error al cambiar la contraseña",
      });
    }
  }

  // ─── PUT /api/user/avatar ───────────────────────────────────
  // Sube la foto de perfil al bucket 'Perfil' de Supabase Storage
  // y guarda la URL pública en la columna 'foto' de la base de datos Neon
  static async updateAvatar(req, res) {
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

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No se proporcionó ningún archivo de imagen",
        });
      }

      const { uploadAvatarFromBuffer } = require("../config/supabase");

      // 1. Subir imagen a Supabase Storage (bucket 'Perfil')
      const { secure_url } = await uploadAvatarFromBuffer(
        req.file.buffer,
        req.file.originalname
      );

      // 2. Actualizar campo 'foto' en Neon DB
      await User.update(
        { foto: secure_url },
        { where: { id: decoded.id } }
      );

      // 3. Obtener usuario actualizado
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      return res.status(200).json({
        success: true,
        message: "Foto de perfil actualizada exitosamente",
        data: user,
      });
    } catch (error) {
      console.error("❌ Error al actualizar foto de perfil:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al subir la foto de perfil",
      });
    }
  }
}

module.exports = UserController;