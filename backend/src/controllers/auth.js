const bcrypt = require("bcrypt");
const { User } = require("../models");
const AuthService = require("../services/auth");

class AuthController {
  // ─── POST /api/auth/register ────────────────────────────────
  // Recibe name, email, password y role (admin o user) desde req.body
  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // ─── 1. Validaciones básicas ──────────────────────────────
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

      // ─── 2. Verificar si el email ya existe ────────────────────
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "El email ya está registrado",
        });
      }

      // ─── 3. Encriptar la contraseña con bcrypt.hash (10 salts) ──
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // ─── 4. Asignar rol por defecto 'user' si no viene o no es válido ─────
      const validRoles = ["admin", "user", "escritor"];
      const validRole = validRoles.includes(role) ? role : "user";

      // ─── 5. Guardar el registro en la base de datos ───────────
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: validRole,
      });

      // ─── 6. Responder con los datos del usuario (sin contraseña) ─
      return res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("❌ Error en register:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al registrar usuario",
      });
    }
  }

  // ─── POST /api/auth/login ────────────────────────────────────
  // Busca al usuario por email y compara la contraseña con bcrypt.compare
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // ─── 1. Validaciones básicas ──────────────────────────────
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email y contraseña son requeridos",
        });
      }

      // ─── 2. Buscar al usuario por su email ────────────────────
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas (email no encontrado)",
        });
      }

      // ─── 3. Comparar la contraseña en texto plano con el hash ──
      //    usando bcrypt.compare
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas (contraseña incorrecta)",
        });
      }

      // ─── 4. Retornar estado 200 con los datos del usuario ──────
      return res.status(200).json({
        success: true,
        message: "Login exitoso",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("❌ Error en login:", error);
      return res.status(500).json({
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

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("❌ Error en me:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener usuario",
      });
    }
  }
  // ─── Solicitar recuperación de contraseña ───────────────────
  /**
   * POST /api/auth/forgot-password
   * Body: { email }
   *
   * Responde SIEMPRE con el mismo mensaje, exista o no el correo,
   * para evitar enumeración de usuarios (ataque de descubrimiento).
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      console.log("\n========== 📨 FORGOT PASSWORD ==========");
      console.log("[1] req.body recibido del frontend:", JSON.stringify(req.body));
      console.log("[1] req.headers:", JSON.stringify({ origin: req.headers.origin, "content-type": req.headers["content-type"] }));
      console.log("Solicitud de recuperación para:", email);
      console.log("EMAIL_PROVIDER =", process.env.EMAIL_PROVIDER);
      console.log("SMTP_HOST =", process.env.SMTP_HOST);
      console.log("SMTP_PORT =", process.env.SMTP_PORT);
      console.log("SMTP_USER =", process.env.SMTP_USER ? "(set)" : "(NOT SET)");
      console.log("SMTP_PASS =", process.env.SMTP_PASS ? "(set)" : "(NOT SET)");
      console.log("SMTP_FROM =", process.env.SMTP_FROM);
      console.log("APP_BASE_URL =", process.env.APP_BASE_URL);
      console.log("========================================\n");

      // ─── Validación básica ──────────────────────────────────
      if (!email) {
        console.log("❌ Email no proporcionado en el body");
        return res.status(400).json({
          success: false,
          message: "El correo electrónico es obligatorio",
        });
      }

      // Validar formato de email con expresión regular simple
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "El formato del correo electrónico no es válido",
        });
      }

      // ─── Delegar al servicio ────────────────────────────────
      console.log("➡️  Delegando a AuthService.forgotPassword...");
      const result = await AuthService.forgotPassword(email);
      console.log("⬅️  AuthService.forgotPassword retornó:", result);

      // ─── Respuesta genérica (anti-enumeración) ───────────────
      console.log("✅ Respondiendo 200 OK (anti-enumeración)\n");
      return res.status(200).json({
        success: true,
        message:
          "Si el correo está registrado, recibirás un enlace de recuperación en breve.",
      });
    } catch (error) {
      console.error("❌❌ Error en forgotPassword (controller):", error);
      console.error("Stack:", error.stack);
      // Incluso en error interno, devolvemos el mismo mensaje genérico
      return res.status(200).json({
        success: true,
        message:
          "Si el correo está registrado, recibirás un enlace de recuperación en breve.",
      });
    }
  }

  // ─── Restablecer contraseña con token ───────────────────────
  /**
   * POST /api/auth/reset-password
   * Body: { token, newPassword }
   *
   * Valida el token, hashea la nueva contraseña con bcrypt (vía
   * utils/password.js) y actualiza al usuario. Invalida el token.
   */
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // ─── Validaciones ────────────────────────────────────────
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "El token y la nueva contraseña son obligatorios",
        });
      }

      // Validar longitud mínima de contraseña
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
        });
      }

      // ─── Delegar al servicio ────────────────────────────────
      const user = await AuthService.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: "Contraseña actualizada correctamente",
        data: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error("❌ Error en resetPassword:", error);
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || "Error al restablecer la contraseña",
      });
    }
  }
}

module.exports = AuthController;