import { useState, useEffect } from 'react';
import FormButtons from './FormButtons';
import { FaEnvelope, FaKey, FaServer, FaCog, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import adminService from '../../services/adminService';

const EmailSettingsEditor = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    email_user: '',
    email_pass: ''
  });

  const [isLoading, setIsLoading] = useState(false);
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
      console.error('Email ayarları yüklenirken hata:', error);
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
    setIsLoading(true);
    setTestResult(null);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Email ayarları kaydedilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!formData.email_user || !formData.email_pass) {
      setTestResult({ success: false, message: 'Email kullanıcı adı ve şifresi gerekli' });
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
        message: error.response?.data?.message || error.message || 'Test e-postası gönderilemedi'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isFormValid = formData.email_user && formData.email_pass;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FaEnvelope className="mr-2" />
          Email Ayarları
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          İletişim formundan gelen mesajların gönderileceği email ayarlarını yapılandırın
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Email Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email_user" className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-1" />
              Gmail Adresi *
            </label>
            <input
              type="email"
              id="email_user"
              name="email_user"
              value={formData.email_user}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your-email@gmail.com"
            />
          </div>

          <div>
            <label htmlFor="email_pass" className="block text-sm font-medium text-gray-700 mb-2">
              <FaKey className="inline mr-1" />
              App Password *
            </label>
            <input
              type="password"
              id="email_pass"
              name="email_pass"
              value={formData.email_pass}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Gmail App Password"
            />
            <p className="text-xs text-gray-500 mt-1">
              Gmail için: Google hesabınızda 2FA aktif olmalı ve App Password oluşturmalısınız
            </p>
          </div>
        </div>

        {/* Test Sonucu */}
        {testResult && (
          <div className={`p-4 rounded-lg flex items-center ${
            testResult.success 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {testResult.success ? (
              <FaCheck className="mr-2 flex-shrink-0" />
            ) : (
              <FaExclamationTriangle className="mr-2 flex-shrink-0" />
            )}
            <span className="text-sm">{testResult.message}</span>
          </div>
        )}

        {/* Mevcut Ayarlar Bilgisi */}
        {existingSettings && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Mevcut Ayarlar</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Email:</strong> {existingSettings.email_user}</p>
            </div>
          </div>
        )}

        {/* Form Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={!isFormValid || isTesting}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
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
          
          <FormButtons
            onSave={handleSubmit}
            onCancel={onCancel}
            saveText="Kaydet"
            isLoading={isLoading}
            saveDisabled={!isFormValid}
          />
        </div>
      </form>
    </div>
  );
};

export default EmailSettingsEditor;
