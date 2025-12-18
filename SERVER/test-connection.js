require('dotenv').config();
const { Pool } = require('pg');

console.log('\n🔍 PostgreSQL Bağlantı Testi Başlatılıyor...\n');

// Bağlantı bilgilerini göster
console.log('📋 Bağlantı Bilgileri:');
console.log('-----------------------------------');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_DATABASE);
console.log('Password:', process.env.DB_PASSWORD ? '✅ Tanımlı' : '❌ Tanımsız');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Tanımlı' : '❌ Tanımsız');
console.log('-----------------------------------\n');

// DATABASE_URL kullanarak bağlan
async function testConnection() {
    console.log('🔌 Bağlantı deneniyor...\n');

    const pool = new Pool(
        process.env.DATABASE_URL
            ? {
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            }
            : {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                ssl: { rejectUnauthorized: false }
            }
    );

    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL bağlantısı BAŞARILI!');

        // Basit bir sorgu çalıştır
        const result = await client.query('SELECT NOW() as current_time, version() as version');
        console.log('\n📊 Veritabanı Bilgileri:');
        console.log('Zaman:', result.rows[0].current_time);
        console.log('Versiyon:', result.rows[0].version.split(',')[0]);

        client.release();
        await pool.end();

        console.log('\n✅ Test başarıyla tamamlandı!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ BAĞLANTI HATASI:\n');
        console.error('Hata Mesajı:', error.message);
        console.error('Hata Kodu:', error.code);

        if (error.code === 'ENOTFOUND') {
            console.error('\n⚠️  DNS hatası: Hostname çözümlenemiyor.');
            console.error('Kontrol edin:');
            console.error('  1. .env dosyasındaki DB_HOST değeri doğru mu?');
            console.error('  2. İnternet bağlantınız var mı?');
            console.error('  3. Supabase servisi çalışıyor mu?');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n⚠️  Bağlantı reddedildi.');
            console.error('Port numarasını kontrol edin: 5432');
        } else if (error.code === '28P01') {
            console.error('\n⚠️  Authentication hatası: Kullanıcı adı veya şifre yanlış.');
        }

        console.error('\n');
        await pool.end();
        process.exit(1);
    }
}

testConnection();
