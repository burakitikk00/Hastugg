-- EmailSettings tablosu oluştur (basitleştirilmiş)
CREATE TABLE EmailSettings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email_user NVARCHAR(255) NOT NULL,
    email_pass NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Varsayılan email ayarları ekle
INSERT INTO EmailSettings (email_user, email_pass)
VALUES (
    'burdburd84@gmail.com',
    'xbfh fnae soxq ndxp'
);

