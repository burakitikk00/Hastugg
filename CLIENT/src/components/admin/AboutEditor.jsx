import { useState, useEffect } from 'react';
import FormButtons from './FormButtons';
import logger from '../../utils/logger';
import adminService from '../../services/adminService';
import { AVAILABLE_ADMIN_ICONS, getArchitecturalIcon } from '../../utils/architecturalIcons';

const AboutEditor = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    mainTitle: '',
    mainDescription: '',
    features: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null);

  // Veritabanından verileri yükle
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const aboutData = await adminService.getAbout();

        if (aboutData) {
          setFormData({
            mainTitle: aboutData.mainTitle || '',
            mainDescription: aboutData.mainDescription || '',
            features: aboutData.features || []
          });
        }
      } catch (error) {
        logger.error('About verileri getirilemedi:', error);
        alert('About verileri yüklenirken hata oluştu: ' + error.message);
      }
    };

    fetchAboutData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, {
        id: null,
        feature: 'Yeni Mimari Nitelik',
        description: 'Özellik açıklaması buraya gelecek',
        icon: 'compass'
      }]
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const openIconPicker = (index) => {
    setSelectedFeatureIndex(index);
    setShowIconPicker(true);
  };

  const selectIcon = (iconId) => {
    if (selectedFeatureIndex !== null) {
      handleFeatureChange(selectedFeatureIndex, 'icon', iconId);
    }
    setShowIconPicker(false);
    setSelectedFeatureIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanedFeatures = formData.features.map(feature => ({
        ...feature,
        feature: (feature.feature || '').trim(),
        description: (feature.description || '').trim(),
        icon: feature.icon || 'compass'
      }));

      const cleanedFormData = {
        ...formData,
        features: cleanedFeatures
      };

      // Veritabanına kaydet
      await adminService.saveAbout(cleanedFormData);

      await onSave(cleanedFormData);
    } catch (error) {
      logger.error('About kaydedilirken hata:', error);
      alert('Kaydedilirken bir hata oluştu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Hakkımızda Bölümü Düzenle</h3>
        <p className="text-sm text-gray-600 mt-1">Hakkımızda vizyonunu ve mimari özellik kartlarını özelleştirin</p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
            placeholder="Ana başlık girin"
          />
        </div>

        {/* Ana Açıklama */}
        <div>
          <label htmlFor="mainDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Kurumsal Hikaye & Felsefe *
          </label>
          <textarea
            id="mainDescription"
            name="mainDescription"
            value={formData.mainDescription}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Kurumsal vizyon ve açıklama metnini girin"
          />
        </div>

        {/* Özellik Kartları */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-900">Öne Çıkan Mimari Nitelikler</h4>
              <p className="text-xs text-gray-500">Ziyaretçilere gösterilen mimari ve mühendislik garantileri</p>
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="px-3 py-1.5 text-sm bg-gray-900 text-amber-400 border border-gray-800 rounded-md hover:bg-black transition-colors font-medium flex items-center gap-1.5"
            >
              <span>+</span> Yeni Mimari Nitelik Ekle
            </button>
          </div>

          <div className="space-y-4">
            {formData.features.map((feature, index) => {
              const IconComponent = getArchitecturalIcon(feature.icon, feature.feature);
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start space-x-3">
                    {/* Vektör Simge Seçici */}
                    <div className="flex-shrink-0 text-center">
                      <button
                        type="button"
                        onClick={() => openIconPicker(index)}
                        title="Özgün mimari vektör ikonu seçin"
                        className="w-14 h-14 border-2 border-amber-300 rounded-lg bg-gray-900 text-amber-400 flex flex-col items-center justify-center hover:bg-black hover:border-amber-400 transition-all shadow-sm"
                      >
                        <IconComponent size={22} />
                        <span className="text-[10px] mt-1 text-gray-300">Değiştir</span>
                      </button>
                    </div>

                    {/* Kart İçeriği */}
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={feature.feature || ''}
                        onChange={(e) => handleFeatureChange(index, 'feature', e.target.value)}
                        placeholder="Nitelik başlığı (örn: Statik Güvenilirlik, Lüks Malzeme)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
                      />
                      <textarea
                        value={feature.description || ''}
                        onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                        placeholder="Nitelik detay açıklaması"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Silme Butonu */}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="flex-shrink-0 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Özgün Vektör Simge Seçici Modal */}
        {showIconPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Özgün Mimari Vektör İkonu Seçin</h3>
                  <p className="text-xs text-gray-500">Mühendislik ve mimari kimliğe uygun profesyonel vektör ikonlar</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVAILABLE_ADMIN_ICONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectIcon(item.id)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 flex items-center gap-3 text-left transition-all group"
                    >
                      <div className="w-10 h-10 rounded-md bg-gray-900 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{item.shortName}</div>
                        <div className="text-[11px] text-gray-500 truncate">{item.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-3 border-t border-gray-200 text-right">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        )}

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

export default AboutEditor;
