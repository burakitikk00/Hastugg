# Supabase Bağlantı Kurulum Rehberi

Bu rehber, Hastugg projesinde Supabase veritabanı bağlantısının nasıl kurulacağını adım adım açıklar.

## 📋 Gereksinimler

Supabase bağlantısı için aşağıdaki bilgilere ihtiyacınız var:

1. **Database Bağlantı Bilgileri** ✅ (Mevcut)
   - Host: `db.ancyfbusyllkwekachls.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: (Sizin belirlediğiniz şifre)

2. **Supabase API Keys** ⚠️ (Gerekli)
   - Anon/Public Key
   - Service Role Key (opsiyonel ama önerilir)

## 🔑 Supabase API Keys Nasıl Alınır?

1. [Supabase Dashboard](https://app.supabase.com/)'a gidin
2. Projenizi seçin (`ancyfbusyllkwekachls`)
3. Sol menüden **Settings** > **API** sayfasına gidin
4. Aşağıdaki anahtarları kopyalayın:
   - **Project URL**: `https://ancyfbusyllkwekachls.supabase.co`
   - **Anon public**: Bu sizin public API key'iniz
   - **Service_role**: Bu sizin service role key'iniz (SECRET - sadece server tarafında kullanın)

## 🚀 Kurulum Adımları

### 1. SERVER Ortam Değişkenlerini Ayarlayın

```bash
cd SERVER
```

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

`.env` dosyasını düzenleyin ve **[YOUR_PASSWORD]**, **[YOUR_ANON_KEY]** ve **[YOUR_SERVICE_ROLE_KEY]** değerlerini kendi değerlerinizle değiştirin:

```env
# DATABASE CONFIGURATION
DATABASE_URL=postgresql://postgres:SIZIN_SIFRENIZ@db.ancyfbusyllkwekachls.supabase.co:5432/postgres

DB_HOST=db.ancyfbusyllkwekachls.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=SIZIN_SIFRENIZ
DB_DATABASE=postgres

# SUPABASE CONFIGURATION
SUPABASE_URL=https://ancyfbusyllkwekachls.supabase.co
SUPABASE_ANON_KEY=SIZIN_ANON_KEYINIZ
SUPABASE_SERVICE_ROLE_KEY=SIZIN_SERVICE_ROLE_KEYINIZ

# SERVER CONFIGURATION
PORT=5000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 2. CLIENT Ortam Değişkenlerini Ayarlayın

```bash
cd ../CLIENT
```

`.env.example` dosyasını `.env.local` olarak kopyalayın:

```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin ve **[YOUR_ANON_KEY]** değerini değiştirin:

```env
# SUPABASE CONFIGURATION
VITE_SUPABASE_URL=https://ancyfbusyllkwekachls.supabase.co
VITE_SUPABASE_ANON_KEY=SIZIN_ANON_KEYINIZ

# API CONFIGURATION
VITE_API_BASE_URL=http://localhost:5000
VITE_API_PORT=5000
```

### 3. Bağımlılıkları Yükleyin

**SERVER:**
```bash
cd SERVER
npm install
```

Bu komut `@supabase/supabase-js` paketini ve diğer bağımlılıkları yükleyecek.

**CLIENT:**
```bash
cd ../CLIENT
npm install
```

### 4. Bağlantıyı Test Edin

**SERVER'ı Başlatın:**
```bash
cd SERVER
npm run dev
```

Konsolda şu mesajları görmelisiniz:
- ✅ `PostgreSQL veritabanına başarıyla bağlanıldı.`
- ✅ `Server is running on port 5000`

**CLIENT'ı Başlatın:**
```bash
cd ../CLIENT
npm run dev
```

## 📁 Oluşturulan Dosyalar

### SERVER
- ✅ `SERVER/.env.example` - Ortam değişkeni şablonu
- ✅ `SERVER/routes/supabaseClient.js` - Supabase client yapılandırması
- ✅ `SERVER/package.json` - `@supabase/supabase-js` bağımlılığı eklendi

### CLIENT
- ✅ `CLIENT/.env.example` - Ortam değişkeni şablonu
- ✅ `CLIENT/src/config/supabaseClient.js` - Supabase client yapılandırması
- ✅ `CLIENT/package.json` - `@supabase/supabase-js` bağımlılığı eklendi

## 🔧 Kullanım Örnekleri

### SERVER Tarafında Supabase Kullanımı

```javascript
const { supabase, supabasePublic } = require('./routes/supabaseClient');

// Service Role ile (tam yetki - admin işlemleri)
const { data, error } = await supabase
    .from('users')
    .select('*');

// Public client ile (sınırlı yetki)
const { data, error } = await supabasePublic
    .from('public_table')
    .select('*');
```

### CLIENT Tarafında Supabase Kullanımı

```javascript
import { supabase, auth, db } from './config/supabaseClient';

// Veritabanı işlemleri
const products = await db.getAll('products');
const product = await db.getById('products', 123);
const newProduct = await db.insert('products', { name: 'Test' });
await db.update('products', 123, { name: 'Updated' });
await db.delete('products', 123);

// Authentication
const user = await auth.getCurrentUser();
const session = await auth.getSession();
await auth.signOut();

// Direkt Supabase kullanımı
const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'electronics');
```

## ⚠️ Önemli Notlar

1. **`.env` ve `.env.local` dosyalarını asla Git'e eklemeyin!** Bu dosyalar `.gitignore`'da olmalı.
2. **Service Role Key'i sadece SERVER tarafında kullanın** - Bu key tam yetkiye sahiptir!
3. **Anon Key'i CLIENT tarafında kullanabilirsiniz** - RLS (Row Level Security) politikaları geçerlidir.
4. Üretim ortamında mutlaka PostgreSQL bağlantı havuzu (connection pooling) kullanın.

## 🐛 Sorun Giderme

### "Module not found: @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
```

### "PostgreSQL veritabanı bağlantı hatası"
- `.env` dosyasındaki DATABASE_URL'in doğru olduğunu kontrol edin
- Şifrenizde özel karakterler varsa URL encoding yapın (örn: `#` → `%23`)
- Supabase Dashboard'da database'in çalıştığını kontrol edin

### "Invalid API key"
- Supabase Dashboard'dan doğru API key'leri kopyaladığınızdan emin olun
- Anon key ile Service Role key'i karıştırmayın
- `.env` dosyasını kaydettikten sonra server'ı yeniden başlatın

## 📚 Ek Kaynaklar

- [Supabase JavaScript Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)
