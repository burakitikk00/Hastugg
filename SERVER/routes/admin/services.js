const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');

// Services verilerini getir
router.get('/services', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, service, description, url FROM "Services" ORDER BY id');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Services getirme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Services verilerini kaydet/güncelle (tüm services array'ini alır)
router.post('/services', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { services } = req.body;
        if (!services || !Array.isArray(services)) {
            return res.status(400).json({ message: 'services array zorunludur.' });
        }

        await client.query('BEGIN');
        await client.query('DELETE FROM "Services"');

        for (const service of services) {
            await client.query(
                'INSERT INTO "Services" (service, description, url) VALUES ($1, $2, $3)',
                [service.service, service.description, service.url || null]
            );
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Services verileri başarıyla kaydedildi' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Services kaydetme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Tek service güncelle
router.put('/services/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { service, description, url } = req.body;
        if (!service || !description) {
            return res.status(400).json({ message: 'service ve description zorunludur.' });
        }

        await pool.query(
            'UPDATE "Services" SET service = $1, description = $2, url = $3 WHERE id = $4',
            [service, description, url || null, id]
        );

        res.status(200).json({ message: 'Hizmet güncellendi' });
    } catch (error) {
        logger.error('Service güncelleme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Service sil
router.delete('/services/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM "Services" WHERE id = $1', [id]);
        res.status(200).json({ message: 'Hizmet silindi' });
    } catch (error) {
        logger.error('Service silme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
