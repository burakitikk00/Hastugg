import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState({
    measurement_id: '',
    is_active: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadAnalyticsSettings();
  }, []);

  const loadAnalyticsSettings = async () => {
    try {
      const settings = await adminService.getAnalyticsSettings();
      setAnalyticsData(settings);
    } catch (error) {
      logger.error('Analytics ayarları yüklenirken hata:', error);
      alert(`Analytics ayarları yüklenirken bir hata oluştu: ${error.message}`);
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
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await adminService.saveAnalyticsSettings(analyticsData);
      alert('Analytics ayarları başarıyla kaydedildi!');
      setTestResult(null);
    } catch (error) {
      logger.error('Analytics ayarları kaydedilirken hata:', error);
      alert(`Analytics ayarları kaydedilirken bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!analyticsData.measurement_id) {
      alert('Lütfen önce Measurement ID girin');
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminService.testAnalyticsSettings(analyticsData.measurement_id);
      setTestResult(result);
      if (result.success) {
        alert('Test başarılı! Measurement ID formatı doğru.');
      }
    } catch (error) {
      logger.error('Analytics test hatası:', error);
      setTestResult({ success: false, message: error.message });
      alert(`Test sırasında hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    loadAnalyticsSettings();
    setTestResult(null);
  };

  if (isLoadingData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Analytics ayarları yükleniyor...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">Google Analytics Ayarları</h1>
          <p className="text-gray-600 mt-2">
            Google Analytics Measurement ID'nizi yapılandırın ve ziyaretçi takibini aktif edin
          </p>
        </div>

        {/* Analytics Settings Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Ayarları</h2>
          
          <div className="space-y-4">
            {/* Measurement ID */}
            <div>
              <label htmlFor="measurement_id" className="block text-sm font-medium text-gray-700 mb-2">
                Google Analytics Measurement ID
              </label>
              <input
                type="text"
                id="measurement_id"
                name="measurement_id"
                value={analyticsData.measurement_id}
                onChange={handleInputChange}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Google Analytics hesabınızdan alacağınız Measurement ID (G-XXXXXXXXXX formatında)
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={analyticsData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Google Analytics'i aktif et
              </label>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`mt-4 p-4 rounded-md ${
              testResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`text-sm ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testResult.message}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            
            <button
              onClick={handleTest}
              disabled={isLoading || !analyticsData.measurement_id}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Test Ediliyor...' : 'Test Et'}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İptal
            </button>
          </div>
        </div>

        {/* Bilgi Kutusu */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Google Analytics Nasıl Kurulur?</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li><a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">analytics.google.com</a> adresine gidin</li>
              <li>Google hesabınızla giriş yapın</li>
              <li>"Start measuring" butonuna tıklayın</li>
              <li>Hesap adı: "Hastugg Construction" girin</li>
              <li>Web sitenizin URL'sini girin</li>
              <li>"Create" butonuna tıklayın</li>
              <li>Measurement ID'yi kopyalayın (G-XXXXXXXXXX formatında)</li>
              <li>Bu ID'yi yukarıdaki alana yapıştırın</li>
            </ol>
          </div>
        </div>

        {/* Durum Bilgisi */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-800 mb-3">📊 Analytics Durumu</h3>
          <div className="text-sm text-green-700 space-y-2">
            <p>
              <strong>Mevcut Durum:</strong> {analyticsData.is_active ? '✅ Aktif' : '❌ Pasif'}
            </p>
            {analyticsData.measurement_id && analyticsData.measurement_id !== 'G-XXXXXXXXXX' && (
              <p>
                <strong>Measurement ID:</strong> {analyticsData.measurement_id}
              </p>
            )}
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Analytics aktif edildiğinde ziyaretçi takibi otomatik başlar</li>
              <li>Veriler 24-48 saat sonra Google Analytics'te görünür</li>
              <li>Dashboard'da ziyaretçi sayısını görebilirsiniz</li>
              <li>Detaylı raporlar için Google Analytics'e giriş yapın</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
