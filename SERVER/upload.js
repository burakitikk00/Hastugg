const multer = require('multer');
const path = require('path');
const logger = require('./utils/logger');
const { supabase } = require('./routes/supabaseClient');

// Supabase Storage bucket adı
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'images';

// 1. Multer memory storage - dosyaları bellekte tut, Supabase'e yükle
const storage = multer.memoryStorage();

// 2. Dosya filtreleme
const fileFilter = (req, file, cb) => {
    // Sadece resim dosyalarını kabul et
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları kabul edilir!'), false);
    }
};

// 3. Yapılandırmayı kullanarak multer'ı oluştur
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
        files: 10 // Maksimum 10 dosya
    }
});

// 4. Supabase Storage'a görsel yükleme
const uploadImageToSupabase = async (file, folder = '') => {
    try {
        if (!supabase) {
            throw new Error('Supabase client başlatılmamış');
        }

        // Benzersiz dosya adı oluştur
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExt = path.extname(file.originalname);
        const fileName = `${folder ? folder + '/' : ''}${file.fieldname || 'image'}-${uniqueSuffix}${fileExt}`;

        // Supabase Storage'a yükle
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            logger.error('Supabase Storage yükleme hatası:', error);
            throw error;
        }

        // Public URL al
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fileName);

        if (!urlData?.publicUrl) {
            throw new Error('Public URL alınamadı');
        }

        logger.log(`✅ Görsel Supabase Storage'a yüklendi: ${fileName}`);
        return urlData.publicUrl;
    } catch (error) {
        logger.error('Görsel yüklenirken hata:', error);
        throw error;
    }
};

// 5. Çoklu görsel yükleme
const uploadMultipleImagesToSupabase = async (files, folder = '') => {
    try {
        const uploadPromises = files.map(file => uploadImageToSupabase(file, folder));
        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        logger.error('Çoklu görsel yüklenirken hata:', error);
        throw error;
    }
};

// 6. Supabase Storage'dan görsel silme
const deleteImage = async (imageURL) => {
    try {
        if (!supabase) {
            logger.warn('Supabase client yok, görsel silinemedi');
            return false;
        }

        // URL'den dosya yolunu çıkar
        // Örnek: https://xxx.supabase.co/storage/v1/object/public/images/project-image-123.jpg
        // veya: /uploads/image-123.jpg (eski format - geriye dönük uyumluluk)
        
        let filePath = imageURL;
        
        // Eğer tam URL ise, path'i çıkar
        if (imageURL.includes('/storage/v1/object/public/')) {
            const parts = imageURL.split('/storage/v1/object/public/');
            if (parts.length > 1) {
                const pathAfterPublic = parts[1];
                // Bucket adını ve dosya yolunu ayır
                const pathParts = pathAfterPublic.split('/');
                if (pathParts.length > 1) {
                    // İlk kısım bucket adı, geri kalanı dosya yolu
                    filePath = pathParts.slice(1).join('/');
                } else {
                    // Sadece bucket adı varsa, boş string
                    filePath = '';
                }
            }
        } else if (imageURL.startsWith('/uploads/')) {
            // Eski format - geriye dönük uyumluluk için yerel dosyayı silmeyi dene
            logger.warn(`Eski format URL tespit edildi: ${imageURL}. Supabase Storage'da silme yapılamadı.`);
            return false;
        } else {
            // Sadece dosya adı veya path (zaten Supabase Storage path formatında)
            filePath = imageURL;
        }

        // Supabase Storage'dan sil
        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (error) {
            logger.error('Supabase Storage silme hatası:', error);
            return false;
        }

        logger.log(`✅ Görsel Supabase Storage'dan silindi: ${filePath}`);
        return true;
    } catch (error) {
        logger.error('Görsel silinirken hata:', error);
        return false;
    }
};

// 7. Çoklu görsel silme
const deleteMultipleImages = async (imagePaths) => {
    try {
        const deletePromises = imagePaths.map(imgPath => deleteImage(imgPath));
        const results = await Promise.all(deletePromises);
        return results.every(r => r === true);
    } catch (error) {
        logger.error('Çoklu görsel silinirken hata:', error);
        return false;
    }
};

// 8. Kullanılmayan görselleri temizle (Supabase Storage için)
const cleanupUnusedImages = async (usedImagePaths) => {
    try {
        if (!supabase) {
            logger.warn('Supabase client yok, temizleme yapılamadı');
            return;
        }

        // Bucket'taki tüm dosyaları listele
        const { data: files, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list('', {
                limit: 1000,
                offset: 0
            });

        if (error) {
            logger.error('Dosya listesi alınırken hata:', error);
            return;
        }

        // Kullanılan dosya yollarını normalize et
        const usedPaths = usedImagePaths.map(url => {
            if (url.includes('/storage/v1/object/public/')) {
                const parts = url.split('/storage/v1/object/public/');
                if (parts.length > 1) {
                    return parts[1].split('/').slice(1).join('/');
                }
            }
            return url.split('/').pop();
        });

        // Kullanılmayan dosyaları sil
        const filesToDelete = [];
        for (const file of files) {
            const filePath = file.name;
            if (!usedPaths.some(used => filePath.includes(used) || used.includes(filePath))) {
                filesToDelete.push(filePath);
            }
        }

        if (filesToDelete.length > 0) {
            const { error: deleteError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove(filesToDelete);

            if (deleteError) {
                logger.error('Kullanılmayan dosyalar silinirken hata:', deleteError);
            } else {
                logger.log(`✅ ${filesToDelete.length} kullanılmayan görsel temizlendi`);
            }
        }
    } catch (error) {
        logger.error('Kullanılmayan görseller temizlenirken hata:', error);
    }
};

module.exports = {
    upload,
    uploadImageToSupabase,
    uploadMultipleImagesToSupabase,
    deleteImage,
    deleteMultipleImages,
    cleanupUnusedImages
};