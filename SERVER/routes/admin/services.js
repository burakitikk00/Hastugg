const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');

// Yardımcı: JSON parse / format fonksiyonu
const safeJson = (val, defaultVal = []) => {
    if (!val) return defaultVal;
    if (typeof val === 'object') return val;
    try {
        return JSON.parse(val);
    } catch {
        return defaultVal;
    }
};

// 1. Tüm Services verilerini getir (Admin)
router.get('/services', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM "Services" ORDER BY display_order ASC, id ASC'
        );
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Services getirme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// 2. Tek bir hizmeti getir (Admin)
router.get('/services/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM "Services" WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Hizmet bulunamadı' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        logger.error('Service getirme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// 3. Yeni bir hizmet ekle (veya toplu kaydetme uyumluluğu)
router.post('/services', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        // Durum A: Toplu services array'i gelmişse (eski arayüz uyumluluğu - ID KORUMALI GÜVENLİ UPSERT)
        if (req.body.services && Array.isArray(req.body.services)) {
            const { services } = req.body;
            await client.query('BEGIN');

            for (const item of services) {
                if (item.id && Number.isInteger(Number(item.id))) {
                    // Mevcut hizmeti güncelle
                    await client.query(
                        `UPDATE "Services" SET
                            service = $1,
                            description = $2,
                            url = $3,
                            category = COALESCE($4, category),
                            short_description = COALESCE($5, short_description),
                            detailed_description = COALESCE($6, detailed_description),
                            icon = COALESCE($7, icon),
                            stamp = COALESCE($8, stamp),
                            scope_tags = COALESCE($9, scope_tags),
                            deliverables = COALESCE($10, deliverables),
                            process_steps = COALESCE($11, process_steps),
                            features = COALESCE($12, features),
                            faqs = COALESCE($13, faqs),
                            gallery_images = COALESCE($14, gallery_images),
                            display_order = COALESCE($15, display_order),
                            is_active = COALESCE($16, is_active)
                        WHERE id = $17`,
                        [
                            item.service,
                            item.description || null,
                            item.url || null,
                            item.category || null,
                            item.short_description || null,
                            item.detailed_description || null,
                            item.icon || 'compass',
                            item.stamp || 'A+ MİMARİ STANDART',
                            JSON.stringify(safeJson(item.scope_tags, [])),
                            JSON.stringify(safeJson(item.deliverables, [])),
                            JSON.stringify(safeJson(item.process_steps, [])),
                            JSON.stringify(safeJson(item.features, [])),
                            JSON.stringify(safeJson(item.faqs, [])),
                            JSON.stringify(safeJson(item.gallery_images, [])),
                            item.display_order ?? 0,
                            item.is_active ?? true,
                            item.id
                        ]
                    );
                } else {
                    // Yeni hizmet ekle
                    await client.query(
                        `INSERT INTO "Services" 
                        (service, description, url, category, short_description, detailed_description, icon, stamp, scope_tags, deliverables, process_steps, features, faqs, gallery_images, display_order, is_active)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                        [
                            item.service,
                            item.description || null,
                            item.url || null,
                            item.category || 'Mimarlık & Mühendislik',
                            item.short_description || item.description || null,
                            item.detailed_description || item.description || null,
                            item.icon || 'compass',
                            item.stamp || 'A+ MİMARİ STANDART',
                            JSON.stringify(safeJson(item.scope_tags, [])),
                            JSON.stringify(safeJson(item.deliverables, [])),
                            JSON.stringify(safeJson(item.process_steps, [])),
                            JSON.stringify(safeJson(item.features, [])),
                            JSON.stringify(safeJson(item.faqs, [])),
                            JSON.stringify(safeJson(item.gallery_images, [])),
                            item.display_order ?? 0,
                            item.is_active ?? true
                        ]
                    );
                }
            }

            await client.query('COMMIT');
            return res.status(200).json({ message: 'Hizmetler başarıyla kaydedildi' });
        }

        // Durum B: Tek bir hizmet nesnesi ekleme (Yeni modern AdminServiceForm)
        const {
            service,
            description,
            url,
            category,
            short_description,
            detailed_description,
            icon,
            stamp,
            scope_tags,
            deliverables,
            process_steps,
            features,
            faqs,
            gallery_images,
            display_order,
            is_active
        } = req.body;

        if (!service) {
            return res.status(400).json({ message: 'Hizmet başlığı (service) zorunludur.' });
        }

        const insertResult = await pool.query(
            `INSERT INTO "Services" 
            (service, description, url, category, short_description, detailed_description, icon, stamp, scope_tags, deliverables, process_steps, features, faqs, gallery_images, display_order, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *`,
            [
                service,
                description || short_description || null,
                url || null,
                category || 'Mimarlık & Mühendislik',
                short_description || description || null,
                detailed_description || description || null,
                icon || 'compass',
                stamp || 'A+ MİMARİ STANDART',
                JSON.stringify(safeJson(scope_tags, [])),
                JSON.stringify(safeJson(deliverables, [])),
                JSON.stringify(safeJson(process_steps, [])),
                JSON.stringify(safeJson(features, [])),
                JSON.stringify(safeJson(faqs, [])),
                JSON.stringify(safeJson(gallery_images, [])),
                display_order ?? 0,
                is_active ?? true
            ]
        );

        res.status(201).json({
            message: 'Yeni hizmet başarıyla oluşturuldu',
            service: insertResult.rows[0]
        });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        logger.error('Services kaydetme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    } finally {
        client.release();
    }
});

// 4. Tek bir hizmeti güncelle (Admin PUT)
router.put('/services/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            service,
            description,
            url,
            category,
            short_description,
            detailed_description,
            icon,
            stamp,
            scope_tags,
            deliverables,
            process_steps,
            features,
            faqs,
            gallery_images,
            display_order,
            is_active
        } = req.body;

        if (!service) {
            return res.status(400).json({ message: 'Hizmet başlığı (service) zorunludur.' });
        }

        const updateResult = await pool.query(
            `UPDATE "Services" SET
                service = $1,
                description = $2,
                url = $3,
                category = $4,
                short_description = $5,
                detailed_description = $6,
                icon = $7,
                stamp = $8,
                scope_tags = $9,
                deliverables = $10,
                process_steps = $11,
                features = $12,
                faqs = $13,
                gallery_images = $14,
                display_order = $15,
                is_active = $16
            WHERE id = $17
            RETURNING *`,
            [
                service,
                description || short_description || null,
                url || null,
                category || 'Mimarlık & Mühendislik',
                short_description || description || null,
                detailed_description || description || null,
                icon || 'compass',
                stamp || 'A+ MİMARİ STANDART',
                JSON.stringify(safeJson(scope_tags, [])),
                JSON.stringify(safeJson(deliverables, [])),
                JSON.stringify(safeJson(process_steps, [])),
                JSON.stringify(safeJson(features, [])),
                JSON.stringify(safeJson(faqs, [])),
                JSON.stringify(safeJson(gallery_images, [])),
                display_order ?? 0,
                is_active ?? true,
                id
            ]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ message: 'Güncellenecek hizmet bulunamadı.' });
        }

        res.status(200).json({
            message: 'Hizmet başarıyla güncellendi',
            service: updateResult.rows[0]
        });
    } catch (error) {
        logger.error('Service güncelleme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// 5. Hizmet sil (Admin DELETE - Bağlı proje kontrolü ile)
router.delete('/services/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const force = req.query.force === 'true';

        // Bu hizmete bağlı proje var mı kontrol et
        const projectsCheck = await pool.query('SELECT id, title, service_ids FROM "Projects"');
        const connectedProjects = projectsCheck.rows.filter(p => {
            const sids = safeJson(p.service_ids, []);
            return Array.isArray(sids) && sids.map(Number).includes(Number(id));
        });

        if (connectedProjects.length > 0 && !force) {
            return res.status(400).json({
                message: `Bu hizmet "${connectedProjects.map(p => p.title).join(', ')}" projesine / projelerine bağlıdır. Silmek için projelerden bu hizmeti çıkarabilir veya zorla silme parametresini kullanabilirsiniz.`,
                connectedProjects: connectedProjects.map(p => ({ id: p.id, title: p.title })),
                canForceDelete: true
            });
        }

        const deleteResult = await pool.query(
            'DELETE FROM "Services" WHERE id = $1 RETURNING id, service',
            [id]
        );

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ message: 'Silinecek hizmet bulunamadı' });
        }

        res.status(200).json({
            message: `"${deleteResult.rows[0].service}" hizmeti başarıyla silindi.`
        });
    } catch (error) {
        logger.error('Service silme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

module.exports = router;
