const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');

// Hero verilerini getir
router.get('/hero', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Hero" ORDER BY id LIMIT 1');
        
        let metrics = [];
        try {
            const metricsResult = await pool.query('SELECT id, value, label, order_index FROM "HeroMetrics" ORDER BY order_index ASC, id ASC');
            metrics = metricsResult.rows;
        } catch (mErr) {
            logger.warn('Admin HeroMetrics tablosu okunamadı:', mErr.message);
        }

        const heroData = result.rows.length > 0 ? result.rows[0] : { mainTitle: '', subheading: '' };
        res.status(200).json({
            ...heroData,
            metrics
        });
    } catch (error) {
        logger.error('Hero getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Hero verilerini kaydet/güncelle
router.post('/hero', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { mainTitle, subheading, metrics } = req.body;
        if (!mainTitle || !subheading) {
            return res.status(400).json({ message: 'mainTitle ve subheading zorunludur.' });
        }

        await client.query('BEGIN');

        // 1. Hero başlık ve alt metnini güncelle veya ekle
        const existing = await client.query('SELECT id FROM "Hero" LIMIT 1');
        if (existing.rows.length > 0) {
            await client.query(
                'UPDATE "Hero" SET "mainTitle" = $1, subheading = $2 WHERE id = $3',
                [mainTitle, subheading, existing.rows[0].id]
            );
        } else {
            await client.query(
                'INSERT INTO "Hero" ("mainTitle", subheading) VALUES ($1, $2)',
                [mainTitle, subheading]
            );
        }

        // 2. Eğer metrics dizisi gönderildiyse HeroMetrics tablosunu güncelle
        let savedMetrics = [];
        if (Array.isArray(metrics)) {
            // Önceki metrikleri temizle
            await client.query('DELETE FROM "HeroMetrics"');

            // Yeni geçerli metrikleri ekle
            for (let i = 0; i < metrics.length; i++) {
                const item = metrics[i];
                if (item && item.value && item.label) {
                    const insertResult = await client.query(
                        'INSERT INTO "HeroMetrics" (value, label, order_index) VALUES ($1, $2, $3) RETURNING id, value, label, order_index',
                        [item.value.trim(), item.label.trim(), item.order_index ?? (i + 1)]
                    );
                    savedMetrics.push(insertResult.rows[0]);
                }
            }
        } else {
            const currentMetrics = await client.query('SELECT id, value, label, order_index FROM "HeroMetrics" ORDER BY order_index ASC, id ASC');
            savedMetrics = currentMetrics.rows;
        }

        await client.query('COMMIT');

        res.status(200).json({ 
            message: 'Hero ve mimari metrik verileri başarıyla kaydedildi',
            metrics: savedMetrics
        });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Hero kaydetme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', details: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
