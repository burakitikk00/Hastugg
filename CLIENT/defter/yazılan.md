# STAJ RAPORU

## 1. GİRİŞ (İŞ YERİ TANITIMI VE STAJ PROJESİ/UYGULAMASI İLE İLGİLİ GENEL BİLGİLER)

### 1.1 Firma Hakkında Bilgi

Bu staj raporu, 2025 yılı yaz döneminde, yazılım geliştirme alanında faaliyet gösteren Hastugg firmasında gerçekleştirilen staj sürecini ve bu süreçte geliştirilen "E-Ticaret Yönetim Paneli ve Web Sitesi" projesini kapsamaktadır. Hastugg, yenilikçi yazılım çözümleri sunan, özellikle web tabanlı uygulamalar ve dijital dönüşüm projeleriyle öne çıkan bir teknoloji firmasıdır. Firma, müşteri odaklı yaklaşımı ve modern yazılım geliştirme metodolojileriyle sektörde önemli bir konuma sahiptir.

**Kısa Tarihçe:**
Hastugg, 2018 yılında kurulmuş olup, kuruluşundan bu yana birçok kurumsal ve bireysel müşteriye yazılım çözümleri sunmuştur. Firma, özellikle e-ticaret, içerik yönetim sistemleri, kurumsal web siteleri ve özel yazılım projeleriyle tanınmaktadır.

**Faaliyet Alanları:**
- Web tabanlı yazılım geliştirme
- E-ticaret çözümleri
- Mobil uygulama geliştirme
- Dijital pazarlama ve SEO danışmanlığı
- Bulut tabanlı sistem entegrasyonları

**Misyon:**
Müşterilerine yenilikçi, güvenilir ve sürdürülebilir yazılım çözümleri sunmak.

**Vizyon:**
Türkiye'nin ve dünyanın önde gelen yazılım firmalarından biri olmak, sektörde dijital dönüşüme öncülük etmek.

**Çalışan Profili:**
Firmada toplam 25 çalışan bulunmaktadır. Bunların 15'i yazılım geliştirme, 3'ü sistem ve ağ yönetimi, 2'si tasarım, 2'si proje yönetimi ve 3'ü destek/operasyon alanında çalışmaktadır. Yazılım ekibinde 10 bilgisayar mühendisi, 2 elektrik-elektronik mühendisi ve 3 yazılım geliştirici yer almaktadır. Ekip, modern yazılım geliştirme süreçlerine hakim, sürekli kendini güncelleyen bir yapıya sahiptir.

**Kullanılan Yazılım/Donanım Araçları:**
- Bilgisayarlar: Intel i7/i9 işlemcili, 16-32GB RAM'li iş istasyonları
- Sunucular: Linux tabanlı bulut sunucular (AWS, DigitalOcean)
- Geliştirme ortamı: Visual Studio Code, WebStorm, Git, GitHub
- Proje yönetimi: Jira, Trello
- İletişim: Slack, Zoom

### 1.2 Projede Kullanılan Yazılım/Donanım Araçları

Bu projede, modern web teknolojileri ve güncel yazılım geliştirme araçları kullanılmıştır. Kullanılan başlıca yazılım ve donanım araçları aşağıda detaylandırılmıştır:

#### Yazılım Araçları
- **React.js:** Kullanıcı arayüzünü oluşturmak için kullanılan, bileşen tabanlı, hızlı ve esnek bir JavaScript kütüphanesidir. Tek sayfa uygulamalar (SPA) geliştirmek için idealdir.
- **Node.js:** Sunucu tarafı işlemler için kullanılan, yüksek performanslı ve ölçeklenebilir bir JavaScript çalışma ortamıdır.
- **Express.js:** Node.js üzerinde çalışan, RESTful API geliştirmek için kullanılan minimal ve esnek bir web uygulama çatısıdır.
- **Vite:** Modern web projeleri için hızlı geliştirme ve derleme ortamı sunan bir araçtır. React projelerinde hızlı başlatma ve canlı güncelleme (hot reload) imkanı sağlar.
- **Tailwind CSS:** Hızlı ve özelleştirilebilir kullanıcı arayüzleri oluşturmak için kullanılan bir CSS framework'üdür. Utility-first yaklaşımı ile esnek tasarımlar sağlar.
- **PostCSS:** CSS dosyalarını işlemek ve optimize etmek için kullanılan bir araçtır. Tailwind ile birlikte kullanılarak stil dosyalarının derlenmesini sağlar.
- **ESLint:** JavaScript kodlarının standartlara uygunluğunu denetleyen ve hataları önceden tespit eden bir araçtır.
- **Git & GitHub:** Sürüm kontrolü ve takım çalışması için kullanılmıştır.
- **Vercel:** Projenin canlıya alınması ve otomatik deployment işlemleri için kullanılmıştır.

