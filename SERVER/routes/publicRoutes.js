const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require('./dbConfig');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email şifreleme/çözme fonksiyonları (adminRoutes.js ile aynı)
const ENCRYPTION_KEY = crypto.scryptSync('hastugg_email_encryption_key_2024', 'salt', 32);
const IV_LENGTH = 16;

function decryptEmailPassword(encryptedText) {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Otomatik email gönderme fonksiyonu
async function sendContactEmail(message) {
    try {
        const pool = await poolPromise;
        
        // Email ayarlarını al
        const emailResult = await pool.request().query('SELECT TOP 1 * FROM EmailSettings ORDER BY id');
        
        if (emailResult.recordset.length === 0) {
            console.log('Email ayarları bulunamadı, otomatik email gönderilemedi');
            return false;
        }
        
        const emailSettings = emailResult.recordset[0];
        
        // Şifrelenmiş şifreyi çöz
        const decryptedPassword = decryptEmailPassword(emailSettings.email_pass);
        
        // Nodemailer transporter oluştur
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailSettings.email_user,
                pass: decryptedPassword
            }
        });

        // E-posta içeriği
        const mailOptions = {
            from: emailSettings.email_user,
            to: emailSettings.email_user, // Admin'e gönder
            subject: `Yeni İletişim Formu - ${message.first_name} ${message.last_name}`,
            html: `
                <h2>Yeni İletişim Formu Mesajı</h2>
                <p><strong>Ad Soyad:</strong> ${message.first_name} ${message.last_name}</p>
                <p><strong>E-posta:</strong> ${message.email}</p>
                <p><strong>Telefon:</strong> ${message.phone}</p>
                <p><strong>Mesaj:</strong></p>
                <p>${message.message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>Bu mesaj web sitenizin iletişim formundan otomatik olarak gönderilmiştir.</em></p>
                <p><strong>Gönderim Zamanı:</strong> ${new Date(message.created_at).toLocaleString('tr-TR')}</p>
            `
        };

        // E-postayı gönder
        await transporter.sendMail(mailOptions);
        console.log('Otomatik email başarıyla gönderildi:', message.email);
        return true;
        
    } catch (error) {
        console.error('Otomatik email gönderme hatası:', error);
        return false;
    }
}


// Hero verilerini getir (herkes erişebilir)
router.get('/hero', async (req, res) => {
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

// About verilerini getir (herkes erişebilir)
router.get('/about', async (req, res) => {
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

// Contact bilgilerini getir (herkes erişebilir)
router.get('/contact', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Contact');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Projeleri getir (herkes erişebilir)
router.get('/projects', async (req, res) => {
    try {
        const pool = await poolPromise;

        // Projeleri ve görselleri ayrı ayrı çekiyoruz ve sunucu tarafında birleştiriyoruz
        const projectsResult = await pool.request().query('SELECT * FROM Projects');
        const imagesResult = await pool.request().query('SELECT * FROM Images');
        const servicesResult = await pool.request().query('SELECT id, service, description, url FROM Services');

        const projectIdToImages = new Map();
        for (const img of imagesResult.recordset) {
            if (!projectIdToImages.has(img.projectid)) projectIdToImages.set(img.projectid, []);
            projectIdToImages.get(img.projectid).push(img.imageURL);
        }

        const serviceIdToService = new Map();
        for (const s of servicesResult.recordset) {
            serviceIdToService.set(s.id, s);
        }

        const combined = projectsResult.recordset.map(p => ({
            ...p,
            images: projectIdToImages.get(p.id) || [],
            service: serviceIdToService.get(p.service_id) || null
        }));

        res.status(200).json(combined);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Hizmetleri getir (herkes erişebilir)
router.get('/services', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, service, description, url FROM Services');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// Team üyelerini getir (herkes erişebilir)
router.get('/team', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, namesurname, position, url, LinkedIn FROM Team ORDER BY id');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
});

// İletişim formu gönderimi
router.post('/contact', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, message } = req.body;

        // Form validasyonu
        if (!firstName || !lastName || !email || !phone || !message) {
            return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
        }

        // E-posta validasyonu
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz' });
        }

        // Database'e mesajı kaydet
        const { sql, poolPromise } = require('./dbConfig');
        const pool = await poolPromise;
        
        try {
            // ContactMessages tablosuna kaydet
            const insertResult = await pool.request()
                .input('firstName', sql.NVarChar, firstName)
                .input('lastName', sql.NVarChar, lastName)
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .input('message', sql.NVarChar, message)
                .query('INSERT INTO ContactMessages (first_name, last_name, email, phone, message) VALUES (@firstName, @lastName, @email, @phone, @message); SELECT SCOPE_IDENTITY() as id;');

            // Kaydedilen mesajın ID'sini al
            const messageId = insertResult.recordset[0].id;
            
            // Mesajı tekrar al (created_at ile birlikte)
            const messageResult = await pool.request()
                .input('id', sql.Int, messageId)
                .query('SELECT * FROM ContactMessages WHERE id = @id');
            
            const savedMessage = messageResult.recordset[0];
            
            // Otomatik email gönder (asenkron, hata olsa bile devam et)
            sendContactEmail(savedMessage).then(emailSent => {
                if (emailSent) {
                    // Email gönderildi olarak işaretle
                    pool.request()
                        .input('id', sql.Int, messageId)
                        .query('UPDATE ContactMessages SET is_sent = 1 WHERE id = @id')
                        .catch(err => console.error('Email gönderildi işaretleme hatası:', err));
                }
            }).catch(err => console.error('Otomatik email gönderme hatası:', err));

            // Başarılı yanıt
            res.status(200).json({ message: 'Mesajınız başarıyla kaydedildi. En kısa sürede size dönüş yapacağız.' });

        } catch (dbError) {
            console.error('Veritabanı hatası:', dbError);
            // Eğer ContactMessages tablosu yoksa, eski yöntemi kullan
            if (dbError.message.includes('ContactMessages')) {
                return res.status(500).json({ 
                    error: 'Mesaj sistemi henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin.' 
                });
            }
            throw dbError;
        }

    } catch (error) {
        console.error('Mesaj kaydetme hatası:', error);
        res.status(500).json({ error: 'Mesaj kaydedilirken bir hata oluştu' });
    }
});

// Public test endpoint kaldırıldı - güvenlik için
// Email test işlemi sadece admin panelinden yapılabilir

// ==================== GOOGLE ANALYTICS AYARLARI (PUBLIC) ====================

// Analytics ayarlarını getir (public - frontend için)
router.get('/analytics-settings', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 1 measurement_id, is_active 
            FROM analytics_settings 
            WHERE is_active = 1
            ORDER BY created_at DESC
        `);
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            // Analytics aktif değilse boş döndür
            res.json({
                measurement_id: null,
                is_active: false
            });
        }
    } catch (error) {
        console.error('Analytics ayarları getirme hatası:', error);
        res.json({
            measurement_id: null,
            is_active: false
        });
    }
});

module.exports = router;
