const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_super_secret_and_long_key_that_no_one_can_guess';
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { sql, poolPromise } = require('./dbConfig');
const verifyToken = require('./middleware/authMiddleware');
const { upload, deleteImage, deleteMultipleImages, cleanupUnusedImages } = require('../upload');

// Hero verilerini kaydet/güncelle
router.post('/hero', verifyToken, async (req, res) => {
    try {
        const { title, subtitle } = req.body;
        
        if (!title || !subtitle) {
            return res.status(400).json({ message: 'title ve subtitle zorunludur.' });
        }

        const pool = await poolPromise;
        
        // Hero tablosunda kayıt var mı kontrol et
        const existingHero = await pool.request().query('SELECT TOP 1 * FROM Hero');
        
        if (existingHero.recordset.length > 0) {
            // Mevcut kaydı güncelle
            await pool.request()
                .input('title', sql.NVarChar, title)
                .input('subtitle', sql.NVarChar, subtitle)
                .query('UPDATE Hero SET title = @title, subtitle = @subtitle WHERE id = 1');
        } else {
            // Yeni kayıt ekle
            await pool.request()
                .input('title', sql.NVarChar, title)
                .input('subtitle', sql.NVarChar, subtitle)
                .query('INSERT INTO Hero (title, subtitle) VALUES (@title, @subtitle)');
        }

        res.status(200).json({ message: 'Hero verileri başarıyla kaydedildi' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const pool = await poolPromise;
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, hashedPassword)
            .query('INSERT INTO Admins (username, password) VALUES (@username, @password)');
        res.status(201).send('admin başarıyla oluşturuldu!');
    } catch (error) {
        console.error(error);
        res.status(500).send('sunucu hatası');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM Admins WHERE username = @username');

        // HATA 1: "lenght" değil, "length" olmalıydı.
        if (result.recordset.length === 0) {
            return res.status(404).send('kullanıcı bulunamadı.');
        }

        const user = result.recordset[0];
        const hashedPasswordFromDB = user.password;
        const isMatch = await bcrypt.compare(password, hashedPasswordFromDB);

        if (!isMatch) {
            return res.status(401).send('Geçersiz parola.');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        // HATA 2 ve 3: Token'ı göndermek ve doğru yerde kapatmak.
        // Başarılı giriş mesajı yerine token'ı içeren bir JSON objesi gönderiyoruz.
        res.status(200).json({
            message: 'Giriş başarılı!',
            token: token
        });

    } catch (error) { // HATA 2: try bloğu burada kapanmalıydı.
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

router.post('/add-project', verifyToken, upload.array('images', 10), async (req, res) => {
    let transaction;
    try {
        const { title, description, status, service_id, url } = req.body;
        const uploadedFiles = req.files;

        // Zorunlu alan kontrolü
        if (!title || !description || !status || !service_id) {
            return res.status(400).json({ message: 'title, description, status ve service_id zorunludur.' });
        }

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ message: 'En az bir görsel yüklenmelidir.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // service_id doğrula
        const serviceCheck = await new sql.Request(transaction)
            .input('service_id', sql.Int, service_id)
            .query('SELECT 1 FROM Services WHERE id = @service_id');
        if (serviceCheck.recordset.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Geçersiz service_id' });
        }

        // Projeyi ekle ve yeni ID'yi al
        const projectRequest = new sql.Request(transaction);
        const projectResult = await projectRequest
            .input('title', sql.VarChar, title)
            .input('description', sql.NVarChar, description)
            .input('status', sql.VarChar, status)
            .input('service_id', sql.Int, service_id)
            .input('url', sql.VarChar, url)
            .query('INSERT INTO Projects (title, description, url, service_id, status) OUTPUT Inserted.id VALUES (@title, @description, @url, @service_id, @status)');

        const newProjectId = projectResult.recordset[0].id;

        // Yüklenen görselleri veritabanına kaydet
        for (const file of uploadedFiles) {
            const imageURL = `/uploads/${file.filename}`;
            await new sql.Request(transaction)
                .input('projectid', sql.Int, newProjectId)
                .input('imageURL', sql.VarChar, imageURL)
                .query('INSERT INTO Images (projectid, imageURL) VALUES (@projectid, @imageURL)');
        }

        await transaction.commit();

        res.status(201).send({
            message: 'Proje ve görselleri başarıyla eklendi!',
            projectId: newProjectId,
            uploadedImages: uploadedFiles.map(file => `/uploads/${file.filename}`)
        });

    } catch (error) {
        if (transaction) {
            try { await transaction.rollback(); } catch (e) { }
        }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});


// Hizmet (Services) CRUD

// Services verilerini getir
router.get('/services', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, service, description, url FROM Services ORDER BY id');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Services verilerini kaydet/güncelle (tüm services array'ini alır)
router.post('/services', verifyToken, async (req, res) => {
    let transaction;
    try {
        const { title, subtitle, description, services } = req.body;
        
        if (!title || !subtitle || !description || !services || !Array.isArray(services)) {
            return res.status(400).json({ message: 'title, subtitle, description ve services array zorunludur.' });
        }

        console.log('Gelen services data:', JSON.stringify(services, null, 2));

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Önce tüm mevcut services'leri sil
        await new sql.Request(transaction).query('DELETE FROM Services');

        // Yeni services'leri ekle
        for (const service of services) {
            console.log(`Service ekleniyor: ${service.service}, URL: ${service.url}`);
            
            await new sql.Request(transaction)
                .input('service', sql.VarChar, service.service)
                .input('description', sql.NVarChar, service.description)
                .input('url', sql.VarChar, service.url || null)
                .query('INSERT INTO Services (service, description, url) VALUES (@service, @description, @url)');
        }

        await transaction.commit();
        res.status(200).json({ message: 'Services verileri başarıyla kaydedildi' });
    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

router.put('/services/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { service, description, url } = req.body;
        if (!service || !description || !url) {
            return res.status(400).json({ message: 'service, description ve url zorunludur.' });
        }
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, Number(id))
            .input('service', sql.VarChar, service)
            .input('description', sql.NVarChar, description)
            .input('url', sql.VarChar, url)
            .query('UPDATE Services SET service=@service, description=@description, url=@url WHERE id=@id');
        res.status(200).json({ message: 'Hizmet güncellendi' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

router.delete('/services/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        // İlişkili projeler olabilir; burada basitçe silmeye çalışıyoruz
        await pool.request().input('id', sql.Int, Number(id)).query('DELETE FROM Services WHERE id=@id');
        res.status(200).json({ message: 'Hizmet silindi' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Proje güncelleme
router.put('/projects/:id', verifyToken, upload.array('images', 10), async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const { title, description, status, service_id, url, deleteExistingImages } = req.body;
        const uploadedFiles = req.files;

        if (!title || !description || !status || !service_id || !url) {
            return res.status(400).json({ message: 'title, description, status, service_id ve url zorunludur.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Mevcut görselleri al
        const existingImages = await new sql.Request(transaction)
            .input('projectid', sql.Int, Number(id))
            .query('SELECT imageURL FROM Images WHERE projectid = @projectid');

        // Proje bilgilerini güncelle
        await new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .input('title', sql.VarChar, title)
            .input('description', sql.NVarChar, description)
            .input('status', sql.VarChar, status)
            .input('service_id', sql.Int, service_id)
            .input('url', sql.VarChar, url)
            .query('UPDATE Projects SET title=@title, description=@description, url=@url, service_id=@service_id, status=@status WHERE id=@id');

        // Eski görselleri sil (veritabanından ve dosya sisteminden)
        if (deleteExistingImages === 'true' || uploadedFiles) {
            // Dosya sisteminden eski görselleri sil
            const oldImagePaths = existingImages.recordset.map(img => img.imageURL);
            await deleteMultipleImages(oldImagePaths);

            // Veritabanından eski görselleri sil
            await new sql.Request(transaction)
                .input('projectid', sql.Int, Number(id))
                .query('DELETE FROM Images WHERE projectid=@projectid');
        }

        // Yeni görseller varsa ekle
        if (uploadedFiles && uploadedFiles.length > 0) {
            for (const file of uploadedFiles) {
                const imageURL = `/uploads/${file.filename}`;
                await new sql.Request(transaction)
                    .input('projectid', sql.Int, Number(id))
                    .input('imageURL', sql.VarChar, imageURL)
                    .query('INSERT INTO Images (projectid, imageURL) VALUES (@projectid, @imageURL)');
            }
        }

        await transaction.commit();
        res.status(200).json({
            message: 'Proje güncellendi',
            uploadedImages: uploadedFiles ? uploadedFiles.map(file => `/uploads/${file.filename}`) : []
        });
    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Proje silme (önce görselleri sil, sonra projeyi sil)
router.delete('/projects/:id', verifyToken, async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Önce görselleri al
        const images = await new sql.Request(transaction)
            .input('projectid', sql.Int, Number(id))
            .query('SELECT imageURL FROM Images WHERE projectid = @projectid');

        // Dosya sisteminden görselleri sil
        const imagePaths = images.recordset.map(img => img.imageURL);
        await deleteMultipleImages(imagePaths);

        // Veritabanından görselleri sil
        await new sql.Request(transaction)
            .input('projectid', sql.Int, Number(id))
            .query('DELETE FROM Images WHERE projectid=@projectid');

        // Projeyi sil
        await new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .query('DELETE FROM Projects WHERE id=@id');

        await transaction.commit();
        res.status(200).json({ message: 'Proje ve görselleri silindi' });
    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});
// Contact tablosundaki tek satırı güncelleyen endpoint
router.put('/contact', verifyToken, async (req, res) => {
    let transaction;
    try {
        // İstekten güncellenecek verileri al
        const { id, address, phone, email, facebook, twitter, instagram, linkedin } = req.body;
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Eğer id verilmemişse ilk satırı güncelle
        let targetId = id;
        if (!targetId) {
            const existing = await new sql.Request(transaction)
                .query('SELECT TOP 1 id FROM Contact ORDER BY id');
            if (existing.recordset.length > 0) {
                targetId = existing.recordset[0].id;
            }
        }

        if (targetId) {
            await new sql.Request(transaction)
                .input('id', sql.Int, targetId)
                .input('address', sql.NVarChar, address)
                .input('phone', sql.NVarChar, phone)
                .input('email', sql.NVarChar, email)
                .input('facebook', sql.NVarChar, facebook || null)
                .input('twitter', sql.NVarChar, twitter || null)
                .input('instagram', sql.NVarChar, instagram || null)
                .input('linkedin', sql.NVarChar, linkedin || null)
                .query('UPDATE Contact SET address=@address, phone=@phone, email=@email, facebook=@facebook, twitter=@twitter, instagram=@instagram, linkedin=@linkedin WHERE id=@id');
        } else {
            await new sql.Request(transaction)
                .input('address', sql.NVarChar, address)
                .input('phone', sql.NVarChar, phone)
                .input('email', sql.NVarChar, email)
                .input('facebook', sql.NVarChar, facebook || null)
                .input('twitter', sql.NVarChar, twitter || null)
                .input('instagram', sql.NVarChar, instagram || null)
                .input('linkedin', sql.NVarChar, linkedin || null)
                .query('INSERT INTO Contact (address, phone, email, facebook, twitter, instagram, linkedin) VALUES (@address, @phone, @email, @facebook, @twitter, @instagram, @linkedin)');
        }

        await transaction.commit();
        res.status(200).json({ message: 'İletişim bilgileri güncellendi' });
    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Aynı işlemi POST ile de destekle
router.post('/contact', verifyToken, async (req, res) => {
    // PUT ile aynı mantık
    let transaction;
    try {
        const { id, address, phone, email, facebook, twitter, instagram, linkedin } = req.body;
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        let targetId = id;
        if (!targetId) {
            const existing = await new sql.Request(transaction)
                .query('SELECT TOP 1 id FROM Contact ORDER BY id');
            if (existing.recordset.length > 0) {
                targetId = existing.recordset[0].id;
            }
        }

        if (targetId) {
            await new sql.Request(transaction)
                .input('id', sql.Int, targetId)
                .input('address', sql.NVarChar, address)
                .input('phone', sql.NVarChar, phone)
                .input('email', sql.NVarChar, email)
                .input('facebook', sql.NVarChar, facebook || null)
                .input('twitter', sql.NVarChar, twitter || null)
                .input('instagram', sql.NVarChar, instagram || null)
                .input('linkedin', sql.NVarChar, linkedin || null)
                .query('UPDATE Contact SET address=@address, phone=@phone, email=@email, facebook=@facebook, twitter=@twitter, instagram=@instagram, linkedin=@linkedin WHERE id=@id');
        } else {
            await new sql.Request(transaction)
                .input('address', sql.NVarChar, address)
                .input('phone', sql.NVarChar, phone)
                .input('email', sql.NVarChar, email)
                .input('facebook', sql.NVarChar, facebook || null)
                .input('twitter', sql.NVarChar, twitter || null)
                .input('instagram', sql.NVarChar, instagram || null)
                .input('linkedin', sql.NVarChar, linkedin || null)
                .query('INSERT INTO Contact (address, phone, email, facebook, twitter, instagram, linkedin) VALUES (@address, @phone, @email, @facebook, @twitter, @instagram, @linkedin)');
        }

        await transaction.commit();
        res.status(200).json({ message: 'İletişim bilgileri başarıyla kaydedildi' });
    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});


// Görsel yükleme endpoint'i (tek başına)
router.post('/upload-image', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Görsel yüklenmedi' });
        }

        const imageURL = `/uploads/${req.file.filename}`;
        res.status(200).json({
            message: 'Görsel başarıyla yüklendi',
            imageURL: imageURL,
            filename: req.file.filename
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Görsel silme endpoint'i (tek başına)
router.delete('/delete-image', verifyToken, async (req, res) => {
    try {
        const { imageURL } = req.body;

        if (!imageURL) {
            return res.status(400).json({ message: 'imageURL gerekli' });
        }

        const deleted = await deleteImage(imageURL);

        if (deleted) {
            res.status(200).json({ message: 'Görsel başarıyla silindi' });
        } else {
            res.status(404).json({ message: 'Görsel bulunamadı' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Kullanılmayan görselleri temizleme endpoint'i
router.post('/cleanup-images', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;

        // Veritabanındaki tüm görsel yollarını al
        const imagesResult = await pool.request().query('SELECT imageURL FROM Images');
        const usedImagePaths = imagesResult.recordset.map(img => img.imageURL);

        // Kullanılmayan görselleri temizle
        await cleanupUnusedImages(usedImagePaths);

        res.status(200).json({ message: 'Kullanılmayan görseller temizlendi' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});


module.exports = router;