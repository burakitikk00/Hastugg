const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// 1. Dosyaların nereye ve nasıl kaydedileceğini belirle
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // uploads klasörünün var olduğundan emin ol
        fs.ensureDirSync('uploads/');
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Dosya adını benzersiz yap: orijinal_ad-zaman_damgası.uzantı
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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

// 4. Yardımcı fonksiyonlar
const deleteImage = async (imagePath) => {
    try {
        // Veritabanından gelen path'den dosya adını çıkar
        const fileName = imagePath.split('/').pop();
        const fullPath = path.join('uploads', fileName);

        if (await fs.pathExists(fullPath)) {
            await fs.remove(fullPath);
            console.log(`Dosya silindi: ${fullPath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Dosya silinirken hata:', error);
        return false;
    }
};

const deleteMultipleImages = async (imagePaths) => {
    try {
        const deletePromises = imagePaths.map(imgPath => deleteImage(imgPath));
        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        console.error('Çoklu dosya silinirken hata:', error);
        return false;
    }
};

const cleanupUnusedImages = async (usedImagePaths) => {
    try {
        const uploadsDir = 'uploads';
        if (!await fs.pathExists(uploadsDir)) return;

        const files = await fs.readdir(uploadsDir);
        const usedFileNames = usedImagePaths.map(path => path.split('/').pop());

        for (const file of files) {
            if (!usedFileNames.includes(file)) {
                const filePath = path.join(uploadsDir, file);
                await fs.remove(filePath);
                console.log(`Kullanılmayan dosya silindi: ${filePath}`);
            }
        }
    } catch (error) {
        console.error('Kullanılmayan dosyalar temizlenirken hata:', error);
    }
};

module.exports = {
    upload,
    deleteImage,
    deleteMultipleImages,
    cleanupUnusedImages
};