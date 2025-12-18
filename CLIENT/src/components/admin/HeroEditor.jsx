import { useState, useEffect } from 'react';
import FormButtons from './FormButtons';
import adminService from '../../services/adminService';

const HeroEditor = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    mainTitle: 'Siz İsteyin, Biz İnşa Edelim',
    subheading: 'Profesyonel ekibimizle isteğinizi birebir yerine getiriyoruz. Hemen teklif alabilirsiniz.',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Veritabanından verileri yükle
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const heroData = await adminService.getHero();
        if (heroData) {
          setFormData({
            mainTitle: heroData.mainTitle || 'Siz İsteyin, Biz İnşa Edelim',
            subheading: heroData.subheading || 'Profesyonel ekibimizle isteğinizi birebir yerine getiriyoruz. Hemen teklif alabilirsiniz.'
          });
        }
      } catch (error) {
        logger.error('Hero verileri getirilemedi:', error);
      }
    };

    fetchHeroData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Veritabanına kaydet
      await adminService.saveHero(formData);
      
      await onSave(formData);
    } catch (error) {
      logger.error('Hero kaydedilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Hero Section Düzenle</h3>
        <p className="text-sm text-gray-600 mt-1">Ana sayfa hero bölümünü özelleştirin</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Ana Başlık */}
        <div>
          <label htmlFor="mainTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Ana Başlık *
          </label>
          <input
            type="text"
            id="mainTitle"
            name="mainTitle"
            value={formData.mainTitle}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ana başlık girin"
          />
        </div>

        {/* Alt Başlık */}
        <div>
          <label htmlFor="subheading" className="block text-sm font-medium text-gray-700 mb-2">
            Alt Başlık *
          </label>
          <textarea
            id="subheading"
            name="subheading"
            value={formData.subheading}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Alt başlık girin"
          />
        </div>

        {/* Form Buttons */}
        <FormButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText="Kaydet"
          isLoading={isLoading}
        />
      </form>
    </div>
  );
};

export default HeroEditor;
