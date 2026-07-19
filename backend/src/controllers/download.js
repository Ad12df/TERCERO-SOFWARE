const { Book } = require('../models');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

/**
 * Descarga un PDF de libro autenticado via SDK de Cloudinary.
 *
 * Estrategia:
 * 1. Busca el libro por ID (usa 'nombre' — el campo real del modelo).
 * 2. Descarga directamente la URL almacenada en pdf_url con Basic Auth,
 *    sin reconstruir la URL ni depender de cloudinary.api.resource().
 * 3. Si falla, intenta con una URL firmada usando resource_type='image'
 *    (el tipo por defecto bajo el que Cloudinary guarda PDFs).
 * 4. Envía el PDF al cliente con las cabeceras correctas.
 */
exports.downloadBookPDF = async (req, res) => {
    try {
        const { id } = req.params;

        // ── 1. Buscar libro (el modelo usa 'nombre', no 'title') ────
        const book = await Book.findByPk(id);
        if (!book) {
            return res.status(404).json({ success: false, message: 'Libro no encontrado.' });
        }
        if (!book.pdf_url) {
            return res.status(404).json({ success: false, message: 'Este libro no tiene PDF asociado.' });
        }

        // ── 2. Credenciales de Cloudinary ───────────────────────────
        const API_KEY = process.env.CLOUDINARY_API_KEY || '878829813274737';
        const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'yO3x3WrCQ7MwDgLMgz5-aAemoYs';
        const authToken = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

        console.log(`📖 Libro: "${book.nombre}" | URL: ${book.pdf_url}`);

        // ── 3. Intentar descargar directamente la URL de la BD ─────
        // La URL almacenada ya apunta al recurso correcto en Cloudinary.
        // Simplemente la pedimos con Basic Auth para evitar el 401.
        let buffer = null;
        let downloadError = null;

        try {
            const response = await axios.get(book.pdf_url, {
                responseType: 'arraybuffer',
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/pdf,*/*',
                },
                timeout: 30000,
            });
            buffer = Buffer.from(response.data);
        } catch (directErr) {
            console.warn('⚠️ Descarga directa falló, intentando con URL firmada image:', directErr.message);
            downloadError = directErr;
        }

        // ── 4. Fallback: reconstruir public_id y generar URL firmada ─
        // Solo entra aquí si la descarga directa falló.
        if (!buffer) {
            // Extraer public_id de la URL original (quitar versión y extensión)
            const uploadMarker = '/upload/';
            if (!book.pdf_url.includes(uploadMarker)) {
                throw new Error('La URL del PDF no es una URL válida de Cloudinary.');
            }

            const afterUpload = book.pdf_url.split(uploadMarker)[1];
            const segments = afterUpload.split('/').filter(Boolean);
            const publicId = segments
                .filter(seg => !/^v\d+$/.test(seg))
                .map(seg => seg.replace(/\.[^/.]+$/, ''))
                .join('/');

            if (!publicId) {
                throw new Error('No se pudo extraer el public_id de la URL del PDF.');
            }

            console.log(`🔑 public_id: "${publicId}"`);

            // Generar URL firmada con resource_type='image' (tipo por defecto de Cloudinary para PDFs)
            const signedUrl = cloudinary.url(publicId, {
                resource_type: 'image',
                sign_url: true,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                flags: 'attachment',
                attachment: true,
            });

            console.log(`🔗 URL firmada image: ${signedUrl.substring(0, 80)}...`);

            const fallbackResponse = await axios.get(signedUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/pdf,*/*',
                },
                timeout: 30000,
            });

            buffer = Buffer.from(fallbackResponse.data);
        }

        // ── 5. Enviar respuesta ────────────────────────────────────
        const filename = (book.nombre || 'book').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '').trim();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        console.log(`✅ PDF "${book.nombre}" enviado (${buffer.length} bytes)`);
        return res.send(buffer);

    } catch (error) {
        console.error('❌ Error en proxy PDF:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error interno al descargar el PDF.',
            error: error.message,
        });
    }
};
