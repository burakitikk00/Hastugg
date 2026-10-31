import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiInbox,
  FiMail,
  FiSend,
  FiBarChart2,
  FiArrowUpRight,
  FiUsers,
  FiBriefcase,
  FiLayers,
  FiCheckCircle,
  FiShield
} from 'react-icons/fi';
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Karşılama ve Durum Kartı */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                  HASTUĞ YÖNETİM SİSTEMİ
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Hoş Geldiniz, Yönetici Paneli
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Portfolyo projeleri, mimari & mühendislik ekip kadrosu ve gelen müşteri taleplerini tek merkezden yönetin.
              </p>
            </div>

            {messageStats.unread > 0 ? (
              <button
                onClick={() => navigate('/admin/contact-messages')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 text-xs font-bold hover:bg-amber-500/25 transition-all self-start md:self-auto"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>{messageStats.unread} Okunmamış İletişim Mesajı</span>
                <FiArrowUpRight size={14} />
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 text-xs font-medium border border-emerald-500/20 self-start md:self-auto">
                <FiCheckCircle size={14} />
                <span>Tüm mesajlar güncel</span>
              </div>
            )}
          </div>
        </div>

        {/* Temel Metrik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Toplam Mesajlar */}
          <div
            onClick={() => navigate('/admin/contact-messages')}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-amber-400/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Toplam Talep
              </span>
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-amber-500/10 group-hover:text-amber-600 transition-colors">
                <FiInbox size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {isLoading ? '...' : messageStats.total}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 group-hover:text-amber-600">
              <span>Mesaj havuzunu incele</span>
              <FiArrowUpRight size={12} />
            </p>
          </div>

          {/* Okunmamış Mesajlar */}
          <div
            onClick={() => navigate('/admin/contact-messages')}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-rose-400/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Yanıt Bekleyen
              </span>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
                <FiMail size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-rose-600 tracking-tight font-mono">
              {isLoading ? '...' : messageStats.unread}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 group-hover:text-rose-600">
              <span>Hemen yanıtla</span>
              <FiArrowUpRight size={12} />
            </p>
          </div>

          {/* Gönderilen Bildirimler */}
          <div
            onClick={() => navigate('/admin/contact-messages')}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-emerald-400/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Otomatik Bildirim
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <FiSend size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {isLoading ? '...' : messageStats.sent}
            </div>
            <p className="text-xs text-slate-500 mt-2">İletilen e-posta onayları</p>
          </div>

          {/* Google Analytics */}
          <div
            onClick={() => navigate('/admin/analytics')}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-amber-400/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Trafik Takibi
              </span>
              <div
                className={`p-2.5 rounded-xl ${
                  analyticsStats.isActive
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <FiBarChart2 size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {analyticsStats.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 truncate">
              {analyticsStats.measurementId
                ? `ID: ${analyticsStats.measurementId}`
                : 'Analytics yapılandır'}
            </p>
          </div>
        </div>

        {/* Hızlı Yönetim Kısayolları */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Hızlı Yönetim Eylemleri
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/team')}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-amber-500 hover:bg-amber-50/30 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <FiUsers size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-amber-700">
                    Ekip & Uzman Kadro
                  </div>
                  <div className="text-xs text-slate-500">
                    Mühendis, mimar ve saha ustalarını yönet
                  </div>
                </div>
              </div>
              <FiArrowUpRight className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/admin/projects')}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-amber-500 hover:bg-amber-50/30 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600">
                  <FiBriefcase size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700">
                    Portfolyo & Projeler
                  </div>
                  <div className="text-xs text-slate-500">
                    Tamamlanan ve devam eden yapı projeleri
                  </div>
                </div>
              </div>
              <FiArrowUpRight className="text-slate-400 group-hover:text-sky-600 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/admin/services')}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-amber-500 hover:bg-amber-50/30 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <FiLayers size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                    Mimari Hizmetler
                  </div>
                  <div className="text-xs text-slate-500">
                    Statik analiz, kentsel dönüşüm ve taahhüt
                  </div>
                </div>
              </div>
              <FiArrowUpRight className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
