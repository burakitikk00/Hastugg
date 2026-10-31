import { useState, useEffect } from 'react';
import {
  FiBarChart2,
  FiCheck,
  FiAlertTriangle,
  FiExternalLink,
  FiActivity,
  FiCheckCircle,
  FiShield,
  FiClock,
  FiX
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoadingState from '../../components/admin/AdminLoadingState';
import adminService from '../../services/adminService';
import logger from '../../utils/logger';

const AnalyticsPage = () => {
  const [savedSettings, setSavedSettings] = useState({
    measurement_id: '',
    is_active: false
  });
  const [analyticsData, setAnalyticsData] = useState({
    measurement_id: '',
    is_active: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadAnalyticsSettings();
  }, []);

  const loadAnalyticsSettings = async () => {
    try {
      const settings = await adminService.getAnalyticsSettings();
      const normalized = {
        measurement_id: settings.measurement_id || '',
        is_active: Boolean(settings.is_active)
      };
      setSavedSettings(normalized);
      setAnalyticsData(normalized);
    } catch (error) {
      logger.error('Analytics ayarları yüklenirken hata:', error);
      setNotification({
        type: 'error',
        message: `Analytics ayarları yüklenirken hata oluştu: ${error.message}`
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAnalyticsData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Değişiklik yapıldığında önceki bildirim veya test sonucunu sıfırla
    if (notification?.type === 'success') {
      setNotification(null);
    }
  };

  const hasChanges =
    Boolean(analyticsData.is_active) !== Boolean(savedSettings.is_active) ||
    (analyticsData.measurement_id || '').trim() !== (savedSettings.measurement_id || '').trim();

  const handleSave = async () => {
    setIsLoading(true);
    setNotification(null);
    try {
      await adminService.saveAnalyticsSettings(analyticsData);
      setSavedSettings({
        measurement_id: analyticsData.measurement_id,
        is_active: Boolean(analyticsData.is_active)
      });
      setNotification({
        type: 'success',
        message: 'Analytics ve takip tercihleri başarıyla kaydedildi ve sisteme uygulandı.'
      });
      setTestResult(null);
    } catch (error) {
      logger.error('Analytics ayarları kaydedilirken hata:', error);
      setNotification({
        type: 'error',
        message: `Analytics ayarları kaydedilirken hata oluştu: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!analyticsData.measurement_id) {
      setNotification({
        type: 'error',
        message: 'Lütfen önce geçerli bir Measurement ID girin.'
      });
      return;
    }

    setIsLoading(true);
    setNotification(null);
    try {
      const result = await adminService.testAnalyticsSettings(analyticsData.measurement_id);
      setTestResult(result);
      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Format testi başarılı! Measurement ID (G-XXXXXXXXXX) yapısı geçerli.'
        });
      }
    } catch (error) {
      logger.error('Analytics test hatası:', error);
      setTestResult({ success: false, message: error.message });
      setNotification({
        type: 'error',
        message: `Test sırasında hata: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAnalyticsData({ ...savedSettings });
    setTestResult(null);
    setNotification(null);
  };

  if (isLoadingData) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminPageHeader
            title="Google Analytics & Trafik Takibi"
            subtitle="Web sitesi ziyaretçi trafiği, sayfa görüntülemeleri ve kullanıcı etkileşimlerini ölçümleyin."
            badge="Trafik Ölçümü"
          />
          <AdminLoadingState type="form" message="Analytics ayarları yükleniyor..." />
        </div>
      </AdminLayout>
    );
  }

  // Header rozeti: Kaydedilmemiş değişiklik varsa "Kayıt Bekleniyor", aksi halde canlı durum
  const headerBadge = hasChanges
    ? 'Kayıt Bekleniyor'
    : savedSettings.is_active
    ? 'Trafik Takibi Aktif'
    : 'Trafik Takibi Pasif';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Google Analytics & Trafik Takibi"
          subtitle="Google Analytics Measurement ID'nizi yapılandırın, çerez izinlerini ve canlı ziyaretçi oturumu takibini yönetin."
          badge={headerBadge}
        />

        {/* Başarı / Hata Bildirim Çubuğu */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold animate-fadeIn border ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <FiCheckCircle className="text-emerald-600 shrink-0" size={16} />
              ) : (
                <FiAlertTriangle className="text-rose-600 shrink-0" size={16} />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        )}

        {/* Analytics Form Kartı */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FiBarChart2 className="text-amber-600" />
              Ölçümleme & Kod Yapılandırması
            </h2>
            <div className="flex items-center gap-2">
              {hasChanges ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Kayıt Bekleniyor</span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      savedSettings.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-xs font-semibold text-slate-600">
                    {savedSettings.is_active ? 'Canlıda Aktif' : 'Devre Dışı'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              <div>
                <label
                  htmlFor="measurement_id"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono"
                >
                  Google Analytics Measurement ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="measurement_id"
                  name="measurement_id"
                  value={analyticsData.measurement_id}
                  onChange={handleInputChange}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 font-mono transition-all bg-white"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Google Analytics 4 (GA4) veri akışı kimliği (G-XXXXXXXXXX formatında)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 font-mono">
                  İzleme Durumu
                </label>
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={analyticsData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 mt-0.5 text-amber-500 focus:ring-amber-400 rounded border-slate-300 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Google Analytics Takibini Canlıya Al
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Ziyaretçi çerezleri ve sayfa oturumlarını takip et
                    </span>
                  </div>
                </label>

                {/* Aktif/Pasif seçim değiştiğinde direkt değil kaydetmeyi bekle uyarısı */}
                {Boolean(analyticsData.is_active) !== Boolean(savedSettings.is_active) && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <FiClock className="text-amber-600 shrink-0 mt-0.5" size={15} />
                    <div className="space-y-0.5">
                      <span className="font-bold block">
                        {analyticsData.is_active
                          ? 'Aktifleştirme Seçildi (Kayıt Bekleniyor)'
                          : 'Devre Dışı Bırakıldı (Kayıt Bekleniyor)'}
                      </span>
                      <p className="text-amber-800/90 leading-relaxed">
                        {analyticsData.is_active
                          ? 'Ziyaretçi çerezleri ve oturum takibi direkt canlıya geçmez; ayarların veritabanına kaydedilmesi beklenmektedir. Lütfen "Ayarları Kaydet" butonuna tıklayınız.'
                          : 'Takibin sitede durdurulması için ayarların kaydedilmesi beklenmektedir.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Sonucu Bildirimi */}
            {testResult && (
              <div
                className={`p-4 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
                  testResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <FiCheck className="text-emerald-600 shrink-0" size={16} />
                ) : (
                  <FiAlertTriangle className="text-rose-600 shrink-0" size={16} />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleTest}
                disabled={isLoading || !analyticsData.measurement_id}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiActivity size={14} />
                <span>{isLoading ? 'Test Ediliyor...' : 'ID Formatını Test Et'}</span>
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {hasChanges && (
                  <span className="hidden sm:inline-block text-xs font-semibold text-amber-700 mr-1 animate-pulse">
                    Kaydedilmemiş değişiklikler var
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading || !hasChanges}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sıfırla
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading || !hasChanges}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <FiCheck size={16} />
                  <span>{isLoading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bilgilendirme ve Durum Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kurulum Rehberi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FiBarChart2 className="text-amber-600" />
                Google Analytics 4 Kurulumu
              </h3>
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                <span>Konsolu Aç</span>
                <FiExternalLink size={12} />
              </a>
            </div>

            <ol className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>analytics.google.com adresine şirket Gmail hesabınızla giriş yapın.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span>Yönetici &gt; Veri Akışları (Data Streams) altından Web Akışını seçin.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>Ölçüm Kimliğini (Measurement ID) kopyalayın (G- ile başlar).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
                <span>Buradaki alana yapıştırıp kutuyu işaretleyin ve <strong>"Ayarları Kaydet"</strong> butonuna basın.</span>
              </li>
            </ol>
          </div>

          {/* Durum Özeti */}
          <div className="bg-[#0b101b] text-slate-200 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <FiActivity className="text-amber-400" />
                Sistem Trafik Durumu
              </h3>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  savedSettings.is_active
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {savedSettings.is_active ? 'Canlı Takip Devrede' : 'Kayıt Yapılmıyor'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-amber-400 shrink-0" size={14} />
                <span>
                  Kayıtlı Canlı ID:{' '}
                  <strong className="font-mono text-white">
                    {savedSettings.measurement_id || 'Tanımlanmadı'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiShield className="text-amber-400 shrink-0" size={14} />
                <span>
                  <strong>Çerez İzni Kontrolü:</strong> Ziyaretçi çerezleri direkt yüklenmez; kullanıcı onayını kaydedene kadar takip başlatılmaz (KVKK/GDPR).
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-amber-400 shrink-0" size={14} />
                <span>Ziyaretçi trafiği Google Analytics panosuna yalnızca onay sonrasında aktarılır.</span>
              </div>
              {hasChanges && (
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-amber-300 text-[11px]">
                  <FiClock className="shrink-0 text-amber-400" size={13} />
                  <span>Kaydedilmemiş değişiklik var: Yeni ayar kaydedilene kadar canlı sistem etkilenmez.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
