const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// DATABASE_URL kontrolü
if (!process.env.DATABASE_URL) {
    const errorMsg = '❌ DATABASE_URL environment variable tanımlı değil!';
    console.error(errorMsg);
    console.error('📝 Lütfen SERVER/.env dosyasında DATABASE_URL değişkenini tanımlayın.');
    
    if (isProduction) {
        console.error('⚠️  Production modunda çalışıyorsunuz. Sunucu kapatılıyor...');
        process.exit(1);
    } else {
        console.warn('⚠️  Development modunda çalışıyorsunuz. Sunucu başlatılıyor ancak veritabanı işlemleri çalışmayacak.');
    }
}

// Pool oluşturmayı try-catch ile sarmala
let pool = null;

try {
    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 30000
        });

        // Bağlantı testi
        pool.connect()
            .then(client => {
                console.log('✅ PostgreSQL veritabanına başarıyla bağlanıldı.');
                client.release();
            })
            .catch(err => {
                console.error('❌ PostgreSQL bağlantı hatası:', err.message);
                if (err.code === 'ENOTFOUND') {
                    console.error('⚠️  DNS hatası: Hostname çözümlenemiyor. DATABASE_URL değerini kontrol edin.');
                } else if (err.code === 'ECONNREFUSED') {
                    console.error('⚠️  Bağlantı reddedildi. Veritabanı sunucusu çalışıyor mu?');
                } else if (err.code === '28P01') {
                    console.error('⚠️  Authentication hatası: Kullanıcı adı veya şifre yanlış.');
                }
                
                if (isProduction) {
                    console.error('⚠️  Production modunda çalışıyorsunuz. Sunucu kapatılıyor...');
                    process.exit(1);
                } else {
                    console.warn('⚠️  Development modunda çalışıyorsunuz. Sunucu başlatılıyor ancak veritabanı işlemleri çalışmayacak.');
                }
            });
    } else {
        // DATABASE_URL yoksa null pool oluştur
        console.warn('⚠️  Pool oluşturulmadı - DATABASE_URL tanımlı değil.');
    }
} catch (error) {
    console.error('❌ Pool oluşturulurken hata:', error.message);
    if (isProduction) {
        process.exit(1);
    }
}

const query = async (text, params) => {
    if (!pool) {
        throw new Error('Veritabanı bağlantısı yok. DATABASE_URL environment variable\'ını kontrol edin.');
    }
    
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error('Sorgu hatası:', error.message);
        throw error;
    }
};

module.exports = {
    pool,
    query
};