const express = require('express');
const bcrypt = require('bcrypt');
const logger = require('../../utils/logger');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { pool } = require('../dbConfig');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

// Admin oluştur
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'username ve password zorunludur.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO "Admins" (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
        );

        res.status(201).json({ message: 'Admin başarıyla oluşturuldu' });
    } catch (error) {
        logger.error('Admin register hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Login rate limiter'ı import et
const { loginLimiter } = require('../../server');

// Admin login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'username ve password zorunludur.' });
        }

        const result = await pool.query('SELECT * FROM "Admins" WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(404).send('kullanıcı bulunamadı.');
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Geçersiz parola.');
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: 'Giriş başarılı!', token });
    } catch (error) {
        logger.error('Admin login hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
