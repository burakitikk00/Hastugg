import { createClient } from '@supabase/supabase-js';

// Supabase yapılandırması
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase client oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Kullanıcı oturum yönetimi için yardımcı fonksiyonlar
export const auth = {
    // Mevcut kullanıcıyı al
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    // Oturum durumunu kontrol et
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    // Çıkış yap
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Oturum değişikliklerini dinle
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Veritabanı işlemleri için yardımcı fonksiyonlar
export const db = {
    // Tüm kayıtları getir
    async getAll(table) {
        const { data, error } = await supabase
            .from(table)
            .select('*');

        if (error) throw error;
        return data;
    },

    // ID ile kayıt getir
    async getById(table, id) {
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
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

export default supabase;
