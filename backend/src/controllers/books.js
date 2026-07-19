const { Book } = require("../models");
const {
  uploadImageFromBuffer,
  uploadPdfFromBuffer,
} = require("../config/cloudinary");

class BookController {
  // ─── POST /api/books (solo admin) ──────────────────────────
  // Crea un libro con subida de portada (imagen) y PDF a Cloudinary
  static async createBook(req, res) {
    try {
      // ─── 1. Recibir campos de texto ──────────────────────────
      const { nombre, autor, direccion, descripcion } = req.body;

      // Validaciones básicas
      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: "El nombre del libro es requerido",
        });
      }

      // ─── 2. Procesar archivos subidos (vienen de Multer) ──────
      // req.files contiene los buffers de 'foto' y 'pdf'
      let fotoUrl = null;
      let pdfUrl = null;

      // Subir imagen de portada a Cloudinary si existe
      if (req.files && req.files.foto && req.files.foto[0]) {
        const fotoFile = req.files.foto[0];
        const result = await uploadImageFromBuffer(
          fotoFile.buffer,
          fotoFile.originalname
        );
        fotoUrl = result.secure_url;
      }

      // Subir PDF a Cloudinary como 'raw' si existe
      if (req.files && req.files.pdf && req.files.pdf[0]) {
        const pdfFile = req.files.pdf[0];
        const result = await uploadPdfFromBuffer(
          pdfFile.buffer,
          pdfFile.originalname
        );
        pdfUrl = result.secure_url;
      }

      // ─── 3. Crear el registro en la base de datos ─────────────
      const newBook = await Book.create({
        nombre,
        autor: autor || null,
        direccion: direccion || null,
        descripcion: descripcion || null,
        foto: fotoUrl, // 👈 secure_url de la imagen
        pdf_url: pdfUrl, // 👈 secure_url del PDF
        puntuacion_media: 0, // 👈 Por defecto en 0
        total_resenas: 0, // 👈 Por defecto en 0
        created_by: req.user.id, // ID del admin autenticado
      });

      // ─── 4. Responder con el libro creado ─────────────────────
      return res.status(201).json({
        success: true,
        message: "Libro creado exitosamente",
        data: newBook,
      });
    } catch (error) {
      console.error("❌ Error al crear libro:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al crear el libro",
      });
    }
  }

  // ─── GET /api/books ─────────────────────────────────────────
  // Obtiene todos los libros (público)
  static async getBooks(req, res) {
    try {
      const books = await Book.findAll({
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      console.error("❌ Error al obtener libros:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener los libros",
      });
    }
  }

  // ─── GET /api/books/:id ─────────────────────────────────────
  // Obtiene un libro por su ID (público)
  static async getBookById(req, res) {
    try {
      const { id } = req.params;
      const book = await Book.findByPk(id);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Libro no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        data: book,
      });
    } catch (error) {
      console.error("❌ Error al obtener libro:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener el libro",
      });
    }
  }

  // ─── DELETE /api/books/:id (solo admin) ─────────────────────
  static async deleteBook(req, res) {
    try {
      const { id } = req.params;
      const book = await Book.findByPk(id);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Libro no encontrado",
        });
      }

      await book.destroy();

      return res.status(200).json({
        success: true,
        message: "Libro eliminado exitosamente",
      });
    } catch (error) {
      console.error("❌ Error al eliminar libro:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al eliminar el libro",
      });
    }
  }
}

module.exports = BookController;
