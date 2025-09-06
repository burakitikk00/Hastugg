// API Configuration
const API_CONFIG = {
  // Base URL - environment variable'dan al, yoksa localhost kullan
  get BASE_URL() {
    // Production'da VITE_API_URL kullan, development'ta localhost
    if (import.meta.env.PROD) {
      // Production'da mutlaka VITE_API_URL kullan
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
      }
      // Eğer VITE_API_URL yoksa Render URL'ini kullan
      console.warn('VITE_API_URL bulunamadı, Render URL kullanılıyor');
      return 'https://hastugg.onrender.com';
    }
    // Development ortamında localhost kullan
    return 'http://localhost:5000';
  },
  
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

// Debug için console'a yazdır
console.log('API Config:', {
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  BASE_URL: API_CONFIG.BASE_URL,
  API_BASE_URL: API_CONFIG.API_BASE_URL,
  ADMIN_API_URL: API_CONFIG.ADMIN_API_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL
});

export default API_CONFIG;
