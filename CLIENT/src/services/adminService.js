const API_BASE_URL = 'http://localhost:5000/api/admin';

class AdminService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // İletişim bilgilerini kaydet/güncelle
  async saveContact(contactData) {
    try {
      const response = await fetch(`${this.baseURL}/contact`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(contactData)
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

  // Token'ı header'lara ekle
  getHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Token'ı al
  getToken() {
    return localStorage.getItem('adminToken');
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

  // Hero verilerini getir
  async getHero() {
    try {
      const response = await fetch(`${this.baseURL}/hero`, {
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

  // About verilerini getir
  async getAbout() {
    try {
      const response = await fetch(`${this.baseURL}/about`, {
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

  // About verilerini kaydet/güncelle
  async saveAbout(aboutData) {
    try {
      const response = await fetch(`${this.baseURL}/about`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(aboutData)
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

  // PROJE YÖNETİMİ METHODLARİ

  // Projeleri listele
  async getProjects() {
    try {
      const response = await fetch(`${this.baseURL}/projects`, {
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

  // Belirli bir projenin detaylarını getir
  async getProject(id) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${id}`, {
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

  // Yeni proje ekle (görseller ile birlikte)
  async addProject(projectData, images) {
    try {
      const formData = new FormData();
      
      // Proje verilerini form data'ya ekle
      Object.keys(projectData).forEach(key => {
        if (projectData[key] !== undefined && projectData[key] !== null) {
          formData.append(key, projectData[key]);
        }
      });

      // Görselleri form data'ya ekle
      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await fetch(`${this.baseURL}/add-project`, {
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

  // Proje güncelle (SADECE proje bilgileri, görseller ayrı)
  async updateProject(id, projectData) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(projectData)
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

  // Proje sil
  async deleteProject(id) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${id}`, {
        method: 'DELETE',
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

  // Projeye yeni görseller ekle
  async addProjectImages(projectId, images, setAsMain = false) {
    try {
      const formData = new FormData();
      
      if (setAsMain) {
        formData.append('setAsMain', 'true');
      }

      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await fetch(`${this.baseURL}/projects/${projectId}/images`, {
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

  // Projenin belirli bir görselini sil
  async deleteProjectImage(projectId, imageURL) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}/images`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({ imageURL })
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

  // Ana görsel ayarla
  async setMainImage(projectId, imageURL) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}/main-image`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ imageURL })
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

  // TEAM YÖNETİMİ METHODLARİ

  // Team üyelerini listele
  async getTeam() {
    try {
      const response = await fetch(`${this.baseURL}/team`, {
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

  // Team üyesi ekle
  async addTeamMember(memberData, imageFile = null) {
    try {
      const formData = new FormData();
      
      // Üye verilerini form data'ya ekle
      Object.keys(memberData).forEach(key => {
        if (memberData[key] !== undefined && memberData[key] !== null) {
          formData.append(key, memberData[key]);
        }
      });

      // Resim varsa ekle
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${this.baseURL}/team`, {
        method: 'POST',
        headers: {
          'Authorization': this.getHeaders().Authorization
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Team üyesi güncelle
  async updateTeamMember(id, memberData, imageFile = null) {
    try {
      const formData = new FormData();
      
      // Üye verilerini form data'ya ekle
      Object.keys(memberData).forEach(key => {
        if (memberData[key] !== undefined && memberData[key] !== null) {
          formData.append(key, memberData[key]);
        }
      });

      // Resim varsa ekle
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${this.baseURL}/team/${id}`, {
        method: 'PUT',
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

  // Team üyesi sil
  async deleteTeamMember(id) {
    try {
      const response = await fetch(`${this.baseURL}/team/${id}`, {
        method: 'DELETE',
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

  // Team üyesi resmi sil
  async deleteTeamMemberImage(id) {
    try {
      const response = await fetch(`${this.baseURL}/team/${id}/image`, {
        method: 'DELETE',
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

  // EMAIL AYARLARI METHODLARİ

  // Email ayarlarını getir
  async getEmailSettings() {
    try {
      const response = await fetch(`${this.baseURL}/email-settings`, {
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

  // Email ayarlarını kaydet/güncelle
  async saveEmailSettings(emailData) {
    try {
      const response = await fetch(`${this.baseURL}/email-settings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Email ayarları kaydedilemedi');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Email ayarlarını test et
  async testEmailSettings() {
    try {
      const response = await fetch(`${this.baseURL}/email-settings/test`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Test e-postası gönderilemedi');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Contact Messages CRUD Operations

  // Contact mesajları istatistiklerini getir
  async getContactMessagesStats() {
    try {
      const response = await fetch(`${this.baseURL}/contact-messages/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Contact mesajları istatistikleri alınamadı');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Contact mesajlarını getir (sayfalama ile)
  async getContactMessages(page = 1, limit = 10, filter = 'all') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        filter: filter
      });

      const response = await fetch(`${this.baseURL}/contact-messages?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Contact mesajları alınamadı');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Contact mesajını okundu olarak işaretle
  async markContactMessageAsRead(id) {
    try {
      const response = await fetch(`${this.baseURL}/contact-messages/${id}/read`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Mesaj okundu olarak işaretlenemedi');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Contact mesajını e-posta olarak gönder
  async sendContactMessageEmail(id) {
    try {
      const response = await fetch(`${this.baseURL}/contact-messages/${id}/send-email`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'E-posta gönderilemedi');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Contact mesajını sil
  async deleteContactMessage(id) {
    try {
      const response = await fetch(`${this.baseURL}/contact-messages/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Mesaj silinemedi');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // ==================== GOOGLE ANALYTICS AYARLARI ====================

  // Analytics ayarlarını getir
  async getAnalyticsSettings() {
    try {
      const response = await fetch(`${this.baseURL}/analytics-settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analytics ayarları alınamadı');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Analytics ayarlarını kaydet
  async saveAnalyticsSettings(analyticsData) {
    try {
      const response = await fetch(`${this.baseURL}/analytics-settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analyticsData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analytics ayarları kaydedilemedi');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Analytics ayarlarını test et
  async testAnalyticsSettings(measurementId) {
    try {
      const response = await fetch(`${this.baseURL}/analytics-settings/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ measurement_id: measurementId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analytics test edilemedi');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // ==================== ŞİFRE DEĞİŞTİRME ====================

  // Admin şifresini değiştir
  async changePassword(passwordData) {
    try {
      const response = await fetch(`${this.baseURL}/change-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Şifre değiştirilemedi');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // ==================== ŞİFRE SIFIRLAMA ====================

  // Şifre sıfırlama isteği gönder
  async forgotPassword(email) {
    try {
      const response = await fetch(`${this.baseURL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Şifre sıfırlama isteği gönderilemedi');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default new AdminService();
