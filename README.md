# 🏗️ Hastugg Construction

Modern ve dinamik bir inşaat firması web sitesi. React, Node.js ve Supabase ile geliştirilmiş full-stack bir proje.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite)

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Özellikler](#-özellikler)
- [Teknolojiler](#️-teknolojiler)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

## 📖 Proje Hakkında

Hastugg Construction, inşaat firmalarının hizmetlerini, projelerini ve ekip üyelerini sergileyebileceği, müşterilerle iletişim kurabilecekleri modern bir web platformudur. Responsive tasarımı ve kullanıcı dostu arayüzü ile profesyonel bir görünüm sunar.

## ✨ Özellikler

- 🎨 **Modern ve Responsive Tasarım** - Tüm cihazlarda mükemmel görünüm
- 🔐 **Kullanıcı Yönetimi** - Google OAuth entegrasyonu ile güvenli giriş
- 📊 **Admin Paneli** - İçerik yönetimi için kapsamlı yönetim paneli
- 🏗️ **Proje Sergileme** - Görsel galeri ve detaylı proje bilgileri
- 👥 **Ekip Yönetimi** - Ekip üyelerinin tanıtımı
- 📧 **İletişim Formu** - Email entegrasyonu ile doğrudan iletişim
- 🎭 **Dinamik İçerik** - Veritabanından yönetilen içerik sistemi
- 📱 **Mobil Uyumlu** - Her ekran boyutunda optimize edilmiş deneyim

## 🛠️ Teknolojiler

### Frontend

- **React** 19.1.1 - Modern kullanıcı arayüzü
- **Vite** - Hızlı geliştirme ve build aracı
- **React Router** - Sayfa yönlendirme
- **Framer Motion** - Animasyonlar
- **Axios** - HTTP istekleri
- **React Icons** - İkon kütüphanesi
- **React Hot Toast** - Bildirimler
- **Tailwind CSS** - Responsive tasarım
- **EmailJS** - Email gönderimi

### Backend

- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Supabase** - Veritabanı ve authentication
- **PostgreSQL** - İlişkisel veritabanı
- **JWT** - Token tabanlı kimlik doğrulama
- **Bcrypt** - Şifre hashleme
- **Nodemailer** - Email servisi
- **Multer** - Dosya yükleme
- **CORS** - Cross-origin kaynak paylaşımı

## 📁 Proje Yapısı

```
Hastugg/
├── CLIENT/                 # Frontend React uygulaması
│   ├── src/
│   │   ├── components/    # React bileşenleri
│   │   ├── pages/         # Sayfa bileşenleri
│   │   ├── styles/        # CSS dosyaları
│   │   └── utils/         # Yardımcı fonksiyonlar
│   ├── public/            # Statik dosyalar
│   └── package.json
│
├── SERVER/                # Backend Node.js uygulaması
│   ├── routes/           # API route'ları
│   │   ├── public/       # Public endpoints
│   │   └── admin/        # Admin endpoints
│   ├── middleware/       # Express middleware'leri
│   ├── utils/            # Yardımcı modüller
│   ├── server.js         # Ana server dosyası
│   └── package.json
│
└── README.md
```

## 🚀 Kurulum

### Gereksinimler

- Node.js (v16 veya üzeri)
- npm veya yarn
- Supabase hesabı

### Backend Kurulumu

1. SERVER klasörüne gidin:
```bash
cd SERVER
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyası oluşturun (`env.example` dosyasını kopyalayarak):
```bash
# Windows
copy env.example .env

# Mac/Linux
cp env.example .env
```

4. `.env` dosyasını düzenleyin ve gerekli değerleri ekleyin:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-very-secure-jwt-secret-key-here
ALLOWED_ORIGINS=http://localhost:5173
```

5. Sunucuyu başlatın:
```bash
# Development modu
npm run dev

# Production modu
npm start
```

### Frontend Kurulumu

1. CLIENT klasörüne gidin:
```bash
cd CLIENT
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyası oluşturun (`.env.example` dosyasını kopyalayarak):
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

4. `.env` dosyasını düzenleyin:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Development sunucusunu başlatın:
```bash
npm run dev
```

Frontend varsayılan olarak `http://localhost:5173` adresinde çalışacaktır.

## 📖 Kullanım

### Development

Backend ve frontend'i ayrı terminallerde çalıştırın:

```bash
# Terminal 1 - Backend
cd SERVER
npm run dev

# Terminal 2 - Frontend
cd CLIENT
npm run dev
```

### Production Build

Frontend için production build oluşturun:

```bash
cd CLIENT
npm run build
```

Build edilmiş dosyalar `CLIENT/dist` klasöründe oluşturulacaktır.

## 🚀 Deployment

Bu proje **Render** (backend) ve **Vercel** (frontend) üzerinde deploy edilebilir.

### Backend Deployment (Render)

1. **Render Dashboard'a gidin** ve yeni bir Web Service oluşturun

2. **Repository'yi bağlayın** (GitHub/GitLab)

3. **Build Settings:**
   - **Build Command:** `cd SERVER && npm install`
   - **Start Command:** `cd SERVER && npm start`

4. **Environment Variables ekleyin:**
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://... (Supabase connection string)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_ANON_KEY=your-anon-key
   JWT_SECRET=your-very-secure-jwt-secret-key-here
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://www.yourdomain.com
   ```

5. **Deploy edin** - Render otomatik olarak deploy edecektir

6. **Backend URL'ini not edin** (örn: `https://hastugg-2.onrender.com`)

**Not:** `render.yaml` dosyası projede mevcutsa, Render dashboard'da "Apply Render Configuration" seçeneğini kullanarak otomatik olarak ayarları yükleyebilirsiniz.

### Frontend Deployment (Vercel)

1. **Vercel Dashboard'a gidin** ve yeni bir proje oluşturun

2. **Repository'yi bağlayın** (GitHub/GitLab)

3. **Project Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `CLIENT`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables ekleyin:**
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Deploy edin** - Vercel otomatik olarak deploy edecektir

6. **Frontend URL'ini not edin** (örn: `https://your-app.vercel.app`)

7. **Backend CORS ayarlarını güncelleyin:**
   - Render dashboard'a gidin
   - Environment Variables bölümünde `ALLOWED_ORIGINS` değişkenini güncelleyin
   - Vercel URL'ini ekleyin: `https://your-app.vercel.app`
   - Render servisi otomatik olarak yeniden deploy edecektir

### Deployment Sırası

1. ✅ **Backend'i Render'da deploy edin**
2. ✅ **Backend URL'ini alın**
3. ✅ **Frontend'i Vercel'de deploy edin** (Backend URL'i environment variable olarak ekleyin)
4. ✅ **Frontend URL'ini alın**
5. ✅ **Backend'deki ALLOWED_ORIGINS'e Frontend URL'ini ekleyin**

### Environment Variables Özeti

#### Backend (Render)
- `NODE_ENV=production`
- `PORT=5000` (Render otomatik set eder)
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET` - JWT secret key
- `ALLOWED_ORIGINS` - Frontend URL'leri (virgülle ayrılmış)

#### Frontend (Vercel)
- `VITE_API_BASE_URL` - Backend API URL (Render URL)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## 🔑 API Endpoints

### Public Routes

- `GET /api/hero` - Hero bölümü içeriği
- `GET /api/about` - Hakkımızda içeriği
- `GET /api/contact` - İletişim bilgileri
- `POST /api/contact` - İletişim formu gönderimi
- `GET /api/services` - Hizmetler listesi
- `GET /api/projects` - Projeler listesi
- `GET /api/team` - Ekip üyeleri

### Admin Routes (Authentication Required)

- `POST /api/admin/login` - Admin girişi
- `GET /api/admin/users` - Kullanıcı listesi
- `PUT /api/admin/users/:id` - Kullanıcı güncelleme
- Content yönetimi endpoints

## 🎨 Özelleştirme

### Tailwind CSS

Tailwind yapılandırması `CLIENT/tailwind.config.js` dosyasında düzenlenebilir:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Özel renklerinizi buraya ekleyin
      }
    }
  }
}
```

### Ortam Değişkenleri

Geliştirme ve production ortamları için farklı `.env` dosyaları kullanabilirsiniz:
- `.env.development`
- `.env.production`

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Bu repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Commit Mesaj Formatı

Conventional Commits standardını kullanıyoruz:

- `feat:` - Yeni özellik
- `fix:` - Bug düzeltmesi
- `docs:` - Dokümantasyon değişiklikleri
- `style:` - Kod formatı değişiklikleri
- `refactor:` - Kod refactoring
- `test:` - Test eklemeleri
- `chore:` - Bakım işleri

## 🐛 Sorun Giderme

### Port zaten kullanımda hatası

Eğer port zaten kullanılıyorsa, `.env` dosyasında farklı bir port belirleyin:

```env
PORT=5001
```

### Supabase bağlantı hatası

Supabase URL ve anahtarlarınızın doğru olduğundan emin olun. Supabase dashboard'dan kontrol edebilirsiniz.

### CORS hatası

Backend'de CORS yapılandırmasını kontrol edin. Frontend URL'inin izin verilen originler listesinde olduğundan emin olun.

## 📄 Lisans

Bu proje özel bir projedir. Tüm hakları saklıdır.

## 👨‍💻 Geliştirici

**Hastugg Construction Team**

## 📞 İletişim

Sorularınız için lütfen bizimle iletişime geçin:
- Website: [hastugg.com](https://hastugg.com)
- Email: info@hastugg.com

## 🙏 Teşekkürler

Bu projeyi geliştirirken kullanılan tüm açık kaynak kütüphanelere teşekkür ederiz.

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
