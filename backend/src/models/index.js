const sequelize = require("../config/database");
const User = require("./users");
const Book = require("./books");
const Review = require("./reviews");
const UserSetting = require("./userSettings");
const Comment = require("./Comment");
const UserList = require("./UserList");
const UserRead = require("./UserRead");
const WriterRequest = require("./WriterRequest");

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

// User → UserSetting (un usuario tiene una configuración)
User.hasOne(UserSetting, { foreignKey: "user_id", as: "settings" });

// UserSetting → User (la configuración pertenece a un usuario)
UserSetting.belongsTo(User, { foreignKey: "user_id", as: "user" });

// ─── Comment Relations ────────────────────────────────────────

// User → Comments (un usuario puede escribir muchos comentarios)
User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });

// Comment → User (cada comentario pertenece a un usuario)
Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Book → Comments (un libro tiene muchos comentarios de discusión)
Book.hasMany(Comment, { foreignKey: "book_id", as: "comments", onDelete: "CASCADE", hooks: true });

// Comment → Book (cada comentario pertenece a un libro)
Comment.belongsTo(Book, { foreignKey: "book_id", as: "book" });

// ─── UserList Relations ────────────────────────────────────────

// User → UserList (un usuario puede tener muchos libros en su lista)
User.hasMany(UserList, { foreignKey: "user_id", as: "userList", onDelete: "CASCADE", hooks: true });

// UserList → User (cada entrada pertenece a un usuario)
UserList.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Book → UserList (un libro puede estar en muchas listas de usuarios)
Book.hasMany(UserList, { foreignKey: "book_id", as: "bookList", onDelete: "CASCADE", hooks: true });

// UserList → Book (cada entrada de lista apunta a un libro)
UserList.belongsTo(Book, { foreignKey: "book_id", as: "book" });

// ─── UserRead Relations ────────────────────────────────────────

// User → UserRead (un usuario puede tener muchos libros leídos)
User.hasMany(UserRead, { foreignKey: "user_id", as: "userRead", onDelete: "CASCADE", hooks: true });

// UserRead → User (cada entrada pertenece a un usuario)
UserRead.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Book → UserRead (un libro puede estar en muchas listas de leídos)
Book.hasMany(UserRead, { foreignKey: "book_id", as: "bookRead", onDelete: "CASCADE", hooks: true });

// UserRead → Book (cada entrada de leídos apunta a un libro)
UserRead.belongsTo(Book, { foreignKey: "book_id", as: "book" });

// ─── WriterRequest Relations ──────────────────────────────────

// User → WriterRequests (un usuario puede tener muchas solicitudes)
User.hasMany(WriterRequest, { foreignKey: "user_id", as: "writerRequests" });

// WriterRequest → User (cada solicitud pertenece a un usuario)
WriterRequest.belongsTo(User, { foreignKey: "user_id", as: "user" });

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
  UserSetting,
  Comment,
  UserList,
  UserRead,
  WriterRequest,
};
