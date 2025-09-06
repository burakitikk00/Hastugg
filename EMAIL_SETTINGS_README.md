# Email Ayarları Yönetimi (Güvenli & Basitleştirilmiş)

Bu özellik, admin panelinde Gmail email ayarlarını güvenli şekilde yönetmenizi sağlar. App Password'ler şifrelenerek saklanır!

## Kurulum

### 1. Database Tablosu Oluşturma

Önce `SERVER/scripts/create_email_settings_table.sql` dosyasını SQL Server'da çalıştırın:

```sql
-- EmailSettings tablosu oluştur (basitleştirilmiş)
CREATE TABLE EmailSettings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email_user NVARCHAR(255) NOT NULL,
    email_pass NVARCHAR(255) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Varsayılan email ayarları ekle (environment variables'dan)
INSERT INTO EmailSettings (email_user, email_pass, is_active)
VALUES (
    ISNULL('${EMAIL_USER}', 'your-email@gmail.com'),
    ISNULL('${EMAIL_PASS}', 'your-app-password'),
    1
);

-- EmailSettings tablosu için trigger oluştur (updated_at otomatik güncelleme için)
CREATE TRIGGER tr_EmailSettings_Update
ON EmailSettings
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE EmailSettings 
    SET updated_at = GETDATE()
    FROM EmailSettings es
    INNER JOIN inserted i ON es.id = i.id;
END;
```

### 2. Server'ı Yeniden Başlatın

Database tablosu oluşturulduktan sonra server'ı yeniden başlatın.

## Kullanım

### Admin Panelinde Email Ayarları

**İki farklı yoldan erişebilirsiniz:**

#### 1. Dashboard'dan (Önerilen)
1. Admin paneline giriş yapın
2. Ana dashboard'da "Email Ayarları" sekmesine tıklayın
3. Gmail bilgilerinizi girin ve test edin

#### 2. Ayrı Sayfadan
1. Admin paneline giriş yapın
2. Sol menüden "Email Ayarları" seçeneğine tıklayın
3. Gmail bilgilerinizi girin:
   - **Gmail Adresi**: Gmail adresiniz (örn: your-email@gmail.com)
   - **App Password**: Gmail App Password (16 haneli şifre)

### Gmail App Password Nasıl Oluşturulur?

1. Google hesabınıza giriş yapın
2. Hesap güvenliği bölümüne gidin
3. 2-Factor Authentication (2FA) aktif edin
4. "App passwords" bölümüne gidin
5. Yeni bir App Password oluşturun
6. Oluşturulan 16 haneli şifreyi buraya girin

### Test Etme

1. Email ayarlarınızı girdikten sonra "Test Et" butonuna tıklayın
2. Sistem ayarları kaydedecek ve test e-postası gönderecektir
3. Test e-postası kendi email adresinize gönderilecektir
4. E-posta gelirse ayarlarınız doğru çalışıyor demektir

## Güvenlik

✅ **Güvenlik Özellikleri**:

1. **Şifreleme**: App Password'ler AES-256-CBC ile şifrelenerek saklanır
2. **App Password**: Normal şifre yerine Gmail App Password kullanılır
3. **Güvenli Saklama**: Database'de şifrelenmiş olarak saklanır
4. **Otomatik Şifre Çözme**: Email gönderirken otomatik olarak şifre çözülür

⚠️ **Güvenlik Önerileri**:

1. **Veritabanı Erişimi**: Veritabanı erişimini sınırlayın
2. **Düzenli Değişim**: Düzenli olarak App Password'lerinizi değiştirin
3. **SSL/TLS**: Üretim ortamında SSL/TLS kullanın
4. **Şifreleme Anahtarı**: Production'da şifreleme anahtarını environment variable'dan alın

## API Endpoints

### GET /api/admin/email-settings
Mevcut email ayarlarını getirir.

### POST /api/admin/email-settings
Email ayarlarını kaydeder/günceller.

**Request Body**:
```json
{
  "email_user": "your-email@gmail.com",
  "email_pass": "your-app-password"
}
```

### POST /api/admin/email-settings/test
Email ayarlarını test eder.

## Database Odaklı Sistem

Sistem artık tamamen database odaklı çalışır:

1. **Tek Kaynak**: Sadece database'den email ayarları alınır
2. **Güvenlik**: App Password'ler şifrelenerek saklanır
3. **Hata Yönetimi**: Email ayarları yoksa kullanıcıya net hata mesajı verilir
4. **Admin Paneli**: Tüm email ayarları admin panelinden yönetilir

Bu sayede daha güvenli ve merkezi bir email yönetim sistemi elde edilir.

## Sorun Giderme

### Test E-postası Gelmiyor
1. Gmail adresinizi ve App Password'ü kontrol edin
2. App Password'ün doğru olduğundan emin olun
3. 2FA'nın aktif olduğunu kontrol edin
4. Gmail hesabınızın güvenlik ayarlarını kontrol edin

### "Email ayarları bulunamadı" Hatası
1. Admin paneline giriş yapın
2. Dashboard'dan veya sol menüden "Email Ayarları" seçin
3. Gmail adresinizi ve App Password'ü girin
4. "Kaydet" butonuna tıklayın

### "EmailSettings tablosu bulunamadı" Hatası
1. SQL script'ini çalıştırdığınızdan emin olun
2. Database bağlantısını kontrol edin
3. Server'ı yeniden başlatın

### "Email ayarları geçersiz" Hatası
1. Admin panelinden email ayarlarınızı yeniden girin
2. App Password'ün doğru olduğundan emin olun
3. "Test Et" butonuna tıklayarak doğrulayın

### "Test e-postası gönderilemedi" Hatası
1. Gmail adresinizi ve App Password'ü kontrol edin
2. İnternet bağlantınızı kontrol edin
3. Firewall ayarlarını kontrol edin
4. Gmail'in SMTP erişimine izin verdiğinden emin olun
