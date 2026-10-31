import { useState, useEffect } from 'react';
import HeroEditor from './HeroEditor';
import AboutEditor from './AboutEditor';
import AdminPageHeader from './AdminPageHeader';
import adminService from '../../services/adminService';
import logger from '../../utils/logger';

const PageContentManager = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isLoading, setIsLoading] = useState(false);
  const [aboutData, setAboutData] = useState(null);

  const sections = [
    { id: 'hero', label: 'Hero / Karşılama Manşeti' },
    { id: 'about', label: 'Hakkımızda & Mimari Vizyon' }
  ];

  useEffect(() => {
    const savedAboutData = localStorage.getItem('aboutData');
    if (savedAboutData) {
      try {
        const parsedData = JSON.parse(savedAboutData);
        setAboutData(parsedData);
      } catch (error) {
        logger.error('About verisi parse edilemedi:', error);
      }
    }
  }, []);

  const handleSave = async (sectionData) => {
    setIsLoading(true);
    try {
      if (activeSection === 'about') {
        localStorage.setItem('aboutData', JSON.stringify(sectionData));
        setAboutData(sectionData);
      }
      alert(`${sections.find(s => s.id === activeSection)?.label} başarıyla kaydedildi!`);
    } catch (error) {
      logger.error('Kaydetme hatası:', error);
      alert(`Kaydetme sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // İptal işlemi
  };

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı ve Sekmeler */}
      <AdminPageHeader
        title="Sayfa İçerikleri & Metinler"
        subtitle="Ana sayfa karşılama sloganı, alt başlık metinleri ve Hakkımızda mimari vizyon kartlarını düzenleyin."
        badge="İçerik Yönetimi"
        actions={
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            {sections.map((section) => {
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        }
      />

      {/* Aktif Bölüm Düzenleyici */}
      {activeSection === 'hero' ? (
        <HeroEditor
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      ) : (
        <AboutEditor
          aboutData={aboutData}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default PageContentManager;
