const sequelize = require("../config/database");
const User = require("./users");
const Book = require("./books");
const Review = require("./reviews");

// ─── Relaciones ───────────────────────────────────────────────

// User → Reviews (un usuario tiene muchos comentarios)
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });

// Review → User (un comentario pertenece a un usuario)
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Book → Reviews (un libro tiene muchos comentarios)
Book.hasMany(Review, { foreignKey: "book_id", as: "reviews" });

// Review → Book (un comentario pertenece a un libro)
Review.belongsTo(Book, { foreignKey: "book_id", as: "book" });

// User → Books (un admin puede crear muchos libros)
User.hasMany(Book, { foreignKey: "created_by", as: "libros" });

// Book → User (cada libro tiene un creador)
Book.belongsTo(User, { foreignKey: "created_by", as: "creador" });

// ─── Conexión y Sincronización ─────────────────────────────────

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // ⚠️ Sincroniza TODOS los modelos - CREA/ACTUALIZA TABLAS AUTOMÁTICAMENTE
    // ⚠️ En producción usa migraciones en vez de esto
    await sequelize.sync({ alter: true });
    console.log("✅ Tablas sincronizadas correctamente");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
  User,
  Book,
  Review,
};
