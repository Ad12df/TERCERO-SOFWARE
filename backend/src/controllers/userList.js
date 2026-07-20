const { User, Book, UserList, UserRead } = require("../models");

class UserListController {
  // ─── GET /api/lists — Obtener todos los libros de la lista del usuario ───
  static async getUserList(req, res) {
    try {
      const userId = req.user.id;

      const entries = await UserList.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Book,
            as: "book",
            attributes: [
              "id", "nombre", "autor", "categoria", "foto",
              "puntuacion_media", "total_resenas", "pdf_url",
              "progreso_porcentaje", "fecha_ultima_lectura",
            ],
          },
        ],
        order: [["fecha_actualizacion", "DESC"]],
      });

      const books = entries
        .filter(e => e.book !== null)
        .map(e => ({
          ...e.book.toJSON(),
          agregado_el: e.fecha_creacion,
        }));

      return res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      console.error("❌ Error al obtener la lista del usuario:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener la lista",
      });
    }
  }

  // ─── GET /api/lists/read — Obtener todos los libros leídos del usuario ───
  static async getReadList(req, res) {
    try {
      const userId = req.user.id;

      const entries = await UserRead.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Book,
            as: "book",
            attributes: [
              "id", "nombre", "autor", "categoria", "foto",
              "puntuacion_media", "total_resenas", "pdf_url",
              "progreso_porcentaje", "fecha_ultima_lectura",
            ],
          },
        ],
        order: [["fecha_actualizacion", "DESC"]],
      });

      const books = entries
        .filter(e => e.book !== null)
        .map(e => ({
          ...e.book.toJSON(),
          completado_el: e.fecha_creacion,
        }));

      return res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      console.error("❌ Error al obtener libros leídos:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener los libros leídos",
      });
    }
  }

  // ─── POST /api/lists/add — Añadir un libro a la lista ───
  static async addBook(req, res) {
    try {
      const userId = req.user.id;
      const { book_id } = req.body;

      if (!book_id) {
        return res.status(400).json({
          success: false,
          message: "book_id es requerido",
        });
      }

      // Verificar que el libro existe
      const book = await Book.findByPk(book_id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Libro no encontrado",
        });
      }

      // Evitar duplicados
      const existing = await UserList.findOne({
        where: { user_id: userId, book_id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Este libro ya está en tu lista",
        });
      }

      const entry = await UserList.create({
        user_id: userId,
        book_id,
      });

      return res.status(201).json({
        success: true,
        message: "Libro añadido a tu lista",
        data: {
          id: entry.id,
          book_id: entry.book_id,
          agregado_el: entry.fecha_creacion,
        },
      });
    } catch (error) {
      console.error("❌ Error al añadir libro a la lista:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al añadir el libro",
      });
    }
  }

  // ─── DELETE /api/lists/remove/:bookId — Quitar un libro de la lista ───
  static async removeBook(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      const entry = await UserList.findOne({
        where: { user_id: userId, book_id: bookId },
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: "El libro no está en tu lista",
        });
      }

      await entry.destroy();

      return res.status(200).json({
        success: true,
        message: "Libro eliminado de tu lista",
      });
    } catch (error) {
      console.error("❌ Error al eliminar libro de la lista:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al eliminar el libro",
      });
    }
  }

  // ─── GET /api/lists/check/:bookId — Verificar si un libro está en la lista ───
  static async checkBook(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      const entry = await UserList.findOne({
        where: { user_id: userId, book_id: bookId },
      });

      return res.status(200).json({
        success: true,
        inList: !!entry,
      });
    } catch (error) {
      console.error("❌ Error al verificar libro en la lista:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al verificar",
      });
    }
  }
}

module.exports = UserListController;