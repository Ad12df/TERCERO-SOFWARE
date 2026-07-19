const { Book } = require("../models");

/**
 * GET /api/books/:id/download
 * Proxy que descarga el PDF desde Cloudinary del lado del servidor
 * y se lo envía al cliente como application/pdf.
 * Evita errores 401/CORS al acceder directamente a las URLs de Cloudinary.
 */
async function downloadBookPdf(req, res) {
  try {
    const { id } = req.params;

    // 1. Buscar el libro en la BD
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Libro no encontrado",
      });
    }

    if (!book.pdf_url) {
      return res.status(404).json({
        success: false,
        message: "Este libro no tiene un PDF asociado",
      });
    }

    // 2. Descargar el PDF desde Cloudinary (server-side)
    const response = await fetch(book.pdf_url);

    if (!response.ok) {
      console.error("Error al descargar desde Cloudinary:", response.status);
      return res.status(502).json({
        success: false,
        message: "No se pudo descargar el PDF desde el almacenamiento",
      });
    }

    // 3. Enviar el PDF al cliente con headers apropiados
    const contentType =
      response.headers.get("content-type") || "application/pdf";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");

    // 4. Stream del cuerpo de la respuesta directamente al cliente
    const buffer = Buffer.from(await response.arrayBuffer());
    return res.send(buffer);
  } catch (error) {
    console.error("Error en downloadBookPdf:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al descargar el PDF",
    });
  }
}

module.exports = { downloadBookPdf };
