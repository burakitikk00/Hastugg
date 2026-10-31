const fs = require('fs');
const path = require('path');
const { pool } = require('../routes/dbConfig');

async function applyHeroMetricsMigration() {
    console.log('🚀 HeroMetrics veritabanı migrasyonu başlatılıyor...');
    if (!pool) {
        console.error('❌ Veritabanı bağlantısı bulunamadı (pool is null).');
        process.exit(1);
    }

    try {
        const sqlPath = path.join(__dirname, 'create_hero_metrics_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 SQL dosyası okundu. Sorgular yürütülüyor...');
        await pool.query(sql);

        const checkResult = await pool.query('SELECT COUNT(*) FROM "HeroMetrics"');
        console.log(`✅ "HeroMetrics" tablosu hazır. Toplam metrik kaydı: ${checkResult.rows[0].count}`);

        const sampleRows = await pool.query('SELECT id, value, label, order_index FROM "HeroMetrics" ORDER BY order_index');
        console.log('📋 Mevcut Metrikler:');
        sampleRows.rows.forEach(r => console.log(`   [#${r.order_index}] ${r.value} -> ${r.label}`));

        console.log('🎉 HeroMetrics migrasyonu başarıyla tamamlandı!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migrasyon çalıştırılırken hata oluştu:', err);
        process.exit(1);
    }
}

applyHeroMetricsMigration();
