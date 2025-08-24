const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require('./dbConfig');

// Hero verilerini getir (herkes erişebilir)
router.get('/hero', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Hero');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Contact bilgilerini getir (herkes erişebilir)
router.get('/contact', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Contact');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Projeleri getir (herkes erişebilir)
router.get('/projects', async (req, res) => {
    try {
        const pool = await poolPromise;

        // Projeleri ve görselleri ayrı ayrı çekiyoruz ve sunucu tarafında birleştiriyoruz
        const projectsResult = await pool.request().query('SELECT * FROM Projects');
        const imagesResult = await pool.request().query('SELECT * FROM Images');
        const servicesResult = await pool.request().query('SELECT id, service, description, url FROM Services');

        const projectIdToImages = new Map();
        for (const img of imagesResult.recordset) {
            if (!projectIdToImages.has(img.projectid)) projectIdToImages.set(img.projectid, []);
            projectIdToImages.get(img.projectid).push(img.imageURL);
        }

        const serviceIdToService = new Map();
        for (const s of servicesResult.recordset) {
            serviceIdToService.set(s.id, s);
        }

        const combined = projectsResult.recordset.map(p => ({
            ...p,
            images: projectIdToImages.get(p.id) || [],
            service: serviceIdToService.get(p.service_id) || null
        }));

        res.status(200).json(combined);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Hizmetleri getir (herkes erişebilir)
router.get('/services', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, service, description, url FROM Services');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
