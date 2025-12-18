const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');

// Hero verilerini getir
router.get('/hero', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Hero" ORDER BY id LIMIT 1');
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Hero verisi bulunamadı' });
        }
    } catch (error) {
        logger.error('Hero getirme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Hero verilerini kaydet/güncelle
router.post('/hero', verifyToken, async (req, res) => {
    try {
        const { mainTitle, subheading } = req.body;
        if (!mainTitle || !subheading) {
            return res.status(400).json({ message: 'mainTitle ve subheading zorunludur.' });
        }

        const existing = await pool.query('SELECT id FROM "Hero" LIMIT 1');
        if (existing.rows.length > 0) {
            await pool.query('UPDATE "Hero" SET "mainTitle" = $1, subheading = $2 WHERE id = $3', [mainTitle, subheading, existing.rows[0].id]);
        } else {
            await pool.query('INSERT INTO "Hero" ("mainTitle", subheading) VALUES ($1, $2)', [mainTitle, subheading]);
        }

        res.status(200).json({ message: 'Hero verileri başarıyla kaydedildi' });
    } catch (error) {
        logger.error('Hero kaydetme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
