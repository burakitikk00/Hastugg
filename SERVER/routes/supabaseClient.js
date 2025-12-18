const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
require('dotenv').config();

// Supabase yapılandırması
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase client oluştur (Service Role Key ile - server tarafında tam yetki)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Public client (Anon Key ile - sınırlı yetkiler)
const supabasePublic = createClient(
    supabaseUrl,
    process.env.SUPABASE_ANON_KEY || supabaseServiceKey
);

// Test fonksiyonu
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('_test_')
            .select('*')
            .limit(1);

        if (error && error.code !== 'PGRST204') {
            logger.log('⚠️  Supabase bağlantı testi: Connection OK (Tablo bulunamadı, bu normal)');
        } else {
            logger.log('✅ Supabase bağlantı testi başarılı!');
        }
    } catch (err) {
        logger.error('❌ Supabase bağlantı hatası:', err.message);
    }
}

// Export
module.exports = {
    supabase,           // Service role - tam yetki
    supabasePublic,     // Anon key - sınırlı yetki
    testSupabaseConnection
};
