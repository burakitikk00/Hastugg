const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require('./dbConfig');
const nodemailer = require('nodemailer');


// Hero verilerini getir (herkes erişebilir)
router.get('/hero', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Hero');
        res.status(200).json(result.recordset);
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

        // E-posta transporter oluştur (Gmail için örnek)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com', // Gmail adresiniz
                pass: process.env.EMAIL_PASS || 'your-app-password' // Gmail uygulama şifresi
            }
        });

        // E-posta içeriği
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: process.env.EMAIL_USER || 'your-email@gmail.com', // Kendi e-posta adresiniz
            subject: `Yeni İletişim Formu - ${firstName} ${lastName}`,
            html: `
                <h2>Yeni İletişim Formu Mesajı</h2>
                <p><strong>Ad Soyad:</strong> ${firstName} ${lastName}</p>
                <p><strong>E-posta:</strong> ${email}</p>
                <p><strong>Telefon:</strong> ${phone}</p>
                <p><strong>Mesaj:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>Bu mesaj web sitenizin iletişim formundan gönderilmiştir.</em></p>
            `
        };

        // E-postayı gönder
        await transporter.sendMail(mailOptions);

        // Başarılı yanıt
        res.status(200).json({ message: 'Mesajınız başarıyla gönderildi' });

    } catch (error) {
        console.error('E-posta gönderme hatası:', error);
        res.status(500).json({ error: 'Mesaj gönderilirken bir hata oluştu' });
    }
});

// E-posta ayarlarını test etmek için endpoint
router.get('/test-email', async (req, res) => {
    try {
        // E-posta transporter oluştur
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });

        // Test e-postası gönder
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: process.env.EMAIL_USER || 'your-email@gmail.com',
            subject: 'E-posta Ayarları Test',
            html: `
                <h2>E-posta Ayarları Başarılı!</h2>
                <p>Bu bir test e-postasıdır. E-posta ayarlarınız doğru çalışıyor.</p>
                <p><strong>Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Test e-postası başarıyla gönderildi' });

    } catch (error) {
        console.error('Test e-postası hatası:', error);
        res.status(500).json({ 
            error: 'Test e-postası gönderilemedi',
            details: error.message 
        });
    }
});

module.exports = router;
