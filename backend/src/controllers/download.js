const { Book } = require("../models");
const axios = require("axios");

/**
 * GET /api/books/:id/download
 * Proxy que descarga el PDF desde Cloudinary del lado del servidor
 * y lo envía al cliente como binary/application/pdf.
 * Evita errores 401/CORS al acceder directamente a las URLs de Cloudinary.
 */
async function downloadBookPdf(req, res) {
  try {
    const { id } = req.params;

    // ─── 1. Buscar libro por ID ────────────────────────────────
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

    // ─── 2. Descargar PDF desde Cloudinary (server-side) ──────
    const response = await axios.get(book.pdf_url, {
      responseType: "arraybuffer",
    });

    // ─── 3. Cabeceras CORS y de contenido ─────────────────────
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "public, max-age=86400");

    // ─── 4. Enviar el buffer binario puro ─────────────────────
    return res.send(Buffer.from(response.data));
  } catch (error) {
    console.error("❌ Error interno en el proxy de descarga:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error interno en el servidor proxy.",
      error: error.message,
    });
  }
}

module.exports = { downloadBookPdf };
