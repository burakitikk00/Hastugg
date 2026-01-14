import API_CONFIG from '../config/api.js';

class PublicService {
  constructor() {
    // URL'leri her seferinde dinamik olarak al
  }

  // Dinamik URL getter'ları
  get baseURL() {
    return API_CONFIG.API_BASE_URL;
  }

  get serverURL() {
    return API_CONFIG.SERVER_BASE_URL;
  }

  // Görsel URL'ini tam URL'ye dönüştür
  getImageURL(imagePath) {
    if (!imagePath) return '/api/placeholder/400/300';
    
    // String'e çevir ve trim yap
    let url = String(imagePath).trim();
    
    // Render öneki temizleme: Eğer URL'de birden fazla https:// varsa, son https://'den başla
    // Örnek: https://hastugg-2.onrender.comhttps://ancyfbusyllkwekachls.supabase.co/...
    const httpsMatches = url.match(/https?:\/\//g);
    if (httpsMatches && httpsMatches.length > 1) {
      // Son https://'in pozisyonunu bul
      let lastHttpsIndex = url.lastIndexOf('https://');
      if (lastHttpsIndex === -1) {
        lastHttpsIndex = url.lastIndexOf('http://');
      }
      if (lastHttpsIndex !== -1 && lastHttpsIndex > 0) {
        // Son https://'den başlayarak URL'yi al
        url = url.substring(lastHttpsIndex);
      }
    }
    
    // Eğer URL içinde Supabase URL'i varsa, sadece Supabase URL'ini al
    // Bu, yanlış birleştirilmiş URL'leri düzeltir
    if (url.includes('supabase.co')) {
      // Supabase URL'ini bul (https:// ile başlayan, supabase.co içeren ve tam path'i içeren)
      // Regex: https:// ile başla, supabase.co'ya kadar olan domain'i al, sonra tüm path'i al
      // Path: / karakterinden sonra boşluk, tırnak, apostrof veya string sonuna kadar
      const supabaseMatch = url.match(/https?:\/\/[^\/]*supabase\.co\/[^\s"']*/);
      if (supabaseMatch) {
        // Eğer match sonunda boşluk, tırnak veya apostrof varsa temizle
        let cleanUrl = supabaseMatch[0].trim();
        // Son karakteri kontrol et ve gerekiyorsa temizle
        while (cleanUrl.endsWith('"') || cleanUrl.endsWith("'") || cleanUrl.endsWith(' ')) {
          cleanUrl = cleanUrl.slice(0, -1).trim();
        }
        return cleanUrl;
      }
      
      // Eğer path yoksa (sadece domain), yine de döndür
      const supabaseDomainMatch = url.match(/https?:\/\/[^\/]*supabase\.co/);
      if (supabaseDomainMatch) {
        return supabaseDomainMatch[0];
      }
    }
    
    // Zaten tam URL ise (http:// veya https:// ile başlıyorsa) - direkt döndür
    // Bu, tüm tam URL'leri destekler (Supabase, CDN, vb.)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Eski format URL'ler (/uploads/...) - artık çalışmıyor, placeholder döndür
    if (url.startsWith('/uploads/')) {
      console.warn('Eski format URL tespit edildi (local storage):', url, '- Lütfen görseli yeniden yükleyin');
      return '/api/placeholder/400/300';
    }
    
    // Diğer durumlar için: Geriye dönük uyumluluk için server URL ile birleştirmeyi dene
    // Ancak bu durumda console'a uyarı yazdır çünkü bu format artık desteklenmiyor
    console.warn('Tanınmayan URL formatı:', url, '- Server URL ile birleştiriliyor (geriye dönük uyumluluk)');
    return `${this.serverURL}${url}`;
  }

  // Hero verilerini getir (herkes erişebilir)
  async getHero() {
    try {
      const response = await fetch(`${this.baseURL}/hero`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hero API hatası:', response.status, errorText);
        throw new Error(`Hero verileri getirilemedi: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Hero fetch hatası:', error);
      throw error;
    }
  }

  // About verilerini getir (herkes erişebilir)
  async getAbout() {
    try {
      const response = await fetch(`${this.baseURL}/about`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('About API hatası:', response.status, errorText);
        throw new Error(`About verileri getirilemedi: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('About fetch hatası:', error);
      throw error;
    }
  }

  // İletişim bilgilerini getir (herkes erişebilir)
  async getContact() {
    try {
      const response = await fetch(`${this.baseURL}/contact`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Contact API hatası:', response.status, errorText);
        throw new Error(`İletişim bilgileri getirilemedi: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Contact fetch hatası:', error);
      throw error;
    }
  }

  // Projeleri getir (herkes erişebilir)
  async getProjects() {
    try {
      const response = await fetch(`${this.baseURL}/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Projects API hatası:', response.status, errorText);
        throw new Error(`Projeler getirilemedi: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Projects fetch hatası:', error);
      throw error;
    }
  }

  // Hizmetleri getir (herkes erişebilir)
  async getServices() {
    try {
      const response = await fetch(`${this.baseURL}/services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Services API hatası:', response.status, errorText);
        throw new Error(`Hizmetler getirilemedi: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Services fetch hatası:', error);
      throw error;
    }
  }

  // Team üyelerini getir (herkes erişebilir)
  async getTeam() {
    try {
      const response = await fetch(`${this.baseURL}/team`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Team API hatası:', response.status, errorText);
        throw new Error(`Team üyeleri getirilemedi: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Team fetch hatası:', error);
      throw error;
    }
  }

  // Analytics ayarlarını getir (herkes erişebilir)
  async getAnalyticsSettings() {
    try {
      const response = await fetch(`${this.baseURL}/analytics-settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Analytics ayarları getirilemedi');
      }

      return await response.json();
    } catch (error) {
      // Analytics ayarları yüklenemezse varsayılan değer döndür
      return {
        measurement_id: null,
        is_active: false
      };
    }
  }
}

export default new PublicService();