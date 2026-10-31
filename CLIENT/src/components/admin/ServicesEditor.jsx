import { useState } from 'react';
import FormButtons from './FormButtons';
import LoadingImage from '../common/LoadingImage';
import adminService from '../../services/adminService';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import API_CONFIG from '../../config/api';

const ServicesEditor = ({ servicesData = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    services: (servicesData?.services || []).map(service => ({
      ...service,
      // URL'yi direkt kullan (Supabase URL'leri zaten tam URL)
      url: service.url || null
    }))
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    // Mevcut hizmeti kopyala ve yeni değerle güncelle
    newServices[index] = { 
      ...newServices[index], 
      [field]: value 
    };
    
    // Eğer url alanı yoksa ekle
    if (!newServices[index].hasOwnProperty('url')) {
      newServices[index].url = null;
    }
    
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;

    setUploadingImages(prev => ({ ...prev, [index]: true }));
    
    try {
      const result = await adminService.uploadImage(file);
      // Backend'den gelen URL zaten tam Supabase Storage URL'i
      // Direkt olarak kullan, hiçbir işlem yapma
      handleServiceChange(index, 'url', result.imageURL);
      alert('Görsel başarıyla yüklendi!');
    } catch (error) {
      logger.error('Görsel yüklenirken hata:', error);
      alert('Görsel yüklenirken hata oluştu: ' + error.message);
    } finally {
      setUploadingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  const addService = () => {
    const newId = Math.max(...formData.services.map(s => s.id), 0) + 1;
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        id: newId,
        service: 'Yeni Hizmet',
        description: 'Hizmet açıklaması',
        url: null
      }]
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if any images are currently uploading
    const isAnyImageUploading = Object.values(uploadingImages).some(uploading => uploading);
    if (isAnyImageUploading) {
      alert('Lütfen görsel yüklemelerinin tamamlanmasını bekleyin!');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSave(formData);
      alert('Hizmetler başarıyla kaydedildi!');
    } catch (error) {
      logger.error('Services kaydedilirken hata:', error);
      alert('Kayıt sırasında hata oluştu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="px-6 py-4.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Hizmet Kalemleri Listesi</h3>
          <p className="text-xs text-slate-500 mt-0.5">Faaliyet gösterilen mühendislik ve mimarlık alanlarını düzenleyin.</p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 border border-amber-500/30">
          {formData.services.length} Hizmet
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
        <div className="space-y-5">
          {formData.services.map((service, serviceIndex) => (
            <div
              key={service.id}
              className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 font-mono font-bold text-xs flex items-center justify-center">
                    {serviceIndex + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {service.service || `Hizmet ${serviceIndex + 1}`}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => removeService(serviceIndex)}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Sil
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                    Hizmet Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={service.service}
                    onChange={(e) => handleServiceChange(serviceIndex, 'service', e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white"
                    placeholder="Örn: Statik Proje & Analiz"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                    Hizmet Görseli
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(serviceIndex, e.target.files[0])}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
                    />
                    {uploadingImages[serviceIndex] && (
                      <div className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        Görsel yükleniyor...
                      </div>
                    )}
                    {service.url && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-16 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                          <LoadingImage 
                            src={publicService.getImageURL(service.url)} 
                            alt="Service preview" 
                            className="w-full h-full object-cover"
                            blurWhileLoading={true}
                            showLoadingSpinner={false}
                          />
                        </div>
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          ✓ Görsel hazır
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                  Hizmet Kapsamı & Açıklaması <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={service.description}
                  onChange={(e) => handleServiceChange(serviceIndex, 'description', e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white leading-relaxed"
                  placeholder="Hizmet detayları ve teknik kapsam..."
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Hizmet Ekleme Butonu */}
        <div className="pt-2">
          <button
            type="button"
            onClick={addService}
            className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 text-slate-700 hover:text-amber-800 bg-slate-50/50 hover:bg-amber-50/30 text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <span>+ Yeni Hizmet Ekle</span>
          </button>
        </div>

        {/* Form Buttons */}
        <FormButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText="Değişiklikleri Kaydet"
          isLoading={isLoading}
          isDisabled={Object.values(uploadingImages).some(uploading => uploading)}
        />
      </form>
    </div>
  );
};

export default ServicesEditor;
