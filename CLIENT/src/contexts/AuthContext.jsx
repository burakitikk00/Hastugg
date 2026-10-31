import { createContext, useContext, useState, useEffect } from 'react';
import adminService from '../services/adminService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sayfa ilk açıldığında localStorage'daki token'ı doğrula
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token && typeof token === 'string' && token !== '[object Object]') {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          // Süre dolmadıysa oturumu geçerli say
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
            setUser({ username: payload.username, id: payload.id });
          } else {
            // Süresi geçmiş token
            localStorage.removeItem('adminToken');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Admin Girişi (LoginForm'dan çağrılır)
  const login = async (credentialsOrToken, userData) => {
    // Eğer doğrudan JWT string ve userData verilmişse (eski uyumluluk)
    if (typeof credentialsOrToken === 'string') {
      localStorage.setItem('adminToken', credentialsOrToken);
      setIsAuthenticated(true);
      setUser(userData || null);
      return { success: true };
    }

    // credentials nesnesi ({ username, password }) gönderilmişse (LoginForm)
    try {
      const response = await adminService.login(credentialsOrToken);
      if (response && response.token) {
        localStorage.setItem('adminToken', response.token);
        setIsAuthenticated(true);
        try {
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          setUser({ username: payload.username, id: payload.id });
        } catch {
          setUser({ username: credentialsOrToken.username });
        }
        return { success: true };
      }
      return { 
        success: false, 
        error: response?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.' 
      };
    } catch (err) {
      return { 
        success: false, 
        error: err.message || 'Giriş yapılırken sunucu hatası oluştu.' 
      };
    }
  };

  // Çıkış
  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
