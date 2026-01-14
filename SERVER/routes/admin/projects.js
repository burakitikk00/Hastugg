const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');
const { upload, uploadMultipleImagesToSupabase, deleteImage, deleteMultipleImages, cleanupUnusedImages } = require('../../upload');

// Proje ekleme
router.post('/add-project', verifyToken, upload.array('images', 10), async (req, res) => {
    const client = await pool.connect();
    try {
        const { title, description, status, service_ids } = req.body;
        const files = req.files || [];

        if (!title || !description || !status || !service_ids) {
            return res.status(400).json({ message: 'title, description, status ve service_ids zorunludur.' });
        }
        if (files.length === 0) {
            return res.status(400).json({ message: 'En az bir görsel yüklenmelidir.' });
        }

        let serviceIdsArray;
        try {
            serviceIdsArray = JSON.parse(service_ids);
            if (!Array.isArray(serviceIdsArray) || serviceIdsArray.length === 0) {
                return res.status(400).json({ message: 'En az bir geçerli service_id gerekli' });
            }
        } catch (err) {
            return res.status(400).json({ message: 'service_ids JSON formatında olmalıdır' });
        }

        await client.query('BEGIN');

        for (const sid of serviceIdsArray) {
            const check = await client.query('SELECT 1 FROM "Services" WHERE id = $1', [sid]);
            if (check.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Geçersiz service_id: ${sid}` });
            }
        }

        const projectResult = await client.query(
            'INSERT INTO "Projects" (title, description, status, service_ids) VALUES ($1, $2, $3, $4) RETURNING id',
            [title, description, status, JSON.stringify(serviceIdsArray)]
        );
        const projectId = projectResult.rows[0].id;

        // Görselleri Supabase Storage'a yükle (hata durumunda rollback yapılacak)
        let imageURLs = [];
        try {
            imageURLs = await uploadMultipleImagesToSupabase(files, 'projects');
            if (imageURLs.length === 0) {
                throw new Error('Görseller Supabase Storage\'a yüklenemedi');
            }
        } catch (uploadError) {
            await client.query('ROLLBACK');
            logger.error('Supabase Storage yükleme hatası:', uploadError);
            return res.status(500).json({ 
                message: 'Görseller yüklenirken hata oluştu', 
                error: uploadError.message 
            });
        }

        const firstImageURL = imageURLs[0] || null;

        // Veritabanına görsel URL'lerini kaydet
        try {
            for (const imageURL of imageURLs) {
                // URL'in tam Supabase URL'i olduğundan emin ol
                const cleanUrl = imageURL.trim();
                if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                    logger.error(`❌ Geçersiz URL formatı: ${cleanUrl}`);
                    throw new Error(`Geçersiz URL formatı: ${cleanUrl}`);
                }
                
                await client.query(
                    'INSERT INTO "Images" (projectid, "imageURL") VALUES ($1, $2)',
                    [projectId, cleanUrl]
                );
                logger.log(`✅ Görsel veritabanına kaydedildi: ${cleanUrl}`);
            }

            if (firstImageURL) {
                const cleanFirstUrl = firstImageURL.trim();
                await client.query('UPDATE "Projects" SET url = $1 WHERE id = $2', [cleanFirstUrl, projectId]);
                logger.log(`✅ Proje ana görseli güncellendi: ${cleanFirstUrl}`);
            }
        } catch (dbError) {
            // Veritabanı hatası durumunda Supabase Storage'dan görselleri sil
            await client.query('ROLLBACK');
            logger.error('Veritabanı kayıt hatası:', dbError);
            // Yüklenen görselleri temizle
            try {
                const { deleteMultipleImages } = require('../../upload');
                await deleteMultipleImages(imageURLs);
            } catch (cleanupError) {
                logger.error('Görsel temizleme hatası:', cleanupError);
            }
            return res.status(500).json({ 
                message: 'Görseller veritabanına kaydedilemedi', 
                error: dbError.message 
            });
        }

        await client.query('COMMIT');
        res.status(201).json({
            message: 'Proje ve görselleri başarıyla eklendi!',
            projectId,
            uploadedImages: imageURLs
        });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Proje ekleme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Proje bilgilerini güncelle
router.put('/projects/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, status, service_ids } = req.body;

    if (!title || !description || !status || !service_ids) {
        return res.status(400).json({ message: 'title, description, status ve service_ids zorunludur.' });
    }

    let serviceIdsArray;
    try {
        serviceIdsArray = JSON.parse(service_ids);
        if (!Array.isArray(serviceIdsArray) || serviceIdsArray.length === 0) {
            return res.status(400).json({ message: 'En az bir service_id gerekli' });
        }
    } catch (err) {
        return res.status(400).json({ message: 'service_ids JSON formatında olmalıdır' });
    }

    try {
        await pool.query(
            'UPDATE "Projects" SET title = $1, description = $2, status = $3, service_ids = $4 WHERE id = $5',
            [title, description, status, JSON.stringify(serviceIdsArray), id]
        );
        res.status(200).json({ message: 'Proje bilgileri güncellendi' });
    } catch (error) {
        logger.error('Proje güncelleme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Projeleri listele
router.get('/projects', verifyToken, async (_req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, title, description, url, status, COALESCE(service_ids, '[]') AS service_ids FROM \"Projects\" ORDER BY id DESC"
        );
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Projects list hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Proje detay
router.get('/projects/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const projectResult = await pool.query(
            "SELECT id, title, description, url, status, COALESCE(service_ids, '[]') AS service_ids FROM \"Projects\" WHERE id = $1",
            [id]
        );
        if (projectResult.rowCount === 0) {
            return res.status(404).json({ message: 'Proje bulunamadı' });
        }

        const imagesResult = await pool.query(
            'SELECT "imageURL" FROM "Images" WHERE projectid = $1 ORDER BY id',
            [id]
        );

        const project = projectResult.rows[0];
        project.images = imagesResult.rows.map(img => img.imageURL);
        res.status(200).json(project);
    } catch (error) {
        logger.error('Proje detay hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Proje sil
router.delete('/projects/:id', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');

        const images = await client.query('SELECT "imageURL" FROM "Images" WHERE projectid = $1', [id]);
        const imagePaths = images.rows.map(img => img.imageURL);
        if (imagePaths.length > 0) {
            await deleteMultipleImages(imagePaths);
        }

        await client.query('DELETE FROM "Images" WHERE projectid = $1', [id]);
        await client.query('DELETE FROM "Projects" WHERE id = $1', [id]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Proje ve görselleri silindi' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Proje silme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Projeye görsel ekle
router.post('/projects/:id/images', verifyToken, upload.array('images', 10), async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const files = req.files || [];
        if (files.length === 0) {
            return res.status(400).json({ message: 'En az bir görsel yüklenmelidir.' });
        }

        await client.query('BEGIN');
        
        // Görselleri Supabase Storage'a yükle (hata durumunda rollback yapılacak)
        let imageURLs = [];
        try {
            imageURLs = await uploadMultipleImagesToSupabase(files, 'projects');
            if (imageURLs.length === 0) {
                throw new Error('Görseller Supabase Storage\'a yüklenemedi');
            }
        } catch (uploadError) {
            await client.query('ROLLBACK');
            logger.error('Supabase Storage yükleme hatası:', uploadError);
            return res.status(500).json({ 
                message: 'Görseller yüklenirken hata oluştu', 
                error: uploadError.message 
            });
        }

        const firstImageURL = imageURLs[0] || null;

        // Veritabanına görsel URL'lerini kaydet
        try {
            for (const imageURL of imageURLs) {
                // URL'in tam Supabase URL'i olduğundan emin ol
                const cleanUrl = imageURL.trim();
                if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                    logger.error(`❌ Geçersiz URL formatı: ${cleanUrl}`);
                    throw new Error(`Geçersiz URL formatı: ${cleanUrl}`);
                }
                
                await client.query('INSERT INTO "Images" (projectid, "imageURL") VALUES ($1, $2)', [id, cleanUrl]);
                logger.log(`✅ Görsel veritabanına kaydedildi: ${cleanUrl}`);
            }

            const projectHasMain = await client.query('SELECT url FROM "Projects" WHERE id = $1', [id]);
            if (projectHasMain.rowCount > 0 && !projectHasMain.rows[0].url && firstImageURL) {
                const cleanFirstUrl = firstImageURL.trim();
                await client.query('UPDATE "Projects" SET url = $1 WHERE id = $2', [cleanFirstUrl, id]);
                logger.log(`✅ Proje ana görseli güncellendi: ${cleanFirstUrl}`);
            }
        } catch (dbError) {
            // Veritabanı hatası durumunda Supabase Storage'dan görselleri sil
            await client.query('ROLLBACK');
            logger.error('Veritabanı kayıt hatası:', dbError);
            // Yüklenen görselleri temizle
            try {
                const { deleteMultipleImages } = require('../../upload');
                await deleteMultipleImages(imageURLs);
            } catch (cleanupError) {
                logger.error('Görsel temizleme hatası:', cleanupError);
            }
            return res.status(500).json({ 
                message: 'Görseller veritabanına kaydedilemedi', 
                error: dbError.message 
            });
        }

        await client.query('COMMIT');
        res.status(201).json({
            message: 'Görseller başarıyla eklendi!',
            uploadedImages: imageURLs
        });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Görsel ekleme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Proje görseli sil
router.delete('/projects/:id/images', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { imageURL } = req.body;
        if (!imageURL) {
            return res.status(400).json({ message: 'imageURL gereklidir.' });
        }

        await client.query('BEGIN');
        const imageCheck = await client.query(
            'SELECT id FROM "Images" WHERE projectid = $1 AND "imageURL" = $2',
            [id, imageURL]
        );
        if (imageCheck.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Görsel bulunamadı.' });
        }

        await client.query('DELETE FROM "Images" WHERE projectid = $1 AND "imageURL" = $2', [id, imageURL]);
        await deleteImage(imageURL);

        const projectResult = await client.query('SELECT url FROM "Projects" WHERE id = $1', [id]);
        if (projectResult.rowCount > 0 && projectResult.rows[0].url === imageURL) {
            const remaining = await client.query(
                'SELECT "imageURL" FROM "Images" WHERE projectid = $1 ORDER BY id LIMIT 1',
                [id]
            );
            const newMain = remaining.rowCount > 0 ? remaining.rows[0].imageURL : null;
            await client.query('UPDATE "Projects" SET url = $1 WHERE id = $2', [newMain, id]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Görsel başarıyla silindi', deletedImage: imageURL });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Görsel silme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Ana görsel ayarla
router.put('/projects/:id/main-image', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { imageURL } = req.body;
        if (!imageURL) {
            return res.status(400).json({ message: 'imageURL gereklidir.' });
        }

        const check = await pool.query('SELECT id FROM "Images" WHERE projectid = $1 AND "imageURL" = $2', [id, imageURL]);
        if (check.rowCount === 0) {
            return res.status(404).json({ message: 'Görsel bu projeye ait değil.' });
        }

        await pool.query('UPDATE "Projects" SET url = $1 WHERE id = $2', [imageURL, id]);
        res.status(200).json({ message: 'Ana görsel ayarlandı', mainImage: imageURL });
    } catch (error) {
        logger.error('Ana görsel hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Tek görsel yükleme (genel) - Sadece Supabase Storage'a yükler, veritabanına kaydetmez
router.post('/upload-image', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Görsel yüklenmedi' });
        }
        const { uploadImageToSupabase } = require('../../upload');
        const imageURL = await uploadImageToSupabase(req.file, 'general');
        
        // URL'in tam Supabase URL'i olduğundan emin ol
        const cleanUrl = imageURL.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            logger.error(`❌ Geçersiz URL formatı: ${cleanUrl}`);
            return res.status(500).json({ 
                message: 'Geçersiz URL formatı', 
                error: 'Görsel URL\'si geçersiz format' 
            });
        }
        
        logger.log(`✅ Genel görsel Supabase Storage'a yüklendi: ${cleanUrl}`);
        res.status(200).json({ 
            message: 'Görsel Supabase Storage\'a yüklendi', 
            imageURL: cleanUrl,
            note: 'Bu görsel veritabanına kaydedilmedi. İlgili tabloya manuel olarak eklemeniz gerekiyor.'
        });
    } catch (error) {
        logger.error('Yükleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Tek görsel silme (genel)
router.delete('/delete-image', verifyToken, async (req, res) => {
    try {
        const { imageURL } = req.body;
        if (!imageURL) {
            return res.status(400).json({ message: 'imageURL gerekli' });
        }
        const deleted = await deleteImage(imageURL);
        if (deleted) {
            res.status(200).json({ message: 'Görsel silindi' });
        } else {
            res.status(404).json({ message: 'Görsel bulunamadı' });
        }
    } catch (error) {
        logger.error('Silme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Kullanılmayan görselleri temizle
router.post('/cleanup-images', verifyToken, async (_req, res) => {
    try {
        const images = await pool.query('SELECT "imageURL" FROM "Images"');
        const usedPaths = images.rows.map(img => img.imageURL);
        await cleanupUnusedImages(usedPaths);
        res.status(200).json({ message: 'Kullanılmayan görseller temizlendi' });
    } catch (error) {
        logger.error('Temizleme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
