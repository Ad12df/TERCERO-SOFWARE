const bcrypt = require("bcrypt");
const { User } = require("../models");

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
}

module.exports = AuthController;