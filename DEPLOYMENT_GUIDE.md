# 🚀 Deployment Rehberi - Vercel & Render

Bu rehber, projeyi Render (Backend) ve Vercel (Frontend) üzerinde deploy etmek için gereken tüm adımları içerir.

## 📋 İçindekiler

1. [Render (Backend) Deployment](#1-render-backend-deployment)
2. [Vercel (Frontend) Deployment](#2-vercel-frontend-deployment)
3. [CORS Ayarları](#3-cors-ayarları)
4. [Troubleshooting](#4-troubleshooting)

---

## 1. Render (Backend) Deployment

### Adım 1: Render Hesabı Oluşturma

1. [Render.com](https://render.com) adresine gidin
2. "Get Started for Free" butonuna tıklayın
3. GitHub/GitLab hesabınızla giriş yapın

### Adım 2: Yeni Web Service Oluşturma

1. Render Dashboard'da **"New +"** butonuna tıklayın
2. **"Web Service"** seçeneğini seçin
3. GitHub/GitLab repository'nizi bağlayın (eğer bağlı değilse)
4. Repository'nizi seçin

### Adım 3: Build ve Start Ayarları

Render, `render.yaml` dosyanızı otomatik olarak algılayacaktır. Eğer manuel ayar yapmak isterseniz:

**Build Command:**
```
cd SERVER && npm install
```

**Start Command:**
```
cd SERVER && npm start
```

**Root Directory:** (Boş bırakın veya proje root'unu belirtin)

### Adım 4: Environment Variables Ekleme

Render Dashboard'da **"Environment"** sekmesine gidin ve aşağıdaki değişkenleri ekleyin:

#### Zorunlu Environment Variables:

1. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

2. **PORT**
   - Key: `PORT`
   - Value: `5000`
   - Not: Render otomatik olarak PORT'u set eder, ama yine de belirtmek iyidir

3. **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: `postgresql://[user]:[password]@[host]:[port]/[database]`
   - Örnek (Supabase): `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - Not: Supabase Dashboard > Project Settings > Database > Connection String > URI

4. **SUPABASE_URL**
   - Key: `SUPABASE_URL`
   - Value: `https://[your-project-ref].supabase.co`
   - Not: Supabase Dashboard > Project Settings > API > Project URL

5. **SUPABASE_SERVICE_ROLE_KEY**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `[your-service-role-key]`
   - Not: Supabase Dashboard > Project Settings > API > service_role key (⚠️ Gizli tutun!)

6. **SUPABASE_ANON_KEY**
   - Key: `SUPABASE_ANON_KEY`
   - Value: `[your-anon-key]`
   - Not: Supabase Dashboard > Project Settings > API > anon public key

7. **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: `[güçlü-rastgele-string]`
   - Not: Güçlü bir secret key oluşturun (örn: `openssl rand -base64 32`)

8. **ALLOWED_ORIGINS** (İlk deploy'da geçici)
   - Key: `ALLOWED_ORIGINS`
   - Value: `http://localhost:5173` (geçici, sonra Vercel URL'i eklenecek)
   - Not: Vercel URL'i aldıktan sonra güncelleyeceğiz

9. **SUPABASE_STORAGE_BUCKET** (Opsiyonel)
   - Key: `SUPABASE_STORAGE_BUCKET`
   - Value: `images` (varsayılan)
   - Not: Supabase Storage bucket adı. Eğer farklı bir bucket adı kullanıyorsanız buraya yazın.

### Adım 4.5: Supabase Storage Bucket Oluşturma

Görsellerin bulut depolamada saklanması için Supabase Storage bucket'ı oluşturmanız gerekiyor:

1. **Supabase Dashboard'a gidin**
   - [https://app.supabase.com](https://app.supabase.com)
   - Projenizi seçin

2. **Storage bölümüne gidin**
   - Sol menüden **"Storage"** seçeneğine tıklayın

3. **Yeni bucket oluşturun**
   - **"New bucket"** butonuna tıklayın
   - **Bucket name:** `images` (veya istediğiniz bir isim)
   - **Public bucket:** ✅ **Açık** (Public olmalı, görseller herkese açık olacak)
   - **"Create bucket"** butonuna tıklayın

4. **Bucket ayarlarını kontrol edin**
   - Bucket'ın **Public** olduğundan emin olun
   - Eğer Public değilse, bucket ayarlarından **"Make public"** seçeneğini aktif edin

5. **Bucket politikalarını ayarlayın (Opsiyonel)**
   - Storage > Policies bölümünden bucket için politikalar ekleyebilirsiniz
   - Varsayılan olarak public bucket'lar herkese açıktır

**Not:** Eğer bucket adını `images` dışında bir şey yaptıysanız, `SUPABASE_STORAGE_BUCKET` environment variable'ını Render'da güncelleyin.

### Adım 5: Deploy

1. **"Create Web Service"** butonuna tıklayın
2. Render otomatik olarak build ve deploy işlemini başlatacaktır
3. **"Logs"** sekmesinden deploy sürecini takip edebilirsiniz
4. Deploy tamamlandığında, servisinizin URL'ini not edin
   - Örnek: `https://hastugg-2.onrender.com`
   - Bu URL'i kopyalayın, Vercel ayarlarında kullanacağız

### Adım 6: Health Check

Deploy tamamlandıktan sonra, tarayıcınızda şu URL'i açın:
```
https://your-backend.onrender.com/health
```

Eğer `{"status":"OK","message":"Server is running",...}` gibi bir JSON yanıtı görüyorsanız, backend başarıyla çalışıyor demektir.

---

## 2. Vercel (Frontend) Deployment

### Adım 1: Vercel Hesabı Oluşturma

1. [Vercel.com](https://vercel.com) adresine gidin
2. "Sign Up" butonuna tıklayın
3. GitHub/GitLab hesabınızla giriş yapın

### Adım 2: Yeni Proje Oluşturma

1. Vercel Dashboard'da **"Add New..."** > **"Project"** seçeneğini seçin
2. GitHub/GitLab repository'nizi seçin
3. **"Import"** butonuna tıklayın

### Adım 3: Project Settings

Vercel otomatik olarak Vite projesini algılayacaktır, ancak şu ayarları kontrol edin:

1. **Framework Preset:** `Vite` (otomatik algılanır)
2. **Root Directory:** `CLIENT` ⚠️ **ÖNEMLİ!**
   - "Root Directory" yanındaki "Edit" butonuna tıklayın
   - `CLIENT` yazın ve "Continue" butonuna tıklayın
3. **Build Command:** `npm run build` (otomatik)
4. **Output Directory:** `dist` (otomatik)
5. **Install Command:** `npm install` (otomatik)

### Adım 4: Environment Variables Ekleme

**"Environment Variables"** bölümüne gidin ve aşağıdaki değişkenleri ekleyin:

#### Zorunlu Environment Variables:

1. **VITE_API_BASE_URL**
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend.onrender.com` (Render'dan aldığınız backend URL'i)
   - Örnek: `https://hastugg-2.onrender.com`
   - Not: Sonunda `/` olmamalı!

2. **VITE_SUPABASE_URL**
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://[your-project-ref].supabase.co`
   - Not: Supabase Dashboard > Project Settings > API > Project URL

3. **VITE_SUPABASE_ANON_KEY**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: `[your-anon-key]`
   - Not: Supabase Dashboard > Project Settings > API > anon public key

#### Environment Variables Ekleme Adımları:

1. **"Environment Variables"** bölümüne gidin
2. **"Add New"** butonuna tıklayın
3. Key ve Value'yu girin
4. **"Save"** butonuna tıklayın
5. Her değişken için tekrarlayın

**Not:** Environment Variables'ları ekledikten sonra, yeni bir deploy başlatmanız gerekebilir.

### Adım 5: Deploy

1. Tüm ayarları kontrol edin
2. **"Deploy"** butonuna tıklayın
3. Vercel otomatik olarak build ve deploy işlemini başlatacaktır
4. **"Deployments"** sekmesinden deploy sürecini takip edebilirsiniz
5. Deploy tamamlandığında, frontend URL'inizi not edin
   - Örnek: `https://hastugg-fov4.vercel.app`
   - Bu URL'i kopyalayın, Render CORS ayarlarında kullanacağız

### Adım 6: Test

Deploy tamamlandıktan sonra, tarayıcınızda frontend URL'inizi açın. Eğer site yükleniyorsa, başarılı demektir.

---

## 3. CORS Ayarları

Frontend deploy edildikten sonra, backend'deki CORS ayarlarını güncellemeniz gerekir.

### Adım 1: Vercel URL'ini Not Edin

Vercel'den aldığınız frontend URL'ini kopyalayın:
- Örnek: `https://hastugg-fov4.vercel.app`

### Adım 2: Render'da ALLOWED_ORIGINS'i Güncelleyin

1. Render Dashboard'a gidin
2. Backend servisinize tıklayın
3. **"Environment"** sekmesine gidin
4. `ALLOWED_ORIGINS` değişkenini bulun
5. **"Edit"** butonuna tıklayın
6. Value'yu güncelleyin:
   ```
   https://your-vercel-app.vercel.app,https://www.yourdomain.com
   ```
   - Vercel URL'ini ekleyin
   - Eğer custom domain kullanıyorsanız, onu da ekleyin
   - Virgülle ayırın (boşluk olmadan)
7. **"Save Changes"** butonuna tıklayın
8. Render otomatik olarak servisi yeniden deploy edecektir

### Adım 3: Test

1. Frontend'de bir işlem yapın (örn: form gönderimi)
2. Browser Console'u açın (F12)
3. Network sekmesinde API isteklerini kontrol edin
4. Eğer CORS hatası yoksa, başarılı demektir

---

## 4. Troubleshooting

### Backend (Render) Sorunları

#### ❌ Build Hatası

**Sorun:** `npm install` hatası veya dependency sorunları

**Çözüm:**
1. Render Logs'u kontrol edin
2. `SERVER/package.json` dosyasını kontrol edin
3. Local'de `npm install` çalıştırıp hataları kontrol edin
4. Node.js versiyonunu kontrol edin (Render'da otomatik algılanır)

#### ❌ Database Connection Hatası

**Sorun:** `DATABASE_URL` hatası veya bağlantı sorunu

**Çözüm:**
1. `DATABASE_URL` formatını kontrol edin
2. Supabase'de database'in aktif olduğundan emin olun
3. Connection string'de özel karakterleri URL encode edin
4. Supabase Dashboard > Database > Connection Pooling'i kontrol edin

#### ❌ Port Hatası

**Sorun:** Port zaten kullanımda

**Çözüm:**
- Render otomatik olarak PORT'u set eder, `PORT` environment variable'ını kaldırabilirsiniz
- Veya `PORT` değişkenini Render'ın set ettiği değere bırakın

### Frontend (Vercel) Sorunları

#### ❌ Build Hatası

**Sorun:** `npm run build` hatası

**Çözüm:**
1. Vercel Logs'u kontrol edin
2. Local'de `npm run build` çalıştırıp hataları kontrol edin
3. `CLIENT/package.json` dosyasını kontrol edin
4. Root Directory'in `CLIENT` olduğundan emin olun

#### ❌ Environment Variables Çalışmıyor

**Sorun:** `VITE_*` değişkenleri build'de görünmüyor

**Çözüm:**
1. Environment Variables'ların doğru eklendiğinden emin olun
2. Değişken isimlerinin `VITE_` ile başladığından emin olun
3. Deploy'u yeniden başlatın (Environment Variables ekledikten sonra)
4. Vercel'de **"Redeploy"** butonuna tıklayın

#### ❌ API İstekleri Çalışmıyor

**Sorun:** Frontend'den backend'e istekler başarısız

**Çözüm:**
1. `VITE_API_BASE_URL`'in doğru olduğundan emin olun
2. Backend URL'inin sonunda `/` olmadığından emin olun
3. Browser Console'da hata mesajlarını kontrol edin
4. CORS ayarlarını kontrol edin (Render'da `ALLOWED_ORIGINS`)

### CORS Sorunları

#### ❌ CORS Policy Hatası

**Sorun:** Browser console'da CORS hatası

**Çözüm:**
1. Render'da `ALLOWED_ORIGINS` değişkenini kontrol edin
2. Vercel URL'inin doğru eklendiğinden emin olun
3. URL'lerin virgülle ayrıldığından ve boşluk olmadığından emin olun
4. Backend'i yeniden deploy edin
5. Browser cache'ini temizleyin

---

## 📝 Özet Checklist

### Render (Backend) ✅
- [ ] Render hesabı oluşturuldu
- [ ] Repository bağlandı
- [ ] Web Service oluşturuldu
- [ ] Build Command: `cd SERVER && npm install`
- [ ] Start Command: `cd SERVER && npm start`
- [ ] Environment Variables eklendi:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `ALLOWED_ORIGINS` (geçici)
- [ ] Deploy tamamlandı
- [ ] Backend URL not edildi
- [ ] Health check başarılı

### Vercel (Frontend) ✅
- [ ] Vercel hesabı oluşturuldu
- [ ] Repository bağlandı
- [ ] Root Directory: `CLIENT` ayarlandı
- [ ] Environment Variables eklendi:
  - [ ] `VITE_API_BASE_URL` (Render URL'i)
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy tamamlandı
- [ ] Frontend URL not edildi
- [ ] Site test edildi

### CORS Ayarları ✅
- [ ] Render'da `ALLOWED_ORIGINS` güncellendi
- [ ] Vercel URL eklendi
- [ ] Backend yeniden deploy edildi
- [ ] CORS test edildi

---

## 🎉 Başarılı!

Tüm adımları tamamladıktan sonra, projeniz hem Render'da (backend) hem de Vercel'de (frontend) çalışıyor olmalı!

Sorularınız için README.md dosyasına bakabilir veya issue açabilirsiniz.
