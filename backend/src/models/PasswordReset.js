/**
 * Modelo PasswordReset
 * ---------------------
 * Tabla auxiliar que almacena los tokens de recuperación de contraseña.
 * Cada registro está asociado a un usuario y contiene:
 *   - token:        hash del token enviado por correo (nunca se guarda en claro)
 *   - expiresAt:    fecha de expiración (15–30 min desde su creación)
 *   - used:         bandera para invalidar el token una vez consumido
 *
 * Ventajas de usar una tabla auxiliar frente a columnas en `users`:
 *   - Permite múltiples solicitudes simultáneas sin sobrescribir datos.
 *   - Facilita auditoría y limpieza de tokens expirados.
 *   - Mantiene el modelo User limpio de responsabilidades de recuperación.
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PasswordReset = sequelize.define(
  "password_resets",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // La FK se define en models/index.js mediante relaciones
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      // Se almacena el HASH (bcrypt) del token, no el token en claro
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
    tableName: "password_resets",
  }
);

module.exports = PasswordReset;
