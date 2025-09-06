// API Configuration
const API_CONFIG = {
  // Base URL - environment variable'dan al, yoksa localhost kullan
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // API endpoints
  get API_BASE_URL() {
    return `${this.BASE_URL}/api`;
  },
  
  get ADMIN_API_URL() {
    return `${this.BASE_URL}/api/admin`;
  },
  
  get SERVER_BASE_URL() {
    return this.BASE_URL;
  }
};

// Debug için console'a yazdır (sadece development'ta)
if (import.meta.env.DEV) {
  console.log('API Config:', {
    BASE_URL: API_CONFIG.BASE_URL,
    API_BASE_URL: API_CONFIG.API_BASE_URL,
    ADMIN_API_URL: API_CONFIG.ADMIN_API_URL
  });
}

export default API_CONFIG;
