const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const nodemailer = require('nodemailer');
const { pool } = require('../dbConfig');
const verifyToken = require('../middleware/authMiddleware');
const { decrypt } = require('./emailSettings');

// Helper: Nodemailer transporter oluştur
async function getEmailTransporter() {
    const emailResult = await pool.query('SELECT * FROM "EmailSettings" ORDER BY id LIMIT 1');
    if (emailResult.rowCount === 0) {
        throw new Error('Email ayarları bulunamadı. Lütfen Ayarlar > E-posta Ayarları bölümünden yapılandırın.');
    }
    const emailSettings = emailResult.rows[0];
    const decryptedPassword = decrypt(emailSettings.email_pass);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailSettings.email_user, pass: decryptedPassword }
    });

    return { transporter, senderEmail: emailSettings.email_user };
}

// İstatistikler (Aktif, Okunmamış, E-posta İletilmiş, Pasif)
router.get('/contact-messages/stats', verifyToken, async (_req, res) => {
    try {
        const stats = await pool.query(
            `SELECT 
                COUNT(*) FILTER (WHERE is_active = true) AS total,
                COUNT(*) FILTER (WHERE is_active = true AND is_read = false) AS unread,
                COUNT(*) FILTER (WHERE is_active = true AND is_sent = true) AS sent,
                COUNT(*) FILTER (WHERE is_active = false) AS passive
             FROM "ContactMessages"`
        );
        const { total, unread, sent, passive } = stats.rows[0];
        res.status(200).json({
            total: Number(total || 0),
            unread: Number(unread || 0),
            sent: Number(sent || 0),
            passive: Number(passive || 0)
        });
    } catch (error) {
        logger.error('Contact mesajları istatistik hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Liste + sayfalama
router.get('/contact-messages', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filter = req.query.filter || 'all';
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE is_active = true';
        if (filter === 'unread') {
            whereClause = 'WHERE is_active = true AND is_read = false';
        } else if (filter === 'sent') {
            whereClause = 'WHERE is_active = true AND is_sent = true';
        } else if (filter === 'passive' || filter === 'trash') {
            whereClause = 'WHERE is_active = false';
        }

        const countResult = await pool.query(`SELECT COUNT(*) FROM "ContactMessages" ${whereClause}`);
        const total = Number(countResult.rows[0].count || 0);

        const result = await pool.query(
            `SELECT id, first_name, last_name, email, phone, message, created_at, is_read, is_sent, is_active
             FROM "ContactMessages"
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const totalPages = Math.ceil(total / limit) || 1;
        res.status(200).json({
            messages: result.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        logger.error('Contact mesajları list hata:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Tekil Okundu işaretle
router.put('/contact-messages/:id/read', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE "ContactMessages" SET is_read = true WHERE id = $1', [id]);
        res.status(200).json({ message: 'Mesaj okundu olarak işaretlendi' });
    } catch (error) {
        logger.error('Mesaj okundu hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Toplu Okundu işaretle
router.post('/contact-messages/bulk-read', verifyToken, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'İşlem yapılacak mesaj seçilmedi.' });
        }
        await pool.query('UPDATE "ContactMessages" SET is_read = true WHERE id = ANY($1::int[])', [ids]);
        res.status(200).json({ message: `${ids.length} mesaj okundu olarak işaretlendi.` });
    } catch (error) {
        logger.error('Toplu okundu işaretleme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Tekil E-posta gönder (Sistem bildirimi veya kullanıcıya doğrudan yanıt)
router.post('/contact-messages/:id/send-email', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, content, target } = req.body || {};

        const msgResult = await pool.query('SELECT * FROM "ContactMessages" WHERE id = $1', [id]);
        if (msgResult.rowCount === 0) {
            return res.status(404).json({ message: 'Mesaj bulunamadı' });
        }
        const message = msgResult.rows[0];

        const { transporter, senderEmail } = await getEmailTransporter();

        if (target === 'recipient' && content) {
            // Kullanıcıya doğrudan yanıt e-postası
            await transporter.sendMail({
                from: `"Hastuğ İnşaat" <${senderEmail}>`,
                to: message.email,
                subject: subject || 'Hastuğ İnşaat - İletişim Formu Talebiniz Hk.',
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Hastuğ İnşaat & Gayrimenkul</h2>
                        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Sayın <strong>${message.first_name} ${message.last_name}</strong>,</p>
                        <div style="white-space: pre-wrap; line-height: 1.7; color: #1e293b; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px; margin: 16px 0;">${content}</div>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                        <p style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Bu e-posta, iletmiş olduğunuz iletişim formu mesajınıza istinaden gönderilmiştir.</p>
                        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Hastuğ İnşaat Yönetim Sistemi</p>
                    </div>
                `
            });
        } else {
            // Standart sistem bildirimi (admin gelen kutusuna)
            await transporter.sendMail({
                from: senderEmail,
                to: senderEmail,
                subject: `İletişim Formu Bildirimi - ${message.first_name} ${message.last_name}`,
                html: `
                    <h2>İletişim Formu Talebi</h2>
                    <p><strong>Ad Soyad:</strong> ${message.first_name} ${message.last_name}</p>
                    <p><strong>E-posta:</strong> ${message.email}</p>
                    <p><strong>Telefon:</strong> ${message.phone || '-'}</p>
                    <p><strong>Mesaj:</strong></p>
                    <p>${(message.message || '').replace(/\n/g, '<br>')}</p>
                    <hr>
                    <p><em>Gönderim Zamanı: ${new Date(message.created_at).toLocaleString('tr-TR')}</em></p>
                `
            });
        }

        await pool.query('UPDATE "ContactMessages" SET is_sent = true WHERE id = $1', [id]);
        res.status(200).json({ message: 'E-posta başarıyla iletildi' });
    } catch (error) {
        logger.error('E-posta gönderme hatası:', error);
        res.status(500).json({ error: 'E-posta gönderilemedi', details: error.message });
    }
});

