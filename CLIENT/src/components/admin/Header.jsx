import { FiMenu, FiExternalLink, FiShield } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES = {
  '/admin/dashboard': 'Dashboard & Genel Bakış',
  '/admin/team': 'Ekip Kadrosu & Uzmanlıklar',
  '/admin/projects': 'Projeler & Portfolyo',
  '/admin/services': 'Hizmetler & Faaliyet Alanları',
  '/admin/contact-messages': 'Gelen İletişim Mesajları',
  '/admin/page-content': 'Sayfa İçerikleri & Metinler',
  '/admin/contact': 'İletişim Bilgileri',
  '/admin/email-settings': 'E-Posta Servis Ayarları',
  '/admin/analytics': 'Google Analytics & Trafik',
  '/admin/change-password': 'Güvenlik & Şifre Değiştir'
};

const Header = ({ user, onToggleSidebar }) => {
  const location = useLocation();
  const currentTitle = ROUTE_TITLES[location.pathname] || 'Yönetici Paneli';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4 lg:px-8 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      {/* Sol: Menü Açma & Başlık */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Menüyü Aç"
        >
          <FiMenu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold tracking-wider uppercase text-slate-400 font-mono">
            HASTUĞ /
          </span>
          <h1 className="text-base font-bold text-slate-800 tracking-tight">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Sağ: Hızlı Eylemler & Kullanıcı Bilgisi */}
      <div className="flex items-center gap-4">
        {/* Canlı Site Butonu */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-amber-600 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 transition-all"
        >
          <span>Siteyi Aç</span>
          <FiExternalLink size={12} />
        </a>

        {/* Kullanıcı Profili */}
        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow-sm ring-2 ring-amber-400/20">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-slate-800">
              {user?.username || 'Yönetici'}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <FiShield size={9} className="text-amber-500" />
              Sistem Yöneticisi
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
