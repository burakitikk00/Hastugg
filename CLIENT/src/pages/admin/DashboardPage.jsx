import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaEnvelopeOpen, FaChartLine } from 'react-icons/fa';
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
    navigate('/admin/contact-messages');
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

          {/* Gönderilen Mesajlar */}
          <div
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={handleMessagesClick}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaEnvelope className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gönderilen</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : messageStats.sent}
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
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
