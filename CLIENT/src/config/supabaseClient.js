import { createClient } from '@supabase/supabase-js';

// Supabase yapılandırması
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Environment variable kontrolleri
if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL environment variable tanımlı değil!');
    console.error('📝 Lütfen CLIENT/.env dosyasında VITE_SUPABASE_URL değişkenini tanımlayın.');
}

if (!supabaseAnonKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY environment variable tanımlı değil!');
    console.error('📝 Lütfen CLIENT/.env dosyasında VITE_SUPABASE_ANON_KEY değişkenini tanımlayın.');
}

// Supabase client oluştur (sadece değerler varsa)
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        console.log('✅ Supabase client oluşturuldu.');
    } catch (error) {
        console.error('❌ Supabase client oluşturulurken hata:', error);
    }
} else {
    console.warn('⚠️  Supabase client oluşturulamadı - eksik environment variable\'lar.');
    // Fallback: Geçerli bir client oluştur ama kullanmayı deneme
    // Bu sadece uygulamanın çökmesini önlemek için
    try {
        supabase = createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder');
    } catch (e) {
        console.error('Fallback Supabase client oluşturulamadı:', e);
    }
}

// Kullanıcı oturum yönetimi için yardımcı fonksiyonlar
export const auth = {
    // Mevcut kullanıcıyı al
    async getCurrentUser() {
        if (!supabase) {
            throw new Error('Supabase client başlatılmamış. Lütfen .env dosyasını kontrol edin.');
        }
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    // Oturum durumunu kontrol et
    async getSession() {
        if (!supabase) {
            throw new Error('Supabase client başlatılmamış. Lütfen .env dosyasını kontrol edin.');
        }
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    // Çıkış yap
    async signOut() {
        if (!supabase) {
            throw new Error('Supabase client başlatılmamış. Lütfen .env dosyasını kontrol edin.');
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Oturum değişikliklerini dinle
    onAuthStateChange(callback) {
        if (!supabase) {
            console.warn('Supabase client başlatılmamış.');
            return { data: { subscription: null }, error: new Error('Supabase client not initialized') };
        }
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Veritabanı işlemleri için yardımcı fonksiyonlar
export const db = {
    // Tüm kayıtları getir
    async getAll(table) {
        if (!supabase) {
            throw new Error('Supabase client başlatılmamış. Lütfen .env dosyasını kontrol edin.');
        }
        const { data, error } = await supabase
            .from(table)
            .select('*');

        if (error) throw error;
        return data;
    },

    // ID ile kayıt getir
    async getById(table, id) {
        if (!supabase) {
            throw new Error('Supabase client başlatılmamış. Lütfen .env dosyasını kontrol edin.');
        }
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Yeni kayıt ekle
    async insert(table, record) {
        if (!supabase) {
            throw new Error('Supabase client başlatılmamış. Lütfen .env dosyasını kontrol edin.');
        }
        const { data, error } = await supabase
            .from(table)
            .insert(record)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Kayıt güncelle
    async update(table, id, updates) {
        if (!supabase) {
            throw new Error('Supabase client başlatılmamış. Lütfen .env dosyasını kontrol edin.');
        }
        const { data, error } = await supabase
            .from(table)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Kayıt sil
    async delete(table, id) {
        if (!supabase) {
            throw new Error('Supabase client başlatılmamış. Lütfen .env dosyasını kontrol edin.');
        }
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

export default supabase;
