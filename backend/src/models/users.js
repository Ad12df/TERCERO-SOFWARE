const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "user", "escritor"),
      defaultValue: "user",
      allowNull: false,
    },
  },
  {
    timestamps: true,
    // ⚠️ Se eliminaron los hooks de encriptación del modelo.
    // La encriptación ahora se hace en el controlador con bcrypt.hash (10 salts)
    // para evitar doble encriptación.
  }
);

// Método para comparar contraseñas usando bcrypt.compare
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si es admin
User.prototype.isAdmin = function () {
  return this.role === "admin";
};

module.exports = User;
