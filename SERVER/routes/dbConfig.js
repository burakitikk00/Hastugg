const { Pool } = require('pg');
const logger = require('../utils/logger');
require('dotenv').config();

// PostgreSQL bağlantı yapılandırma ayarları
const isProduction = process.env.NODE_ENV === 'production';

// Bağlantı havuzu (pool) oluştur
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            // Bağlantı sorunlarını gidermek için ek ayarlar
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
            // IPv4'ü zorla (Supabase bazen IPv6 ile sorun yaşıyor)
            options: '-c search_path=public'
        }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            max: 10,                            // Maksimum bağlantı sayısı
            idleTimeoutMillis: 30000,           // Boşta kalma süresi
            connectionTimeoutMillis: 30000,     // Bağlantı zaman aşımı
            ssl: isProduction ? { rejectUnauthorized: false } : false,
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000
        }
);

// Bağlantı testi
pool.connect()
    .then(client => {
        logger.log(' PostgreSQL veritabanına başarıyla bağlanıldı.');
        client.release();
    })
    .catch(err => {
        logger.error(' PostgreSQL veritabanı bağlantı hatası: ', err.message);
        if (isProduction) {
            process.exit(1);
        }
    });

// Yardımcı sorgu fonksiyonu
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.info('Sorgu çalıştırıldı', {
            text: text.substring(0, 80),
            duration: `${duration}ms`,
            rows: result.rowCount
        });
        return result;
    } catch (error) {
        logger.error('Sorgu hatası:', error.message);
        throw error;
    }
};

// Diğer dosyalarda kullanmak için 'pool' ve yardımcı fonksiyonları export et
module.exports = {
    pool,
    query
};