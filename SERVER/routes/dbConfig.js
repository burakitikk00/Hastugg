const sql = require('mssql');
require('dotenv').config();

// Veritabanı yapılandırma ayarları
const config = {
    user: process.env.DB_USER,                  // SQL Server kullanıcı adı
    password: process.env.DB_PASSWORD,           // SQL Server şifresi
    server: process.env.DB_SERVER,                // SQL Server adresi (örn: 'sunucu.database.windows.net')
    database: process.env.DB_DATABASE,           // Veritabanı adı
    port: 1433,                                  // SQL Server varsayılan portu

    // --- DÜZELTME: 'pool' objesi, 'options' ile aynı seviyede olmalı ---
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },

    // Bağlantı seçenekleri
    options: {
        encrypt: true,                           // Azure SQL için bu seçenek zorunludur
        trustServerCertificate: true,            // SSL sertifikası doğrulamasını atla (lokal/geliştirme için)
        enableArithAbort: true,
        requestTimeout: 30000,                   // İstek zaman aşımı (30 saniye)
        connectionTimeout: 30000                 // Bağlantı zaman aşımı (30 saniye)
    }
};

// Veritabanı bağlantı havuzunu (pool) oluştur ve bağlan
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        // --- İYİLEŞTİRME: Başarılı bağlantı durumunda konsola bilgi ver ---
        console.log('✅ Veritabanına başarıyla bağlanıldı.');
        return pool;
    })
    .catch(err => {
        // --- İYİLEŞTİRME: Bağlantı hatasında uygulamayı durdur ---
        console.error('❌ Veritabanı bağlantı hatası: ', err);
        // Veritabanı olmadan uygulama çalışamaz, bu yüzden işlemi sonlandır.
        process.exit(1);
    });

// Diğer dosyalarda kullanmak için 'sql' objesini ve 'poolPromise'i export et
module.exports = {
    sql,
    poolPromise
};