const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserSetting = sequelize.define(
  "user_settings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    tema: {
      type: DataTypes.ENUM("claro", "oscuro"),
      defaultValue: "oscuro",
      allowNull: false,
    },
    idioma: {
      type: DataTypes.STRING(10),
      defaultValue: "es",
      allowNull: false,
    },
    notificaciones: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    tamano_letra: {
      type: DataTypes.ENUM("pequeño", "mediano", "grande"),
      defaultValue: "mediano",
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = UserSetting;