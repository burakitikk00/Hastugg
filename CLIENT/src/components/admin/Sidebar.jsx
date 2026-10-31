import { useNavigate, useLocation } from 'react-router-dom';
import hastugLogo from '../../assets/hastuglogo.png';
import {
  FiGrid,
  FiFileText,
  FiMessageSquare,
  FiLayers,
  FiUsers,
  FiBriefcase,
  FiPhone,
  FiMail,
  FiBarChart2,
  FiLock,
  FiLogOut,
  FiExternalLink,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ onLogout, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
    { path: '/admin/team', label: 'Ekip & Kadro', icon: FiUsers },
    { path: '/admin/projects', label: 'Projeler', icon: FiBriefcase },
    { path: '/admin/services', label: 'Hizmetler', icon: FiLayers },
    { path: '/admin/contact-messages', label: 'Gelen Mesajlar', icon: FiMessageSquare },
    { path: '/admin/page-content', label: 'Sayfa İçerikleri', icon: FiFileText },
    { path: '/admin/contact', label: 'İletişim Bilgileri', icon: FiPhone },
    { path: '/admin/email-settings', label: 'E-Posta Ayarları', icon: FiMail },
    { path: '/admin/analytics', label: 'Analitik & Takip', icon: FiBarChart2 },
    { path: '/admin/change-password', label: 'Güvenlik & Şifre', icon: FiLock },
  ];

  const isActive = (path) => location.pathname === path;

  const handleMenuClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`w-64 bg-[#0b101b] border-r border-slate-800/80 text-slate-300 h-screen fixed left-0 top-0 z-50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out select-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Üst Kısım: Marka Başlığı */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div
            onClick={() => handleMenuClick('/admin/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(229,169,60,0.3)] shrink-0 transition-transform duration-200 group-hover:scale-105">
              <img
                src={hastugLogo}
                alt="Hastuğ Logo"
                className="w-full h-full object-contain brightness-0"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-white tracking-wider text-base leading-none transition-colors group-hover:text-amber-400">
                HASTUĞ
              </span>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold mt-1">
                YÖNETİM PANELİ
              </p>
            </div>
          </div>

          {/* Mobil Kapat Butonu */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Menüyü Kapat"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Hızlı Canlı Site Önizleme Linki */}
        <div className="px-3 pt-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-xs font-medium text-slate-400 hover:text-amber-400 transition-all group"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Canlı Web Sitesi</span>
            </span>
            <FiExternalLink className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" size={13} />
          </a>
        </div>

        {/* Navigasyon Linkleri */}
        <nav className="mt-3 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-slate-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleMenuClick(item.path)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 text-sm font-medium ${
                  active
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold shadow-[0_0_12px_rgba(229,169,60,0.12)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors shrink-0 ${
                    active ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Alt Kısım: Güvenli Çıkış */}
      <div className="p-4 border-t border-slate-800/80 bg-[#080d16]">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/90 border border-rose-500/20 hover:border-rose-600 transition-all duration-200 shadow-sm"
        >
          <FiLogOut size={14} />
          <span>Oturumu Kapat</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
