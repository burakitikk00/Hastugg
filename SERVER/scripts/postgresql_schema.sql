-- PostgreSQL şeması - Hastugg
-- Çalıştırma: psql -h <host> -U <user> -d <database> -f postgresql_schema.sql

-- Uzantılar
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ Temel tablolar ============

CREATE TABLE IF NOT EXISTS "Admins" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Hero" (
    id SERIAL PRIMARY KEY,
    "mainTitle" VARCHAR(255) NOT NULL,
    subheading TEXT
);

CREATE TABLE IF NOT EXISTS "AboutUs" (
    id SERIAL PRIMARY KEY,
    "mainTitle" VARCHAR(255),
    "mainDescription" TEXT
);

CREATE TABLE IF NOT EXISTS "FeatureCards" (
    id SERIAL PRIMARY KEY,
    feature VARCHAR(50),
    description TEXT,
    icon VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS "Services" (
    id SERIAL PRIMARY KEY,
    service VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT
);

CREATE TABLE IF NOT EXISTS "Projects" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'In Progress',
    service_ids JSONB DEFAULT '[]'::jsonb,
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Images" (
    id SERIAL PRIMARY KEY,
    projectid INTEGER REFERENCES "Projects"(id) ON DELETE CASCADE,
    "imageURL" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Team" (
    id SERIAL PRIMARY KEY,
    namesurname VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    url TEXT,
    "LinkedIn" VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "Contact" (
    id SERIAL PRIMARY KEY,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    facebook VARCHAR(255),
    twitter VARCHAR(255),
    instagram VARCHAR(255),
    linkedin VARCHAR(255),
    "mapEmbedUrl" TEXT
);

CREATE TABLE IF NOT EXISTS "ContactMessages" (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "EmailSettings" (
    id SERIAL PRIMARY KEY,
    email_user VARCHAR(255) NOT NULL,
    email_pass TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_settings (
    id SERIAL PRIMARY KEY,
    measurement_id VARCHAR(50),
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ İndeksler ============
CREATE INDEX IF NOT EXISTS idx_images_projectid ON "Images"(projectid);
CREATE INDEX IF NOT EXISTS idx_contactmessages_created ON "ContactMessages"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contactmessages_read ON "ContactMessages"(is_read);
CREATE INDEX IF NOT EXISTS idx_projects_status ON "Projects"(status);

-- ============ Varsayılan admin (isteğe bağlı) ============
-- INSERT INTO "Admins" (username, password) VALUES ('admin', '<bcrypt_hash>');
