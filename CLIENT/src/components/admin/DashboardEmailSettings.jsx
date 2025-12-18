import { useState, useEffect } from 'react';
import { FaEnvelope, FaKey, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import adminService from '../../services/adminService';
import logger from '../../utils/logger';

const DashboardEmailSettings = ({ onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    email_user: '',
    email_pass: ''
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [existingSettings, setExistingSettings] = useState(null);

  // Mevcut ayarları yükle
  useEffect(() => {
    loadExistingSettings();
  }, []);

  const loadExistingSettings = async () => {
    try {
      const settings = await adminService.getEmailSettings();
      if (settings) {
        setExistingSettings(settings);
        setFormData({
          email_user: settings.email_user || '',
          email_pass: settings.email_pass === '••••••••' ? '' : settings.email_pass || ''
        });
      }
    } catch (error) {
      logger.error('Email ayarları yüklenirken hata:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTestResult(null);
    await onSave(formData);
  };

  const handleTest = async () => {
    if (!formData.email_user || !formData.email_pass) {
      setTestResult({ success: false, message: 'Gmail adresi ve App Password gerekli' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Önce ayarları kaydet
      await adminService.saveEmailSettings(formData);
      
      // Sonra test et (artık şifre göndermeye gerek yok)
      const result = await adminService.testEmailSettings();
      setTestResult({ success: true, message: result.message });
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error.response?.data?.details || error.message || 'Test e-postası gönderilemedi'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isFormValid = formData.email_user && formData.email_pass;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-2">
          <FaEnvelope className="mr-2" />
          Email Ayarları
        </h3>
        <p className="text-sm text-gray-600">
          İletişim formundan gelen mesajların gönderileceği Gmail ayarları
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email_user" className="block text-sm font-medium text-gray-700 mb-1">
              Gmail Adresi *
            </label>
            <input
              type="email"
              id="email_user"
              name="email_user"
              value={formData.email_user}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="your-email@gmail.com"
            />
          </div>

          <div>
            <label htmlFor="email_pass" className="block text-sm font-medium text-gray-700 mb-1">
              App Password *
            </label>
            <input
              type="password"
              id="email_pass"
              name="email_pass"
              value={formData.email_pass}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Gmail App Password"
            />
          </div>
        </div>

        {/* Test Sonucu */}
        {testResult && (
          <div className={`p-3 rounded-lg flex items-center text-sm ${
            testResult.success 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {testResult.success ? (
              <FaCheck className="mr-2 flex-shrink-0" />
            ) : (
              <FaExclamationTriangle className="mr-2 flex-shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Mevcut Ayarlar Bilgisi */}
        {existingSettings && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Mevcut Ayarlar</h4>
            <div className="text-xs text-blue-700">
              <p><strong>Email:</strong> {existingSettings.email_user}</p>
            </div>
          </div>
        )}

        {/* Form Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={handleTest}
            disabled={!isFormValid || isTesting}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-sm"
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Test Ediliyor...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" />
                Test Et
              </>
            )}
          </button>
          
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
          >
            İptal
          </button>
        </div>
      </form>

      {/* Bilgi Kutusu */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Gmail App Password Nasıl Oluşturulur?</h4>
        <ol className="text-xs text-gray-600 list-decimal list-inside space-y-1">
          <li>Google hesabınıza giriş yapın</li>
          <li>Hesap güvenliği → 2FA aktif edin</li>
          <li>"App passwords" → Yeni App Password oluşturun</li>
          <li>16 haneli şifreyi buraya girin</li>
        </ol>
      </div>
    </div>
  );
};

export default DashboardEmailSettings;
