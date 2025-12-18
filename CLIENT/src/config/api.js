const PRODUCTION_BASE_URL = 'https://hastugg-2.onrender.com';
const LOCAL_BASE_URL = 'http://localhost';
const DEFAULT_LOCAL_PORT = '5000';

// Belirlenen önceliğe göre backend adresini çözümle
const resolveBaseUrl = () => {
  const envUrl = import.meta?.env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalHost = ['localhost', '127.0.0.1'].includes(hostname);

    if (isLocalHost) {
      const port = import.meta?.env?.VITE_API_PORT || DEFAULT_LOCAL_PORT;
      return `${LOCAL_BASE_URL}:${port}`;
    }
  }

  return PRODUCTION_BASE_URL;
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
