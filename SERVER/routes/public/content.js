const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');

// Hero verilerini getir (herkes erişebilir)
router.get('/hero', async (req, res) => {
    try {
        if (!pool) {
            logger.error('Veritabanı bağlantısı yok');
            return res.status(503).json({ error: 'Veritabanı bağlantısı yok' });
        }
        const result = await pool.query('SELECT * FROM "Hero" ORDER BY id LIMIT 1');
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Hero verisi bulunamadı' });
        }
    } catch (error) {
        logger.error('Hero getirme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// About verilerini getir (herkes erişebilir)
router.get('/about', async (req, res) => {
    try {
        if (!pool) {
            logger.error('Veritabanı bağlantısı yok');
            return res.status(503).json({ error: 'Veritabanı bağlantısı yok' });
        }
        const aboutResult = await pool.query('SELECT * FROM "AboutUs" ORDER BY id LIMIT 1');
        if (aboutResult.rows.length === 0) {
            return res.status(404).json({ message: 'About verisi bulunamadı' });
        }

        const aboutData = aboutResult.rows[0];
        const featuresResult = await pool.query('SELECT * FROM "FeatureCards" ORDER BY id');

        res.status(200).json({
            id: aboutData.id,
            mainTitle: aboutData.mainTitle ?? aboutData.maintitle,
            mainDescription: aboutData.mainDescription ?? aboutData.maindescription,
            features: featuresResult.rows
        });
    } catch (error) {
        logger.error('About getirme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// Contact bilgilerini getir (herkes erişebilir)
router.get('/contact', async (req, res) => {
    try {
        if (!pool) {
            logger.error('Veritabanı bağlantısı yok');
            return res.status(503).json({ error: 'Veritabanı bağlantısı yok' });
        }
        const result = await pool.query('SELECT * FROM "Contact"');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Contact getirme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// Projeleri getir (herkes erişebilir)
router.get('/projects', async (req, res) => {
    try {
        if (!pool) {
            logger.error('Veritabanı bağlantısı yok');
            return res.status(503).json({ error: 'Veritabanı bağlantısı yok' });
        }
        const projectsResult = await pool.query('SELECT * FROM "Projects" ORDER BY id DESC');
        const imagesResult = await pool.query('SELECT * FROM "Images"');
        const servicesResult = await pool.query('SELECT id, service, description, url FROM "Services"');

        const projectIdToImages = new Map();
        for (const img of imagesResult.rows) {
            if (!projectIdToImages.has(img.projectid)) projectIdToImages.set(img.projectid, []);
            projectIdToImages.get(img.projectid).push(img.imageURL ?? img.imageurl);
        }

        const serviceIdToService = new Map();
        for (const s of servicesResult.rows) {
            serviceIdToService.set(s.id, s);
        }

        const combined = projectsResult.rows.map(p => {
            let serviceIds = [];
            try {
                if (Array.isArray(p.service_ids)) serviceIds = p.service_ids;
                else if (p.service_ids) serviceIds = JSON.parse(p.service_ids);
            } catch (_) { serviceIds = []; }

            const services = serviceIds
                .map(id => serviceIdToService.get(Number(id)))
                .filter(Boolean);

            return {
                ...p,
                images: projectIdToImages.get(p.id) || [],
                services,
                service_ids: serviceIds
            };
        });

        res.status(200).json(combined);
    } catch (error) {
        logger.error('Projects getirme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// Hizmetleri getir (herkes erişebilir)
router.get('/services', async (req, res) => {
    try {
        if (!pool) {
            logger.error('Veritabanı bağlantısı yok');
            return res.status(503).json({ error: 'Veritabanı bağlantısı yok' });
        }
        const result = await pool.query('SELECT id, service, description, url FROM "Services" ORDER BY id');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Services getirme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// Team üyelerini getir (herkes erişebilir)
router.get('/team', async (req, res) => {
    try {
        if (!pool) {
            logger.error('Veritabanı bağlantısı yok');
            return res.status(503).json({ error: 'Veritabanı bağlantısı yok' });
        }
        const result = await pool.query('SELECT id, namesurname, position, url, "LinkedIn" FROM "Team" ORDER BY id');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Team getirme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// Analytics ayarlarını getir (public - frontend için)
router.get('/analytics-settings', async (req, res) => {
    try {
        // Önce tablonun var olup olmadığını kontrol et
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'analytics_settings'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            // Tablo yok, sessizce fallback döndür
            logger.warn('Analytics settings tablosu bulunamadı. Tabloyu oluşturmak için SQL script\'ini çalıştırın.');
            return res.json({ measurement_id: null, is_active: false });
        }

        // Tablo varsa sorguyu çalıştır
        const result = await pool.query(`
            SELECT measurement_id, is_active 
            FROM analytics_settings 
            WHERE is_active = true
            ORDER BY created_at DESC
            LIMIT 1
        `);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            // Tablo var ama aktif kayıt yok - bu normal
            res.json({ measurement_id: null, is_active: false });
        }
    } catch (error) {
        // Beklenmeyen hatalar için logla ama yine de fallback döndür
        logger.error('Analytics ayarları getirme hatası:', error);
        res.json({ measurement_id: null, is_active: false });
    }
});

module.exports = router;
