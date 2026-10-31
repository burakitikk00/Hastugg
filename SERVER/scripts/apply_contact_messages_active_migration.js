const { pool } = require('../routes/dbConfig');

async function runMigration() {
    try {
        console.log('🔄 ContactMessages tablosuna is_active kolonu kontrol ediliyor...');
        
        // is_active sütununu ekle (varsa dokunma)
        await pool.query(`
            ALTER TABLE "ContactMessages" 
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        `);

        // Mevcut NULL kayıtları TRUE yap
        await pool.query(`
            UPDATE "ContactMessages" 
            SET is_active = TRUE 
            WHERE is_active IS NULL;
        `);

        // Index ekle
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_contactmessages_active 
            ON "ContactMessages"(is_active);
        `);

        console.log('✅ is_active kolonu ve indeksi başarıyla hazırlandı!');

        // Kontrol et
        const res = await pool.query(`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'ContactMessages';
        `);
        console.log('📊 ContactMessages sütunları:', res.rows.map(r => `${r.column_name} (${r.data_type})`));

        // Mesaj sayılarını kontrol et
        const countRes = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE is_active = true) as active,
                COUNT(*) FILTER (WHERE is_active = false) as passive
            FROM "ContactMessages";
        `);
        console.log('📈 Mesaj durumu:', countRes.rows[0]);

        process.exit(0);
    } catch (err) {
        console.error('❌ Hata:', err);
        process.exit(1);
    }
}

runMigration();
