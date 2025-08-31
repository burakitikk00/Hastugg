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
            console.log('UPDATE sorgusu çalıştırılıyor, targetId:', targetId);
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
            console.log('UPDATE sorgusu başarıyla tamamlandı');
        } else {
            console.log('INSERT sorgusu çalıştırılıyor');
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
            console.log('INSERT sorgusu başarıyla tamamlandı');
        }

        await transaction.commit();
        console.log('Transaction commit edildi');
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
        console.log('Team verileri getirme isteği alındı');
        const pool = await poolPromise;
        
        // Önce Team tablosunun var olup olmadığını kontrol et
        const tableCheck = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'Team'
        `);
        
        if (tableCheck.recordset.length === 0) {
            console.log('Team tablosu bulunamadı!');
            return res.status(404).json({ message: 'Team tablosu bulunamadı. Lütfen önce tabloyu oluşturun.' });
        }
        
        console.log('Team tablosu bulundu, veriler getiriliyor...');
        const result = await pool.request().query('SELECT id, namesurname, position, url, LinkedIn FROM Team ORDER BY id');
        console.log('Team verileri başarıyla getirildi:', result.recordset.length, 'kayıt');
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
        console.log('Team üyesi ekleme isteği alındı');
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        const { namesurname, position, LinkedIn } = req.body;
        const uploadedFile = req.file;

        if (!namesurname || !position) {
            console.log('Validasyon hatası: namesurname veya position eksik');
            return res.status(400).json({ message: 'namesurname ve position zorunludur.' });
        }

        console.log('Veritabanı bağlantısı kuruluyor...');
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        let imageURL = null;
        if (uploadedFile) {
            imageURL = `/uploads/${uploadedFile.filename}`;
            console.log('Resim URL oluşturuldu:', imageURL);
        }

        console.log('Team üyesi veritabanına ekleniyor...');
        // Team üyesini ekle
        await new sql.Request(transaction)
            .input('namesurname', sql.NVarChar, namesurname)
            .input('position', sql.NVarChar, position)
            .input('url', sql.NVarChar(sql.MAX), imageURL)
            .input('LinkedIn', sql.NVarChar, LinkedIn || null)
            .query('INSERT INTO Team (namesurname, position, url, LinkedIn) VALUES (@namesurname, @position, @url, @LinkedIn)');

        console.log('Transaction commit ediliyor...');
        await transaction.commit();

        console.log('Team üyesi başarıyla eklendi');
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

module.exports = router;