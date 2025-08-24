# Hastugg Admin Paneli

Bu proje, Hastugg inşaat şirketi için geliştirilmiş admin yönetim panelidir.

## Özellikler

- 🔐 Güvenli admin girişi
- 📊 Dashboard ile genel bakış
- 🏗️ Proje yönetimi
- ⚡ Hizmet yönetimi
- 📞 İletişim bilgileri yönetimi
- 🖼️ Görsel yükleme ve yönetimi
- 🛡️ JWT token tabanlı kimlik doğrulama

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Kullanım

### Admin Girişi
- URL: `/admin/login`
- Mevcut API endpoint: `POST /api/admin/login`
- Kullanıcı adı ve şifre ile giriş yapın

### Admin Dashboard
- URL: `/admin/dashboard`
- Genel istatistikler ve hızlı işlemler
- Proje, hizmet ve görsel sayıları

### Güvenlik
- JWT token tabanlı kimlik doğrulama
- Korumalı rotalar
- Otomatik token yenileme
- Güvenli çıkış işlemi

## Dosya Yapısı

```
src/
├── components/
│   └── admin/
│       ├── LoginForm.jsx          # Giriş formu
│       ├── AdminLayout.jsx        # Admin panel düzeni
│       └── ProtectedRoute.jsx     # Korumalı rota bileşeni
├── contexts/
│   └── AuthContext.jsx            # Kimlik doğrulama context'i
├── pages/
│   └── admin/
│       ├── AdminLogin.jsx         # Giriş sayfası
│       └── AdminDashboard.jsx     # Dashboard sayfası
├── services/
│   └── adminService.js            # Admin API servisleri
├── App.jsx                        # Ana uygulama (routing)
└── MainApp.jsx                    # Ana site bileşenleri
```

## API Endpoints

### Kimlik Doğrulama
- `POST /api/admin/login` - Admin girişi
- `POST /api/admin/register` - Admin kaydı

### Projeler
- `GET /api/admin/get-projects` - Projeleri listele
- `POST /api/admin/add-project` - Yeni proje ekle
- `PUT /api/admin/projects/:id` - Proje güncelle
- `DELETE /api/admin/projects/:id` - Proje sil

### Hizmetler
- `GET /api/admin/services` - Hizmetleri listele
- `POST /api/admin/add-services` - Yeni hizmet ekle
- `PUT /api/admin/services/:id` - Hizmet güncelle
- `DELETE /api/admin/services/:id` - Hizmet sil

### İletişim
- `GET /api/admin/contact` - İletişim bilgilerini getir
- `PUT /api/admin/contact` - İletişim bilgilerini güncelle

### Görseller
- `POST /api/admin/upload-image` - Görsel yükle
- `DELETE /api/admin/delete-image` - Görsel sil
- `POST /api/admin/cleanup-images` - Kullanılmayan görselleri temizle

## Güvenlik Özellikleri

1. **JWT Token**: Güvenli token tabanlı kimlik doğrulama
2. **Protected Routes**: Yetkisiz erişimi engelleyen korumalı rotalar
3. **Token Expiration**: Token'lar 1 saat sonra geçersiz olur
4. **Secure Headers**: Authorization header ile güvenli API çağrıları
5. **Automatic Logout**: Geçersiz token durumunda otomatik çıkış

## Geliştirme

### Yeni Admin Sayfası Ekleme
1. `src/pages/admin/` klasörüne yeni sayfa bileşeni ekleyin
2. `src/components/admin/` klasörüne gerekli bileşenleri ekleyin
3. `App.jsx` dosyasına yeni route ekleyin
4. `AdminLayout.jsx` dosyasına navigation link ekleyin

### Yeni API Endpoint Ekleme
1. `src/services/adminService.js` dosyasına yeni metod ekleyin
2. Gerekli bileşenlerde servisi kullanın

## Test

Admin panelini test etmek için:

1. Sunucuyu başlatın: `npm run dev`
2. `/admin/login` adresine gidin
3. Mevcut admin bilgileriyle giriş yapın
4. Dashboard'ı kontrol edin

## Notlar

- Tüm admin işlemleri için geçerli JWT token gerekli
- Token localStorage'da saklanır
- Sayfa yenilendiğinde token otomatik kontrol edilir
- Geçersiz token durumunda otomatik çıkış yapılır