// Toplu E-posta gönder (Kullanıcılara toplu e-posta veya sistem bildirimini toplu tetikleme)
router.post('/contact-messages/bulk-email', verifyToken, async (req, res) => {
    try {
        const { ids, subject, content, target = 'recipient' } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Lütfen en az bir mesaj seçiniz.' });
        }

        const msgResult = await pool.query('SELECT * FROM "ContactMessages" WHERE id = ANY($1::int[])', [ids]);
        const messages = msgResult.rows;
        if (messages.length === 0) {
            return res.status(404).json({ error: 'Seçilen mesajlar bulunamadı.' });
        }

        const { transporter, senderEmail } = await getEmailTransporter();

        let successCount = 0;
        let errors = [];

        for (const msg of messages) {
            try {
                if (target === 'recipient') {
                    await transporter.sendMail({
                        from: `"Hastuğ İnşaat" <${senderEmail}>`,
                        to: msg.email,
                        subject: subject || 'Hastuğ İnşaat - İletişim Formu Talebiniz Hk.',
                        html: `
                            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                                <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Hastuğ İnşaat & Gayrimenkul</h2>
                                <p style="color: #334155; font-size: 14px; line-height: 1.6;">Sayın <strong>${msg.first_name} ${msg.last_name}</strong>,</p>
                                <div style="white-space: pre-wrap; line-height: 1.7; color: #1e293b; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px; margin: 16px 0;">${content || 'İletişim talebiniz tarafımıza ulaşmıştır. En kısa sürede yetkililerimiz sizinle irtibata geçecektir.'}</div>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                                <p style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Bu e-posta, iletmiş olduğunuz iletişim formu mesajınıza istinaden gönderilmiştir.</p>
                                <p style="font-size: 12px; color: #94a3b8; margin: 0;">Hastuğ İnşaat Yönetim Sistemi</p>
                            </div>
                        `
                    });
                } else {
                    await transporter.sendMail({
                        from: senderEmail,
                        to: senderEmail,
                        subject: `İletişim Formu Bildirimi - ${msg.first_name} ${msg.last_name}`,
                        html: `
                            <h2>İletişim Formu Talebi</h2>
                            <p><strong>Ad Soyad:</strong> ${msg.first_name} ${msg.last_name}</p>
                            <p><strong>E-posta:</strong> ${msg.email}</p>
                            <p><strong>Telefon:</strong> ${msg.phone || '-'}</p>
                            <p><strong>Mesaj:</strong></p>
                            <p>${(msg.message || '').replace(/\n/g, '<br>')}</p>
                            <hr>
                            <p><em>Gönderim Zamanı: ${new Date(msg.created_at).toLocaleString('tr-TR')}</em></p>
                        `
                    });
                }

                await pool.query('UPDATE "ContactMessages" SET is_sent = true WHERE id = $1', [msg.id]);
                successCount++;
            } catch (err) {
                logger.error(`Mesaj ID ${msg.id} email hatası:`, err);
                errors.push(`${msg.email}: ${err.message}`);
            }
        }

        res.status(200).json({
            message: `${successCount} adet e-posta başarıyla iletildi.${errors.length > 0 ? ` (${errors.length} başarısız)` : ''}`,
            successCount,
            failedCount: errors.length
        });
    } catch (error) {
        logger.error('Toplu e-posta gönderme hatası:', error);
        res.status(500).json({ error: error.message || 'E-postalar gönderilemedi' });
    }
});

// Tekil Silme (Soft-delete / pasife alma)
router.delete('/contact-messages/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const permanent = req.query.permanent === 'true';

        if (permanent) {
            await pool.query('DELETE FROM "ContactMessages" WHERE id = $1', [id]);
            return res.status(200).json({ message: 'Mesaj kalıcı olarak silindi' });
        }

        // Soft-delete: pasife al
        await pool.query('UPDATE "ContactMessages" SET is_active = false WHERE id = $1', [id]);
        res.status(200).json({ message: 'Mesaj pasife alındı' });
    } catch (error) {
        logger.error('Mesaj silme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Tekil Geri Yükle (Yeniden aktif yap)
router.put('/contact-messages/:id/restore', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE "ContactMessages" SET is_active = true WHERE id = $1', [id]);
        res.status(200).json({ message: 'Mesaj yeniden aktif edildi' });
    } catch (error) {
        logger.error('Mesaj aktif etme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Toplu Pasife Al (Silme)
router.post('/contact-messages/bulk-delete', verifyToken, async (req, res) => {
    try {
        const { ids, permanent } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'İşlem yapılacak mesaj seçilmedi.' });
        }

        if (permanent) {
            await pool.query('DELETE FROM "ContactMessages" WHERE id = ANY($1::int[])', [ids]);
            return res.status(200).json({ message: `${ids.length} mesaj kalıcı olarak silindi.` });
        }

        // Soft delete: is_active = false
        await pool.query('UPDATE "ContactMessages" SET is_active = false WHERE id = ANY($1::int[])', [ids]);
        res.status(200).json({ message: `${ids.length} mesaj pasife alındı.` });
    } catch (error) {
        logger.error('Toplu pasife alma hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Toplu Yeniden Aktif Et
router.post('/contact-messages/bulk-restore', verifyToken, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'İşlem yapılacak mesaj seçilmedi.' });
        }

        await pool.query('UPDATE "ContactMessages" SET is_active = true WHERE id = ANY($1::int[])', [ids]);
        res.status(200).json({ message: `${ids.length} mesaj yeniden aktif edildi.` });
    } catch (error) {
        logger.error('Toplu aktif etme hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;
