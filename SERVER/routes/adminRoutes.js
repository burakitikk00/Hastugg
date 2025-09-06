const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET;
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const { sql, poolPromise } = require('./dbConfig');
const verifyToken = require('./middleware/authMiddleware');
const { upload, deleteImage, deleteMultipleImages, cleanupUnusedImages } = require('../upload');

// Email şifreleme/çözme fonksiyonları
const ENCRYPTION_KEY = crypto.scryptSync('hastugg_email_encryption_key_2024', 'salt', 32);
const IV_LENGTH = 16;

function encryptEmailPassword(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decryptEmailPassword(encryptedText) {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Hero verilerini getir
router.get('/hero', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT TOP 1 * FROM Hero ORDER BY id');
        
        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset[0]);
        } else {
            res.status(404).json({ message: 'Hero verisi bulunamadı' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Hero verilerini kaydet/güncelle
router.post('/hero', verifyToken, async (req, res) => {
    try {
        const { mainTitle, subheading } = req.body;
        
        if (!mainTitle || !subheading) {
            return res.status(400).json({ message: 'mainTitle ve subheading zorunludur.' });
        }

        const pool = await poolPromise;
        
        // Hero tablosunda kayıt var mı kontrol et
        const existingHero = await pool.request().query('SELECT TOP 1 * FROM Hero');
        
        if (existingHero.recordset.length > 0) {
            // Mevcut kaydı güncelle
            await pool.request()
                .input('mainTitle', sql.NVarChar, mainTitle)
                .input('subheading', sql.NVarChar, subheading)
                .query('UPDATE Hero SET mainTitle = @mainTitle, subheading = @subheading WHERE id = 1');
        } else {
            // Yeni kayıt ekle
            await pool.request()
                .input('mainTitle', sql.NVarChar, mainTitle)
                .input('subheading', sql.NVarChar, subheading)
                .query('INSERT INTO Hero (mainTitle, subheading) VALUES (@mainTitle, @subheading)');
        }

        res.status(200).json({ message: 'Hero verileri başarıyla kaydedildi' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// AboutUs verilerini getir
router.get('/about', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // AboutUs tablosundan ana verileri al
        const aboutResult = await pool.request().query('SELECT TOP 1 * FROM AboutUs ORDER BY id');
        
        if (aboutResult.recordset.length === 0) {
            return res.status(404).json({ message: 'About verisi bulunamadı' });
        }
        
        const aboutData = aboutResult.recordset[0];
        
        // FeatureCards verilerini al
        const featuresResult = await pool.request().query('SELECT * FROM FeatureCards ORDER BY id');
        
        res.status(200).json({
            id: aboutData.id,
            mainTitle: aboutData.mainTitle,
            mainDescription: aboutData.mainDescription,
            features: featuresResult.recordset
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// AboutUs verilerini kaydet/güncelle
router.post('/about', verifyToken, async (req, res) => {
    let transaction;
    try {
        const { mainTitle, mainDescription, features } = req.body;
        
        if (!mainTitle || !mainDescription || !features || !Array.isArray(features)) {
            return res.status(400).json({ message: 'mainTitle, mainDescription ve features array zorunludur.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // AboutUs tablosunda kayıt var mı kontrol et
        const existingAbout = await new sql.Request(transaction).query('SELECT TOP 1 * FROM AboutUs');
        
        if (existingAbout.recordset.length > 0) {
            // Mevcut AboutUs kaydını güncelle
            await new sql.Request(transaction)
                .input('mainTitle', sql.NVarChar, mainTitle)
                .input('mainDescription', sql.NVarChar, mainDescription)
                .query('UPDATE AboutUs SET mainTitle = @mainTitle, mainDescription = @mainDescription WHERE id = 1');
        } else {
            // Yeni AboutUs kaydı ekle
            await new sql.Request(transaction)
                .input('mainTitle', sql.NVarChar, mainTitle)
                .input('mainDescription', sql.NVarChar, mainDescription)
                .query('INSERT INTO AboutUs (mainTitle, mainDescription) VALUES (@mainTitle, @mainDescription)');
        }

        // Mevcut FeatureCards'ları al
        const existingFeatures = await new sql.Request(transaction).query('SELECT * FROM FeatureCards ORDER BY id');
        const existingFeaturesMap = new Map(existingFeatures.recordset.map(f => [f.id, f]));

        // Gelen features'ları işle
        for (let i = 0; i < features.length; i++) {
            const feature = features[i];
            
            if (feature.id && feature.id !== null && existingFeaturesMap.has(parseInt(feature.id))) {
                // Mevcut feature'ı güncelle
                await new sql.Request(transaction)
                    .input('id', sql.Int, parseInt(feature.id))
                    .input('feaute', sql.NVarChar(50), (feature.feaute || '').trim())
                    .input('description', sql.NVarChar, (feature.description || '').trim())
                    .input('icon', sql.NVarChar(10), (feature.icon || '').trim())
                    .query('UPDATE FeatureCards SET feaute = @feaute, description = @description, icon = @icon WHERE id = @id');
                
                existingFeaturesMap.delete(parseInt(feature.id));
            } else {
                // Yeni feature ekle
                await new sql.Request(transaction)
                    .input('feaute', sql.NVarChar(50), (feature.feaute || '').trim())
                    .input('description', sql.NVarChar, (feature.description || '').trim())
                    .input('icon', sql.NVarChar(10), (feature.icon || '').trim())
                    .query('INSERT INTO FeatureCards (feaute, description, icon) VALUES (@feaute, @description, @icon)');
            }
        }

        // Kullanılmayan feature'ları sil
        for (const [id, feature] of existingFeaturesMap) {
            await new sql.Request(transaction)
                .input('id', sql.Int, id)
                .query('DELETE FROM FeatureCards WHERE id = @id');
        }

        await transaction.commit();
        res.status(200).json({ message: 'About verileri başarıyla kaydedildi' });
    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
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
        const { title, description, status, service_ids, url } = req.body;
        const uploadedFiles = req.files;



        // Zorunlu alan kontrolü
        if (!title || !description || !status || !service_ids) {
            return res.status(400).json({ message: 'title, description, status ve service_ids zorunludur.' });
        }

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ message: 'En az bir görsel yüklenmelidir.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // service_ids doğrula
        try {
            const serviceIdsArray = JSON.parse(service_ids);
            if (!Array.isArray(serviceIdsArray) || serviceIdsArray.length === 0) {
                await transaction.rollback();
                return res.status(400).json({ message: 'En az bir geçerli service_id gerekli' });
            }
            
            // Tüm service_id'leri doğrula
            for (const serviceId of serviceIdsArray) {
                const serviceCheck = await new sql.Request(transaction)
                    .input('service_id', sql.Int, serviceId)
                    .query('SELECT 1 FROM Services WHERE id = @service_id');
                if (serviceCheck.recordset.length === 0) {
                    await transaction.rollback();
                    return res.status(400).json({ message: `Geçersiz service_id: ${serviceId}` });
                }
            }
        } catch (error) {
            await transaction.rollback();
            return res.status(400).json({ message: 'service_ids JSON formatında olmalıdır' });
        }

        // service_ids kolonu var mı kontrol et  
        const columnsResult = await new sql.Request(transaction).query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Projects' AND COLUMN_NAME = 'service_ids'
        `);
        
        const hasServiceIdsColumn = columnsResult.recordset.length > 0;
        
        // Projeyi ekle ve yeni ID'yi al (URL başlangıçta null)
        const projectRequest = new sql.Request(transaction);
        
        let insertQuery, projectResult;
        if (hasServiceIdsColumn) {
            projectResult = await projectRequest
                .input('title', sql.VarChar, title)
                .input('description', sql.NVarChar, description)
                .input('status', sql.VarChar, status)
                .input('service_ids', sql.NVarChar, service_ids)
                .query('INSERT INTO Projects (title, description, service_ids, status) OUTPUT Inserted.id VALUES (@title, @description, @service_ids, @status)');
        } else {
            projectResult = await projectRequest
                .input('title', sql.VarChar, title)
                .input('description', sql.NVarChar, description)
                .input('status', sql.VarChar, status)
                .query('INSERT INTO Projects (title, description, status) OUTPUT Inserted.id VALUES (@title, @description, @status)');
        }

        const newProjectId = projectResult.recordset[0].id;

        // Yüklenen görselleri veritabanına kaydet ve ilk görseli ana görsel yap
        let firstImageURL = null;
        
        for (const file of uploadedFiles) {
            const imageURL = `/uploads/${file.filename}`;
            if (!firstImageURL) firstImageURL = imageURL; // İlk görseli kaydet
            
            await new sql.Request(transaction)
                .input('projectid', sql.Int, newProjectId)
                .input('imageURL', sql.NVarChar(sql.MAX), imageURL)
                .query('INSERT INTO Images (projectid, imageURL) VALUES (@projectid, @imageURL)');
        }

        // İlk görseli ana görsel olarak Projects tablosunda güncelle
        if (firstImageURL) {
            await new sql.Request(transaction)
                .input('projectid', sql.Int, newProjectId)
                .input('url', sql.NVarChar(sql.MAX), firstImageURL)
                .query('UPDATE Projects SET url = @url WHERE id = @projectid');
        }

        await transaction.commit();

        res.status(201).json({
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
        const { services } = req.body;
        
        if (!services || !Array.isArray(services)) {
            return res.status(400).json({ message: 'services array zorunludur.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Önce tüm mevcut services'leri sil
        await new sql.Request(transaction).query('DELETE FROM Services');

        // Yeni services'leri ekle
        for (const service of services) {
            await new sql.Request(transaction)
                .input('service', sql.VarChar, service.service)
                .input('description', sql.NVarChar, service.description)
                .input('url', sql.NVarChar(sql.MAX), service.url || null)
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
            .input('url', sql.NVarChar(sql.MAX), url)
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

// Proje güncelleme (SADECE proje bilgileri, görseller ayrı endpoint'ler)
router.put('/projects/:id', verifyToken, async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const { title, description, status, service_ids } = req.body;



        if (!title || !description || !status || !service_ids) {
            return res.status(400).json({ message: 'title, description, status ve service_ids zorunludur.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // service_ids kolonu var mı kontrol et
        const columnsResult = await new sql.Request(transaction).query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Projects' AND COLUMN_NAME = 'service_ids'
        `);
        
        const hasServiceIdsColumn = columnsResult.recordset.length > 0;
        
        // SADECE proje bilgilerini güncelle (görsellere DOKUNMA)
        let updateQuery = 'UPDATE Projects SET title=@title, description=@description, status=@status';
        const updateRequest = new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .input('title', sql.VarChar, title)
            .input('description', sql.NVarChar, description)
            .input('status', sql.VarChar, status);

        if (hasServiceIdsColumn) {
            updateQuery += ', service_ids=@service_ids';
            updateRequest.input('service_ids', sql.NVarChar, service_ids);
        }

        updateQuery += ' WHERE id=@id';
        await updateRequest.query(updateQuery);

        await transaction.commit();
        res.status(200).json({
            message: 'Proje bilgileri güncellendi'
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
        const { id, address, phone, email, facebook, twitter, instagram, linkedin, mapEmbedUrl } = req.body;
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
                .input('mapEmbedUrl', sql.NVarChar(sql.MAX), mapEmbedUrl || null)
                .query('UPDATE Contact SET address=@address, phone=@phone, email=@email, facebook=@facebook, twitter=@twitter, instagram=@instagram, linkedin=@linkedin, mapEmbedUrl=@mapEmbedUrl WHERE id=@id');
        } else {
            await new sql.Request(transaction)
                .input('address', sql.NVarChar, address)
                .input('phone', sql.NVarChar, phone)
                .input('email', sql.NVarChar, email)
                .input('facebook', sql.NVarChar, facebook || null)
                .input('twitter', sql.NVarChar, twitter || null)
                .input('instagram', sql.NVarChar, instagram || null)
                .input('linkedin', sql.NVarChar, linkedin || null)
                .input('mapEmbedUrl', sql.NVarChar(sql.MAX), mapEmbedUrl || null)
                .query('INSERT INTO Contact (address, phone, email, facebook, twitter, instagram, linkedin, mapEmbedUrl) VALUES (@address, @phone, @email, @facebook, @twitter, @instagram, @linkedin, @mapEmbedUrl)');
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
        const { id, address, phone, email, facebook, twitter, instagram, linkedin, mapEmbedUrl } = req.body;
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
                .input('mapEmbedUrl', sql.NVarChar(sql.MAX), mapEmbedUrl || null)
                .query('UPDATE Contact SET address=@address, phone=@phone, email=@email, facebook=@facebook, twitter=@twitter, instagram=@instagram, linkedin=@linkedin, mapEmbedUrl=@mapEmbedUrl WHERE id=@id');
        } else {
            await new sql.Request(transaction)
                .input('address', sql.NVarChar, address)
                .input('phone', sql.NVarChar, phone)
                .input('email', sql.NVarChar, email)
                .input('facebook', sql.NVarChar, facebook || null)
                .input('twitter', sql.NVarChar, twitter || null)
                .input('instagram', sql.NVarChar, instagram || null)
                .input('linkedin', sql.NVarChar, linkedin || null)
                .input('mapEmbedUrl', sql.NVarChar(sql.MAX), mapEmbedUrl || null)
                .query('INSERT INTO Contact (address, phone, email, facebook, twitter, instagram, linkedin, mapEmbedUrl) VALUES (@address, @phone, @email, @facebook, @twitter, @instagram, @linkedin, @mapEmbedUrl)');
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

// Projeleri listele (service bilgileri ile birlikte)
router.get('/projects', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        // service_ids kolonu var mı kontrol et
        const columnsResult = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Projects' AND COLUMN_NAME = 'service_ids'
        `);
        
        const hasServiceIdsColumn = columnsResult.recordset.length > 0;
        
        let query;
        if (hasServiceIdsColumn) {
            query = `
                SELECT 
                    p.id, 
                    p.title, 
                    p.description, 
                    p.url, 
                    p.status,
                    ISNULL(p.service_ids, '[1]') as service_ids
                FROM Projects p
                ORDER BY p.id DESC
            `;
        } else {
            query = `
                SELECT 
                    p.id, 
                    p.title, 
                    p.description, 
                    p.url, 
                    p.status,
                    '[1]' as service_ids
                FROM Projects p
                ORDER BY p.id DESC
            `;
        }
        
        const result = await pool.request().query(query);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Belirli bir projenin detaylarını getir (görselleri ile birlikte)
router.get('/projects/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        
        // service_ids kolonu var mı kontrol et
        const columnsResult = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Projects' AND COLUMN_NAME = 'service_ids'
        `);
        
        const hasServiceIdsColumn = columnsResult.recordset.length > 0;
        
        let query;
        if (hasServiceIdsColumn) {
            query = `
                SELECT 
                    p.id, 
                    p.title, 
                    p.description, 
                    p.url, 
                    p.status,
                    ISNULL(p.service_ids, '[1]') as service_ids
                FROM Projects p
                WHERE p.id = @id
            `;
        } else {
            query = `
                SELECT 
                    p.id, 
                    p.title, 
                    p.description, 
                    p.url, 
                    p.status,
                    '[1]' as service_ids
                FROM Projects p
                WHERE p.id = @id
            `;
        }
        
        // Proje bilgilerini al
        const projectResult = await pool.request()
            .input('id', sql.Int, Number(id))
            .query(query);

        if (projectResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Proje bulunamadı' });
        }

        // Proje görsellerini al
        const imagesResult = await pool.request()
            .input('projectid', sql.Int, Number(id))
            .query('SELECT imageURL FROM Images WHERE projectid = @projectid ORDER BY id');

        const project = projectResult.recordset[0];
        project.images = imagesResult.recordset.map(img => img.imageURL);

        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Projenin belirli bir görselini sil
router.delete('/projects/:id/images', verifyToken, async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const { imageURL } = req.body;

        if (!imageURL) {
            return res.status(400).json({ message: 'imageURL gerekli' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Görseli veritabanından sil
        await new sql.Request(transaction)
            .input('projectid', sql.Int, Number(id))
            .input('imageURL', sql.VarChar, imageURL)
            .query('DELETE FROM Images WHERE projectid = @projectid AND imageURL = @imageURL');

        // Dosya sisteminden görseli sil
        await deleteImage(imageURL);

        // Eğer silinen görsel proje ana görseli ise, yeni ana görseli belirle
        const projectResult = await new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .query('SELECT url FROM Projects WHERE id = @id');

        if (projectResult.recordset.length > 0 && projectResult.recordset[0].url === imageURL) {
            // Kalan ilk görseli ana görsel yap
            const remainingImages = await new sql.Request(transaction)
                .input('projectid', sql.Int, Number(id))
                .query('SELECT TOP 1 imageURL FROM Images WHERE projectid = @projectid ORDER BY id');

            const newMainImageURL = remainingImages.recordset.length > 0 ? remainingImages.recordset[0].imageURL : null;

            await new sql.Request(transaction)
                .input('id', sql.Int, Number(id))
                .input('url', sql.VarChar, newMainImageURL)
                .query('UPDATE Projects SET url = @url WHERE id = @id');
        }

        await transaction.commit();
        res.status(200).json({ message: 'Görsel başarıyla silindi' });
    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Projeye yeni görseller ekle
router.post('/projects/:id/images', verifyToken, upload.array('images', 10), async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const { setAsMain } = req.body; // İlk yüklenen görseli ana görsel yapmak için
        const uploadedFiles = req.files;

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ message: 'En az bir görsel yüklenmelidir.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        let firstImageURL = null;

        // Yüklenen görselleri veritabanına kaydet
        for (const file of uploadedFiles) {
            const imageURL = `/uploads/${file.filename}`;
            if (!firstImageURL) firstImageURL = imageURL;

            await new sql.Request(transaction)
                .input('projectid', sql.Int, Number(id))
                .input('imageURL', sql.NVarChar(sql.MAX), imageURL)
                .query('INSERT INTO Images (projectid, imageURL) VALUES (@projectid, @imageURL)');
        }

        // Eğer setAsMain true ise veya proje ana görseli yoksa, ilk görseli ana görsel yap
        if (setAsMain === 'true' || !setAsMain) {
            const projectResult = await new sql.Request(transaction)
                .input('id', sql.Int, Number(id))
                .query('SELECT url FROM Projects WHERE id = @id');

            if (projectResult.recordset.length > 0 && !projectResult.recordset[0].url) {
                await new sql.Request(transaction)
                    .input('id', sql.Int, Number(id))
                    .input('url', sql.NVarChar(sql.MAX), firstImageURL)
                    .query('UPDATE Projects SET url = @url WHERE id = @id');
            }
        }

        await transaction.commit();

        res.status(201).json({
            message: 'Görseller başarıyla eklendi!',
            uploadedImages: uploadedFiles.map(file => `/uploads/${file.filename}`)
        });
    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Projenin belirli bir görselini sil
router.delete('/projects/:id/images', verifyToken, async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const { imageURL } = req.body;



        if (!imageURL) {
            return res.status(400).json({ message: 'imageURL gereklidir.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Görselin bu projeye ait olup olmadığını kontrol et
        const imageCheck = await new sql.Request(transaction)
            .input('projectid', sql.Int, Number(id))
            .input('imageURL', sql.NVarChar(sql.MAX), imageURL)
            .query('SELECT id FROM Images WHERE projectid = @projectid AND imageURL = @imageURL');

        if (imageCheck.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Görsel bulunamadı.' });
        }

        // Görseli veritabanından sil
        await new sql.Request(transaction)
            .input('projectid', sql.Int, Number(id))
            .input('imageURL', sql.NVarChar(sql.MAX), imageURL)
            .query('DELETE FROM Images WHERE projectid = @projectid AND imageURL = @imageURL');

        // Eğer silinen görsel ana görsel ise, yeni ana görseli belirle
        const projectResult = await new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .query('SELECT CAST(url AS NVARCHAR(MAX)) as url FROM Projects WHERE id = @id');

        const currentMainImage = projectResult.recordset.length > 0 ? projectResult.recordset[0].url : null;
        if (currentMainImage && String(currentMainImage) === String(imageURL)) {
            // Kalan görselleri al
            const remainingImages = await new sql.Request(transaction)
                .input('projectid', sql.Int, Number(id))
                .query('SELECT TOP 1 imageURL FROM Images WHERE projectid = @projectid ORDER BY id ASC');

            let newMainImage = null;
            if (remainingImages.recordset.length > 0) {
                newMainImage = remainingImages.recordset[0].imageURL;
            }

            // Ana görseli güncelle (null olabilir)
            const updateRequest = new sql.Request(transaction)
                .input('id', sql.Int, Number(id));
            
            if (newMainImage) {
                updateRequest.input('url', sql.NVarChar(sql.MAX), newMainImage);
                await updateRequest.query('UPDATE Projects SET url = @url WHERE id = @id');
            } else {
                await updateRequest.query('UPDATE Projects SET url = NULL WHERE id = @id');
            }

        }

        await transaction.commit();

        // Dosyayı fiziksel olarak sil
        try {
            const { deleteImage } = require('../upload.js');
            await deleteImage(imageURL);
        } catch (fileError) {
            // Dosya silme hatası kritik değil, devam et
            console.log('File deletion warning:', fileError.message);
        }

        res.status(200).json({ 
            message: 'Görsel başarıyla silindi',
            deletedImage: imageURL 
        });

    } catch (error) {
        if (transaction) { 
            try { 
                await transaction.rollback(); 
            } catch (e) { } 
        }
        console.error('Görsel silme hatası:', error);
        res.status(500).json({ 
            message: 'Sunucu hatası'
        });
    }
});

// Ana görsel ayarla
router.put('/projects/:id/main-image', verifyToken, async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const { imageURL } = req.body;

        if (!imageURL) {
            return res.status(400).json({ message: 'imageURL gereklidir.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Görselin bu projeye ait olup olmadığını kontrol et
        const imageCheck = await new sql.Request(transaction)
            .input('projectid', sql.Int, Number(id))
            .input('imageURL', sql.NVarChar(sql.MAX), imageURL)
            .query('SELECT id FROM Images WHERE projectid = @projectid AND imageURL = @imageURL');

        if (imageCheck.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Görsel bu projeye ait değil.' });
        }

        // Ana görseli güncelle
        await new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .input('url', sql.NVarChar(sql.MAX), imageURL)
            .query('UPDATE Projects SET url = @url WHERE id = @id');

        await transaction.commit();

        res.status(200).json({ 
            message: 'Ana görsel başarıyla ayarlandı',
            mainImage: imageURL 
        });

    } catch (error) {
        if (transaction) { 
            try { 
                await transaction.rollback(); 
            } catch (e) { } 
        }
        console.error('Ana görsel ayarlama hatası:', error);
        res.status(500).json({ 
            message: 'Sunucu hatası'
        });
    }
});

// Team CRUD Operations

// Team verilerini getir
router.get('/team', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Önce Team tablosunun var olup olmadığını kontrol et
        const tableCheck = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'Team'
        `);
        
        if (tableCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Team tablosu bulunamadı. Lütfen önce tabloyu oluşturun.' });
        }
        
        const result = await pool.request().query('SELECT id, namesurname, position, url, LinkedIn FROM Team ORDER BY id');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Team verileri getirme hatası:', error);
        res.status(500).send('Sunucu hatası: ' + error.message);
    }
});

// Team üyesi ekle
router.post('/team', verifyToken, upload.single('image'), async (req, res) => {
    let transaction;
    try {
        const { namesurname, position, LinkedIn } = req.body;
        const uploadedFile = req.file;

        if (!namesurname || !position) {
            return res.status(400).json({ message: 'namesurname ve position zorunludur.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        let imageURL = null;
        if (uploadedFile) {
            imageURL = `/uploads/${uploadedFile.filename}`;
        }

        // Team üyesini ekle
        await new sql.Request(transaction)
            .input('namesurname', sql.NVarChar, namesurname)
            .input('position', sql.NVarChar, position)
            .input('url', sql.NVarChar(sql.MAX), imageURL)
            .input('LinkedIn', sql.NVarChar, LinkedIn || null)
            .query('INSERT INTO Team (namesurname, position, url, LinkedIn) VALUES (@namesurname, @position, @url, @LinkedIn)');

        await transaction.commit();

        res.status(201).json({
            message: 'Team üyesi başarıyla eklendi!',
            imageURL: imageURL
        });

    } catch (error) {
        console.error('Team üyesi ekleme hatası:', error);
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        res.status(500).send('Sunucu hatası: ' + error.message);
    }
});

// Team üyesi güncelle
router.put('/team/:id', verifyToken, upload.single('image'), async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const { namesurname, position, LinkedIn, currentImageURL } = req.body;
        const uploadedFile = req.file;

        if (!namesurname || !position) {
            return res.status(400).json({ message: 'namesurname ve position zorunludur.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Mevcut resmi al
        const currentResult = await new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .query('SELECT url FROM Team WHERE id = @id');

        if (currentResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Team üyesi bulunamadı' });
        }

        let imageURL = currentResult.recordset[0].url;

        // Eğer yeni resim yüklendiyse
        if (uploadedFile) {
            // Eski resmi sil
            if (imageURL) {
                await deleteImage(imageURL);
            }
            imageURL = `/uploads/${uploadedFile.filename}`;
        }

        // Team üyesini güncelle
        await new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .input('namesurname', sql.NVarChar, namesurname)
            .input('position', sql.NVarChar, position)
            .input('url', sql.NVarChar(sql.MAX), imageURL)
            .input('LinkedIn', sql.NVarChar, LinkedIn || null)
            .query('UPDATE Team SET namesurname = @namesurname, position = @position, url = @url, LinkedIn = @LinkedIn WHERE id = @id');

        await transaction.commit();

        res.status(200).json({
            message: 'Team üyesi başarıyla güncellendi!',
            imageURL: imageURL
        });

    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Team üyesi sil
router.delete('/team/:id', verifyToken, async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Mevcut resmi al
        const currentResult = await new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .query('SELECT url FROM Team WHERE id = @id');

        if (currentResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Team üyesi bulunamadı' });
        }

        // Resmi sil
        const imageURL = currentResult.recordset[0].url;
        if (imageURL) {
            await deleteImage(imageURL);
        }

        // Team üyesini sil
        await new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .query('DELETE FROM Team WHERE id = @id');

        await transaction.commit();

        res.status(200).json({ message: 'Team üyesi başarıyla silindi' });

    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Team üyesi resmi sil
router.delete('/team/:id/image', verifyToken, async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Mevcut resmi al
        const currentResult = await new sql.Request(transaction)
            .input('id', sql.Int, Number(id))
            .query('SELECT url FROM Team WHERE id = @id');

        if (currentResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Team üyesi bulunamadı' });
        }

        const imageURL = currentResult.recordset[0].url;
        if (imageURL) {
            // Dosyayı sil
            await deleteImage(imageURL);
            
            // Veritabanından resim URL'ini temizle
            await new sql.Request(transaction)
                .input('id', sql.Int, Number(id))
                .query('UPDATE Team SET url = NULL WHERE id = @id');
        }

        await transaction.commit();

        res.status(200).json({ message: 'Team üyesi resmi başarıyla silindi' });

    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Email Settings CRUD Operations

// Email ayarlarını getir
router.get('/email-settings', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // EmailSettings tablosunun var olup olmadığını kontrol et
        const tableCheck = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'EmailSettings'
        `);
        
        if (tableCheck.recordset.length === 0) {
            return res.status(404).json({ 
                message: 'EmailSettings tablosu bulunamadı. Lütfen önce tabloyu oluşturun.',
                needsSetup: true
            });
        }
        
        const result = await pool.request().query('SELECT TOP 1 * FROM EmailSettings ORDER BY id');
        
        if (result.recordset.length > 0) {
            const settings = result.recordset[0];
            
            res.status(200).json({
                id: settings.id,
                email_user: settings.email_user,
                email_pass: '••••••••', // Güvenlik için gizli göster
                created_at: settings.created_at
            });
        } else {
            res.status(404).json({ message: 'Email ayarları bulunamadı' });
        }
    } catch (error) {
        console.error('Email ayarları getirme hatası:', error);
        res.status(500).send('Sunucu hatası: ' + error.message);
    }
});

// Email ayarlarını kaydet/güncelle
router.post('/email-settings', verifyToken, async (req, res) => {
    let transaction;
    try {
        const { email_user, email_pass } = req.body;
        
        if (!email_user || !email_pass) {
            return res.status(400).json({ message: 'email_user ve email_pass zorunludur.' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // EmailSettings tablosunun var olup olmadığını kontrol et
        const tableCheck = await new sql.Request(transaction).query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'EmailSettings'
        `);
        
        if (tableCheck.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ 
                message: 'EmailSettings tablosu bulunamadı. Lütfen önce tabloyu oluşturun.',
                needsSetup: true
            });
        }

        // Mevcut ayarları sil
        await new sql.Request(transaction)
            .query('DELETE FROM EmailSettings');

        // Şifreyi şifrele (geri çözülebilir)
        const encryptedPassword = encryptEmailPassword(email_pass);

        // Şifrelenmiş şifreyi sakla
        await new sql.Request(transaction)
            .input('email_user', sql.NVarChar, email_user)
            .input('email_pass', sql.NVarChar, encryptedPassword)
            .query('INSERT INTO EmailSettings (email_user, email_pass) VALUES (@email_user, @email_pass)');

        await transaction.commit();
        res.status(200).json({ message: 'Email ayarları başarıyla kaydedildi' });
    } catch (error) {
        if (transaction) { try { await transaction.rollback(); } catch (e) { } }
        console.error('Email ayarları kaydetme hatası:', error);
        res.status(500).send('Sunucu hatası: ' + error.message);
    }
});

// Email ayarlarını test et
router.post('/email-settings/test', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Email ayarlarını al
        const result = await pool.request().query('SELECT TOP 1 * FROM EmailSettings ORDER BY id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Email ayarları bulunamadı' });
        }

        const settings = result.recordset[0];
        
        // Şifrelenmiş şifreyi çöz
        const decryptedPassword = decryptEmailPassword(settings.email_pass);
        
        // Nodemailer transporter oluştur (Gmail için basitleştirilmiş)
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: settings.email_user,
                pass: decryptedPassword // Çözülmüş şifre
            }
        });

        // Test e-postası gönder
        const mailOptions = {
            from: settings.email_user,
            to: settings.email_user, // Kendine gönder
            subject: 'Email Ayarları Test - Hastugg',
            html: `
                <h2>Email Ayarları Başarılı!</h2>
                <p>Bu bir test e-postasıdır. Email ayarlarınız doğru çalışıyor.</p>
                <p><strong>Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}</p>
                <p><strong>Email:</strong> ${settings.email_user}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Test e-postası başarıyla gönderildi' });

    } catch (error) {
        console.error('Email test hatası:', error);
        res.status(500).json({ 
            error: 'Test e-postası gönderilemedi',
            details: error.message 
        });
    }
});

// Contact Messages CRUD Operations

// Contact mesajları istatistiklerini getir
router.get('/contact-messages/stats', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // ContactMessages tablosunun var olup olmadığını kontrol et
        const tableCheck = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'ContactMessages'
        `);
        
        if (tableCheck.recordset.length === 0) {
            return res.status(200).json({ 
                total: 0,
                unread: 0,
                unsent: 0
            });
        }
        
        // Toplam mesaj sayısı
        const totalResult = await pool.request().query('SELECT COUNT(*) as total FROM ContactMessages');
        const total = totalResult.recordset[0].total;
        
        // Okunmamış mesaj sayısı
        const unreadResult = await pool.request().query('SELECT COUNT(*) as unread FROM ContactMessages WHERE is_read = 0');
        const unread = unreadResult.recordset[0].unread;
        
        // Email gönderilmiş mesaj sayısı
        const sentResult = await pool.request().query('SELECT COUNT(*) as sent FROM ContactMessages WHERE is_sent = 1');
        const sent = sentResult.recordset[0].sent;
        
        res.status(200).json({
            total: total,
            unread: unread,
            sent: sent
        });
    } catch (error) {
        console.error('Contact mesajları istatistikleri getirme hatası:', error);
        res.status(500).send('Sunucu hatası: ' + error.message);
    }
});

// Contact mesajlarını getir (sayfalama ile)
router.get('/contact-messages', verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, filter = 'all' } = req.query;
        const offset = (page - 1) * limit;
        
        const pool = await poolPromise;
        
        // ContactMessages tablosunun var olup olmadığını kontrol et
        const tableCheck = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'ContactMessages'
        `);
        
        if (tableCheck.recordset.length === 0) {
            return res.status(404).json({ 
                message: 'ContactMessages tablosu bulunamadı. Lütfen önce tabloyu oluşturun.',
                needsSetup: true
            });
        }
        
        // Filtre koşulu
        let whereClause = '';
        if (filter === 'unread') {
            whereClause = 'WHERE is_read = 0';
        } else if (filter === 'sent') {
            whereClause = 'WHERE is_sent = 1';
        }
        
        // Toplam kayıt sayısını al
        const countResult = await pool.request().query(`
            SELECT COUNT(*) as total 
            FROM ContactMessages 
            ${whereClause}
        `);
        const total = countResult.recordset[0].total;
        
        // Sayfalanmış verileri al
        const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, parseInt(limit))
            .query(`
                SELECT 
                    id, 
                    first_name, 
                    last_name, 
                    email, 
                    phone, 
                    message, 
                    created_at, 
                    is_read, 
                    is_sent 
                FROM ContactMessages 
                ${whereClause}
                ORDER BY created_at DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);
        
        const totalPages = Math.ceil(total / limit);
        
        res.status(200).json({
            messages: result.recordset,
            pagination: {
                currentPage: parseInt(page),
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Contact mesajları getirme hatası:', error);
        res.status(500).send('Sunucu hatası: ' + error.message);
    }
});

// Contact mesajını okundu olarak işaretle
router.put('/contact-messages/:id/read', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        
        await pool.request()
            .input('id', sql.Int, Number(id))
            .query('UPDATE ContactMessages SET is_read = 1 WHERE id = @id');
        
        res.status(200).json({ message: 'Mesaj okundu olarak işaretlendi' });
    } catch (error) {
        console.error('Mesaj okundu işaretleme hatası:', error);
        res.status(500).send('Sunucu hatası: ' + error.message);
    }
});

// Contact mesajını e-posta olarak gönder
router.post('/contact-messages/:id/send-email', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        
        // Mesajı al
        const messageResult = await pool.request()
            .input('id', sql.Int, Number(id))
            .query('SELECT * FROM ContactMessages WHERE id = @id');
        
        if (messageResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Mesaj bulunamadı' });
        }
        
        const message = messageResult.recordset[0];
        
        // Email ayarlarını al
        const emailResult = await pool.request().query('SELECT TOP 1 * FROM EmailSettings ORDER BY id');
        
        if (emailResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Email ayarları bulunamadı' });
        }
        
        const emailSettings = emailResult.recordset[0];
        
        // Şifrelenmiş şifreyi çöz
        const decryptedPassword = decryptEmailPassword(emailSettings.email_pass);
        
        // Nodemailer transporter oluştur
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailSettings.email_user,
                pass: decryptedPassword // Çözülmüş şifre
            }
        });

        // E-posta içeriği
        const mailOptions = {
            from: emailSettings.email_user,
            to: emailSettings.email_user, // Kendi e-posta adresiniz
            subject: `Yeni İletişim Formu - ${message.first_name} ${message.last_name}`,
            html: `
                <h2>Yeni İletişim Formu Mesajı</h2>
                <p><strong>Ad Soyad:</strong> ${message.first_name} ${message.last_name}</p>
                <p><strong>E-posta:</strong> ${message.email}</p>
                <p><strong>Telefon:</strong> ${message.phone}</p>
                <p><strong>Mesaj:</strong></p>
                <p>${message.message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>Bu mesaj web sitenizin iletişim formundan gönderilmiştir.</em></p>
                <p><strong>Gönderim Zamanı:</strong> ${new Date(message.created_at).toLocaleString('tr-TR')}</p>
            `
        };

        // E-postayı gönder
        await transporter.sendMail(mailOptions);
        
        // Mesajı gönderildi olarak işaretle
        await pool.request()
            .input('id', sql.Int, Number(id))
            .query('UPDATE ContactMessages SET is_sent = 1 WHERE id = @id');
        
        res.status(200).json({ message: 'E-posta başarıyla gönderildi' });

    } catch (error) {
        console.error('E-posta gönderme hatası:', error);
        res.status(500).json({ 
            error: 'E-posta gönderilemedi',
            details: error.message 
        });
    }
});

// Contact mesajını sil
router.delete('/contact-messages/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        
        await pool.request()
            .input('id', sql.Int, Number(id))
            .query('DELETE FROM ContactMessages WHERE id = @id');
        
        res.status(200).json({ message: 'Mesaj başarıyla silindi' });
    } catch (error) {
        console.error('Mesaj silme hatası:', error);
        res.status(500).send('Sunucu hatası: ' + error.message);
    }
});

// ==================== GOOGLE ANALYTICS AYARLARI ====================

// Analytics ayarlarını getir
router.get('/analytics-settings', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 1 measurement_id, is_active, created_at, updated_at 
            FROM analytics_settings 
            ORDER BY created_at DESC
        `);
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            // Varsayılan değer döndür
            res.json({
                measurement_id: 'G-XXXXXXXXXX',
                is_active: false,
                created_at: null,
                updated_at: null
            });
        }
    } catch (error) {
        console.error('Analytics ayarları getirme hatası:', error);
        res.status(500).json({ error: 'Analytics ayarları alınamadı' });
    }
});

// Analytics ayarlarını kaydet
router.post('/analytics-settings', verifyToken, async (req, res) => {
    try {
        const { measurement_id, is_active } = req.body;
        
        // Validation
        if (!measurement_id || !measurement_id.startsWith('G-')) {
            return res.status(400).json({ error: 'Geçerli bir Google Analytics Measurement ID girin (G-XXXXXXXXXX formatında)' });
        }
        
        const pool = await poolPromise;
        
        // Önce mevcut kayıtları kontrol et
        const existingResult = await pool.request().query(`
            SELECT COUNT(*) as count FROM analytics_settings
        `);
        
        if (existingResult.recordset[0].count > 0) {
            // Mevcut kaydı güncelle
            await pool.request()
                .input('measurement_id', sql.NVarChar, measurement_id)
                .input('is_active', sql.Bit, is_active)
                .query(`
                    UPDATE analytics_settings 
                    SET measurement_id = @measurement_id, 
                        is_active = @is_active, 
                        updated_at = GETDATE()
                `);
        } else {
            // Yeni kayıt ekle
            await pool.request()
                .input('measurement_id', sql.NVarChar, measurement_id)
                .input('is_active', sql.Bit, is_active)
                .query(`
                    INSERT INTO analytics_settings (measurement_id, is_active) 
                    VALUES (@measurement_id, @is_active)
                `);
        }
        
        res.json({ 
            message: 'Analytics ayarları başarıyla kaydedildi',
            measurement_id,
            is_active
        });
    } catch (error) {
        console.error('Analytics ayarları kaydetme hatası:', error);
        res.status(500).json({ error: 'Analytics ayarları kaydedilemedi' });
    }
});

// Analytics ayarlarını test et
router.post('/analytics-settings/test', verifyToken, async (req, res) => {
    try {
        const { measurement_id } = req.body;
        
        if (!measurement_id || !measurement_id.startsWith('G-')) {
            return res.status(400).json({ error: 'Geçerli bir Measurement ID girin' });
        }
        
        // Google Analytics API'sine test isteği gönder
        // Bu basit bir format kontrolü
        const isValidFormat = /^G-[A-Z0-9]{10}$/.test(measurement_id);
        
        if (isValidFormat) {
            res.json({ 
                success: true, 
                message: 'Measurement ID formatı doğru görünüyor. Google Analytics hesabınızda bu ID\'yi kontrol edin.' 
            });
        } else {
            res.status(400).json({ 
                error: 'Measurement ID formatı hatalı. G-XXXXXXXXXX formatında olmalıdır.' 
            });
        }
    } catch (error) {
        console.error('Analytics test hatası:', error);
        res.status(500).json({ error: 'Test sırasında hata oluştu' });
    }
});

// ==================== ŞİFRE DEĞİŞTİRME ====================

// Rate limiting için basit in-memory store
const passwordChangeAttempts = new Map();

// Rate limiting middleware
const passwordChangeRateLimit = (req, res, next) => {
    const userId = req.user.id;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 dakika
    const maxAttempts = 5; // 15 dakikada maksimum 5 deneme
    
    if (!passwordChangeAttempts.has(userId)) {
        passwordChangeAttempts.set(userId, []);
    }
    
    const attempts = passwordChangeAttempts.get(userId);
    
    // Eski denemeleri temizle
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    passwordChangeAttempts.set(userId, validAttempts);
    
    if (validAttempts.length >= maxAttempts) {
        return res.status(429).json({ 
            error: 'Çok fazla şifre değiştirme denemesi yapıldı. 15 dakika sonra tekrar deneyin.' 
        });
    }
    
    next();
};

// Test route - route'un çalışıp çalışmadığını kontrol et
router.get('/change-password-test', verifyToken, (req, res) => {
    res.json({ message: 'Change password route is working!' });
});

// ==================== ŞİFRE SIFIRLAMA ====================

// Rastgele şifre oluşturma fonksiyonu
function generateRandomPassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

// Şifre sıfırlama isteği
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'E-posta adresi zorunludur.' });
        }
        
        const pool = await poolPromise;
        
        // EmailSettings tablosundan e-posta kontrolü yap
        const emailResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT email_user FROM EmailSettings WHERE email_user = @email');
        
        if (emailResult.recordset.length === 0) {
            // E-posta EmailSettings tablosunda bulunamadı
            return res.status(404).json({ 
                error: 'Bu e-posta adresi sistemde kayıtlı değil. Lütfen doğru e-posta adresini girin.' 
            });
        }
        
        // EmailSettings'den e-posta bulundu, şimdi admin kullanıcısını bul
        // İlk admin kullanıcısını al (genellikle tek admin olur)
        const userResult = await pool.request()
            .query('SELECT TOP 1 id, username FROM Admins ORDER BY id');
        
        if (userResult.recordset.length === 0) {
            return res.status(500).json({ 
                error: 'Admin kullanıcısı bulunamadı.' 
            });
        }
        
        const user = userResult.recordset[0];
        
        // Yeni rastgele şifre oluştur
        const newPassword = generateRandomPassword(12);
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Şifreyi güncelle
        await pool.request()
            .input('id', sql.Int, user.id)
            .input('newPassword', sql.VarChar, hashedPassword)
            .query('UPDATE Admins SET password = @newPassword WHERE id = @id');
        
        // E-posta ayarlarını al (zaten yukarıda kontrol ettik)
        const emailSettingsResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM EmailSettings WHERE email_user = @email');
        
        const emailSettings = emailSettingsResult.recordset[0];
        const decryptedPassword = decryptEmailPassword(emailSettings.email_pass);
        
        // Nodemailer ile e-posta gönder
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailSettings.email_user,
                pass: decryptedPassword
            }
        });
        
        const mailOptions = {
            from: emailSettings.email_user,
            to: email, // Kullanıcının e-posta adresi
            subject: 'Hastugg Admin - Şifre Sıfırlama',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Hastugg Admin Panel</h2>
                    <h3 style="color: #374151;">Şifre Sıfırlama</h3>
                    
                    <p>Merhaba,</p>
                    
                    <p>Admin paneli şifreniz başarıyla sıfırlanmıştır. Yeni şifreniz aşağıda belirtilmiştir:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <strong style="color: #dc2626; font-size: 18px;">Yeni Şifre: ${newPassword}</strong>
                    </div>
                    
                    <p><strong>Güvenlik Uyarısı:</strong></p>
                    <ul style="color: #dc2626;">
                        <li>Bu şifreyi giriş yaptıktan sonra mutlaka değiştirin</li>
                        <li>Şifrenizi kimseyle paylaşmayın</li>
                        <li>Güvenli bir şifre oluşturun</li>
                    </ul>
                    
                    <p>Giriş yapmak için: <a href="http://localhost:3000/admin/login" style="color: #2563eb;">Admin Paneli</a></p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px;">
                        Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.<br>
                        Hastugg Admin Panel - ${new Date().toLocaleString('tr-TR')}
                    </p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ 
            message: 'Şifre sıfırlama e-postası başarıyla gönderildi. Lütfen e-posta kutunuzu kontrol edin.' 
        });
        
    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        res.status(500).json({ 
            error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.' 
        });
    }
});

// Admin şifresini değiştir (basit versiyon)
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        // Validasyon
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                error: 'Mevcut şifre, yeni şifre ve şifre onayı zorunludur.' 
            });
        }
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                error: 'Yeni şifre ve şifre onayı eşleşmiyor.' 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'Yeni şifre en az 6 karakter olmalıdır.' 
            });
        }
        
        if (currentPassword === newPassword) {
            return res.status(400).json({ 
                error: 'Yeni şifre mevcut şifre ile aynı olamaz.' 
            });
        }
        
        const pool = await poolPromise;
        
        // Token'dan kullanıcı bilgilerini al
        const userId = req.user.id;
        
        // Mevcut şifreyi kontrol et
        const userResult = await pool.request()
            .input('id', sql.Int, userId)
            .query('SELECT password FROM Admins WHERE id = @id');
        
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }
        
        const hashedCurrentPassword = userResult.recordset[0].password;
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, hashedCurrentPassword);
        
        if (!isCurrentPasswordValid) {
            // Başarısız denemeyi kaydet
            const attempts = passwordChangeAttempts.get(userId) || [];
            attempts.push(Date.now());
            passwordChangeAttempts.set(userId, attempts);
            
            return res.status(400).json({ error: 'Mevcut şifre yanlış.' });
        }
        
        // Yeni şifreyi hash'le
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Şifreyi güncelle
        await pool.request()
            .input('id', sql.Int, userId)
            .input('newPassword', sql.VarChar, hashedNewPassword)
            .query('UPDATE Admins SET password = @newPassword WHERE id = @id');
        
        // Başarılı işlem sonrası rate limiting kayıtlarını temizle
        passwordChangeAttempts.delete(userId);
        
        res.status(200).json({ 
            message: 'Şifre başarıyla değiştirildi. Güvenlik için tekrar giriş yapmanız gerekecektir.',
            requiresReauth: true
        });
        
    } catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        res.status(500).json({ error: 'Şifre değiştirilirken bir hata oluştu.' });
    }
});

module.exports = router;