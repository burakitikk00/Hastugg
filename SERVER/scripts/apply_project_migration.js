const fs = require('fs');
const path = require('path');
const { pool } = require('../routes/dbConfig');

async function applyMigration() {
    console.log('🚀 Supabase veritabanı migrasyonu başlatılıyor...');
    if (!pool) {
        console.error('❌ Veritabanı bağlantısı bulunamadı (pool is null).');
        process.exit(1);
    }

    try {
        const sqlPath = path.join(__dirname, 'create_project_details_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 SQL dosyası okundu. Sorgular yürütülüyor...');
        await pool.query(sql);

        console.log('✅ "Projects" tablosu güncellendi.');
        console.log('✅ "ProjectHighlights" tablosu oluşturuldu / hazır.');
        console.log('✅ "ProjectTransportation" tablosu oluşturuldu / hazır.');
        console.log('🎉 Migrasyon başarıyla tamamlandı!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migrasyon çalıştırılırken hata oluştu:', err);
        process.exit(1);
    }
}

applyMigration();