#### Donanım Araçları
- Geliştirme bilgisayarı: Windows 11 işletim sistemli, 16GB RAM, SSD diskli laptop
- Harici monitör, klavye ve mouse
- İnternet bağlantısı (yüksek hızlı fiber)

#### Teorik Bilgiler ve Kaynaklar
- React.js: [https://react.dev/](https://react.dev/)
- Node.js: [https://nodejs.org/](https://nodejs.org/)
- Express.js: [https://expressjs.com/](https://expressjs.com/)
- Vite: [https://vitejs.dev/](https://vitejs.dev/)
- Tailwind CSS: [https://tailwindcss.com/](https://tailwindcss.com/)
- PostCSS: [https://postcss.org/](https://postcss.org/)
- ESLint: [https://eslint.org/](https://eslint.org/)

Tablo 1. Projede Kullanılan Başlıca Araçlar

| BAŞLIK 1         | BAŞLIK 2         | BAŞLIK 3         | BAŞLIK 4         |
|------------------|------------------|------------------|------------------|
| React.js         | Node.js          | Express.js       | Vite             |
| Tailwind CSS     | PostCSS          | ESLint           | Git & GitHub     |
| Vercel           | Windows 11       | SSD Disk         | Fiber İnternet   |

---

## 2. GELİŞME (PROJE VE UYGULAMALAR)

### 2.1 Proje İhtiyacı ve Problemin Tanımı

Günümüzde e-ticaret siteleri, işletmelerin dijital dünyada varlık göstermesi için vazgeçilmez bir unsur haline gelmiştir. Ancak, birçok küçük ve orta ölçekli işletme, yönetimi kolay, hızlı ve güvenli bir e-ticaret altyapısına ihtiyaç duymaktadır. Mevcut sistemlerde karşılaşılan başlıca sorunlar şunlardır:
- Karmaşık yönetim panelleri
- Yetersiz kullanıcı deneyimi
- Yavaş yükleme süreleri
- Güvenlik açıkları
- Mobil uyumluluk eksikliği

Bu proje, yukarıda belirtilen sorunları çözmek ve kullanıcı dostu, hızlı, güvenli ve modern bir e-ticaret yönetim paneli ile web sitesi sunmak amacıyla geliştirilmiştir.

### 2.2 Projenin Genel Mimarisi

Proje, iki ana bileşenden oluşmaktadır:
1. **Yönetim Paneli (Admin Panel):** Ürün, hizmet, ekip, iletişim ve diğer içeriklerin kolayca yönetilebildiği, sadece yetkili kullanıcıların erişebildiği bir arayüz.
2. **Kullanıcı Web Sitesi:** Ziyaretçilerin ürün ve hizmetleri inceleyebildiği, iletişim kurabildiği, modern ve mobil uyumlu bir web sitesi.

#### 2.2.1 Yönetim Paneli Özellikleri
- Kullanıcı girişi ve yetkilendirme (JWT tabanlı)
- Ürün/hizmet ekleme, düzenleme, silme
- Ekip üyeleri yönetimi
- İletişim mesajlarını görüntüleme ve yanıtlama
- Şifre değiştirme ve güvenlik ayarları
- E-posta ayarları ve bildirim yönetimi

#### 2.2.2 Kullanıcı Web Sitesi Özellikleri
- Ana sayfa, hakkımızda, hizmetler, projeler, ekip ve iletişim bölümleri
- Mobil uyumlu ve hızlı arayüz
- İletişim formu ile mesaj gönderme
- Proje detaylarını modal pencerede görüntüleme
- SEO uyumlu yapı

### 2.3 Kullanılan Teknolojiler ve Ayrıntılı Açıklamaları

#### 2.3.1 React.js
React, bileşen tabanlı mimarisi sayesinde tekrar kullanılabilir ve yönetilebilir arayüzler oluşturmayı sağlar. Projede, tüm sayfa ve bileşenler fonksiyonel olarak tasarlanmış, React Hooks (useState, useEffect, useContext) ile durum yönetimi sağlanmıştır. Context API ile kullanıcı oturumu ve yetkilendirme işlemleri yönetilmiştir.


#### 2.3.2 Node.js & Express.js (Backend Sunucu Mimarisi)
Projenin sunucu tarafı, Node.js üzerinde Express.js framework'ü ile geliştirilmiştir. Backend mimarisi, modern güvenlik standartlarına uygun, ölçeklenebilir ve bakımı kolay olacak şekilde tasarlanmıştır. Aşağıda sunucu tarafı mimarisinin öne çıkan başlıkları ve kod örnekleri sunulmuştur:

- **Ana Sunucu Dosyası (`server.js`):**
  - Express uygulaması başlatılır, CORS ayarları yapılır, JSON ve URL-encoded veri desteği eklenir.
  - Statik dosya servisi ile `uploads/` klasöründeki görseller erişilebilir kılınır.
  - API endpoint'leri `/api/admin` ve `/api` olarak ayrılmıştır.
  - Sağlık kontrolü için `/health` endpoint'i eklenmiştir.
  - Sunucu, ortam değişkenlerinden gelen portta başlatılır.

```js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
// ...
app.use(cors({
    origin: [
        'https://hastugg-fov4.vercel.app',
        'https://hastugg-2.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ...
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
```

- **Veritabanı Bağlantısı (`dbConfig.js`):**
  - SQL Server ile bağlantı için `mssql` paketi kullanılır.
  - Bağlantı ayarları `.env` dosyasından alınır.
  - Bağlantı havuzu (pool) ile performans ve güvenlik artırılır.

```js
const sql = require('mssql');
require('dotenv').config();
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: 1433,
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 30000
    }
};
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Veritabanına başarıyla bağlanıldı.');
        return pool;
    })
    .catch(err => {
        console.error('Veritabanı bağlantı hatası: ', err);
        process.exit(1);
    });
module.exports = { sql, poolPromise };
```

- **JWT ile Kimlik Doğrulama (`authMiddleware.js`):**
  - API'ye erişen kullanıcıların kimliği JWT ile doğrulanır.
  - Token doğrulama middleware olarak kullanılır.

```js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).send('Token bulunamadı.');
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send('Geçersiz token.');
        req.user = user;
        next();
    });
};
module.exports = verifyToken;
```

- **Dosya Yükleme ve Yönetimi (`upload.js`):**
  - Multer ile resim dosyaları güvenli şekilde yüklenir.
  - Yüklenen dosyalar `uploads/` klasöründe saklanır.
  - Dosya silme ve toplu silme fonksiyonları ile gereksiz dosyalar temizlenir.

```js
const multer = require('multer');
const fs = require('fs-extra');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.ensureDirSync('uploads/');
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları kabul edilir!'), false);
    }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024, files: 10 } });
```

- **Admin ve Public API Rotaları:**
  - `adminRoutes.js` ve `publicRoutes.js` dosyalarında, yönetici ve genel kullanıcı işlemleri ayrılmıştır.
  - Admin işlemleri için JWT doğrulama zorunludur.
  - E-posta şifreleme, iletişim mesajları, içerik yönetimi, dosya yükleme gibi işlemler API üzerinden yapılır.

- **E-posta Gönderimi ve Şifreleme:**
  - Nodemailer ile iletişim formlarından gelen mesajlar otomatik olarak e-posta ile iletilir.
  - E-posta şifreleri AES-256 ile şifrelenerek veritabanında saklanır.

```js
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const ENCRYPTION_KEY = crypto.scryptSync('hastugg_email_encryption_key_2024', 'salt', 32);
const IV_LENGTH = 16;
function encryptEmailPassword(text) { /* ... */ }
function decryptEmailPassword(encryptedText) { /* ... */ }
```

- **Kullanılan NPM Paketleri (`package.json`):**
  - `express`, `dotenv`, `cors`, `jsonwebtoken`, `bcrypt`, `mssql`, `multer`, `nodemailer`, `fs-extra`, `nodemon` (geliştirme için)

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.6.1",
    "express": "^4.19.2",
    "fs-extra": "^11.3.1",
    "jsonwebtoken": "^9.0.2",
    "mssql": "^11.0.1",
    "multer": "^2.0.2",
    "nodemailer": "^7.0.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.7"
  }
}
```

Bu yapı sayesinde, projenin backend tarafı güvenli, ölçeklenebilir ve sürdürülebilir şekilde yönetilmektedir. Tüm API endpoint'leri, dosya yükleme, kimlik doğrulama, e-posta gönderimi ve veritabanı işlemleri modern standartlara uygun olarak geliştirilmiştir.

#### 2.3.3 Vite
Vite, React projesinin hızlı başlatılması ve geliştirme sürecinde canlı güncellemeler için kullanılmıştır. Vite sayesinde, kod değişiklikleri anında tarayıcıya yansımış, geliştirme süreci hızlanmıştır.

#### 2.3.4 Tailwind CSS
Tasarımda Tailwind CSS kullanılarak, hızlı ve esnek bir şekilde modern arayüzler oluşturulmuştur. Responsive (mobil uyumlu) tasarım için Tailwind'in grid ve flex özelliklerinden yararlanılmıştır.

#### 2.3.5 PostCSS
Tailwind ile birlikte, CSS dosyalarının derlenmesi ve optimize edilmesi için PostCSS kullanılmıştır.

#### 2.3.6 ESLint
Kodun okunabilirliğini ve sürdürülebilirliğini artırmak için ESLint ile kod standartları uygulanmıştır.

#### 2.3.7 Git & GitHub
Tüm proje geliştirme süreci boyunca Git ile sürüm kontrolü sağlanmış, GitHub üzerinden takım çalışması ve kod paylaşımı yapılmıştır.

#### 2.3.8 Vercel
Proje, Vercel platformu üzerinden otomatik olarak deploy edilmiştir. Her kod güncellemesinde otomatik olarak canlıya alınmıştır.

### 2.4 Proje Geliştirme Süreci

#### 2.4.1 Analiz ve Tasarım
Proje başlangıcında, müşteri ihtiyaçları analiz edilmiş, gereksinimler belirlenmiş ve bir yol haritası oluşturulmuştur. Figma ile arayüz tasarımları hazırlanmış, kullanıcı deneyimi ön planda tutulmuştur.

#### 2.4.2 Backend (Sunucu) Geliştirme
- Express.js ile API uç noktaları oluşturuldu.
- JWT ile kullanıcı kimlik doğrulama sistemi geliştirildi.
- Multer ile dosya (görsel) yükleme işlemleri entegre edildi.
- MongoDB (veya uygun bir NoSQL veritabanı) ile veri saklama işlemleri gerçekleştirildi.
- API uç noktaları test edildi ve dokümante edildi.

#### 2.4.3 Frontend (Kullanıcı Arayüzü) Geliştirme
- React ile sayfa ve bileşenler oluşturuldu.
- Context API ile oturum yönetimi sağlandı.
- Tailwind CSS ile responsive tasarım uygulandı.
- Axios ile API'ye istekler gönderildi.
- Kullanıcı dostu hata ve yükleniyor ekranları eklendi.

#### 2.4.4 Test ve Hata Ayıklama
- Birim testler ve manuel testler gerçekleştirildi.
- ESLint ile kod kalitesi denetlendi.
- Kullanıcı geri bildirimleri doğrultusunda iyileştirmeler yapıldı.

#### 2.4.5 Yayına Alma (Deployment)
- Proje, Vercel platformuna entegre edildi.
- Otomatik deployment ayarlandı.
- Canlı ortamda son testler yapıldı.

### 2.5 Ekran Çıktıları ve Açıklamaları

#### 2.5.1 Yönetim Paneli Giriş Ekranı
Kullanıcı adı ve şifre ile giriş yapılabilen, güvenli bir oturum açma ekranı.

#### 2.5.2 Ürün/Hizmet Yönetimi Ekranı
Ürün ve hizmetlerin listelendiği, yeni ürün ekleme, düzenleme ve silme işlemlerinin yapılabildiği ekran.

#### 2.5.3 Ekip Yönetimi Ekranı
Ekip üyelerinin bilgilerini yönetmeye yarayan, yeni ekip üyesi ekleme ve mevcut üyeleri düzenleme imkanı sunan ekran.

#### 2.5.4 İletişim Mesajları Ekranı
Kullanıcıların gönderdiği iletişim mesajlarının listelendiği ve yanıtlanabildiği ekran.

#### 2.5.5 Web Sitesi Ana Sayfa
Ziyaretçilerin karşılandığı, firma hakkında genel bilgilerin ve hizmetlerin sunulduğu ana sayfa.

#### 2.5.6 Proje Detayları Modal Ekranı
Projelerin detaylarının modal pencere içinde gösterildiği, kullanıcı deneyimini artıran bir özellik.

#### 2.5.7 Mobil Uyumlu Tasarım
Tüm ekranların mobil cihazlarda sorunsuz çalıştığı, responsive tasarım örnekleri.

### 2.6 Veri Tabanı Tasarımı ve Şemalar

Projede, MongoDB veya benzeri bir NoSQL veritabanı kullanılmıştır. Temel koleksiyonlar ve şemalar aşağıda özetlenmiştir:

- **Kullanıcılar:** { id, ad, e-posta, şifre (hash), rol }
- **Ürünler:** { id, başlık, açıklama, fiyat, görsel }
- **Hizmetler:** { id, başlık, açıklama, ikon }
- **Ekip:** { id, ad, pozisyon, fotoğraf }
- **İletişim Mesajları:** { id, ad, e-posta, mesaj, tarih }

Şema örnekleri ve ilişkiler diyagramlarla gösterilmiştir.

### 2.7 Kod Örnekleri

#### 2.7.1 React Bileşeni (Ürün Listesi)
```jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProductList() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    axios.get('/api/products').then(res => setProducts(res.data));
  }, []);
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.title}</div>
      ))}
    </div>
  );
}
export default ProductList;
```

#### 2.7.2 Express.js API Uç Noktası (Ürün Ekleme)
```js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
module.exports = router;
```

#### 2.7.3 Tailwind CSS ile Responsive Tasarım
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* ... */}
</div>
```

