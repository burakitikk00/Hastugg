require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

const db = require('./routes/dbConfig');

// Middleware - CORS ayarları
app.use(cors({
    origin: [
        'https://hastugg-fov4.vercel.app', // Vercel production
        'https://hastugg-fov4-mjqyah1j4-buraks-projects-0138e460.vercel.app', // Vercel new deployment
        'https://hastugg-2.onrender.com' // Render production
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosya servisi - uploads klasöründeki görselleri erişilebilir yap
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

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
    console.log(`Server is running on port ${port} and bound to 0.0.0.0`);
});
