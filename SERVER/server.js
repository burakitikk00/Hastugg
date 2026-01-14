require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
