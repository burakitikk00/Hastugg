# Multer Entegrasyonu - Görsel Yükleme ve Yönetimi

Bu proje, multer kullanarak görsel yükleme, silme ve yönetimi için tam entegrasyon sağlar.

## 🚀 Özellikler

- **Çoklu görsel yükleme** (maksimum 10 dosya)
- **Otomatik dosya silme** - Proje silindiğinde/güncellendiğinde
- **Kullanılmayan dosya temizliği** - Uploads klasöründeki gereksiz dosyaları temizler
- **Güvenli dosya filtreleme** - Sadece resim dosyaları kabul edilir
- **Dosya boyutu sınırı** - 5MB maksimum
- **Benzersiz dosya adları** - Çakışma önleme

## 📁 Dosya Yapısı

```
SERVER/
├── upload.js              # Multer yapılandırması ve yardımcı fonksiyonlar
├── uploads/               # Yüklenen görsellerin saklandığı klasör
├── routes/adminRoutes.js  # API endpoint'leri
└── server.js              # Ana sunucu dosyası
```

## 🔧 API Endpoint'leri

### 1. Proje Ekleme (Görsellerle)
```http
POST /api/admin/add-project
Content-Type: multipart/form-data

Form Data:
- title: string (zorunlu)
- description: string (zorunlu)
- status: string (zorunlu)
- service_id: number (zorunlu)
- url: string
- images: file[] (maksimum 10, zorunlu)
```

### 2. Proje Güncelleme
```http
PUT /api/admin/projects/:id
Content-Type: multipart/form-data

Form Data:
- title: string (zorunlu)
- description: string (zorunlu)
- status: string (zorunlu)
- service_id: number (zorunlu)
- url: string (zorunlu)
- deleteExistingImages: "true" (eski görselleri silmek için)
- images: file[] (yeni görseller, opsiyonel)
```

### 3. Tek Görsel Yükleme
```http
POST /api/admin/upload-image
Content-Type: multipart/form-data

Form Data:
- image: file (zorunlu)
```

### 4. Tek Görsel Silme
```http
DELETE /api/admin/delete-image
Content-Type: application/json

Body:
{
  "imageURL": "/uploads/filename.jpg"
}
```

### 5. Kullanılmayan Görselleri Temizleme
```http
POST /api/admin/cleanup-images
Authorization: Bearer <token>
```

## 💡 Kullanım Örnekleri

### Frontend'den Görsel Yükleme (JavaScript)

```javascript
// Proje ekleme örneği
const formData = new FormData();
formData.append('title', 'Proje Başlığı');
formData.append('description', 'Proje açıklaması');
formData.append('status', 'active');
formData.append('service_id', '1');
formData.append('url', 'https://example.com');

// Görselleri ekle
const imageFiles = document.getElementById('imageInput').files;
for (let i = 0; i < imageFiles.length; i++) {
    formData.append('images', imageFiles[i]);
}

fetch('/api/admin/add-project', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`
    },
    body: formData
})
.then(response => response.json())
.then(data => console.log('Başarılı:', data));
```

### Görsel Silme Örneği

```javascript
fetch('/api/admin/delete-image', {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        imageURL: '/uploads/old-image.jpg'
    })
})
.then(response => response.json())
.then(data => console.log('Silindi:', data));
```

## 🛡️ Güvenlik Özellikleri

1. **Dosya Türü Kontrolü**: Sadece resim dosyaları kabul edilir
2. **Dosya Boyutu Limiti**: 5MB maksimum
3. **Benzersiz Dosya Adları**: Çakışma önleme
4. **Token Doğrulama**: Tüm işlemler için admin yetkisi gerekli

## 🔄 Otomatik Temizlik

- **Proje Silindiğinde**: İlişkili tüm görseller dosya sisteminden silinir
- **Proje Güncellendiğinde**: Eski görseller otomatik olarak silinir
- **Manuel Temizlik**: `/cleanup-images` endpoint'i ile kullanılmayan dosyalar temizlenir

## 📝 Notlar

- Görseller `/uploads/` klasöründe saklanır
- Veritabanında sadece dosya yolu tutulur
- Dosya silindiğinde hem veritabanından hem dosya sisteminden kaldırılır
- Hata durumunda transaction rollback yapılır
- Uploads klasörü otomatik olarak oluşturulur

## 🧪 Test Etme

Test dosyasını çalıştırmak için:

```bash
node test-multer.js
```

## ⚠️ Dikkat Edilecekler

1. **Dosya Yolu**: Görseller `/uploads/filename.jpg` formatında saklanır
2. **Çoklu Yükleme**: Maksimum 10 dosya aynı anda yüklenebilir
3. **Dosya Formatları**: JPEG, PNG, GIF, WebP gibi resim formatları desteklenir
4. **Hata Yönetimi**: Tüm işlemler try-catch bloklarında sarmalanmıştır
