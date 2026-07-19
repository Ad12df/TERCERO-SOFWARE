const { Book } = require('../models');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;

// ─── Configuración de Cloudinary ─────────────────────────────
// Necesario para generar URLs firmadas válidas para recursos 'raw' (PDFs)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ditggsmd',
  api_key: process.env.CLOUDINARY_API_KEY || '878829813274737',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'yO3x3WrCQ7MwDgLMgz5-aAemoYs',
});

/**
 * Extrae el public_id de una URL de Cloudinary.
 * Ejemplo:
 *   https://res.cloudinary.com/ditggsmd/raw/upload/v123/bibliotech/pdfs/libro-abc.pdf
 *   → bibliotech/pdfs/libro-abc
 */
function extractPublicId(url) {
  try {
    // Quita la query string si existe
    const cleanUrl = url.split('?')[0];
    // Elimina la extensión final (.pdf)
    const noExt = cleanUrl.replace(/\.pdf$/i, '');
    // Toma todo lo que está después de '/upload/' y elimina versiones (v123456/)
    const parts = noExt.split('/upload/');
    if (parts.length < 2) return null;
    let publicId = parts[1];
    // Elimina el segmento de versión si existe (v seguido de números)
    publicId = publicId.replace(/^v\d+\//, '');
    return publicId;
  } catch {
    return null;
  }
}

/**
 * Descarga un PDF de libro como proxy autenticado de Cloudinary.
 *
 * Estrategia:
 * 1. Obtiene el ID del libro de req.params.
 * 2. Busca el libro en la BD con Book.findByPk.
 * 3. Usa el campo pdf_url almacenado en la BD.
 * 4. Genera una URL firmada con el SDK oficial de Cloudinary
 *    (resource_type: 'raw' para PDFs) — esto evita el 401.
 * 5. Hace un GET con axios (responseType: 'stream') a la URL firmada.
 * 6. Pipe del stream al response del cliente con las cabeceras correctas.
 */
exports.downloadBookPDF = async (req, res) => {
    try {
        const { id } = req.params;

        // ── 1. Obtener ID ────────────────────────────────────────────
        console.log(`🔍 Intentando buscar libro con ID: ${id}`);

        // ── 2. Buscar libro en la BD ────────────────────────────────
        const book = await Book.findByPk(id);

        // ── 3. Verificar qué trae la consulta ────────────────────────
        console.log('📦 Resultado de Book.findByPk:', book);
        console.log('📋 Campos disponibles:', book ? Object.keys(book.dataValues) : 'NULO');

        // ── 4. Manejo de libro no encontrado ─────────────────────────
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Libro no encontrado en la base de datos',
            });
        }

        // ── 5. Verificar que el libro tenga PDF ─────────────────────
        const pdfUrl = book.pdf_url;
        console.log(`📖 Libro encontrado: "${book.nombre}" | pdf_url: ${pdfUrl}`);

        if (!pdfUrl) {
            return res.status(404).json({
                success: false,
                message: 'Este libro no tiene PDF asociado.',
            });
        }

        // ── 6. Generar URL firmada con el SDK de Cloudinary ──────────
        // Los PDFs se suben como resource_type: 'raw', por lo que la URL
        // firmada debe generarse con el mismo resource_type para evitar 401.
        const publicId = extractPublicId(pdfUrl);
        console.log(`🔑 public_id extraído: ${publicId}`);

        let finalUrl = pdfUrl;
        if (publicId) {
            try {
                finalUrl = cloudinary.utils.url(publicId, {
                    resource_type: 'raw',
                    type: 'upload',
                    sign_url: true,
                    attachment: true, // fuerza descarga (Content-Disposition: attachment)
                });
                console.log(`✅ URL firmada generada: ${finalUrl}`);
            } catch (signErr) {
                console.warn('⚠️ No se pudo firmar la URL, usando la original:', signErr.message);
                finalUrl = pdfUrl;
            }
        }

        // ── 7. Descargar el PDF con axios usando responseType stream ──
        // ⚠️ NO enviamos header Authorization porque la URL ya está firmada
        //    y Cloudinary rechaza Basic Auth en URLs públicas/firmadas (401).
        const response = await axios.get(finalUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/pdf,*/*',
            },
            timeout: 30000,
        });

        // ── 8. Limpiar nombre de archivo ────────────────────────────
        const filename = (book.nombre || 'book')
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '')
            .trim();

        // ── 9. Enviar cabeceras de respuesta ─────────────────────────
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // ── 10. Pipe del stream de Cloudinary al cliente ─────────────
        response.data.pipe(res);

        response.data.on('end', () => {
            console.log(`✅ PDF "${book.nombre}" enviado correctamente`);
        });

        response.data.on('error', (err) => {
            console.error('❌ Error en el stream del PDF:', err.message);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error al transmitir el PDF.',
                    error: err.message,
                });
            }
        });

    } catch (error) {
        console.error('❌ Error en proxy PDF:', error.message);
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
