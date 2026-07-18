const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Book = require("./books");

const Review = sequelize.define(
  "reviews",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    puntuacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
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
  },
  {
    timestamps: true,
    hooks: {
      afterCreate: async (review) => {
        await recalcularPuntuacionMedia(review.book_id);
      },
      afterUpdate: async (review) => {
        await recalcularPuntuacionMedia(review.book_id);
      },
      afterDestroy: async (review) => {
        await recalcularPuntuacionMedia(review.book_id);
      },
    },
  }
);

// Función para recalcular la puntuación media
async function recalcularPuntuacionMedia(bookId) {
  try {
    const { Review, Book } = require("./index");

    const result = await Review.findOne({
      where: { book_id: bookId },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("puntuacion")), "promedio"],
        [sequelize.fn("COUNT", sequelize.col("id")), "total"],
      ],
      raw: true,
    });

    const promedio = result.promedio ? parseFloat(result.promedio).toFixed(1) : 0;
    const total = result.total || 0;

    await Book.update(
      {
        puntuacion_media: promedio,
        total_resenas: total,
      },
      { where: { id: bookId } }
    );

    console.log(`✅ Puntuación media actualizada para libro ${bookId}: ${promedio}`);
  } catch (error) {
    console.error("❌ Error al recalcular puntuación media:", error);
  }
}

module.exports = Review;