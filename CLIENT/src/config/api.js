// API Configuration
const API_CONFIG = {
  // Sadece production URL kullan
  get BASE_URL() {
    return 'https://hastugg.onrender.com';
  },
  
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

export default API_CONFIG;