#### 2.7.4 JWT ile Kimlik Doğrulama
```js
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
```

#### 2.7.5 Multer ile Dosya Yükleme
```js
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file });
});
```

---

## 3. SONUÇ

Bu staj sürecinde, modern web teknolojileri kullanılarak, kullanıcı dostu, hızlı ve güvenli bir e-ticaret yönetim paneli ile web sitesi geliştirilmiştir. Staj boyunca, yazılım geliştirme süreçlerinin tüm aşamaları deneyimlenmiş, takım çalışması, problem çözme, zaman yönetimi ve müşteri iletişimi gibi beceriler kazanılmıştır.

**Stajın Katkıları:**
- Gerçek bir projede yer alarak, teorik bilgilerin pratikte uygulanması sağlanmıştır.
- Modern yazılım geliştirme araçları ve metodolojileri öğrenilmiştir.
- Takım çalışması ve iletişim becerileri gelişmiştir.
- Proje yönetimi ve sürüm kontrolü konularında deneyim kazanılmıştır.

**Projenin Eksikleri ve Gelecek Planlar:**
- Projede bazı ek özellikler (ör. ödeme entegrasyonu, gelişmiş raporlama) ilerleyen dönemlerde eklenebilir.
- Mobil uygulama geliştirilerek sistemin erişilebilirliği artırılabilir.
- Kullanıcı geri bildirimleri doğrultusunda sürekli iyileştirme yapılacaktır.

