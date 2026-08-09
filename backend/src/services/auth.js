const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { User, UserSetting, PasswordReset } = require("../models");
const { sendPasswordResetEmail } = require("./email");
const { encryptPassword } = require("../utils/password");

// ─── Constantes de seguridad ────────────────────────────────────
const RESET_TOKEN_BYTES = 32; // 32 bytes = 256 bits de entropía
const RESET_TOKEN_EXPIRY_MIN = 15; // 15 minutos de validez
const BCRYPT_SALT_ROUNDS = 10;

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
  // ─── Solicitar recuperación de contraseña ───────────────────
  /**
   * Genera un token de recuperación, lo guarda (hasheado) en la BD
   * y envía el correo con el enlace de restablecimiento.
   *
   * @param {string} email - Correo del usuario que solicita recuperación
   * @returns {Promise<boolean>} true si se envió el correo, false si el usuario no existe
   *   (el controlador responde igual en ambos casos para evitar enumeración)
   */
  static async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });

    // Si el usuario no existe, no hacemos nada pero devolvemos true
    // para que el controlador responda de forma idéntica (anti-enumeración)
    if (!user) return false;

    // ─── 1. Generar token criptográficamente seguro ────────────
    const plainToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");

    // ─── 2. Hashear el token antes de guardarlo en la BD ───────
    const hashedToken = await bcrypt.hash(plainToken, BCRYPT_SALT_ROUNDS);

    // ─── 3. Calcular fecha de expiración ──────────────────────
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MIN * 60 * 1000);

    // ─── 4. Invalidar tokens anteriores del usuario ────────────
    await PasswordReset.update(
      { used: true },
      { where: { user_id: user.id, used: false } }
    );

    // ─── 5. Guardar el nuevo token ─────────────────────────────
    await PasswordReset.create({
      user_id: user.id,
      token: hashedToken,
      expiresAt,
      used: false,
    });

    // ─── 6. Enviar el correo con el token en claro ────────────
    await sendPasswordResetEmail(user.email, plainToken);

    return true;
  }

  // ─── Restablecer contraseña con token ───────────────────────
  /**
   * Valida el token de recuperación, hashea la nueva contraseña y
   * actualiza el registro del usuario. Invalida el token usado.
   *
   * @param {string} token        - Token en claro recibido por URL
   * @param {string} newPassword  - Nueva contraseña en texto plano
   * @throws {Error} Con `status` 400 si el token es inválido/expirado
   * @returns {Promise<object>} Datos mínimos del usuario actualizado
   */
  static async resetPassword(token, newPassword) {
    // ─── 1. Buscar tokens no usados ────────────────────────────
    const resetRecords = await PasswordReset.findAll({
      where: { used: false },
    });

    // ─── 2. Comparar el token recibido con cada hash ───────────
    let matchedRecord = null;
    let matchedUser = null;

    for (const record of resetRecords) {
      const isMatch = await bcrypt.compare(token, record.token);
      if (isMatch) {
        matchedRecord = record;
        matchedUser = await User.findByPk(record.user_id);
        break;
      }
    }

    if (!matchedRecord || !matchedUser) {
      const error = new Error("Token inválido o expirado");
      error.status = 400;
      throw error;
    }

    // ─── 3. Verificar que el token no haya expirado ────────────
    if (new Date() > new Date(matchedRecord.expiresAt)) {
      // Marcar como usado para evitar reintentos sobre un token expirado
      await matchedRecord.update({ used: true });
      const error = new Error("El token ha expirado");
      error.status = 400;
      throw error;
    }

    // ─── 4. Hashear la nueva contraseña ────────────────────────
    //    Se usa el utilitario centralizado utils/password.js
    const hashedPassword = await encryptPassword(newPassword);

    // ─── 5. Actualizar la contraseña del usuario ────────────────
    await matchedUser.update({ password: hashedPassword });

    // ─── 6. Invalidar el token usado ───────────────────────────
    await matchedRecord.update({ used: true });

    return {
      id: matchedUser.id,
      email: matchedUser.email,
    };
  }
}

module.exports = AuthService;