import { useState, useEffect } from 'react';
import HeroEditor from './HeroEditor';
import AboutEditor from './AboutEditor';
import adminService from '../../services/adminService';

const PageContentManager = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isLoading, setIsLoading] = useState(false);
  const [aboutData, setAboutData] = useState(null);

  const sections = [
    { id: 'hero', label: 'Hero Section', component: HeroEditor },
    { id: 'about', label: 'Hakkımızda', component: AboutEditor }
  ];

  useEffect(() => {
    // localStorage'dan about verilerini yükle
    const savedAboutData = localStorage.getItem('aboutData');
    if (savedAboutData) {
      try {
        const parsedData = JSON.parse(savedAboutData);
        setAboutData(parsedData);
      } catch (error) {
        console.error('About verisi parse edilemedi:', error);
      }
    }
  }, []);

  const handleSave = async (sectionData) => {
    setIsLoading(true);
    try {
      if (activeSection === 'about') {
        // About verilerini localStorage'a kaydet
        localStorage.setItem('aboutData', JSON.stringify(sectionData));
        setAboutData(sectionData);
      }
      
      // Başarılı kayıt sonrası işlemler
      alert(`${sections.find(s => s.id === activeSection)?.label} başarıyla kaydedildi!`);
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert(`Kaydetme sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // İptal işlemi - form verilerini sıfırla
  };

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Sayfa içerikleri ve email ayarlarını buradan düzenleyebilirsiniz</p>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Yönetim Bölümleri</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Section Editor */}
      {ActiveComponent && (
        <ActiveComponent
          aboutData={activeSection === 'about' ? aboutData : null}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}

    </div>
  );
};

export default PageContentManager;
