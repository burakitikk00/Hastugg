import { useState, useEffect } from 'react';
import FormButtons from './FormButtons';
import adminService from '../../services/adminService';

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
        console.error('About verileri getirilemedi:', error);
        alert('About verileri yüklenirken hata oluştu: ' + error.message);
      }
    };

    fetchAboutData();
  }, []);

  // Kullanılabilir simgeler
  const availableIcons = [
    '✅', '💡', '🌱', '👷‍♂️', '🏗️', '🔨', '⚡', '🌟', '💎', '🎯', '🚀', '🌍', '🔒', '⚙️', '📈', '🎨', '🏆', '💪', '🤝', '📋', '🔍', '💼', '🎪', '🎭', '🎨', '🎬', '🎵', '🎤', '🎧', '🎮', '🎲', '🎯', '🎪', '🎭', '🎨', '🎬', '🎵', '🎤', '🎧', '🎮', '🎲', '🎯', '🎪', '🎭', '🎨', '🎬', '🎵', '🎤', '🎧', '🎮', '🎲', '🎯'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...formData.features];
    // Boşlukları temizle (sadece başta ve sonda)
    const cleanedValue = field === 'icon' ? value : value.trim();
    newFeatures[index] = { ...newFeatures[index], [field]: cleanedValue };
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { 
        id: null, // Yeni feature için ID null
        feature: 'Yeni Özellik', 
        description: 'Özellik açıklaması buraya gelecek',
        icon: '⭐'
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

  const selectIcon = (icon) => {
    if (selectedFeatureIndex !== null) {
      handleFeatureChange(selectedFeatureIndex, 'icon', icon);
    }
    setShowIconPicker(false);
    setSelectedFeatureIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Features'ları temizle ve kontrol et
      console.log('Form data before cleaning:', formData);
      const cleanedFeatures = formData.features.map(feature => ({
        ...feature,
        feature: (feature.feature || '').trim(),
        description: (feature.description || '').trim(),
        icon: feature.icon || '⭐'
      }));
      console.log('Cleaned features:', cleanedFeatures);
      
      const cleanedFormData = {
        ...formData,
        features: cleanedFeatures
      };
      
      // Veritabanına kaydet
      await adminService.saveAbout(cleanedFormData);
      
      await onSave(cleanedFormData);
    } catch (error) {
      console.error('About kaydedilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Hakkımızda Bölümü Düzenle</h3>
        <p className="text-sm text-gray-600 mt-1">Hakkımızda bölümünü özelleştirin</p>
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

        {/* Ana Açıklama */}
        <div>
          <label htmlFor="mainDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Ana Açıklama *
          </label>
          <textarea
            id="mainDescription"
            name="mainDescription"
            value={formData.mainDescription}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Hakkımızda ana açıklamasını girin"
          />
        </div>

        {/* Özellik Kartları */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Özellik Kartları
            </label>
            <button
              type="button"
              onClick={addFeature}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              + Yeni Kart Ekle
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.features.map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start space-x-3">
                  {/* Simge Seçici */}
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openIconPicker(index)}
                      className="w-12 h-12 border-2 border-gray-300 rounded-lg bg-white flex items-center justify-center text-xl hover:border-blue-500 transition-colors"
                    >
                      {feature.icon}
                    </button>
                  </div>
                  
                  {/* Kart İçeriği */}
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={feature.feature || ''}
                      onChange={(e) => handleFeatureChange(index, 'feature', e.target.value)}
                      placeholder="Özellik başlığı"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                    <textarea
                      value={feature.description || ''}
                      onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                      placeholder="Özellik açıklaması"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Silme Butonu */}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="flex-shrink-0 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simge Seçici Modal */}
        {showIconPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Simge Seçin</h3>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-8 gap-2">
                {availableIcons.map((icon, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectIcon(icon)}
                    className="w-12 h-12 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center text-xl transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  İptal
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
