const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');

// About verilerini getir
router.get('/about', verifyToken, async (req, res) => {
    try {
        const aboutResult = await pool.query('SELECT * FROM "AboutUs" ORDER BY id LIMIT 1');
        if (aboutResult.rows.length === 0) {
            return res.status(404).json({ message: 'About verisi bulunamadı' });
        }

        const aboutData = aboutResult.rows[0];
        const featuresResult = await pool.query('SELECT * FROM "FeatureCards" ORDER BY id');

        res.status(200).json({
            id: aboutData.id,
            mainTitle: aboutData.maintitle ?? aboutData.mainTitle,
            mainDescription: aboutData.maindescription ?? aboutData.mainDescription,
            features: featuresResult.rows
        });
    } catch (error) {
        logger.error('About getirme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// About verilerini kaydet/güncelle
router.post('/about', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { mainTitle, mainDescription, features } = req.body;
        if (!mainTitle || !mainDescription || !features || !Array.isArray(features)) {
            return res.status(400).json({ message: 'mainTitle, mainDescription ve features array zorunludur.' });
        }

        await client.query('BEGIN');

        const existingAbout = await client.query('SELECT id FROM "AboutUs" ORDER BY id LIMIT 1');
        if (existingAbout.rows.length > 0) {
            await client.query(
                'UPDATE "AboutUs" SET "mainTitle" = $1, "mainDescription" = $2 WHERE id = $3',
                [mainTitle, mainDescription, existingAbout.rows[0].id]
            );
        } else {
            await client.query(
                'INSERT INTO "AboutUs" ("mainTitle", "mainDescription") VALUES ($1, $2)',
                [mainTitle, mainDescription]
            );
        }

        const existingFeatures = await client.query('SELECT id FROM "FeatureCards" ORDER BY id');
        const existingIds = new Set(existingFeatures.rows.map(f => f.id));
        const sentIds = new Set();

        for (const feature of features) {
            const fid = feature.id ? Number(feature.id) : null;
            const cols = {
                feature: (feature.feature || '').trim(),
                description: (feature.description || '').trim(),
                icon: (feature.icon || '').trim()
            };

            if (fid && existingIds.has(fid)) {
                await client.query(
                    'UPDATE "FeatureCards" SET feature = $1, description = $2, icon = $3 WHERE id = $4',
                    [cols.feature, cols.description, cols.icon, fid]
                );
                sentIds.add(fid);
            } else {
                const insertResult = await client.query(
                    'INSERT INTO "FeatureCards" (feature, description, icon) VALUES ($1, $2, $3) RETURNING id',
                    [cols.feature, cols.description, cols.icon]
                );
                sentIds.add(insertResult.rows[0].id);
            }
        }

        for (const id of existingIds) {
            if (!sentIds.has(id)) {
                await client.query('DELETE FROM "FeatureCards" WHERE id = $1', [id]);
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'About verileri başarıyla kaydedildi' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('About POST error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
