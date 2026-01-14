# 🔧 URL Düzeltme Rehberi

Bu rehber, veritabanındaki yanlış birleştirilmiş URL'leri nasıl düzelteceğinizi gösterir.

## 📋 Sorun

Veritabanında bazı görsel URL'leri yanlış birleştirilmiş durumda:
- ❌ `https://hastugg-2.onrender.comhttps://ancyfbusyllkwekachls.supabase.co/...`
- ✅ `https://ancyfbusyllkwekachls.supabase.co/...`

## 🚀 Çözüm Yöntemleri

### Yöntem 1: Tarayıcı Console'undan (En Kolay)

1. **Admin paneline giriş yapın**
   - `https://your-frontend.vercel.app/admin/login`

2. **Tarayıcı Console'unu açın**
   - Chrome/Edge: `F12` veya `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
   - Firefox: `F12` veya `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

3. **Aşağıdaki kodu yapıştırın ve Enter'a basın:**

```javascript
// AdminService'i import et
import adminService from './services/adminService.js';

// URL'leri düzelt
adminService.fixUrls()
  .then(result => {
    console.log('✅ URL düzeltme başarılı!', result);
    alert('URL\'ler başarıyla düzeltildi!\n\n' + JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('❌ Hata:', error);
    alert('Hata: ' + error.message);
  });
```

**Veya daha basit yöntem (fetch ile):**

```javascript
// Token'ı al
const token = localStorage.getItem('adminToken');

// URL'leri düzelt
fetch('https://hastugg-2.onrender.com/api/admin/fix-urls', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(result => {
  console.log('✅ Sonuç:', result);
  alert('URL\'ler düzeltildi!\n\nDüzeltilen:\n' +
    '- Projects: ' + result.results.projects.fixed + '\n' +
    '- Images: ' + result.results.images.fixed + '\n' +
    '- Team: ' + result.results.team.fixed);
})
.catch(error => {
  console.error('❌ Hata:', error);
  alert('Hata: ' + error.message);
});
```

### Yöntem 2: Postman veya cURL

#### Postman ile:

1. **Yeni Request oluşturun**
   - Method: `POST`
   - URL: `https://hastugg-2.onrender.com/api/admin/fix-urls`

2. **Headers ekleyin:**
   - `Authorization`: `Bearer YOUR_TOKEN`
   - `Content-Type`: `application/json`

3. **Send butonuna tıklayın**

#### cURL ile:

```bash
curl -X POST https://hastugg-2.onrender.com/api/admin/fix-urls \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Token'ı nereden alacaksınız?**
- Tarayıcı Console'unda: `localStorage.getItem('adminToken')`
- Veya admin paneline giriş yaptıktan sonra tarayıcı Developer Tools > Application > Local Storage > `adminToken`

### Yöntem 3: Admin Panelinde Buton (Gelecek Güncelleme)

Gelecekte admin paneline bir "URL'leri Düzelt" butonu eklenebilir.

## 📊 Beklenen Sonuç

Başarılı bir istek şu şekilde bir yanıt döner:

```json
{
  "success": true,
  "message": "URL düzeltme tamamlandı",
  "results": {
    "projects": {
      "fixed": 5,
      "errors": []
    },
    "images": {
      "fixed": 12,
      "errors": []
    },
    "team": {
      "fixed": 3,
      "errors": []
    }
  }
}
```

## ⚠️ Önemli Notlar

1. **Token Gerekli**: Bu endpoint admin yetkisi gerektirir
2. **Güvenlik**: Token'ınızı kimseyle paylaşmayın
3. **Yedek**: İşlem öncesi veritabanı yedeği almanız önerilir
4. **Tekrar Çalıştırma**: Endpoint'i birden fazla kez çalıştırabilirsiniz, zararsızdır

## 🔍 Kontrol

Düzeltme sonrası, admin panelinden bir görseli açıp URL'in doğru olduğundan emin olun:
- ✅ `https://...supabase.co/storage/v1/object/public/images/...`
- ❌ `https://hastugg-2.onrender.comhttps://...supabase.co/...`

## 🆘 Sorun Giderme

**"401 Unauthorized" hatası:**
- Token'ın geçerli olduğundan emin olun
- Admin paneline tekrar giriş yapın

**"404 Not Found" hatası:**
- Endpoint URL'ini kontrol edin
- Render servisinin çalıştığından emin olun

**"500 Internal Server Error":**
- Render loglarını kontrol edin
- Veritabanı bağlantısını kontrol edin
