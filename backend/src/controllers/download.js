const { Book } = require('../models');
const axios = require('axios');

/**
 * Descarga un PDF de libro como proxy autenticado de Cloudinary.
 *
 * Estrategia:
 * 1. Obtiene el ID del libro de req.params.
 * 2. Busca el libro en la BD con Book.findByPk e imprime el resultado
 *    para verificar qué campos trae (console.log del objeto completo).
 * 3. Usa directamente el campo pdf_url almacenado en la BD.
 * 4. Hace un GET con axios (responseType: 'stream') a esa URL con
 *    autenticación Basic Auth para evitar el 401 de Cloudinary.
 * 5. Pipe del stream al response del cliente con las cabeceras correctas.
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

        // ── 6. Credenciales de Cloudinary para Basic Auth ────────────
        const API_KEY = process.env.CLOUDINARY_API_KEY || '878829813274737';
        const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'yO3x3WrCQ7MwDgLMgz5-aAemoYs';
        const authToken = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

        // ── 7. Descargar el PDF con axios usando responseType stream ──
        const response = await axios.get(pdfUrl, {
            responseType: 'stream',
            headers: {
                'Authorization': `Basic ${authToken}`,
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
