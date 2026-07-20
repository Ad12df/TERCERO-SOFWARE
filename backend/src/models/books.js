const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Book = sequelize.define(
  "books",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pdf_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    puntuacion_media: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
    },
    total_resenas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    autor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    progreso_porcentaje: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    fecha_ultima_lectura: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("PENDIENTE", "APROBADO"),
      defaultValue: "PENDIENTE",
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Book;