import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaEnvelopeOpen, FaPaperPlane, FaChartLine, FaTools, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';
import logger from '../../utils/logger';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [messageStats, setMessageStats] = useState({
    total: 0,
    unread: 0,
    sent: 0
  });
  const [analyticsStats, setAnalyticsStats] = useState({
    isActive: false,
    measurementId: null,
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFixingUrls, setIsFixingUrls] = useState(false);
  const [fixUrlsResult, setFixUrlsResult] = useState(null);

  useEffect(() => {
    loadMessageStats();
    loadAnalyticsStats();
  }, []);

  const loadMessageStats = async () => {
    try {
      const stats = await adminService.getContactMessagesStats();
      setMessageStats(stats);
    } catch (error) {
      logger.error('Mesaj istatistikleri yüklenirken hata:', error);
      // Hata durumunda varsayılan değerler
      setMessageStats({ total: 0, unread: 0, sent: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyticsStats = async () => {
    try {
      const settings = await adminService.getAnalyticsSettings();
      setAnalyticsStats({
        isActive: settings.is_active,
        measurementId: settings.measurement_id,
        lastUpdated: settings.updated_at
      });
    } catch (error) {
      logger.error('Analytics ayarları yüklenirken hata:', error);
    }
  };

  const handleMessagesClick = () => {
    // Mesajlar sayfasına yönlendir
    navigate('/admin/contact-messages');
  };

  const handleFixUrls = async () => {
    if (!window.confirm('URL\'leri düzeltmek istediğinizden emin misiniz?\n\nBu işlem veritabanındaki yanlış birleştirilmiş URL\'leri düzeltecektir.')) {
      return;
    }

    setIsFixingUrls(true);
    setFixUrlsResult(null);

    try {
      const result = await adminService.fixUrls();
      setFixUrlsResult(result);
      logger.log('URL düzeltme başarılı:', result);
      
      // 2 saniye sonra sonucu temizle
      setTimeout(() => {
        setFixUrlsResult(null);
      }, 5000);
    } catch (error) {
      logger.error('URL düzeltme hatası:', error);
      setFixUrlsResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsFixingUrls(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Hoş geldiniz! Buradan tüm işlemlerinizi yönetebilirsiniz.
            {messageStats.unread > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {messageStats.unread} yeni mesajınız var
              </span>
            )}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Toplam Mesajlar */}
          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleMessagesClick}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaEnvelope className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : messageStats.total}
                </p>
              </div>
            </div>
          </div>

          {/* Okunmamış Mesajlar */}
          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleMessagesClick}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FaEnvelopeOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Okunmamış Mesaj</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : messageStats.unread}
                </p>
              </div>
            </div>
          </div>

          {/* Toplam Mesajlar */}
          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleMessagesClick}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaEnvelope className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Mesajlar</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : messageStats.total}
                </p>
                <p className="text-xs text-gray-500 mt-1">Otomatik email gönderildi</p>
              </div>
            </div>
          </div>

          {/* Google Analytics */}
          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => navigate('/admin/analytics')}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${analyticsStats.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                <FaChartLine className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Google Analytics</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsStats.isActive ? (
                    <span className="text-green-600">Aktif</span>
                  ) : (
                    <span className="text-gray-500">Pasif</span>
                  )}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  {analyticsStats.isActive ? (
                    <div>
                      <p>ID: {analyticsStats.measurementId}</p>
                      <a 
                        href="https://analytics.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Raporları Görüntüle
                      </a>
                    </div>
                  ) : (
                    <p>Analytics ayarlarını yapılandırın</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* URL Düzeltme Butonu - Geçici */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaTools className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">URL Düzeltme Aracı</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Veritabanındaki yanlış birleştirilmiş görsel URL'lerini düzeltir
                </p>
                {fixUrlsResult && (
                  <div className={`mt-3 p-3 rounded-lg ${fixUrlsResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {fixUrlsResult.success ? (
                      <div className="flex items-start">
                        <FaCheckCircle className="text-green-600 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-800">URL'ler başarıyla düzeltildi!</p>
                          <div className="text-xs text-green-700 mt-1">
                            <p>• Projects: {fixUrlsResult.results?.projects?.fixed || 0} düzeltildi</p>
                            <p>• Images: {fixUrlsResult.results?.images?.fixed || 0} düzeltildi</p>
                            <p>• Team: {fixUrlsResult.results?.team?.fixed || 0} düzeltildi</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <FaExclamationTriangle className="text-red-600 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Hata oluştu</p>
                          <p className="text-xs text-red-700 mt-1">{fixUrlsResult.error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleFixUrls}
              disabled={isFixingUrls}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isFixingUrls
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              {isFixingUrls ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Düzeltiliyor...
                </span>
              ) : (
                'URL\'leri Düzelt'
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
