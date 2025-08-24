const API_BASE_URL = 'http://localhost:5000/api';

class PublicService {
  constructor() {
    this.baseURL = API_BASE_URL;
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
}

export default new PublicService();
