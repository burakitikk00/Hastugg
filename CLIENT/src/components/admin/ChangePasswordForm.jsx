import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLock, FaCheck, FaTimes } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const ChangePasswordForm = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Mevcut şifre zorunludur';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Yeni şifre zorunludur';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Yeni şifre en az 6 karakter olmalıdır';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Şifre onayı zorunludur';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Yeni şifre mevcut şifre ile aynı olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Rate limiting kontrolü
    if (isBlocked) {
      setMessage({
        type: 'error',
        text: `Çok fazla deneme yapıldı. ${blockTimeRemaining} saniye sonra tekrar deneyin.`
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminService.changePassword(formData);
      
      setMessage({
        type: 'success',
        text: response.message || 'Şifre başarıyla değiştirildi!'
      });
      
      // Başarılı işlem sonrası attempt count'u sıfırla
      setAttemptCount(0);
      
      // Formu temizle
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Eğer backend'den requiresReauth flag'i gelirse, kullanıcıyı çıkış yap
      if (response.requiresReauth) {
        setTimeout(() => {
          logout();
          navigate('/admin/login');
        }, 2000); // 2 saniye bekle, kullanıcı mesajı görebilsin
      }
      
    } catch (error) {
      // Hata durumunda attempt count'u artır
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      // 3 başarısız denemeden sonra 5 dakika blokla
      if (newAttemptCount >= 3) {
        setIsBlocked(true);
        setBlockTimeRemaining(300); // 5 dakika
        
        // Countdown timer
        const timer = setInterval(() => {
          setBlockTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsBlocked(false);
              setAttemptCount(0);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      
      setMessage({
        type: 'error',
        text: error.message || 'Şifre değiştirilirken bir hata oluştu'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthLevels = [
      { text: 'Çok zayıf', color: 'bg-red-500' },
      { text: 'Zayıf', color: 'bg-red-400' },
      { text: 'Orta', color: 'bg-yellow-400' },
      { text: 'İyi', color: 'bg-blue-400' },
      { text: 'Güçlü', color: 'bg-green-400' },
      { text: 'Çok güçlü', color: 'bg-green-500' }
    ];

    return {
      strength: Math.min(strength, 5),
      text: strengthLevels[Math.min(strength, 5)].text,
      color: strengthLevels[Math.min(strength, 5)].color
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FaLock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Şifre Değiştir</h2>
        <p className="text-gray-600 mt-3 text-lg">Hesap güvenliğiniz için şifrenizi güncelleyin</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <FaCheck className="w-5 h-5 mr-2" />
          ) : (
            <FaTimes className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mevcut Şifre */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Mevcut Şifre
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-4 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mevcut şifrenizi girin"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
          )}
        </div>

        {/* Yeni Şifre */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Yeni Şifre
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-4 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Yeni şifrenizi girin"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          {/* Şifre Gücü Göstergesi */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Şifre gücü:</span>
                <span className={`font-medium ${
                  passwordStrength.strength >= 3 ? 'text-green-600' : 
                  passwordStrength.strength >= 2 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        {/* Şifre Onayı */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Şifre Onayı
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-4 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                errors.confirmPassword 
                  ? 'border-red-500' 
                  : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                    ? 'border-green-500'
                    : 'border-gray-300'
              }`}
              placeholder="Yeni şifrenizi tekrar girin"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          {/* Gerçek zamanlı şifre eşleşme kontrolü */}
          {formData.confirmPassword && (
            <div className="mt-2">
              {formData.newPassword === formData.confirmPassword ? (
                <div className="flex items-center text-green-600">
                  <FaCheck className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Şifreler eşleşiyor</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <FaTimes className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Şifreler eşleşmiyor</span>
                </div>
              )}
            </div>
          )}
          
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Güvenlik İpuçları */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Güvenlik İpuçları:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• En az 6 karakter kullanın</li>
            <li>• Büyük ve küçük harf karışımı kullanın</li>
            <li>• Sayı ve özel karakter ekleyin</li>
            <li>• Kişisel bilgilerinizi kullanmayın</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isBlocked}
          className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors duration-200 text-lg ${
            isLoading || isBlocked
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Değiştiriliyor...
            </div>
          ) : isBlocked ? (
            `Bloklu (${Math.floor(blockTimeRemaining / 60)}:${(blockTimeRemaining % 60).toString().padStart(2, '0')})`
          ) : (
            'Şifreyi Değiştir'
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
