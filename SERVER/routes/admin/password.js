const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');
const { decrypt } = require('./emailSettings');

function generateRandomPassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < length; i++) {
        pwd += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return pwd;
}

// Şifre değiştir (login olmuş admin)
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'Mevcut şifre, yeni şifre ve onay zorunludur.' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Yeni şifre ve onay eşleşmiyor.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalı.' });
        }
        if (newPassword === currentPassword) {
            return res.status(400).json({ error: 'Yeni şifre mevcut şifre ile aynı olamaz.' });
        }

        const userId = req.user.id;
        const userResult = await pool.query('SELECT password FROM "Admins" WHERE id = $1', [userId]);
        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }

        const hashedCurrent = userResult.rows[0].password;
        const valid = await bcrypt.compare(currentPassword, hashedCurrent);
        if (!valid) {
            return res.status(400).json({ error: 'Mevcut şifre yanlış.' });
        }

        const hashedNew = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE "Admins" SET password = $1 WHERE id = $2', [hashedNew, userId]);
        res.status(200).json({ message: 'Şifre değiştirildi. Tekrar giriş yapmanız gerekebilir.', requiresReauth: true });
    } catch (error) {
        logger.error('Şifre değiştirme hatası:', error);
        res.status(500).json({ error: 'Şifre değiştirilemedi' });
    }
});

// Şifre sıfırlama
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'E-posta zorunludur.' });
        }

        const emailSettingsRes = await pool.query('SELECT * FROM "EmailSettings" WHERE email_user = $1', [email]);
        if (emailSettingsRes.rowCount === 0) {
            return res.status(404).json({ error: 'Bu e-posta sistemde kayıtlı değil.' });
        }
        const emailSettings = emailSettingsRes.rows[0];

        const adminRes = await pool.query('SELECT id, username FROM "Admins" ORDER BY id LIMIT 1');
        if (adminRes.rowCount === 0) {
            return res.status(500).json({ error: 'Admin kullanıcısı bulunamadı.' });
        }
        const admin = adminRes.rows[0];

        const newPassword = generateRandomPassword(12);
        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE "Admins" SET password = $1 WHERE id = $2', [hashed, admin.id]);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: emailSettings.email_user, pass: decrypt(emailSettings.email_pass) }
        });

        await transporter.sendMail({
            from: emailSettings.email_user,
            to: email,
            subject: 'Hastugg Admin - Şifre Sıfırlama',
            html: `
                <h3>Şifreniz sıfırlandı</h3>
                <p>Yeni şifreniz: <strong>${newPassword}</strong></p>
                <p>Lütfen giriş yaptıktan sonra şifrenizi değiştirin.</p>
            `
        });

        res.status(200).json({ message: 'Şifre sıfırlama e-postası gönderildi.' });
    } catch (error) {
        logger.error('Şifre sıfırlama hatası:', error);
        res.status(500).json({ error: 'Şifre sıfırlama başarısız' });
    }
});

module.exports = router;
