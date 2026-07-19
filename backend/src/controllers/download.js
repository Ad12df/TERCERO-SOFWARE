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

    // ─── LOG: Verificar que el modelo Book no sea undefined ───
    console.log("📦 Modelo Book importado:", typeof Book);
    console.log("📦 Book.findByPk es función:", typeof Book.findByPk);

    // ─── 1. Buscar libro por ID ────────────────────────────────
    const book = await Book.findByPk(id);

    console.log("📖 Libro encontrado con ID", id, ":", book ? "SÍ" : "NO");
    if (book) {
      console.log("   - nombre:", book.nombre);
      console.log("   - pdf_url:", book.pdf_url ? "SÍ tiene URL" : "NO tiene URL");
    }

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
    console.log("🌐 Intentando descargar de Cloudinary:", book.pdf_url);

    const response = await axios.get(book.pdf_url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    console.log("✅ Descarga de Cloudinary exitosa");
    console.log("   - Status HTTP:", response.status);
    console.log("   - Content-Type:", response.headers["content-type"]);
    console.log("   - Tamaño (bytes):", response.data.length);

    // ─── 3. Cabeceras CORS y de contenido ─────────────────────
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "public, max-age=86400");

    // ─── 4. Enviar el buffer binario puro ─────────────────────
    return res.send(Buffer.from(response.data));
  } catch (error) {
    // ─── LOG DE ERROR COMPLETO ─────────────────────────────────
    console.error("═══════════════════════════════════════");
    console.error("❌ ERROR DETALLADO PROXY:");
    console.error("   Mensaje:", error.message);
    console.error("   Nombre:", error.name);
    console.error("   Stack:", error.stack);

    // Detectar si es un error de axios (respuesta de Cloudinary)
    if (error.response) {
      console.error("   → Error de Cloudinary:");
      console.error("     Status:", error.response.status);
      console.error("     StatusText:", error.response.statusText);
      console.error("     Headers:", JSON.stringify(error.response.headers, null, 2));
      console.error("     Data (primeros 200 chars):", String(error.response.data).substring(0, 200));
    }

    // Detectar errores de red (no llegó a Cloudinary)
    if (error.code) {
      console.error("   → Código de error:", error.code);
    }

    // Detectar si el modelo Book era undefined
    if (typeof Book === "undefined") {
      console.error("   → ¡ALERTA! El modelo Book es undefined");
    }

    console.error("═══════════════════════════════════════");

    return res.status(500).json({
      success: false,
      message: "Error interno en el servidor proxy.",
      error: error.message,
    });
  }
}

module.exports = { downloadBookPdf };
