const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');

const ENCRYPTION_KEY = crypto.scryptSync('hastugg_email_encryption_key_2024', 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Email ayarlarını getir
router.get('/email-settings', verifyToken, async (_req, res) => {
    try {
        const tableCheck = await pool.query(
            `SELECT table_name FROM information_schema.tables WHERE table_name = 'emailsettings'`
        );
        if (tableCheck.rowCount === 0) {
            return res.status(404).json({ message: 'EmailSettings tablosu bulunamadı.', needsSetup: true });
        }

        const result = await pool.query('SELECT * FROM "EmailSettings" ORDER BY id LIMIT 1');
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Email ayarları bulunamadı' });
        }

        const settings = result.rows[0];
        res.status(200).json({
            id: settings.id,
            email_user: settings.email_user,
            email_pass: '••••••••',
            created_at: settings.created_at
        });
    } catch (error) {
        logger.error('Email ayarları getirme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Email ayarlarını kaydet/güncelle
router.post('/email-settings', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { email_user, email_pass } = req.body;
        if (!email_user || !email_pass) {
            return res.status(400).json({ message: 'email_user ve email_pass zorunludur.' });
        }

        await client.query('BEGIN');
        await client.query('DELETE FROM "EmailSettings"');
        const encryptedPassword = encrypt(email_pass);
        await client.query(
            'INSERT INTO "EmailSettings" (email_user, email_pass) VALUES ($1, $2)',
            [email_user, encryptedPassword]
        );
        await client.query('COMMIT');
        res.status(200).json({ message: 'Email ayarları kaydedildi' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Email kaydetme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Email ayarlarını test et
router.post('/email-settings/test', verifyToken, async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "EmailSettings" ORDER BY id LIMIT 1');
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Email ayarları bulunamadı' });
        }

        const settings = result.rows[0];
        const decryptedPassword = decrypt(settings.email_pass);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: settings.email_user, pass: decryptedPassword }
        });

        await transporter.sendMail({
            from: settings.email_user,
            to: settings.email_user,
            subject: 'Email Ayarları Test - Hastugg',
            html: '<h3>Email ayarları başarılı!</h3>'
        });

        res.status(200).json({ message: 'Test e-postası gönderildi' });
    } catch (error) {
        logger.error('Email test hatası:', error);
        res.status(500).json({ error: 'Test e-postası gönderilemedi', details: error.message });
    }
});

module.exports = { router, decrypt };
