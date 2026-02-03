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

  // Merkezi istek yönetimi
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (response.status === 429) {
        console.warn('Rate limit aşıldı:', endpoint);
        const error = new Error('Çok fazla istek yapıldı. Lütfen biraz bekleyin.');
        error.isRateLimit = true;
        throw error;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API hatası (${endpoint}):`, response.status, errorText);
        throw new Error(`Veri getirilemedi: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Fetch hatası (${endpoint}):`, error);
      throw error;
    }
  }

  // Hero verilerini getir
  async getHero() {
    return this.request('/hero');
  }

  // About verilerini getir
  async getAbout() {
    return this.request('/about');
  }

  // İletişim bilgilerini getir
  async getContact() {
    return this.request('/contact');
  }

  // Projeleri getir
  async getProjects() {
    return this.request('/projects');
  }

  // Hizmetleri getir
  async getServices() {
    return this.request('/services');
  }

  // Team üyelerini getir
  async getTeam() {
    return this.request('/team');
  }

  // Analytics ayarlarını getir
  async getAnalyticsSettings() {
    try {
      return await this.request('/analytics-settings');
    } catch (error) {
      return { measurement_id: null, is_active: false };
    }
  }

  // Tek bir hizmeti getir
  async getServiceById(id) {
    return this.request(`/services/${id}`);
  }

  // Tek bir projeyi getir
  async getProjectById(id) {
    return this.request(`/projects/${id}`);
  }
}

export default new PublicService();