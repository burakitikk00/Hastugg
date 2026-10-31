-- ==============================================================================
-- Hastugg Proje Detayları & Supabase Veri Mimarisi Tabloları
-- ==============================================================================

-- 1. "Projects" Tablosuna Mimari Künye & Konum Sütunları
ALTER TABLE "Projects" 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Karma Proje',
ADD COLUMN IF NOT EXISTS total_area VARCHAR(100),
ADD COLUMN IF NOT EXISTS delivery_date VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS client VARCHAR(255),
ADD COLUMN IF NOT EXISTS land_area VARCHAR(100),
ADD COLUMN IF NOT EXISTS project_year VARCHAR(100),
ADD COLUMN IF NOT EXISTS map_embed_url TEXT,
ADD COLUMN IF NOT EXISTS map_address TEXT;

-- 2. "ProjectHighlights" (Öne Çıkan Özellikler Tablosu)
CREATE TABLE IF NOT EXISTS "ProjectHighlights" (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES "Projects"(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'sun',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. "ProjectTransportation" (Konum ve Ulaşım Noktaları Tablosu)
CREATE TABLE IF NOT EXISTS "ProjectTransportation" (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES "Projects"(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'subway',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Performans İndeksleri
CREATE INDEX IF NOT EXISTS idx_highlights_project_id ON "ProjectHighlights"(project_id);
CREATE INDEX IF NOT EXISTS idx_transportation_project_id ON "ProjectTransportation"(project_id);
