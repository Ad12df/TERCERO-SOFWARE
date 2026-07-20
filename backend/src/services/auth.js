const { User, UserSetting } = require("../models");

class AuthService {
  // ─── Registrar usuario ──────────────────────────────────────
  static async register({ name, email, password, role }) {
    // Validar que el email no exista
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error("El email ya está registrado");
      error.status = 400;
      throw error;
    }

    // Validar rol (solo 'admin' o 'escritor' si se especifica, sino 'user' por defecto)
    const validRoles = ["admin", "user", "escritor"];
    const validRole = validRoles.includes(role) ? role : "user";

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: validRole,
    });

    // Crear configuración por defecto
    await UserSetting.create({
      user_id: user.id,
    });

    // Retornar datos públicos (sin contraseña)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  // ─── Iniciar sesión ─────────────────────────────────────────
  static async login({ email, password }) {
    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("Credenciales inválidas");
      error.status = 401;
      throw error;
    }

    // Comparar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Credenciales inválidas");
      error.status = 401;
      throw error;
    }

    // Generar token simple (para pruebas)
    const token = this.generateToken(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
  }

  // ─── Generar token simple ───────────────────────────────────
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    // Token simple codificado (para producción usar JWT real)
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }

  // ─── Verificar token ────────────────────────────────────────
  static verifyToken(token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      return decoded;
    } catch {
      return null;
    }
  }
}

module.exports = AuthService;