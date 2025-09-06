import { useState } from 'react';
import { FaEnvelope, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import adminService from '../../services/adminService';

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({
        type: 'error',
        text: 'E-posta adresi zorunludur.'
      });
      return;
    }

    // Basit e-posta validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({
        type: 'error',
        text: 'Geçerli bir e-posta adresi girin.'
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminService.forgotPassword(email);
      
      setMessage({
        type: 'success',
        text: response.message || 'Şifre sıfırlama e-postası başarıyla gönderildi!'
      });
      
      setIsEmailSent(true);
      
    } catch (error) {
      // 404 hatası için özel mesaj
      if (error.message.includes('kayıtlı değil')) {
        setMessage({
          type: 'error',
          text: 'Bu e-posta adresi sistemde kayıtlı değil. Lütfen doğru e-posta adresini girin.'
        });
      } else {
        setMessage({
          type: 'error',
          text: error.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FaCheck className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">E-posta Gönderildi!</h2>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              Şifre sıfırlama e-postası <strong>{email}</strong> adresine gönderildi. 
              Lütfen e-posta kutunuzu kontrol edin ve spam klasörünü de kontrol etmeyi unutmayın.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Giriş Sayfasına Dön</span>
            </button>
            
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail('');
                setMessage({ type: '', text: '' });
              }}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Başka bir e-posta ile dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FaEnvelope className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Şifremi Unuttum</h2>
        <p className="text-gray-600 mt-2">
          E-posta adresinizi girin, size yeni bir şifre gönderelim.
        </p>
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
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            E-posta Adresi
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="ornek@email.com"
              required
            />
            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Güvenlik Bilgisi */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">Güvenlik Bilgisi:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• E-posta adresiniz sistemde kayıtlıysa yeni şifre gönderilecektir</li>
            <li>• Yeni şifre e-postanızda görünecektir</li>
            <li>• Giriş yaptıktan sonra şifrenizi değiştirmeniz önerilir</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Gönderiliyor...
            </div>
          ) : (
            'Şifre Sıfırlama E-postası Gönder'
          )}
        </button>

        {/* Back to Login */}
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Giriş Sayfasına Dön</span>
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
