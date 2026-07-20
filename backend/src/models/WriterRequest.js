const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WriterRequest = sequelize.define(
  "writer_requests",
  {
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
    estado: {
      type: DataTypes.ENUM("PENDIENTE", "APROBADO", "RECHAZADO"),
      defaultValue: "PENDIENTE",
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = WriterRequest;