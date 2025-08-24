-- Hero tablosunu oluştur
CREATE TABLE Hero (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    subtitle NVARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Varsayılan verileri ekle
INSERT INTO Hero (title, subtitle) VALUES 
('Siz İsteyin, Biz İnşa Edelim', 'Profesyonel ekibimizle isteğinizi birebir yerine getiriyoruz. Hemen teklif alabilirsiniz.');

-- Tabloyu kontrol et
SELECT * FROM Hero;
