// ─────────────────────────────────────────────────────────────
// Modelo UserList — Asocia un usuario con un libro en su lista
// ─────────────────────────────────────────────────────────────
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserList = sequelize.define("UserList", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "books",
      key: "id",
    },
  },
}, {
  tableName: "user_lists",
  timestamps: true,
  updatedAt: "fecha_actualizacion",
  createdAt: "fecha_creacion",
  indexes: [
    // Evita duplicados: un mismo libro no dos veces en la misma lista
    { unique: true, fields: ["user_id", "book_id"] },
  ],
});

module.exports = UserList;