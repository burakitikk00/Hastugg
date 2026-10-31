const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');
const { upload, uploadImageToSupabase, deleteImage } = require('../../upload');

// Team listele
router.get('/team', verifyToken, async (_req, res) => {
    try {
        const tableCheck = await pool.query(
            `SELECT table_name FROM information_schema.tables WHERE table_name = 'Team'`
        );
        if (tableCheck.rowCount === 0) {
            return res.status(404).json({ message: 'Team tablosu bulunamadı. Lütfen tabloyu oluşturun.' });
        }

        const result = await pool.query('SELECT id, namesurname, position, url, "LinkedIn" FROM "Team" ORDER BY id');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Team verileri getirme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Team üyesi ekle
router.post('/team', verifyToken, upload.single('image'), async (req, res) => {
    const client = await pool.connect();
    try {
        const { namesurname, position, LinkedIn } = req.body;
        if (!namesurname || !position) {
            return res.status(400).json({ message: 'namesurname ve position zorunludur.' });
        }

        await client.query('BEGIN');
        let imageURL = null;
        
        // Görsel varsa Supabase Storage'a yükle
        if (req.file) {
            try {
                imageURL = await uploadImageToSupabase(req.file, 'team');
                logger.log(`✅ Team görseli Supabase Storage'a yüklendi: ${imageURL}`);
            } catch (uploadError) {
                await client.query('ROLLBACK');
                logger.error('Team görsel yükleme hatası:', uploadError);
                return res.status(500).json({ 
                    message: 'Görsel yüklenirken hata oluştu', 
                    error: uploadError.message 
                });
            }
        }
        
        // Veritabanına kaydet
        try {
            // URL'in tam Supabase URL'i olduğundan emin ol
            const cleanImageURL = imageURL ? imageURL.trim() : null;
            if (cleanImageURL && !cleanImageURL.startsWith('http://') && !cleanImageURL.startsWith('https://')) {
                logger.error(`❌ Geçersiz URL formatı: ${cleanImageURL}`);
                throw new Error(`Geçersiz URL formatı: ${cleanImageURL}`);
            }
            
            await client.query(
                'INSERT INTO "Team" (namesurname, position, url, "LinkedIn") VALUES ($1, $2, $3, $4)',
                [namesurname, position, cleanImageURL, LinkedIn || null]
            );
            logger.log(`✅ Team üyesi veritabanına kaydedildi: ${namesurname}`);
            if (cleanImageURL) {
                logger.log(`✅ Team görsel URL'i: ${cleanImageURL}`);
            }
        } catch (dbError) {
            // Veritabanı hatası durumunda Supabase Storage'dan görseli sil
            await client.query('ROLLBACK');
            logger.error('Team veritabanı kayıt hatası:', dbError);
            if (imageURL) {
                try {
                    const { deleteImage } = require('../../upload');
                    await deleteImage(imageURL);
                } catch (cleanupError) {
                    logger.error('Team görsel temizleme hatası:', cleanupError);
                }
            }
            return res.status(500).json({ 
                message: 'Team üyesi veritabanına kaydedilemedi', 
                error: dbError.message 
            });
        }
        
        await client.query('COMMIT');

        res.status(201).json({ message: 'Team üyesi eklendi', imageURL });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Team üyesi ekleme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Team üyesi güncelle
router.put('/team/:id', verifyToken, upload.single('image'), async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { namesurname, position, LinkedIn } = req.body;
        if (!namesurname || !position) {
            return res.status(400).json({ message: 'namesurname ve position zorunludur.' });
        }

        await client.query('BEGIN');
        const current = await client.query('SELECT url FROM "Team" WHERE id = $1', [id]);
        if (current.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Team üyesi bulunamadı' });
        }

        let imageURL = current.rows[0].url;
        let oldImageURL = imageURL;
        
        // Yeni görsel varsa Supabase Storage'a yükle
        if (req.file) {
            try {
                // Eski görseli sil
                if (oldImageURL) {
                    await deleteImage(oldImageURL);
                    logger.log(`🗑️ Eski team görseli silindi: ${oldImageURL}`);
                }
                // Yeni görseli yükle
                imageURL = await uploadImageToSupabase(req.file, 'team');
                logger.log(`✅ Yeni team görseli Supabase Storage'a yüklendi: ${imageURL}`);
            } catch (uploadError) {
                await client.query('ROLLBACK');
                logger.error('Team görsel güncelleme hatası:', uploadError);
                return res.status(500).json({ 
                    message: 'Görsel yüklenirken hata oluştu', 
                    error: uploadError.message 
                });
            }
        } else if (req.body.removeImage === 'true' || req.body.removeImage === true) {
            // Kullanıcı görseli kaldırdıysa eski görseli sil
            if (oldImageURL) {
                try {
                    await deleteImage(oldImageURL);
                    logger.log(`🗑️ Team görseli kaldırıldı ve silindi: ${oldImageURL}`);
                } catch (delError) {
                    logger.warn('Team görsel silme uyarısı:', delError);
                }
            }
            imageURL = null;
        }

        // Veritabanını güncelle
        try {
            // URL'in tam Supabase URL'i olduğundan emin ol
            const cleanImageURL = imageURL ? imageURL.trim() : null;
            if (cleanImageURL && !cleanImageURL.startsWith('http://') && !cleanImageURL.startsWith('https://')) {
                logger.error(`❌ Geçersiz URL formatı: ${cleanImageURL}`);
                throw new Error(`Geçersiz URL formatı: ${cleanImageURL}`);
            }
            
            await client.query(
                'UPDATE "Team" SET namesurname = $1, position = $2, url = $3, "LinkedIn" = $4 WHERE id = $5',
                [namesurname, position, cleanImageURL, LinkedIn || null, id]
            );
            logger.log(`✅ Team üyesi veritabanında güncellendi: ${namesurname}`);
            if (cleanImageURL) {
                logger.log(`✅ Team görsel URL'i güncellendi: ${cleanImageURL}`);
            }
        } catch (dbError) {
            // Veritabanı hatası durumunda yeni görseli sil, eski görseli geri yükle
            await client.query('ROLLBACK');
            logger.error('Team veritabanı güncelleme hatası:', dbError);
            if (req.file && imageURL && imageURL !== oldImageURL) {
                try {
                    const { deleteImage } = require('../../upload');
                    await deleteImage(imageURL);
                } catch (cleanupError) {
                    logger.error('Team görsel temizleme hatası:', cleanupError);
                }
            }
            return res.status(500).json({ 
                message: 'Team üyesi güncellenemedi', 
                error: dbError.message 
            });
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Team üyesi güncellendi', imageURL });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Team güncelleme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Team üyesi sil
router.delete('/team/:id', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');
        const current = await client.query('SELECT url FROM "Team" WHERE id = $1', [id]);
        if (current.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Team üyesi bulunamadı' });
        }

        const imageURL = current.rows[0].url;
        if (imageURL) await deleteImage(imageURL);

        await client.query('DELETE FROM "Team" WHERE id = $1', [id]);
        await client.query('COMMIT');
        res.status(200).json({ message: 'Team üyesi silindi' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Team silme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

// Team üyesi resmi sil
router.delete('/team/:id/image', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');
        const current = await client.query('SELECT url FROM "Team" WHERE id = $1', [id]);
        if (current.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Team üyesi bulunamadı' });
        }

        const imageURL = current.rows[0].url;
        if (imageURL) {
            await deleteImage(imageURL);
            await client.query('UPDATE "Team" SET url = NULL WHERE id = $1', [id]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Team üyesi resmi silindi' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Team resmi silme hatası:', error);
        res.status(500).send('Sunucu hatası');
    } finally {
        client.release();
    }
});

module.exports = router;
