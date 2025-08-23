const { upload, deleteImage, deleteMultipleImages, cleanupUnusedImages } = require('./upload');
const fs = require('fs-extra');
const path = require('path');

// Test fonksiyonları
async function testMulterIntegration() {
    console.log('=== Multer Entegrasyon Testi ===\n');

    try {
        // 1. Uploads klasörünün varlığını kontrol et
        console.log('1. Uploads klasörü kontrolü...');
        const uploadsExists = await fs.pathExists('uploads');
        console.log(`   Uploads klasörü mevcut: ${uploadsExists}`);

        if (!uploadsExists) {
            await fs.ensureDir('uploads');
            console.log('   Uploads klasörü oluşturuldu');
        }

        // 2. Test dosyası oluştur
        console.log('\n2. Test dosyası oluşturuluyor...');
        const testFilePath = path.join('uploads', 'test-image.txt');
        await fs.writeFile(testFilePath, 'Bu bir test dosyasıdır');
        console.log(`   Test dosyası oluşturuldu: ${testFilePath}`);

        // 3. Dosya silme fonksiyonunu test et
        console.log('\n3. Dosya silme fonksiyonu test ediliyor...');
        const deleted = await deleteImage('/uploads/test-image.txt');
        console.log(`   Dosya silindi: ${deleted}`);

        // 4. Kullanılmayan dosyaları temizleme testi
        console.log('\n4. Kullanılmayan dosyalar temizleniyor...');
        await cleanupUnusedImages(['/uploads/example.jpg']);
        console.log('   Temizlik tamamlandı');

        console.log('\n✅ Tüm testler başarıyla tamamlandı!');

    } catch (error) {
        console.error('❌ Test sırasında hata:', error);
    }
}

// Test çalıştır
testMulterIntegration();
