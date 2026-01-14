const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Supabase yapılandırması
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Environment variable kontrolleri
if (!supabaseUrl) {
    const errorMsg = '❌ SUPABASE_URL environment variable tanımlı değil!';
    logger.error(errorMsg);
    logger.error('📝 Lütfen SERVER/.env dosyasında SUPABASE_URL değişkenini tanımlayın.');
    
    if (isProduction) {
        logger.error('⚠️  Production modunda çalışıyorsunuz. Sunucu kapatılıyor...');
        process.exit(1);
    } else {
        logger.warn('⚠️  Development modunda çalışıyorsunuz. Supabase client oluşturulamadı.');
    }
}

if (!supabaseServiceKey) {
    const errorMsg = '❌ SUPABASE_SERVICE_ROLE_KEY environment variable tanımlı değil!';
    logger.error(errorMsg);
    logger.error('📝 Lütfen SERVER/.env dosyasında SUPABASE_SERVICE_ROLE_KEY değişkenini tanımlayın.');
    
    if (isProduction) {
        logger.error('⚠️  Production modunda çalışıyorsunuz. Sunucu kapatılıyor...');
        process.exit(1);
    } else {
        logger.warn('⚠️  Development modunda çalışıyorsunuz. Supabase client oluşturulamadı.');
    }
}

// Supabase client oluştur (Service Role Key ile - server tarafında tam yetki)
let supabase = null;
let supabasePublic = null;

try {
    if (supabaseUrl && supabaseServiceKey) {
        supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        logger.log('✅ Supabase client (service role) oluşturuldu.');

        // Public client (Anon Key ile - sınırlı yetkiler)
        const publicKey = supabaseAnonKey || supabaseServiceKey;
        supabasePublic = createClient(supabaseUrl, publicKey);
        
        if (supabaseAnonKey) {
            logger.log('✅ Supabase public client (anon key) oluşturuldu.');
        } else {
            logger.warn('⚠️  SUPABASE_ANON_KEY tanımlı değil, service role key kullanılıyor.');
        }
    } else {
        logger.warn('⚠️  Supabase client\'lar oluşturulamadı - eksik environment variable\'lar.');
    }
} catch (error) {
    logger.error('❌ Supabase client oluşturulurken hata:', error.message);
    if (isProduction) {
        process.exit(1);
    }
}

// Test fonksiyonu
async function testSupabaseConnection() {
    if (!supabase) {
        logger.warn('⚠️  Supabase client yok, bağlantı testi yapılamıyor.');
        return;
    }
    
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
