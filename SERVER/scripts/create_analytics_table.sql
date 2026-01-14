-- Analytics Settings tablosunu oluştur
-- Eğer tablo zaten varsa hata vermez (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS analytics_settings (
    id SERIAL PRIMARY KEY,
    measurement_id VARCHAR(50),
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tablo oluşturuldu mesajı
DO $$
BEGIN
    RAISE NOTICE 'Analytics settings tablosu başarıyla oluşturuldu veya zaten mevcut.';
END $$;
