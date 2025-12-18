const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');

// Analytics ayarlarını getir
router.get('/analytics-settings', verifyToken, async (_req, res) => {
    try {
        const result = await pool.query(
            'SELECT measurement_id, is_active, created_at, updated_at FROM analytics_settings ORDER BY created_at DESC LIMIT 1'
        );
        if (result.rowCount > 0) {
            res.json(result.rows[0]);
        } else {
            res.json({ measurement_id: 'G-XXXXXXXXXX', is_active: false, created_at: null, updated_at: null });
        }
    } catch (error) {
        logger.error('Analytics getirme hatası:', error);
        res.status(500).json({ error: 'Analytics ayarları alınamadı' });
    }
});

// Analytics ayarlarını kaydet
router.post('/analytics-settings', verifyToken, async (req, res) => {
    try {
        const { measurement_id, is_active } = req.body;
        if (!measurement_id || !measurement_id.startsWith('G-')) {
            return res.status(400).json({ error: 'Geçerli bir Google Analytics Measurement ID girin (G-XXXXXXXXXX)' });
        }

        const exists = await pool.query('SELECT COUNT(*) FROM analytics_settings');
        if (Number(exists.rows[0].count) > 0) {
            await pool.query(
                'UPDATE analytics_settings SET measurement_id = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP',
                [measurement_id, !!is_active]
            );
        } else {
            await pool.query(
                'INSERT INTO analytics_settings (measurement_id, is_active) VALUES ($1, $2)',
                [measurement_id, !!is_active]
            );
        }

        res.json({ message: 'Analytics ayarları kaydedildi', measurement_id, is_active: !!is_active });
    } catch (error) {
        logger.error('Analytics kaydetme hatası:', error);
        res.status(500).json({ error: 'Analytics ayarları kaydedilemedi' });
    }
});

// Analytics test
router.post('/analytics-settings/test', verifyToken, async (req, res) => {
    try {
        const { measurement_id } = req.body;
        if (!measurement_id || !/^G-[A-Z0-9]{10}$/.test(measurement_id)) {
            return res.status(400).json({ error: 'Measurement ID formatı hatalı. G-XXXXXXXXXX olmalı.' });
        }
        res.json({ success: true, message: 'Measurement ID formatı doğru görünüyor.' });
    } catch (error) {
        logger.error('Analytics test hatası:', error);
        res.status(500).json({ error: 'Test sırasında hata oluştu' });
    }
});

module.exports = router;
