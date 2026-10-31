import { useState, useEffect } from 'react';
import FormButtons from './FormButtons';
import { FiMail, FiKey, FiCheck, FiAlertTriangle, FiSend } from 'react-icons/fi';
import adminService from '../../services/adminService';
import logger from '../../utils/logger';

const EmailSettingsEditor = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    email_user: '',
    email_pass: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [existingSettings, setExistingSettings] = useState(null);

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
    setIsLoading(true);
    setTestResult(null);

    try {
      await onSave(formData);
    } catch (error) {
      logger.error('Email ayarları kaydedilirken hata:', error);
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
      await adminService.saveEmailSettings(formData);
      const result = await adminService.testEmailSettings();
      setTestResult({ success: true, message: result.message || 'Test e-postası başarıyla gönderildi!' });
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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="px-6 py-4.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FiMail className="text-amber-600" />
            SMTP & E-Posta Yapılandırması
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            İletişim formundan gelen iletilerin sistem tarafından gönderilmesini sağlayan kimlik bilgileri
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
        {/* Email Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="email_user" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Gmail / Gönderici Adresi <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email_user"
              name="email_user"
              value={formData.email_user}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white"
              placeholder="ornek@gmail.com"
            />
          </div>

          <div>
            <label htmlFor="email_pass" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Gmail Uygulama Şifresi (16 Haneli) <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="email_pass"
              name="email_pass"
              value={formData.email_pass}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white font-mono"
              placeholder="••••••••••••••••"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Normal hesap şifrenizi değil, Google Güvenlik menüsünden üretilen 16 haneli App Password'ü girin.
            </p>
          </div>
        </div>

        {/* Test Sonucu Bildirimi */}
        {testResult && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
              testResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <FiCheck className="shrink-0 text-emerald-600" size={16} />
            ) : (
              <FiAlertTriangle className="shrink-0 text-rose-600" size={16} />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Mevcut Ayarlar Özeti */}
        {existingSettings?.email_user && (
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 flex items-center justify-between">
            <span>
              Aktif Gönderici: <strong className="text-slate-800 font-mono">{existingSettings.email_user}</strong>
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-100/70 font-semibold px-2 py-0.5 rounded-full">
              Kayıtlı
            </span>
          </div>
        )}

        {/* Butonlar & Test Etme */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleTest}
            disabled={!isFormValid || isTesting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-amber-900 bg-amber-50 hover:bg-amber-100/90 border border-amber-300/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isTesting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin" />
                <span>Test E-Postası Gönderiliyor...</span>
              </>
            ) : (
              <>
                <FiSend size={14} />
                <span>Ayarları Test Et</span>
              </>
            )}
          </button>

          <FormButtons
            onSave={handleSubmit}
            onCancel={onCancel}
            saveText="Ayarları Kaydet"
            isLoading={isLoading}
            isDisabled={!isFormValid}
          />
        </div>
      </form>
    </div>
  );
};

export default EmailSettingsEditor;
