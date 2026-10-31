import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiShield, FiCheck, FiX, FiFileText } from 'react-icons/fi';
import publicService from '../../services/publicService';

const COOKIE_CONSENT_KEY = 'hastug_cookie_consent';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Admin sayfalarında gösterme
    if (location.pathname.startsWith('/admin')) {
      setIsVisible(false);
      return;
    }

    const checkConsentAndSettings = async () => {
      try {
        const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        // Ziyaretçi daha önce tercihini kaydettiyse otomatik açma
        if (storedConsent) {
          setIsVisible(false);
          return;
        }

        // Analytics aktif mi kontrol et - sadece takip aktifse ilk girişte çerez onayını bekle
        const settings = await publicService.getAnalyticsSettings();
        if (settings && settings.is_active && settings.measurement_id) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch {
        setIsVisible(false);
      }
    };

    checkConsentAndSettings();

    // Footer veya diğer bileşenlerden çerez tercihlerini tekrar açma isteği
    const handleManualOpen = () => {
      setIsVisible(true);
    };

    window.addEventListener('hastug_open_cookie_consent', handleManualOpen);
    return () => window.removeEventListener('hastug_open_cookie_consent', handleManualOpen);
  }, [location.pathname]);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    window.dispatchEvent(
      new CustomEvent('hastug_cookie_consent_updated', { detail: 'accepted' })
    );
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    window.dispatchEvent(
      new CustomEvent('hastug_cookie_consent_updated', { detail: 'declined' })
    );
    setIsVisible(false);
  };

  const handleOpenPolicy = () => {
    window.dispatchEvent(
      new CustomEvent('hastug_open_legal_modal', { detail: { tab: 'cerez' } })
    );
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Çerez ve Gizlilik Bildirimi"
      className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fadeIn"
    >
      <div className="bg-[#0b101b]/95 backdrop-blur-md text-slate-200 border border-slate-700/80 rounded-2xl p-5 shadow-2xl ring-1 ring-amber-500/20 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <FiShield size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white tracking-tight">
              Çerez ve Gizlilik Tercihleri
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Deneyiminizi geliştirmek ve web sitesi trafiğini anonim analiz etmek için çerezler kullanıyoruz.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs transition-all active:scale-[0.98]"
          >
            <FiCheck size={14} />
            <span>Kabul Et</span>
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <FiX size={14} />
            <span>Yalnızca Zorunlu</span>
          </button>
          <button
            type="button"
            onClick={handleOpenPolicy}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2.5 rounded-xl font-medium text-xs text-amber-400/90 hover:text-amber-300 hover:bg-amber-400/10 transition-colors"
            title="Çerez Politikasını Oku"
          >
            <FiFileText size={13} />
            <span>İncele</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
