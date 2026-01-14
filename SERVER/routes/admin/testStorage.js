const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { supabase } = require('../supabaseClient');
const verifyToken = require('../middleware/authMiddleware');

// Supabase Storage test endpoint (token gerektirmez - sadece test için)
router.get('/test-storage', async (_req, res) => {
    try {
        const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'images';
        
        // 1. Supabase client kontrolü
        if (!supabase) {
            return res.status(500).json({
                success: false,
                error: 'Supabase client başlatılmamış',
                details: 'SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY environment variable\'larını kontrol edin.'
            });
        }

        // 2. Bucket'ın var olup olmadığını kontrol et
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            logger.error('Bucket listesi alınamadı:', listError);
            return res.status(500).json({
                success: false,
                error: 'Bucket listesi alınamadı',
                details: listError.message,
                code: listError.statusCode
            });
        }

        const bucketExists = buckets.some(b => b.name === STORAGE_BUCKET);
        
        if (!bucketExists) {
            return res.status(404).json({
                success: false,
                error: `Bucket '${STORAGE_BUCKET}' bulunamadı`,
                availableBuckets: buckets.map(b => ({ name: b.name, public: b.public })),
                message: `Lütfen Supabase Dashboard'dan '${STORAGE_BUCKET}' adında bir bucket oluşturun ve Public yapın.`
            });
        }

        // 3. Bucket'ın public olup olmadığını kontrol et
        const bucket = buckets.find(b => b.name === STORAGE_BUCKET);
        
        if (!bucket.public) {
            return res.status(403).json({
                success: false,
                error: `Bucket '${STORAGE_BUCKET}' public değil`,
                message: 'Bucket\'ı public yapmak için Supabase Dashboard > Storage > Buckets bölümünden ayarları değiştirin.'
            });
        }

        // 4. Bucket'a dosya listeleme testi
        const { data: files, error: listFilesError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list('', { limit: 10 });

        if (listFilesError) {
            logger.error('Dosya listesi alınamadı:', listFilesError);
            return res.status(500).json({
                success: false,
                error: 'Dosya listesi alınamadı',
                details: listFilesError.message,
                bucketInfo: {
                    name: bucket.name,
                    public: bucket.public,
                    created_at: bucket.created_at
                }
            });
        }

        // 5. Test dosyası yükleme (küçük bir test görseli)
        const testFileName = `test-${Date.now()}.txt`;
        const testContent = Buffer.from('Test file for Supabase Storage connection');
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(testFileName, testContent, {
                contentType: 'text/plain',
                upsert: false
            });

        if (uploadError) {
            logger.error('Test dosyası yüklenemedi:', uploadError);
            return res.status(500).json({
                success: false,
                error: 'Test dosyası yüklenemedi',
                details: uploadError.message,
                code: uploadError.statusCode,
                bucketInfo: {
                    name: bucket.name,
                    public: bucket.public
                }
            });
        }

        // 6. Public URL al
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(testFileName);

        // 7. Test dosyasını sil
        const { error: deleteError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([testFileName]);

        if (deleteError) {
            logger.warn('Test dosyası silinemedi:', deleteError);
        }

        // Başarılı test sonucu
        res.json({
            success: true,
            message: 'Supabase Storage bağlantısı başarılı!',
            bucket: {
                name: bucket.name,
                public: bucket.public,
                created_at: bucket.created_at
            },
            testResults: {
                upload: '✅ Başarılı',
                publicUrl: urlData?.publicUrl || 'URL alınamadı',
                delete: deleteError ? '⚠️ Silinemedi' : '✅ Başarılı'
            },
            fileCount: files?.length || 0,
            environment: {
                bucketName: STORAGE_BUCKET,
                supabaseUrl: process.env.SUPABASE_URL ? '✅ Tanımlı' : '❌ Tanımlı değil',
                serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Tanımlı' : '❌ Tanımlı değil'
            }
        });

    } catch (error) {
        logger.error('Storage test hatası:', error);
        res.status(500).json({
            success: false,
            error: 'Storage testi sırasında hata oluştu',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
