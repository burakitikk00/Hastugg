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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="px-6 py-4.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Hakkımızda & Mimari Vizyon</h3>
          <p className="text-xs text-slate-500 mt-0.5">Kurumsal felsefe, hikaye ve ziyaretçilere sunulan mimari güvenceleri düzenleyin.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
        {/* Ana Başlık */}
        <div>
          <label htmlFor="mainTitle" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
            Bölüm Başlığı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="mainTitle"
            name="mainTitle"
            value={formData.mainTitle}
            onChange={handleChange}
            required
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-semibold text-slate-900 transition-all bg-white"
            placeholder="Örn: Kusursuz Mühendislik, Zamansız Mimari"
          />
        </div>

        {/* Ana Açıklama */}
        <div>
          <label htmlFor="mainDescription" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
            Kurumsal Hikaye & Felsefe <span className="text-red-500">*</span>
          </label>
          <textarea
            id="mainDescription"
            name="mainDescription"
            value={formData.mainDescription}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white leading-relaxed"
            placeholder="Kurumsal vizyon ve açıklama metnini girin..."
          />
        </div>

        {/* Özellik Kartları */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Öne Çıkan Mimari Nitelikler</h4>
              <p className="text-xs text-slate-500">Ziyaretçilere sunulan mimari taahhütler ve teknik güvence kartları</p>
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs transition-all active:scale-[0.98] self-start sm:self-auto"
            >
              <span>+ Yeni Nitelik Ekle</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.features.map((feature, index) => {
              const IconComponent = getArchitecturalIcon(feature.icon, feature.feature);
              return (
                <div key={index} className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all shadow-2xs">
                  <div className="flex items-start gap-4">
                    {/* Vektör Simge Seçici */}
                    <div className="shrink-0 text-center">
                      <button
                        type="button"
                        onClick={() => openIconPicker(index)}
                        title="Mimari vektör ikonu seçin"
                        className="w-14 h-14 border border-slate-800 rounded-xl bg-[#0b101b] text-amber-400 hover:border-amber-400 hover:scale-105 flex flex-col items-center justify-center transition-all shadow-xs"
                      >
                        <IconComponent size={22} />
                        <span className="text-[9px] mt-0.5 text-slate-400 font-mono">Değiştir</span>
                      </button>
                    </div>

                    {/* Kart İçeriği */}
                    <div className="flex-1 space-y-2.5">
                      <input
                        type="text"
                        value={feature.feature || ''}
                        onChange={(e) => handleFeatureChange(index, 'feature', e.target.value)}
                        placeholder="Nitelik başlığı (örn: Statik Güvenilirlik, Lüks Malzeme)"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-semibold text-slate-900 transition-all bg-white"
                      />
                      <textarea
                        value={feature.description || ''}
                        onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                        placeholder="Nitelik detay açıklaması..."
                        rows={2}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs text-slate-800 transition-all bg-white leading-relaxed"
                      />
                    </div>

                    {/* Silme Butonu */}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
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
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Mimari Vektör İkonu Seçin</h3>
                  <p className="text-xs text-slate-500">Mühendislik ve mimari kimliğe uygun profesyonel semboller</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(false)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-lg"
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
                      className="p-3 border border-slate-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/50 flex items-center gap-3 text-left transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#0b101b] text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{item.shortName}</div>
                        <div className="text-[10px] text-slate-500 truncate">{item.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200 text-right">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors text-xs font-semibold"
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
          saveText="Hakkımızda Bilgilerini Kaydet"
          isLoading={isLoading}
        />
      </form>
    </div>
  );
};

export default AboutEditor;
