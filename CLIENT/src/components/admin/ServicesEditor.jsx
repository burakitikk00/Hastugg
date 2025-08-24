import { useState } from 'react';
import FormButtons from './FormButtons';
import adminService from '../../services/adminService';

const ServicesEditor = ({ servicesData = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: servicesData?.title || 'HİZMETLERİMİZ',
    subtitle: servicesData?.subtitle || 'Konutlar ve Sektörler İçin Yüksek Kaliteli İnşaat Çözümleri!',
    description: servicesData?.description || 'Profesyonel inşaat ve yapı hizmetleri',
    services: (servicesData?.services || [
      {
        id: 1,
        service: 'Mimari ve Yapı Projeleri',
        description: 'Uygulama projeleri, kat planları, kesit ve görünüş çizimleri, yapısal sistem çözümleri, malzeme detayı geliştirme, teklif dosyası hazırlama, 3D modelleme ve render alma hizmetleri.',
        url: null
      },
      {
        id: 2,
        service: 'Saha Uygulama ve Takip',
        description: 'Saha uygulama takibi, keşif-metraj çalışmaları, hakediş düzenleme ve tüm uygulama aşamalarında mühendislik ilkelerine bağlı titiz çalışma.',
        url: null
      }
    ]).map(service => ({
      ...service,
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
      // Backend'den imageURL geliyor, url olarak kaydet
      handleServiceChange(index, 'url', result.imageURL);
    } catch (error) {
      console.error('Görsel yüklenirken hata:', error);
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
    setIsLoading(true);
    
    try {
      console.log('Kaydedilecek services data:', JSON.stringify(formData, null, 2));
      await onSave(formData);
    } catch (error) {
      console.error('Services kaydedilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Services Section Düzenle</h3>
        <p className="text-sm text-gray-600 mt-1">Hizmetler bölümünü özelleştirin</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Ana Başlık */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Ana Başlık *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ana başlık girin"
          />
        </div>

        {/* Alt Başlık */}
        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
            Alt Başlık *
          </label>
          <input
            type="text"
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Alt başlık girin"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Hizmetler açıklamasını girin"
          />
        </div>

        {/* Hizmetler */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Hizmetler
            </label>
          </div>
          
          <div className="space-y-6">
            {formData.services.map((service, serviceIndex) => (
              <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Hizmet {serviceIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeService(serviceIndex)}
                    className="px-2 py-1 text-red-600 hover:text-red-800"
                  >
                    ✕ Sil
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hizmet Adı *
                    </label>
                    <input
                      type="text"
                      value={service.service}
                      onChange={(e) => handleServiceChange(serviceIndex, 'service', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Hizmet adı"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görsel
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(serviceIndex, e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {uploadingImages[serviceIndex] && (
                        <div className="text-sm text-blue-600">Görsel yükleniyor...</div>
                      )}
                      {service.url && (
                        <div className="text-sm text-green-600">
                          ✓ Görsel yüklendi: {service.url}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={service.description}
                    onChange={(e) => handleServiceChange(serviceIndex, 'description', e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Hizmet açıklaması"
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Hizmet Ekleme Butonu - En Altta */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={addService}
              className="w-full px-4 py-3 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              + Yeni Hizmet Ekle
            </button>
          </div>
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

export default ServicesEditor;