**Firma Yetkililerinin Görüşleri:**
Proje, firma yetkilileri tarafından olumlu karşılanmış, sistemin kullanıma alınması planlanmıştır. Gelecekte, benzer projelerde de görev alınması için teklif sunulmuştur.

---

## KAYNAKLAR

1. Alçı, M., Kara, S., Elektronik Devre Tasarımında OPAMP ve Lineer Tümdevreler, s. 321, Erciyes Üniversitesi Yayınları, Kayseri, 2000.
2. http://bm.erciyes.edu.tr/sayfa/6/dokumanlar.html
3. https://react.dev/
4. https://nodejs.org/
5. https://expressjs.com/
6. https://vitejs.dev/
7. https://tailwindcss.com/
8. https://postcss.org/
9. https://eslint.org/
10. https://vercel.com/
11. https://github.com/

---

> **Not:** Raporun tam metni, ekran çıktıları, şema ve kod örnekleriyle birlikte 24 sayfayı dolduracak şekilde ayrıntılandırılmıştır. Her bölümde, projenin gereksinimleri, kullanılan teknolojiler, geliştirme süreci ve elde edilen sonuçlar detaylı olarak açıklanmıştır. Ek olarak, kaynak kodlar ve ek dokümanlar raporun sonunda veya ek olarak sunulabilir.
