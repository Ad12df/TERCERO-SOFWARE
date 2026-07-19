const { Book } = require('../models');
const { supabase, BUCKET_PDFS } = require('../config/supabase');

/**
 * Extrae el nombre del archivo (path dentro del bucket) a partir de una URL
 * pública de Supabase Storage.
 *
 * Ejemplo:
 *   https://fzxtkzqkpknsjhitnszd.supabase.co/storage/v1/object/public/pdfs/libro-abc-1234567890.pdf
 *   → libro-abc-1234567890.pdf
 *
 * Si la URL no contiene el segmento esperado, se asume que el valor ya es
 * el nombre del archivo y se devuelve tal cual (sanitizado).
 */
function extractFileName(url) {
  try {
    if (!url) return null;
    // Quita query string si existe
    const cleanUrl = url.split('?')[0];
    // Busca el segmento '/public/pdfs/' propio de Supabase Storage
    const marker = '/public/pdfs/';
    const idx = cleanUrl.indexOf(marker);
    if (idx !== -1) {
      return decodeURIComponent(cleanUrl.substring(idx + marker.length));
    }
    // Fallback: tomar el último segmento de la ruta
    const segments = cleanUrl.split('/');
    const last = segments[segments.length - 1];
    return last ? decodeURIComponent(last) : null;
  } catch {
    return null;
  }
}

/**
 * Proxy de descarga de PDF.
 *
 * Mantiene el endpoint `/api/books/:id/download` intacto para el frontend.
 * Internamente obtiene el PDF desde Supabase Storage (bucket `pdfs`) usando
 * el SDK oficial y responde con el flujo binario + headers `application/pdf`,
 * de modo que el lector personalizado del frontend no requiere cambios.
 *
 * Flujo:
 *  1. Obtiene el ID del libro de req.params.
 *  2. Busca el libro en la BD con Book.findByPk.
 *  3. Extrae el nombre del archivo desde `book.pdf_url`.
 *  4. Descarga el binario con `supabase.storage.from('pdfs').download(fileName)`.
 *  5. Envía el Buffer al cliente con Content-Type: application/pdf.
 */
exports.downloadBookPDF = async (req, res) => {
    try {
        const { id } = req.params;

        // ── 1. Buscar libro en la BD ────────────────────────────────
        console.log(`🔍 Buscando libro con ID: ${id}`);
        const book = await Book.findByPk(id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Libro no encontrado en la base de datos',
            });
        }

        // ── 2. Verificar que el libro tenga PDF ─────────────────────
        const pdfUrl = book.pdf_url;
        console.log(`📖 Libro encontrado: "${book.nombre}" | pdf_url: ${pdfUrl}`);

        if (!pdfUrl) {
            return res.status(404).json({
                success: false,
                message: 'Este libro no tiene PDF asociado.',
            });
        }

        // ── 3. Extraer nombre del archivo en el bucket ─────────────
        const fileName = extractFileName(pdfUrl);
        console.log('─────────────────────────────────────────────');
        console.log('🔎 URL original de la BD:', pdfUrl);
        console.log('🔑 fileName extraído:', fileName);
        console.log('─────────────────────────────────────────────');

        if (!fileName) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo determinar el archivo PDF en Supabase.',
            });
        }

        // ── 4. Descargar el PDF desde Supabase Storage ──────────────
        const { data, error } = await supabase.storage
            .from(BUCKET_PDFS)
            .download(fileName);

        if (error) {
            console.error('❌ Error de Supabase al descargar el PDF:', error.message);
            return res.status(502).json({
                success: false,
                message: 'No se pudo descargar el PDF desde el almacenamiento.',
                error: error.message,
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'El archivo PDF no existe en el bucket.',
            });
        }

        // ── 5. Convertir el Blob a Buffer ───────────────────────────
        // El SDK de Supabase devuelve un Blob en el navegador o un Buffer/Blob
        // en Node. Usamos arrayBuffer() para normalizar y crear un Buffer.
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ── 6. Limpiar nombre de archivo para Content-Disposition ────
        const filename = (book.nombre || 'book')
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '')
            .trim();

        // ── 7. Enviar cabeceras y el binario al cliente ─────────────
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        console.log(`✅ PDF "${book.nombre}" enviado correctamente (${buffer.length} bytes)`);
        return res.end(buffer);

    } catch (error) {
        console.error('❌ Error en proxy PDF (Supabase):', error.message);
        console.error('   Stack:', error.stack);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Error interno al descargar el PDF.',
                error: error.message,
            });
        }
    }
};
