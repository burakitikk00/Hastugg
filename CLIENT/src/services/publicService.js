import API_CONFIG from '../config/api.js';

class PublicService {
  constructor() {
    // URL'leri her seferinde dinamik olarak al
    this.cache = {};
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

  CACHE_PREFIX = 'hastug_cache_';
  DEFAULT_TTL = 15 * 60 * 1000; // 15 dakika

  // Yerel veya bellek içi önbellekten oku
  getCache(key) {
    // 1. Önce RAM (bellek içi) kontrolü
    if (this.cache[key] !== undefined) {
      return this.cache[key];
    }
    // 2. LocalStorage kontrolü
    try {
      const item = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (!parsed || parsed.data === undefined) return null;
      // RAM'e de al
      this.cache[key] = parsed.data;
      return parsed.data;
    } catch {
      return null;
    }
  }

  // Önbellek süresinin dolup dolmadığını kontrol et
  isCacheStale(key, maxAge = this.DEFAULT_TTL) {
    try {
      const item = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!item) return true;
      const parsed = JSON.parse(item);
      if (!parsed || !parsed.timestamp) return true;
      return Date.now() - parsed.timestamp > maxAge;
    } catch {
      return true;
    }
  }

  // Önbelleğe yaz (hem RAM hem localStorage)
  setCache(key, data) {
    this.cache[key] = data;
    try {
      localStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (e) {
      console.warn('LocalStorage yazma hatası:', e);
    }
  }

  // Önbelleği temizle (belirli bir anahtar veya tamamı)
  clearCache(key = null) {
    if (key) {
      delete this.cache[key];
      try {
        localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
      } catch (e) {}
    } else {
      this.cache = {};
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(this.CACHE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch (e) {}
    }
  }

  // İsteği yap ve önbelleğe kaydet
  async fetchAndCache(endpoint, cacheKey) {
    const data = await this.request(endpoint);
    this.setCache(cacheKey, data);
    return data;
  }

  // Hero verilerini getir (SWR destekli)
  async getHero(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getCache('hero');
      if (cached) {
        if (this.isCacheStale('hero')) {
          this.fetchAndCache('/hero', 'hero').catch(() => {});
        }
        return cached;
      }
    }
    return this.fetchAndCache('/hero', 'hero');
  }

  // About verilerini getir (SWR destekli)
  async getAbout(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getCache('about');
      if (cached) {
        if (this.isCacheStale('about')) {
          this.fetchAndCache('/about', 'about').catch(() => {});
        }
        return cached;
      }
    }
    return this.fetchAndCache('/about', 'about');
  }

  // İletişim bilgilerini getir (SWR destekli)
  async getContact(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getCache('contact');
      if (cached) {
        if (this.isCacheStale('contact')) {
          this.fetchAndCache('/contact', 'contact').catch(() => {});
        }
        return cached;
      }
    }
    return this.fetchAndCache('/contact', 'contact');
  }

  // Projeleri getir (SWR destekli)
  async getProjects(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getCache('projects');
      if (cached) {
        if (this.isCacheStale('projects')) {
          this.fetchAndCache('/projects', 'projects').catch(() => {});
        }
        return cached;
      }
    }
    return this.fetchAndCache('/projects', 'projects');
  }

  // Cache'den senkron olarak projeleri al
  getCachedProjects() {
    return this.getCache('projects');
  }

  // Hizmetleri getir (SWR destekli)
  async getServices(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getCache('services');
      if (cached) {
        if (this.isCacheStale('services')) {
          this.fetchAndCache('/services', 'services').catch(() => {});
        }
        return cached;
      }
    }
    return this.fetchAndCache('/services', 'services');
  }

  // Cache'den senkron olarak hizmetleri al
  getCachedServices() {
    return this.getCache('services');
  }

  // Team üyelerini getir (SWR destekli)
  async getTeam(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getCache('team');
      if (cached) {
        if (this.isCacheStale('team')) {
          this.fetchAndCache('/team', 'team').catch(() => {});
        }
        return cached;
      }
    }
    return this.fetchAndCache('/team', 'team');
  }

  // Cache'den senkron olarak team verilerini al
  getCachedTeam() {
    return this.getCache('team');
  }

  // Analytics ayarlarını getir
  async getAnalyticsSettings(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getCache('analytics_settings');
      if (cached) {
        if (this.isCacheStale('analytics_settings', 30 * 60 * 1000)) {
          this.request('/analytics-settings')
            .then(data => this.setCache('analytics_settings', data))
            .catch(() => {});
        }
        return cached;
      }
    }
    try {
      const data = await this.request('/analytics-settings');
      this.setCache('analytics_settings', data);
      return data;
    } catch (error) {
      return { measurement_id: null, is_active: false };
    }
  }

  // Tek bir hizmeti getir (Önbellekli)
  async getServiceById(id, forceRefresh = false) {
    const cacheKey = `service_${id}`;
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        if (this.isCacheStale(cacheKey)) {
          this.fetchAndCache(`/services/${id}`, cacheKey).catch(() => {});
        }
        return cached;
      }
    }
    return this.fetchAndCache(`/services/${id}`, cacheKey);
  }

  // Tek bir projeyi getir (Önbellekli)
  async getProjectById(id, forceRefresh = false) {
    const cacheKey = `project_${id}`;
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        if (this.isCacheStale(cacheKey)) {
          this.fetchAndCache(`/projects/${id}`, cacheKey).catch(() => {});
        }
        return cached;
      }
    }
    return this.fetchAndCache(`/projects/${id}`, cacheKey);
  }

  // İletişim formu mesajı gönder
  async submitContact(data) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export default new PublicService();