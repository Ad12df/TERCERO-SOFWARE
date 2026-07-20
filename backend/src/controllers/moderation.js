const { Book, User, WriterRequest } = require("../models");

class ModerationController {
  // ─── LIBROS PENDIENTES ──────────────────────────────────────

  // GET /api/moderation/books/pending - Obtener libros pendientes (solo admin)
  static async getPendingBooks(req, res) {
    try {
      const books = await Book.findAll({
        where: { status: "PENDIENTE" },
        include: [
          {
            model: User,
            as: "creador",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      console.error("❌ Error al obtener libros pendientes:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener los libros pendientes",
      });
    }
  }

  // PUT /api/moderation/books/:id/approve - Aprobar un libro (solo admin)
  static async approveBook(req, res) {
    try {
      const { id } = req.params;

      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Libro no encontrado",
        });
      }

      await book.update({ status: "APROBADO" });

      return res.status(200).json({
        success: true,
        message: "Libro aprobado exitosamente",
        data: book,
      });
    } catch (error) {
      console.error("❌ Error al aprobar libro:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al aprobar el libro",
      });
    }
  }

  // PUT /api/moderation/books/:id/reject - Rechazar un libro (solo admin)
  static async rejectBook(req, res) {
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
        message: "Libro rechazado y eliminado",
      });
    } catch (error) {
      console.error("❌ Error al rechazar libro:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al rechazar el libro",
      });
    }
  }

  // PUT /api/moderation/books/approve-all - Aprobar todos los libros pendientes (solo admin)
  static async approveAllBooks(req, res) {
    try {
      const result = await Book.update(
        { status: "APROBADO" },
        { where: { status: "PENDIENTE" } }
      );

      return res.status(200).json({
        success: true,
        message: `Se aprobaron ${result[0]} libros`,
        data: { count: result[0] },
      });
    } catch (error) {
      console.error("❌ Error al aprobar todos los libros:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al aprobar todos los libros",
      });
    }
  }

  // PUT /api/moderation/books/reject-all - Rechazar todos los libros pendientes (solo admin)
  static async rejectAllBooks(req, res) {
    try {
      const result = await Book.destroy({
        where: { status: "PENDIENTE" },
      });

      return res.status(200).json({
        success: true,
        message: `Se rechazaron y eliminaron ${result} libros`,
        data: { count: result },
      });
    } catch (error) {
      console.error("❌ Error al rechazar todos los libros:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al rechazar todos los libros",
      });
    }
  }

  // ─── SOLICITUDES DE ESCRITOR ───────────────────────────────

  // GET /api/moderation/writer-requests - Obtener solicitudes de ascenso (solo admin)
  static async getWriterRequests(req, res) {
    try {
      const requests = await WriterRequest.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      console.error("❌ Error al obtener solicitudes de escritor:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener las solicitudes",
      });
    }
  }

  // POST /api/moderation/writer-requests - Crear solicitud de ascenso (usuario autenticado)
  static async createWriterRequest(req, res) {
    try {
      const userId = req.user.id;
      const { mensaje } = req.body;

      // Verificar si ya tiene una solicitud pendiente
      const existingRequest = await WriterRequest.findOne({
        where: {
          user_id: userId,
          estado: "PENDIENTE",
        },
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: "Ya tienes una solicitud pendiente",
        });
      }

      // Verificar si ya es escritor
      const user = await User.findByPk(userId);
      if (user.role === "escritor" || user.role === "admin") {
        return res.status(400).json({
          success: false,
          message: "Ya tienes el rol de escritor o eres administrador",
        });
      }

      const request = await WriterRequest.create({
        user_id: userId,
        mensaje: mensaje || null,
        estado: "PENDIENTE",
      });

      return res.status(201).json({
        success: true,
        message: "Solicitud enviada exitosamente",
        data: request,
      });
    } catch (error) {
      console.error("❌ Error al crear solicitud:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al crear la solicitud",
      });
    }
  }

  // PUT /api/moderation/writer-requests/:id/approve - Aprobar solicitud (solo admin)
  static async approveWriterRequest(req, res) {
    try {
      const { id } = req.params;

      const request = await WriterRequest.findByPk(id, {
        include: [{ model: User, as: "user" }],
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Solicitud no encontrada",
        });
      }

      // Actualizar rol del usuario a escritor
      await request.user.update({ role: "escritor" });

      // Marcar solicitud como aprobada
      await request.update({ estado: "APROBADO" });

      return res.status(200).json({
        success: true,
        message: `Se ha ascendido a ${request.user.name} a escritor`,
        data: request,
      });
    } catch (error) {
      console.error("❌ Error al aprobar solicitud:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al aprobar la solicitud",
      });
    }
  }

  // PUT /api/moderation/writer-requests/:id/reject - Rechazar solicitud (solo admin)
  static async rejectWriterRequest(req, res) {
    try {
      const { id } = req.params;

      const request = await WriterRequest.findByPk(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Solicitud no encontrada",
        });
      }

      await request.update({ estado: "RECHAZADO" });

      return res.status(200).json({
        success: true,
        message: "Solicitud rechazada",
        data: request,
      });
    } catch (error) {
      console.error("❌ Error al rechazar solicitud:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al rechazar la solicitud",
      });
    }
  }

  // PUT /api/moderation/writer-requests/approve-all - Aprobar todas las solicitudes (solo admin)
  static async approveAllWriterRequests(req, res) {
    try {
      // Obtener todas las solicitudes pendientes
      const pendingRequests = await WriterRequest.findAll({
        where: { estado: "PENDIENTE" },
        include: [{ model: User, as: "user" }],
      });

      if (pendingRequests.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No hay solicitudes pendientes",
          data: { count: 0 },
        });
      }

      // Aprobar todas las solicitudes y ascender a los usuarios
      for (const request of pendingRequests) {
        await request.user.update({ role: "escritor" });
        await request.update({ estado: "APROBADO" });
      }

      return res.status(200).json({
        success: true,
        message: `Se aprobaron ${pendingRequests.length} solicitudes`,
        data: { count: pendingRequests.length },
      });
    } catch (error) {
      console.error("❌ Error al aprobar todas las solicitudes:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al aprobar todas las solicitudes",
      });
    }
  }

  // PUT /api/moderation/writer-requests/reject-all - Rechazar todas las solicitudes (solo admin)
  static async rejectAllWriterRequests(req, res) {
    try {
      const result = await WriterRequest.update(
        { estado: "RECHAZADO" },
        { where: { estado: "PENDIENTE" } }
      );

      return res.status(200).json({
        success: true,
        message: `Se rechazaron ${result[0]} solicitudes`,
        data: { count: result[0] },
      });
    } catch (error) {
      console.error("❌ Error al rechazar todas las solicitudes:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al rechazar todas las solicitudes",
      });
    }
  }

  // GET /api/moderation/counts - Obtener conteos de solicitudes pendientes (solo admin)
  static async getCounts(req, res) {
    try {
      const pendingBooks = await Book.count({ where: { status: "PENDIENTE" } });
      const pendingWriterRequests = await WriterRequest.count({
        where: { estado: "PENDIENTE" },
      });

      return res.status(200).json({
        success: true,
        data: {
          pendingBooks,
          pendingWriterRequests,
          total: pendingBooks + pendingWriterRequests,
        },
      });
    } catch (error) {
      console.error("❌ Error al obtener conteos:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error al obtener los conteos",
      });
    }
  }
}

module.exports = ModerationController;