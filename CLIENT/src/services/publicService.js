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
    
    // Zaten tam URL ise (Supabase Storage veya başka bir URL)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Eski format URL'ler (/uploads/...) - artık çalışmıyor, placeholder döndür
    if (imagePath.startsWith('/uploads/')) {
      console.warn('Eski format URL tespit edildi:', imagePath, '- Lütfen görseli yeniden yükleyin');
      return '/api/placeholder/400/300';
    }
    
    // Diğer durumlar için server URL ile birleştir
    return `${this.serverURL}${imagePath}`;
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
