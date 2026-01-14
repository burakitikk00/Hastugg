const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');
const fs = require('fs-extra');
const path = require('path');

// Eski görselleri Supabase Storage'a migrate et
router.post('/migrate-images', verifyToken, async (_req, res) => {
    const client = await pool.connect();
    try {
        logger.log('🔄 Görsel migration başlatılıyor...');

        // 1. Veritabanındaki eski format URL'leri bul
        const projectsResult = await pool.query('SELECT id, url FROM "Projects" WHERE url LIKE \'/uploads/%\'');
        const imagesResult = await pool.query('SELECT id, projectid, "imageURL" FROM "Images" WHERE "imageURL" LIKE \'/uploads/%\'');
        const teamResult = await pool.query('SELECT id, url FROM "Team" WHERE url LIKE \'/uploads/%\'');

        const results = {
            projects: { found: projectsResult.rowCount, migrated: 0, errors: [] },
            images: { found: imagesResult.rowCount, migrated: 0, errors: [] },
            team: { found: teamResult.rowCount, migrated: 0, errors: [] }
        };

        // 2. Projects tablosundaki görselleri migrate et
        for (const project of projectsResult.rows) {
            try {
                const oldPath = project.url;
                const fileName = oldPath.replace('/uploads/', '');
                const localPath = path.join(__dirname, '../../uploads', fileName);

                // Dosya yerelde var mı kontrol et
                if (await fs.pathExists(localPath)) {
                    // Dosyayı oku
                    const fileBuffer = await fs.readFile(localPath);
                    const fileExt = path.extname(fileName);
                    const mimeType = fileExt === '.jpg' || fileExt === '.jpeg' ? 'image/jpeg' : 
                                   fileExt === '.png' ? 'image/png' : 
                                   fileExt === '.gif' ? 'image/gif' : 'image/jpeg';

                    // Supabase Storage'a yükle
                    const { supabase } = require('../supabaseClient');
                    const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'images';
                    const newFileName = `projects/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from(STORAGE_BUCKET)
                        .upload(newFileName, fileBuffer, {
                            contentType: mimeType,
                            upsert: false
                        });

                    if (uploadError) {
                        throw new Error(`Yükleme hatası: ${uploadError.message}`);
                    }

                    // Public URL al
                    const { data: urlData } = supabase.storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(newFileName);

                    if (!urlData?.publicUrl) {
                        throw new Error('Public URL alınamadı');
                    }

                    // Veritabanını güncelle
                    await client.query('UPDATE "Projects" SET url = $1 WHERE id = $2', [urlData.publicUrl, project.id]);
                    results.projects.migrated++;
                    logger.log(`✅ Project ${project.id} görseli migrate edildi: ${urlData.publicUrl}`);
                } else {
                    results.projects.errors.push(`Dosya bulunamadı: ${localPath}`);
                }
            } catch (error) {
                results.projects.errors.push(`Project ${project.id}: ${error.message}`);
                logger.error(`Project ${project.id} migration hatası:`, error);
            }
        }

        // 3. Images tablosundaki görselleri migrate et
        for (const image of imagesResult.rows) {
            try {
                const oldPath = image.imageURL;
                const fileName = oldPath.replace('/uploads/', '');
                const localPath = path.join(__dirname, '../../uploads', fileName);

                if (await fs.pathExists(localPath)) {
                    const fileBuffer = await fs.readFile(localPath);
                    const fileExt = path.extname(fileName);
                    const mimeType = fileExt === '.jpg' || fileExt === '.jpeg' ? 'image/jpeg' : 
                                   fileExt === '.png' ? 'image/png' : 
                                   fileExt === '.gif' ? 'image/gif' : 'image/jpeg';

                    const { supabase } = require('../supabaseClient');
                    const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'images';
                    const newFileName = `projects/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from(STORAGE_BUCKET)
                        .upload(newFileName, fileBuffer, {
                            contentType: mimeType,
                            upsert: false
                        });

                    if (uploadError) {
                        throw new Error(`Yükleme hatası: ${uploadError.message}`);
                    }

                    const { data: urlData } = supabase.storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(newFileName);

                    if (!urlData?.publicUrl) {
                        throw new Error('Public URL alınamadı');
                    }

                    await client.query('UPDATE "Images" SET "imageURL" = $1 WHERE id = $2', [urlData.publicUrl, image.id]);
                    results.images.migrated++;
                    logger.log(`✅ Image ${image.id} migrate edildi: ${urlData.publicUrl}`);
                } else {
                    results.images.errors.push(`Dosya bulunamadı: ${localPath}`);
                }
            } catch (error) {
                results.images.errors.push(`Image ${image.id}: ${error.message}`);
                logger.error(`Image ${image.id} migration hatası:`, error);
            }
        }

        // 4. Team tablosundaki görselleri migrate et
        for (const team of teamResult.rows) {
            try {
                const oldPath = team.url;
                const fileName = oldPath.replace('/uploads/', '');
                const localPath = path.join(__dirname, '../../uploads', fileName);

                if (await fs.pathExists(localPath)) {
                    const fileBuffer = await fs.readFile(localPath);
                    const fileExt = path.extname(fileName);
                    const mimeType = fileExt === '.jpg' || fileExt === '.jpeg' ? 'image/jpeg' : 
                                   fileExt === '.png' ? 'image/png' : 
                                   fileExt === '.gif' ? 'image/gif' : 'image/jpeg';

                    const { supabase } = require('../supabaseClient');
                    const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'images';
                    const newFileName = `team/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from(STORAGE_BUCKET)
                        .upload(newFileName, fileBuffer, {
                            contentType: mimeType,
                            upsert: false
                        });

                    if (uploadError) {
                        throw new Error(`Yükleme hatası: ${uploadError.message}`);
                    }

                    const { data: urlData } = supabase.storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(newFileName);

                    if (!urlData?.publicUrl) {
                        throw new Error('Public URL alınamadı');
                    }

                    await client.query('UPDATE "Team" SET url = $1 WHERE id = $2', [urlData.publicUrl, team.id]);
                    results.team.migrated++;
                    logger.log(`✅ Team ${team.id} görseli migrate edildi: ${urlData.publicUrl}`);
                } else {
                    results.team.errors.push(`Dosya bulunamadı: ${localPath}`);
                }
            } catch (error) {
                results.team.errors.push(`Team ${team.id}: ${error.message}`);
                logger.error(`Team ${team.id} migration hatası:`, error);
            }
        }

        res.json({
            success: true,
            message: 'Migration tamamlandı',
            results
        });

    } catch (error) {
        logger.error('Migration hatası:', error);
        res.status(500).json({
            success: false,
            error: 'Migration sırasında hata oluştu',
            details: error.message
        });
    } finally {
        client.release();
    }
});

module.exports = router;
