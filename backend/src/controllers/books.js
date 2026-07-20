const { Book, Comment } = require("../models");
const {
  uploadImageFromBuffer,
  uploadPdfFromBuffer,
} = require("../config/supabase");

class BookController {
  // ─── POST /api/books (solo admin) ──────────────────────────
  // Crea un libro con subida de portada (imagen) y PDF a Cloudinary
  static async createBook(req, res) {
    try {
      // ─── 1. Recibir campos de texto ──────────────────────────
      const { nombre, autor, categoria, direccion, descripcion } = req.body;

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

      // Subir imagen de portada a Supabase Storage si existe
      if (req.files && req.files.foto && req.files.foto[0]) {
        const fotoFile = req.files.foto[0];
        const result = await uploadImageFromBuffer(
          fotoFile.buffer,
          fotoFile.originalname
        );
        fotoUrl = result.secure_url;
      }

      // Subir PDF a Supabase Storage si existe
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
        categoria: categoria || null,
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

  // ─── PUT /api/books/:id (solo admin) ──────────────────────
  // Actualiza un libro existente (parcial, con subida opcional de archivos)
  static async updateBook(req, res) {
    try {
      const { id } = req.params;
      const book = await Book.findByPk(id);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Libro no encontrado",
        });
      }

      const { nombre, autor, categoria, direccion, descripcion } = req.body;

      // Actualizar campos de texto solo si se envían
      if (nombre !== undefined) book.nombre = nombre;
      if (autor !== undefined) book.autor = autor;
      if (categoria !== undefined) book.categoria = categoria;
      if (direccion !== undefined) book.direccion = direccion;
      if (descripcion !== undefined) book.descripcion = descripcion;

      // Subir nueva portada si se envía
      if (req.files && req.files.foto && req.files.foto[0]) {
        const fotoFile = req.files.foto[0];
        const result = await uploadImageFromBuffer(
          fotoFile.buffer,
          fotoFile.originalname
        );
        book.foto = result.secure_url;
      }

      // Subir nuevo PDF si se envía
      if (req.files && req.files.pdf && req.files.pdf[0]) {
        const pdfFile = req.files.pdf[0];
        const result = await uploadPdfFromBuffer(
          pdfFile.buffer,
          pdfFile.originalname
        );
        book.pdf_url = result.secure_url;
      }

      await book.save();

      return res.status(200).json({
        success: true,
        message: "Libro actualizado exitosamente",
        data: book,
      });
    } catch (error) {
      console.error("❌ Error al actualizar libro:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al actualizar el libro",
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

  // ─── PATCH /api/books/:id/progress ─────────────────────────
  // Actualiza el progreso de lectura del libro para el usuario actual
  static async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const { progreso_porcentaje } = req.body;

      const book = await Book.findByPk(id);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Libro no encontrado",
        });
      }

      if (progreso_porcentaje === undefined) {
        return res.status(400).json({
          success: false,
          message: "El campo progreso_porcentaje es requerido",
        });
      }

      const porcentaje = Math.max(0, Math.min(100, parseInt(progreso_porcentaje, 10)));

      book.progreso_porcentaje = porcentaje;
      book.fecha_ultima_lectura = new Date();
      await book.save();

      return res.status(200).json({
        success: true,
        message: "Progreso actualizado",
        data: {
          progreso_porcentaje: book.progreso_porcentaje,
          fecha_ultima_lectura: book.fecha_ultima_lectura,
        },
      });
    } catch (error) {
      console.error("❌ Error al actualizar progreso:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al actualizar el progreso",
      });
    }
  }

  // ─── GET /api/books/:id/comments ───────────────────────────
  // Obtiene todos los comentarios de un libro (público)
  static async getComments(req, res) {
    try {
      const { id } = req.params;

      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Libro no encontrado",
        });
      }

      const comments = await Comment.findAll({
        where: { book_id: id },
        include: [
          {
            model: require("../models").User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      console.error("❌ Error al obtener comentarios:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener los comentarios",
      });
    }
  }

  // ─── POST /api/books/:id/comments ─────────────────────────
  // Crea un nuevo comentario en un libro (requiere autenticación)
  static async createComment(req, res) {
    try {
      const { id } = req.params;
      const { contenido } = req.body;

      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Libro no encontrado",
        });
      }

      if (!contenido || !contenido.trim()) {
        return res.status(400).json({
          success: false,
          message: "El contenido del comentario es requerido",
        });
      }

      const newComment = await Comment.create({
        contenido: contenido.trim(),
        book_id: parseInt(id, 10),
        user_id: req.user.id,
      });

      // Cargar datos del usuario para devolver en la respuesta
      const commentWithUser = await Comment.findByPk(newComment.id, {
        include: [
          {
            model: require("../models").User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      return res.status(201).json({
        success: true,
        message: "Comentario creado exitosamente",
        data: commentWithUser,
      });
    } catch (error) {
      console.error("❌ Error al crear comentario:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al crear el comentario",
      });
    }
  }
}

module.exports = BookController;
