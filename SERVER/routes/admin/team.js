const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');
const { upload, deleteImage } = require('../../upload');

// Team listele
router.get('/team', verifyToken, async (_req, res) => {
    try {
        const tableCheck = await pool.query(
            `SELECT table_name FROM information_schema.tables WHERE table_name = 'Team'`
        );
        if (tableCheck.rowCount === 0) {
            return res.status(404).json({ message: 'Team tablosu bulunamadı. Lütfen tabloyu oluşturun.' });
        }

        const result = await pool.query('SELECT id, namesurname, position, url, "LinkedIn" FROM "Team" ORDER BY id');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Team verileri getirme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Team üyesi ekle
router.post('/team', verifyToken, upload.single('image'), async (req, res) => {
    const client = await pool.connect();
    try {
        const { namesurname, position, LinkedIn } = req.body;
        if (!namesurname || !position) {
            return res.status(400).json({ message: 'namesurname ve position zorunludur.' });
        }

        await client.query('BEGIN');
        const imageURL = req.file ? `/uploads/${req.file.filename}` : null;
        await client.query(
            'INSERT INTO "Team" (namesurname, position, url, "LinkedIn") VALUES ($1, $2, $3, $4)',
            [namesurname, position, imageURL, LinkedIn || null]
        );
        await client.query('COMMIT');

        res.status(201).json({ message: 'Team üyesi eklendi', imageURL });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Team üyesi ekleme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Team üyesi güncelle
router.put('/team/:id', verifyToken, upload.single('image'), async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { namesurname, position, LinkedIn } = req.body;
        if (!namesurname || !position) {
            return res.status(400).json({ message: 'namesurname ve position zorunludur.' });
        }

        await client.query('BEGIN');
        const current = await client.query('SELECT url FROM "Team" WHERE id = $1', [id]);
        if (current.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Team üyesi bulunamadı' });
        }

        let imageURL = current.rows[0].url;
        if (req.file) {
            if (imageURL) await deleteImage(imageURL);
            imageURL = `/uploads/${req.file.filename}`;
        }

        await client.query(
            'UPDATE "Team" SET namesurname = $1, position = $2, url = $3, "LinkedIn" = $4 WHERE id = $5',
            [namesurname, position, imageURL, LinkedIn || null, id]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: 'Team üyesi güncellendi', imageURL });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Team güncelleme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Team üyesi sil
router.delete('/team/:id', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');
        const current = await client.query('SELECT url FROM "Team" WHERE id = $1', [id]);
        if (current.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Team üyesi bulunamadı' });
        }

        const imageURL = current.rows[0].url;
        if (imageURL) await deleteImage(imageURL);

        await client.query('DELETE FROM "Team" WHERE id = $1', [id]);
        await client.query('COMMIT');
        res.status(200).json({ message: 'Team üyesi silindi' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Team silme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Team üyesi resmi sil
router.delete('/team/:id/image', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');
        const current = await client.query('SELECT url FROM "Team" WHERE id = $1', [id]);
        if (current.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Team üyesi bulunamadı' });
        }

        const imageURL = current.rows[0].url;
        if (imageURL) {
            await deleteImage(imageURL);
            await client.query('UPDATE "Team" SET url = NULL WHERE id = $1', [id]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Team üyesi resmi silindi' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Team resmi silme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

module.exports = router;
