-- Google Analytics ayarları tablosu
CREATE TABLE analytics_settings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    measurement_id NVARCHAR(50) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Varsayılan değer ekle
INSERT INTO analytics_settings (measurement_id, is_active) 
VALUES ('G-XXXXXXXXXX', 0);
