require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 5000;

const db = require('./routes/dbConfig');

// Middleware - CORS ayarları
const defaultOrigins = [
    'https://hastugg-fov4.vercel.app',
    'https://hastugg-fov4-mjqyah1j4-buraks-projects-0138e460.vercel.app',
    'https://hastugg-2.onrender.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
    : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
const isProduction = process.env.NODE_ENV === 'production';

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

// Statik dosya servisi - uploads klasöründeki görselleri erişilebilir yap
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.listen(port, '0.0.0.0', () => {
    logger.log(`Server is running on port ${port} and bound to 0.0.0.0`);
});
