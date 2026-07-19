const { Book } = require('../models');
const cloudinary = require('cloudinary').v2;

/**
 * Descarga un PDF de libro autenticado via SDK de Cloudinary.
 * 
 * Estrategia:
 * 1. Busca el libro por ID.
 * 2. Extrae el public_id de la URL de Cloudinary.
 * 3. Genera una URL firmada con expiración (signed URL).
 * 4. Hace proxy del contenido usando fetch con autenticación Basic Auth
 *    (API_KEY:API_SECRET en base64) para evitar el 401.
 * 5. Envía el PDF al cliente con las cabeceras correctas.
 */
exports.downloadBookPDF = async (req, res) => {
    try {
        const { id } = req.params;

        // ── 1. Buscar libro ──────────────────────────────────────────
        const book = await Book.findByPk(id);
        if (!book || !book.pdf_url) {
            return res.status(404).json({ success: false, message: 'Libro no encontrado.' });
        }

        // ── 2. Extraer public_id de la URL de Cloudinary ──────────
        // URL típica: https://res.cloudinary.com/<cloud_name>/raw/upload/<folder>/<public_id>.pdf
        const urlObj = new URL(book.pdf_url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        // pathParts: ['v<version>', 'raw', 'upload', '<folder>', '<public_id>.pdf']
        // Necesitamos el public_id sin extensión (para raw es resource_type=raw)
        const rawIndex = pathParts.indexOf('raw');
        const uploadIndex = pathParts.indexOf('upload');

        if (rawIndex === -1 || uploadIndex === -1 || rawIndex <= uploadIndex) {
            throw new Error('URL de Cloudinary no tiene el formato esperado para un recurso raw.');
        }

        // El public_id es todo lo que viene después de 'upload' hasta el final
        const afterUpload = pathParts.slice(uploadIndex + 1);
        // Quitar 'v<version>' si está al inicio (v1234567890)
        const publicIdParts = afterUpload.filter(p => !/^v\d+$/.test(p));
        const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // quitar extensión

        // ── 3. Credenciales de Cloudinary (del config) ─────────────
        const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'ditggsmd';
        const API_KEY = process.env.CLOUDINARY_API_KEY || '878829813274737';
        const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'yO3x3WrCQ7MwDgLMgz5-aAemoYs';

        // ── 4. Generar URL firmada con expiración (1 hora) ─────────
        const signedUrl = cloudinary.url(publicId, {
            resource_type: 'raw',
            format: 'pdf',
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hora
            flags: 'attachment',
            attachment: true,
            cloud_name: CLOUD_NAME,
        });

        console.log(`📥 Proxy PDF: ${book.title} → URL firmada generada`);

        // ── 5. Descargar el PDF con autenticación Basic Auth ───────
        // Cloudinary acepta autenticación Basic Auth con API_KEY:API_SECRET
        const authToken = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

        const response = await fetch(signedUrl, {
            headers: {
                'Authorization': `Basic ${authToken}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/pdf,*/*',
            },
        });

        if (!response.ok) {
            throw new Error(`Cloudinary respondió con estado ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ── 6. Enviar respuesta ────────────────────────────────────
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${book.title || 'book'}.pdf"`);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
