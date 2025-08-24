const API_BASE_URL = 'http://localhost:5000/api/admin';

class AdminService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Token'ı header'lara ekle
  getHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Admin girişi
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Admin kaydı
  async register(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.text();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Hero verilerini kaydet/güncelle
  async saveHero(heroData) {
    try {
      const response = await fetch(`${this.baseURL}/hero`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(heroData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Services verilerini getir
  async getServices() {
    try {
      const response = await fetch(`${this.baseURL}/services`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Services verilerini kaydet/güncelle
  async saveServices(servicesData) {
    try {
      const response = await fetch(`${this.baseURL}/services`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(servicesData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Görsel yükle
  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.baseURL}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': this.getHeaders().Authorization
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Token doğrulama
  async verifyToken() {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return false;
      }

      // Token'ın geçerliliğini kontrol etmek için basit bir istek
      const response = await fetch(`${this.baseURL}/services`, {
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new AdminService();
