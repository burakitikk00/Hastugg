const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');

// Contact bilgilerini güncelle (PUT/POST benzer)
async function upsertContact(req, res) {
    const client = await pool.connect();
    try {
        const { id, address, phone, email, facebook, twitter, instagram, linkedin, mapEmbedUrl } = req.body;
        await client.query('BEGIN');

        let targetId = id;
        if (!targetId) {
            const existing = await client.query('SELECT id FROM "Contact" ORDER BY id LIMIT 1');
            if (existing.rowCount > 0) targetId = existing.rows[0].id;
        }

        const values = [address, phone, email, facebook || null, twitter || null, instagram || null, linkedin || null, mapEmbedUrl || null];

        if (targetId) {
            await client.query(
                'UPDATE "Contact" SET address = $1, phone = $2, email = $3, facebook = $4, twitter = $5, instagram = $6, linkedin = $7, "mapEmbedUrl" = $8 WHERE id = $9',
                [...values, targetId]
            );
        } else {
            await client.query(
                'INSERT INTO "Contact" (address, phone, email, facebook, twitter, instagram, linkedin, "mapEmbedUrl") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
                values
            );
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'İletişim bilgileri kaydedildi' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Contact kaydetme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
}

router.put('/contact', verifyToken, upsertContact);
router.post('/contact', verifyToken, upsertContact);

module.exports = router;
