import { useState, useEffect, useRef } from 'react';
import { FiX, FiShield, FiFileText, FiInfo, FiLock } from 'react-icons/fi';
import { LEGAL_POLICIES } from '../../data/legalPolicies';
import './LegalModal.css';

const TABS = [
  { id: 'kvkk', label: 'KVKK Aydınlatma', icon: FiShield },
  { id: 'cerez', label: 'Çerez Politikası', icon: FiLock },
  { id: 'iletisim', label: 'İletişim Formu', icon: FiFileText }
];

const LegalModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('kvkk');
  const modalContentRef = useRef(null);

  useEffect(() => {
    const handleOpen = (e) => {
      const targetTab = e.detail?.tab;
      if (targetTab && LEGAL_POLICIES[targetTab]) {
        setActiveTab(targetTab);
      }
      setIsOpen(true);
    };

    window.addEventListener('hastug_open_legal_modal', handleOpen);
    return () => window.removeEventListener('hastug_open_legal_modal', handleOpen);
  }, []);

  // ESC tuşuyla kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Tab değiştiğinde scroll'u başa sar
  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const currentPolicy = LEGAL_POLICIES[activeTab] || LEGAL_POLICIES.kvkk;

  return (
    <div
      className="legal-modal-backdrop"
      onClick={() => setIsOpen(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="legal-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Başlık & Kapat Butonu */}
        <div className="legal-modal-header">
          <div className="legal-modal-header-info">
            <span className="legal-modal-badge">{currentPolicy.badge}</span>
            <h2 id="legal-modal-title" className="legal-modal-title">
              {currentPolicy.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="legal-modal-close-btn"
            aria-label="Pencereyi Kapat"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Sekmeler (Tabs) */}
        <div className="legal-modal-tabs" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`legal-modal-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* İçerik Gövdesi */}
        <div ref={modalContentRef} className="legal-modal-body">
          <div className="legal-modal-sections">
            {currentPolicy.sections.map((section, idx) => (
              <article key={idx} className="legal-section-block">
                <h3 className="legal-section-heading">{section.heading}</h3>
                <div className="legal-section-text">
                  {section.content.split('\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="legal-modal-footer-note">
            <FiInfo size={14} className="shrink-0 text-amber-400" />
            <span>
              Son Güncelleme: {currentPolicy.lastUpdated} — Hastuğ İnşaat & Mimarlık Yasal Uyumluluk Birimi
            </span>
          </div>
        </div>

        {/* Alt Kapatma Çubuğu */}
        <div className="legal-modal-action-bar">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="legal-modal-confirm-btn"
          >
            Anladım & Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
