# E-posta Ayarları Kurulum Rehberi

Bu rehber, iletişim formundan gelen mesajların e-posta olarak gönderilmesi için gerekli ayarları açıklar.

## 1. Gmail Hesabı Ayarları

### Gmail'de 2 Adımlı Doğrulama Aktifleştirin
1. Gmail hesabınıza giriş yapın
2. Google Hesabı ayarlarına gidin
3. "Güvenlik" sekmesine tıklayın
4. "2 Adımlı Doğrulama"yı aktifleştirin

### Uygulama Şifresi Oluşturun
1. Google Hesabı ayarlarında "Güvenlik" sekmesine gidin
2. "2 Adımlı Doğrulama" altında "Uygulama şifreleri"ne tıklayın
3. "Uygulama seç" dropdown'undan "Diğer"i seçin
4. Bir isim verin (örn: "Web Sitesi")
5. "Oluştur" butonuna tıklayın
6. Size verilen 16 haneli şifreyi not alın

## 2. Environment Variables Ayarları

SERVER klasöründe `.env` dosyası oluşturun ve aşağıdaki bilgileri ekleyin:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

**Önemli:** 
- `EMAIL_USER`: Gmail adresinizi yazın
- `EMAIL_PASS`: Yukarıda oluşturduğunuz 16 haneli uygulama şifresini yazın
- Normal Gmail şifrenizi değil, uygulama şifresini kullanın

## 3. Paket Kurulumu

SERVER klasöründe aşağıdaki komutu çalıştırın:

```bash
npm install
```

## 4. Test Etme

1. Server'ı başlatın: `npm start`
2. Web sitesindeki iletişim formunu doldurun
3. Formu gönderin
4. Gmail'inizde yeni mesajı kontrol edin

## Sorun Giderme

### "Invalid login" hatası alırsanız:
- 2 adımlı doğrulamanın aktif olduğundan emin olun
- Uygulama şifresinin doğru olduğundan emin olun
- Gmail adresinin doğru olduğundan emin olun

### "Less secure app access" hatası alırsanız:
- Bu özellik artık desteklenmiyor
- Mutlaka uygulama şifresi kullanın

### E-posta gelmiyorsa:
- Spam klasörünü kontrol edin
- Console'da hata mesajlarını kontrol edin
- Server'ın çalıştığından emin olun

## Güvenlik Notları

- `.env` dosyasını asla GitHub'a push etmeyin
- `.gitignore` dosyasına `.env` ekleyin
- Uygulama şifrenizi kimseyle paylaşmayın
- Düzenli olarak uygulama şifrelerini yenileyin
