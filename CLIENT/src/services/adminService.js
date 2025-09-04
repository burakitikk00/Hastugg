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
}

export default new AdminService();
