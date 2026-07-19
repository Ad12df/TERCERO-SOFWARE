const { Book } = require('../models');
const axios = require('axios');

exports.downloadBookPDF = async (req, res) => {
    try {
        const { id } = req.params;

        const book = await Book.findByPk(id);
        if (!book || !book.pdf_url) {
            return res.status(404).json({ success: false, message: 'Libro no encontrado.' });
        }

        // Petición simulando un navegador real para evitar el error 401
        const response = await axios.get(book.pdf_url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/pdf'
            }
        });

        // Cabeceras de respuesta y CORS obligatorias
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        return res.send(Buffer.from(response.data));

    } catch (error) {
        console.error('❌ Error en proxy:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Error interno en el servidor proxy.',
            error: error.message 
        });
    }
};
