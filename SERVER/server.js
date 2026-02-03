require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 5000;

const db = require('./routes/dbConfig');

// Middleware - CORS ayarları
// Environment variable'dan allowed origins al
const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
    : [];

// Development için default local origins
const defaultLocalOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

const isProduction = process.env.NODE_ENV === 'production';

// Production'da sadece env'den gelen origins, development'da local origins + env origins
const allowedOrigins = isProduction
    ? envOrigins
    : [...new Set([...defaultLocalOrigins, ...envOrigins])];

const baseCorsOptions = {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin']
};

const productionCorsOptions = {
    ...baseCorsOptions,
    origin(origin, callback) {
        const isLocal = origin && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

        if (!origin || isLocal || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Reddet ama sunucuyu düşürme
        return callback(null, false);
    }
};

// In development, allow *any* origin to unblock local debugging
const developmentCorsOptions = {
    ...baseCorsOptions,
    origin: true
};

const activeCorsOptions = isProduction ? productionCorsOptions : developmentCorsOptions;

app.use(cors(activeCorsOptions));
app.options('*', cors(activeCorsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ RATE LIMITING ============
// Genel API rate limiter - 15 dakikada 100 istek
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // 15 dakikada maksimum 100 istek
    message: {
        error: 'Çok fazla istek. Lütfen 15 dakika sonra tekrar deneyin.',
        retryAfterMinutes: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health' // Health check'i atla
});

// İletişim formu için daha sıkı limit - 1 saatte 5 mesaj
const contactFormLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 5, // 1 saatte maksimum 5 mesaj
    message: {
        error: 'Çok fazla mesaj gönderdiniz. Lütfen 1 saat sonra tekrar deneyin.',
        retryAfterMinutes: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Login için rate limiter - brute force koruması
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // 15 dakikada maksimum 5 deneme
    message: {
        error: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
        retryAfterMinutes: 15
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Genel rate limiting uygula
app.use('/api', generalLimiter);

// İletişim formu için özel limit
app.post('/api/contact', contactFormLimiter);

// Login için özel limit
app.post('/api/admin/login', loginLimiter);

// ============ GÜVENLİK BAŞLIKLARI ============
app.use((req, res, next) => {
    // XSS koruması
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Clickjacking koruması
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // MIME type sniffing koruması
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Not: Statik dosya servisi kaldırıldı - artık görseller Supabase Storage'da

const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 5000
    });
});

const server = app.listen(port, '0.0.0.0', () => {
    logger.log(`✅ Server is running on port ${port} and bound to 0.0.0.0`);
});

// Port kullanımda hatası için özel yönetim
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${port} zaten kullanımda!`);
        logger.error(`📝 Çözüm:`);
        logger.error(`   1. Çalışan Node.js süreçlerini durdurun:`);
        logger.error(`      Windows: Get-Process node | Stop-Process -Force`);
        logger.error(`      Mac/Linux: pkill -f node`);
        logger.error(`   2. Veya farklı bir port kullanın: PORT=5001 npm run dev`);
        logger.error(`   3. Port ${port}'i kullanan süreci bulun:`);
        logger.error(`      Windows: netstat -ano | findstr :${port}`);
        logger.error(`      Mac/Linux: lsof -i :${port}`);
        process.exit(1);
    } else {
        logger.error('❌ Sunucu başlatılırken hata:', error);
        process.exit(1);
    }
});
