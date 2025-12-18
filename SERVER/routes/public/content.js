const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');

// Hero verilerini getir (herkes erişebilir)
router.get('/hero', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Hero" ORDER BY id LIMIT 1');
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Hero verisi bulunamadı' });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// About verilerini getir (herkes erişebilir)
router.get('/about', async (req, res) => {
    try {
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
        logger.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Contact bilgilerini getir (herkes erişebilir)
router.get('/contact', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Contact"');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Projeleri getir (herkes erişebilir)
router.get('/projects', async (req, res) => {
    try {
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
        logger.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Hizmetleri getir (herkes erişebilir)
router.get('/services', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, service, description, url FROM "Services" ORDER BY id');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Team üyelerini getir (herkes erişebilir)
router.get('/team', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, namesurname, position, url, "LinkedIn" FROM "Team" ORDER BY id');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Analytics ayarlarını getir (public - frontend için)
router.get('/analytics-settings', async (req, res) => {
    try {
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
            res.json({ measurement_id: null, is_active: false });
        }
    } catch (error) {
        logger.error('Analytics ayarları getirme hatası:', error);
        res.json({ measurement_id: null, is_active: false });
    }
});

module.exports = router;
