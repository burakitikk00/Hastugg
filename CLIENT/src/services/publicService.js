const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
const SERVER_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class PublicService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.serverURL = SERVER_BASE_URL;
  }

  // Görsel URL'ini tam URL'ye dönüştür
  getImageURL(imagePath) {
    if (!imagePath) return '/api/placeholder/400/300';
    if (imagePath.startsWith('http')) return imagePath; // Zaten tam URL
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
        throw new Error('Hero verileri getirilemedi');
      }

      return await response.json();
    } catch (error) {
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
        throw new Error('About verileri getirilemedi');
      }

      return await response.json();
    } catch (error) {
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
        throw new Error('İletişim bilgileri getirilemedi');
      }

      return await response.json();
    } catch (error) {
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
        throw new Error('Projeler getirilemedi');
      }

      return await response.json();
    } catch (error) {
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
        throw new Error('Hizmetler getirilemedi');
      }

      return await response.json();
    } catch (error) {
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
        throw new Error('Team üyeleri getirilemedi');
      }

      return await response.json();
    } catch (error) {
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
