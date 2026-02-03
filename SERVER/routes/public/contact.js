const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');

const ENCRYPTION_KEY = crypto.scryptSync('hastugg_email_encryption_key_2024', 'salt', 32);
const IV_LENGTH = 16;

function decryptEmailPassword(encryptedText) {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

async function sendContactEmail(message) {
    try {
        const emailResult = await pool.query('SELECT * FROM "EmailSettings" ORDER BY id LIMIT 1');

        if (emailResult.rows.length === 0) {
            logger.warn('Email ayarları bulunamadı, otomatik email gönderilemedi');
            return false;
        }

        const emailSettings = emailResult.rows[0];
        const decryptedPassword = decryptEmailPassword(emailSettings.email_pass);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailSettings.email_user,
                pass: decryptedPassword
            }
        });

        const mailOptions = {
            from: emailSettings.email_user,
            to: emailSettings.email_user,
            subject: `Yeni İletişim Formu - ${message.first_name} ${message.last_name}`,
            html: `
                <h2>Yeni İletişim Formu Mesajı</h2>
                <p><strong>Ad Soyad:</strong> ${message.first_name} ${message.last_name}</p>
                <p><strong>E-posta:</strong> ${message.email}</p>
                <p><strong>Telefon:</strong> ${message.phone}</p>
                <p><strong>Mesaj:</strong></p>
                <p>${message.message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>Bu mesaj web sitenizin iletişim formundan otomatik olarak gönderilmiştir.</em></p>
                <p><strong>Gönderim Zamanı:</strong> ${new Date(message.created_at).toLocaleString('tr-TR')}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        logger.info('Otomatik email başarıyla gönderildi:', message.email);
        return true;
    } catch (error) {
        logger.error('Otomatik email gönderme hatası:', error);
        return false;
    }
}

// İletişim formu rate limiter'ı import et
const { contactFormLimiter } = require('../../server');

// İletişim formu gönderimi
router.post('/contact', contactFormLimiter, async (req, res) => {
    try {
        const { firstName, lastName, email, phone, message } = req.body;

        if (!firstName || !lastName || !email || !phone || !message) {
            return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz' });
        }

        const insertResult = await pool.query(
            `INSERT INTO "ContactMessages" (first_name, last_name, email, phone, message)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [firstName, lastName, email, phone, message]
        );

        const savedMessage = insertResult.rows[0];

        sendContactEmail(savedMessage).then(emailSent => {
            if (emailSent) {
                pool.query(
                    'UPDATE "ContactMessages" SET is_sent = true WHERE id = $1',
                    [savedMessage.id]
                ).catch(err => logger.error('Email gönderildi işaretleme hatası:', err));
            }
        }).catch(err => logger.error('Otomatik email gönderme hatası:', err));

        res.status(200).json({ message: 'Mesajınız başarıyla kaydedildi. En kısa sürede size dönüş yapacağız.' });
    } catch (error) {
        logger.error('Mesaj kaydetme hatası:', error);
        res.status(500).json({ error: 'Mesaj kaydedilirken bir hata oluştu' });
    }
});

module.exports = router;
