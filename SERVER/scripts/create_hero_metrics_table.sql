-- Hero tablosundaki metrikleri dinamik olarak saklamak için HeroMetrics tablosu
CREATE TABLE IF NOT EXISTS "HeroMetrics" (
    id SERIAL PRIMARY KEY,
    value VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Başlangıç verileri (tablo henüz boşsa 4 temel mimari metriği ekle)
INSERT INTO "HeroMetrics" (value, label, order_index)
SELECT '150+', 'Tamamlanan Prestij Projesi', 1
WHERE NOT EXISTS (SELECT 1 FROM "HeroMetrics");

INSERT INTO "HeroMetrics" (value, label, order_index)
SELECT '%100', 'Statik & Deprem Güvencesi', 2
WHERE (SELECT COUNT(*) FROM "HeroMetrics") = 1;

INSERT INTO "HeroMetrics" (value, label, order_index)
SELECT '15+', 'Yıllık Mimari Deneyim', 3
WHERE (SELECT COUNT(*) FROM "HeroMetrics") = 2;

INSERT INTO "HeroMetrics" (value, label, order_index)
SELECT 'A+', 'Enerji & Malzeme Kalitesi', 4
WHERE (SELECT COUNT(*) FROM "HeroMetrics") = 3;
