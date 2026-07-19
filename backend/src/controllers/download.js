const { Book } = require('../models');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

/**
 * Descarga un PDF de libro autenticado via SDK de Cloudinary.
 *
 * Estrategia:
 * 1. Busca el libro por ID.
 * 2. Extrae el public_id de la URL de Cloudinary (formato flexible).
 * 3. Usa cloudinary.api.resource() para obtener metadatos y detectar
 *    el resource_type real del archivo.
 * 4. Genera una URL firmada con expiración (1 hora).
 * 5. Descarga el PDF con axios usando autenticación Basic Auth.
 * 6. Envía el PDF al cliente con las cabeceras correctas.
 */
exports.downloadBookPDF = async (req, res) => {
    try {
        const { id } = req.params;

        // ── 1. Buscar libro ──────────────────────────────────────────
        const book = await Book.findByPk(id);
        if (!book || !book.pdf_url) {
            return res.status(404).json({ success: false, message: 'Libro no encontrado.' });
        }

        // ── 2. Credenciales de Cloudinary ───────────────────────────
        const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'ditggsmd';
        const API_KEY = process.env.CLOUDINARY_API_KEY || '878829813274737';
        const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'yO3x3WrCQ7MwDgLMgz5-aAemoYs';

        // ── 3. Extraer public_id de la URL de forma flexible ────────
        // Acepta cualquier variant de URL Cloudinary:
        //   https://res.cloudinary.com/{cloud}/raw/upload/v12345678/folder/file.pdf
        //   https://res.cloudinary.com/{cloud}/image/upload/v12345678/folder/file.pdf
        //   https://res.cloudinary.com/{cloud}/upload/v12345678/folder/file.pdf
        //
        // Dividimos después de /upload/ y quitamos la versión (v12345678) y extensión.
        const pdfUrl = book.pdf_url;
        const uploadMarker = '/upload/';

        if (!pdfUrl.includes(uploadMarker)) {
            throw new Error('La URL del PDF no es una URL válida de Cloudinary.');
        }

        // Todo lo que viene después de '/upload/'
        const afterUpload = pdfUrl.split(uploadMarker)[1];

        // Dividir por '/' y filtrar: quitar versión (v12345678) y extensión (.pdf)
        const segments = afterUpload.split('/').filter(Boolean);
        const publicIdSegments = segments
            .filter(seg => !/^v\d+$/.test(seg))           // quitar 'v1234567890'
            .map(seg => seg.replace(/\.[^/.]+$/, ''));    // quitar '.pdf' u otra extensión

        const publicId = publicIdSegments.join('/');

        if (!publicId) {
            throw new Error('No se pudo extraer el public_id de la URL del PDF.');
        }

        console.log(`📖 Libro: "${book.title}" | public_id extraído: "${publicId}"`);

        // ── 4. Obtener metadatos del recurso para detectar resource_type ──
        // Intentar con 'raw' primero (PDFs subidos como raw), luego 'image'
        let resourceInfo = null;
        let resourceType = 'raw';

        try {
            resourceInfo = await cloudinary.api.resource(publicId, {
                resource_type: 'raw',
                cloud_name: CLOUD_NAME,
            });
        } catch {
            // Si falla, el PDF puede estar guardado como 'image' en Cloudinary
            try {
                resourceInfo = await cloudinary.api.resource(publicId, {
                    resource_type: 'image',
                    cloud_name: CLOUD_NAME,
                });
                resourceType = 'image';
            } catch (apiErr) {
                console.warn('⚠️ cloudinary.api.resource falló, usando extracción directa:', apiErr.message);
            }
        }

        // ── 5. Generar URL firmada con expiración (1 hora) ─────────
        const signedUrl = cloudinary.url(publicId, {
            resource_type: resourceType,
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            flags: 'attachment',
            attachment: true,
            cloud_name: CLOUD_NAME,
        });

        console.log(`🔗 URL firmada generada para ${resourceType}: ${signedUrl.substring(0, 80)}...`);

        // ── 6. Descargar el PDF con autenticación Basic Auth ───────
        // Cloudinary acepta Basic Auth con API_KEY:API_SECRET
        const authToken = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

        const response = await axios.get(signedUrl, {
            responseType: 'arraybuffer',
            headers: {
                'Authorization': `Basic ${authToken}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/pdf,*/*',
            },
            timeout: 30000,
        });

        const buffer = Buffer.from(response.data);

        // ── 7. Enviar respuesta ────────────────────────────────────
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${book.title || 'book'}.pdf"`);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        console.log(`✅ PDF "${book.title}" enviado (${buffer.length} bytes)`);
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
