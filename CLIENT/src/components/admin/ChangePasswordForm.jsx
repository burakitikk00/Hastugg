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
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/10 text-amber-600 rounded-2xl mb-3 shadow-[0_0_15px_rgba(229,169,60,0.1)]">
          <FaLock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Güvenlik & Şifre Değiştir</h2>
        <p className="text-slate-500 mt-1 text-xs">Hesap güvenliğinizi korumak için periyodik olarak şifrenizi güncelleyin</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center text-xs font-semibold ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? (
            <FaCheck className="w-4 h-4 mr-2 text-emerald-600" />
          ) : (
            <FaTimes className="w-4 h-4 mr-2 text-rose-600" />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mevcut Şifre */}
        <div>
          <label htmlFor="currentPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
            Mevcut Şifre <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className={`w-full px-3.5 py-2.5 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition-all bg-white ${
                errors.currentPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
              placeholder="Mevcut şifrenizi girin"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPasswords.current ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.currentPassword}</p>
          )}
        </div>

        {/* Yeni Şifre */}
        <div>
          <label htmlFor="newPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
            Yeni Şifre <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`w-full px-3.5 py-2.5 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition-all bg-white ${
                errors.newPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
              placeholder="En az 6 karakterli yeni şifre"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPasswords.new ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
            </button>
          </div>
          
          {/* Şifre Gücü Göstergesi */}
          {formData.newPassword && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Şifre gücü:</span>
                <span className={`font-semibold ${
                  passwordStrength.strength >= 3 ? 'text-emerald-600' : 
                  passwordStrength.strength >= 2 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {errors.newPassword && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.newPassword}</p>
          )}
        </div>

        {/* Şifre Onayı */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
            Yeni Şifre Tekrarı <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3.5 py-2.5 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition-all bg-white ${
                errors.confirmPassword 
                  ? 'border-rose-400 bg-rose-50/20' 
                  : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                    ? 'border-emerald-400'
                    : 'border-slate-300'
              }`}
              placeholder="Yeni şifrenizi doğrulayın"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPasswords.confirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
            </button>
          </div>
          
          {/* Gerçek zamanlı şifre eşleşme kontrolü */}
          {formData.confirmPassword && (
            <div className="mt-1.5">
              {formData.newPassword === formData.confirmPassword ? (
                <div className="flex items-center text-emerald-600 text-xs font-medium gap-1">
                  <FaCheck className="w-3.5 h-3.5" />
                  <span>Şifreler eşleşiyor</span>
                </div>
              ) : (
                <div className="flex items-center text-rose-600 text-xs font-medium gap-1">
                  <FaTimes className="w-3.5 h-3.5" />
                  <span>Şifreler eşleşmiyor</span>
                </div>
              )}
            </div>
          )}
          
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Güvenlik İpuçları */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
            Güçlü Şifre Kriterleri:
          </h4>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>• En az 6 (tercihen 8+) karakterden oluşmalıdır.</li>
            <li>• Büyük ve küçük harf kombinasyonları içermelidir.</li>
            <li>• Rakam ve özel karakterler (!@#$%^&*) ekleyiniz.</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isBlocked}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs hover:shadow transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              <span>Şifre Güncelleniyor...</span>
            </>
          ) : isBlocked ? (
            `Bloklu (${Math.floor(blockTimeRemaining / 60)}:${(blockTimeRemaining % 60).toString().padStart(2, '0')})`
          ) : (
            'Şifreyi Güncelle'
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
