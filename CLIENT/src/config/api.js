const LOCAL_BASE_URL = 'http://localhost';
const DEFAULT_LOCAL_PORT = '5000';

// Belirlenen önceliğe göre backend adresini çözümle
const resolveBaseUrl = () => {
  // Öncelik 1: Environment variable'dan al (Vercel, Render, local için set edilmeli)
  const envUrl = import.meta?.env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }

  // Öncelik 2: Local development için otomatik tespit
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalHost = ['localhost', '127.0.0.1'].includes(hostname);

    if (isLocalHost) {
      const port = import.meta?.env?.VITE_API_PORT || DEFAULT_LOCAL_PORT;
      return `${LOCAL_BASE_URL}:${port}`;
    }
  }

  // Fallback: Eğer hiçbir environment variable set edilmemişse hata ver
  console.error('❌ VITE_API_BASE_URL environment variable tanımlı değil!');
  console.error('📝 Lütfen CLIENT/.env dosyasında VITE_API_BASE_URL değişkenini tanımlayın.');
  console.error('   Local: VITE_API_BASE_URL=http://localhost:5000');
  console.error('   Production: VITE_API_BASE_URL=https://your-backend.onrender.com');
  
  // Development'da localhost'a fallback, production'da hata
  if (import.meta?.env?.MODE === 'development') {
    return `${LOCAL_BASE_URL}:${DEFAULT_LOCAL_PORT}`;
  }
  
  throw new Error('VITE_API_BASE_URL environment variable must be set for production');
};

// API Configuration
const API_CONFIG = {
  get BASE_URL() {
    return resolveBaseUrl();
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
