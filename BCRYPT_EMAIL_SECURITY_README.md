# Email Şifre Güvenliği - bcrypt Implementasyonu

Bu güncelleme ile email şifreleriniz artık bcrypt ile hash'lenerek güvenli bir şekilde saklanmaktadır.

## 🔐 Güvenlik Özellikleri

### 1. Email Şifre Hashleme
- Email şifreleri artık bcrypt ile hash'lenerek saklanır
- Salt rounds: 10 (güvenlik ve performans dengesi)
- Hash'lenmiş şifreler geri çözülemez

### 2. Şifre Doğrulama
- Email test ederken şifre doğrulaması yapılır
- bcrypt.compare() ile güvenli karşılaştırma
- Yanlış şifre girişlerinde hata mesajı

### 3. Güvenli Email Gönderimi
- Public routes'da email gönderimi kaldırıldı
- Email gönderimi sadece admin panelinden yapılır
- Contact mesajları önce veritabanına kaydedilir

## 📋 Kurulum Adımları

### 1. Veritabanı Tablolarını Oluşturun

```sql
-- ContactMessages tablosu oluştur
CREATE TABLE ContactMessages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    is_read BIT DEFAULT 0,
    is_sent BIT DEFAULT 0
);

-- Index'ler ekle
CREATE INDEX IX_ContactMessages_CreatedAt ON ContactMessages(created_at);
CREATE INDEX IX_ContactMessages_IsRead ON ContactMessages(is_read);
CREATE INDEX IX_ContactMessages_IsSent ON ContactMessages(is_sent);
```

### 2. Mevcut Email Ayarlarını Güncelleyin

Eğer daha önce email ayarları kaydetmişseniz, admin panelinden tekrar kaydetmeniz gerekiyor çünkü şifreler artık hash'lenerek saklanacak.

## 🚀 Kullanım

### Admin Panelinde Email Ayarları

1. **Email Ayarları Sayfasına Gidin**
   - Admin panelinde "Email Ayarları" bölümüne gidin

2. **Gmail Bilgilerini Girin**
   - Gmail adresinizi girin
   - Gmail App Password'ünüzü girin

3. **Test Edin**
   - "Test Et" butonuna tıklayın
   - Şifrenizi tekrar girmeniz istenecek
   - Test e-postası gönderilecek

4. **Kaydedin**
   - Test başarılıysa "Kaydet" butonuna tıklayın
   - Şifre hash'lenerek veritabanına kaydedilecek

### Contact Mesajları Yönetimi

1. **Mesajları Görüntüleyin**
   - Admin panelinde contact mesajları listelenir
   - Okunmamış mesajlar öne çıkar

2. **Email Gönderin**
   - Mesajı seçin
   - "Email Gönder" butonuna tıklayın
   - Email şifrenizi girin
   - Mesaj e-posta olarak gönderilir

3. **Mesajları Yönetin**
   - Okundu olarak işaretleyin
   - Gereksiz mesajları silin

## 🔧 Teknik Detaylar

### Server Tarafı Değişiklikler

1. **adminRoutes.js**
   - Email şifreleri bcrypt ile hash'lenir
   - Test fonksiyonu şifre doğrulaması yapar
   - Contact messages CRUD operasyonları eklendi

2. **publicRoutes.js**
   - Email gönderimi kaldırıldı
   - Contact mesajları veritabanına kaydedilir

3. **Yeni Endpoint'ler**
   - `GET /admin/contact-messages` - Mesajları listele
   - `PUT /admin/contact-messages/:id/read` - Okundu işaretle
   - `POST /admin/contact-messages/:id/send-email` - Email gönder
   - `DELETE /admin/contact-messages/:id` - Mesaj sil

### Client Tarafı Değişiklikler

1. **adminService.js**
   - Test fonksiyonu şifre parametresi alır
   - Contact messages fonksiyonları eklendi

2. **DashboardEmailSettings.jsx**
   - Test fonksiyonu güncellendi
   - Şifre doğrulaması eklendi

## 🛡️ Güvenlik Avantajları

1. **Şifre Güvenliği**
   - Email şifreleri hash'lenerek saklanır
   - Veritabanı ele geçirilse bile şifreler okunamaz

2. **Erişim Kontrolü**
   - Email gönderimi sadece admin panelinden yapılır
   - Her email gönderiminde şifre doğrulaması

3. **Audit Trail**
   - Tüm contact mesajları kaydedilir
   - Hangi mesajların gönderildiği takip edilir

## ⚠️ Önemli Notlar

1. **Gmail App Password**
   - Gmail hesabınızda 2FA aktif olmalı
   - App Password oluşturmanız gerekiyor
   - Normal Gmail şifrenizi kullanamazsınız

2. **Veritabanı Yedekleme**
   - Hash'lenmiş şifreler geri çözülemez
   - Email şifrenizi güvenli bir yerde saklayın

3. **Test Etme**
   - Her değişiklikten sonra email test edin
   - Şifre doğrulaması çalışıyor mu kontrol edin

## 🔍 Sorun Giderme

### Email Test Edilemiyor
- Gmail App Password doğru mu kontrol edin
- 2FA aktif mi kontrol edin
- Şifre hash'leme çalışıyor mu kontrol edin

### Contact Mesajları Görünmüyor
- ContactMessages tablosu oluşturuldu mu kontrol edin
- Veritabanı bağlantısı çalışıyor mu kontrol edin

### Email Gönderilemiyor
- Email ayarları kaydedildi mi kontrol edin
- Şifre doğrulaması başarılı mı kontrol edin
- Gmail SMTP ayarları doğru mu kontrol edin

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Veritabanı bağlantısını test edin
3. Email ayarlarını yeniden yapılandırın
