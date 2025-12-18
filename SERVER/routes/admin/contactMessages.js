const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const nodemailer = require('nodemailer');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');
const { decrypt } = require('./emailSettings');

// İstatistikler
router.get('/contact-messages/stats', verifyToken, async (_req, res) => {
    try {
        const stats = await pool.query(
            `SELECT COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE is_read = false) AS unread,
                    COUNT(*) FILTER (WHERE is_sent = true) AS sent
             FROM "ContactMessages"`
        );
        const { total, unread, sent } = stats.rows[0];
        res.status(200).json({
            total: Number(total || 0),
            unread: Number(unread || 0),
            sent: Number(sent || 0)
        });
    } catch (error) {
        logger.error('Contact mesajları istatistik hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Liste + sayfalama
router.get('/contact-messages', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filter = req.query.filter || 'all';
        const offset = (page - 1) * limit;

        let whereClause = '';
        if (filter === 'unread') whereClause = 'WHERE is_read = false';
        else if (filter === 'sent') whereClause = 'WHERE is_sent = true';

        const countResult = await pool.query(`SELECT COUNT(*) FROM "ContactMessages" ${whereClause}`);
        const total = Number(countResult.rows[0].count || 0);

        const result = await pool.query(
            `SELECT id, first_name, last_name, email, phone, message, created_at, is_read, is_sent
             FROM "ContactMessages"
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const totalPages = Math.ceil(total / limit) || 1;
        res.status(200).json({
            messages: result.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        logger.error('Contact mesajları list hata:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Okundu işaretle
router.put('/contact-messages/:id/read', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE "ContactMessages" SET is_read = true WHERE id = $1', [id]);
        res.status(200).json({ message: 'Mesaj okundu olarak işaretlendi' });
    } catch (error) {
        logger.error('Mesaj okundu hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// E-posta gönder
router.post('/contact-messages/:id/send-email', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const msgResult = await pool.query('SELECT * FROM "ContactMessages" WHERE id = $1', [id]);
        if (msgResult.rowCount === 0) {
            return res.status(404).json({ message: 'Mesaj bulunamadı' });
        }
        const message = msgResult.rows[0];

        const emailResult = await pool.query('SELECT * FROM "EmailSettings" ORDER BY id LIMIT 1');
        if (emailResult.rowCount === 0) {
            return res.status(404).json({ message: 'Email ayarları bulunamadı' });
        }
        const emailSettings = emailResult.rows[0];
        const decryptedPassword = decrypt(emailSettings.email_pass);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: emailSettings.email_user, pass: decryptedPassword }
        });

        await transporter.sendMail({
            from: emailSettings.email_user,
            to: emailSettings.email_user,
            subject: `Yeni İletişim Formu - ${message.first_name} ${message.last_name}`,
            html: `
                <h2>Yeni İletişim Formu Mesajı</h2>
                <p><strong>Ad Soyad:</strong> ${message.first_name} ${message.last_name}</p>
                <p><strong>E-posta:</strong> ${message.email}</p>
                <p><strong>Telefon:</strong> ${message.phone}</p>
                <p><strong>Mesaj:</strong></p>
                <p>${(message.message || '').replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>Bu mesaj web sitenizin iletişim formundan gönderilmiştir.</em></p>
                <p><strong>Gönderim Zamanı:</strong> ${new Date(message.created_at).toLocaleString('tr-TR')}</p>
            `
        });

        await pool.query('UPDATE "ContactMessages" SET is_sent = true WHERE id = $1', [id]);
        res.status(200).json({ message: 'E-posta gönderildi' });
    } catch (error) {
        logger.error('E-posta gönderme hatası:', error);
        res.status(500).json({ error: 'E-posta gönderilemedi', details: error.message });
    }
});

// Mesaj sil
router.delete('/contact-messages/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM "ContactMessages" WHERE id = $1', [id]);
        res.status(200).json({ message: 'Mesaj silindi' });
    } catch (error) {
        logger.error('Mesaj silme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
