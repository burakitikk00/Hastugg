const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');

router.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT 1 as test');
        res.json({
            status: 'success',
            message: 'Veritabanı bağlantısı başarılı!',
            data: result.rows[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Veritabanı test hatası:', error);
        res.status(500).json({
            status: 'error',
            message: 'Veritabanı bağlantı hatası',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
