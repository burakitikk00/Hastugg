import { useState, useEffect } from 'react';
import FormButtons from './FormButtons';
import logger from '../../utils/logger';

const AdminProjectForm = ({ project = null, services = [], onSave, onCancel }) => {
  // İlk state'i doğru şekilde parse et
  const getInitialServiceIds = () => {
    if (!project) return [];
    try {
      if (Array.isArray(project.service_ids)) {
        return project.service_ids.filter(id => id && id !== 0);
      } else if (project.service_ids && typeof project.service_ids === 'string') {
        const parsed = JSON.parse(project.service_ids);
        return Array.isArray(parsed) ? parsed.filter(id => id && id !== 0) : [];
      }
    } catch (e) {
      console.error('service_ids initial parse hatası:', e);
    }
    return [];
  };

  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    service_ids: getInitialServiceIds(),
    status: project?.status || 'In Progress',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Form verilerini proje değiştiğinde güncelle
  useEffect(() => {
    if (project) {
      // service_ids'i parse et
      let parsedServiceIds = [];
      try {
        if (Array.isArray(project.service_ids)) {
          parsedServiceIds = project.service_ids.filter(id => id && id !== 0);
        } else if (project.service_ids && typeof project.service_ids === 'string') {
          const parsed = JSON.parse(project.service_ids);
          parsedServiceIds = Array.isArray(parsed) ? parsed.filter(id => id && id !== 0) : [];
        }
      } catch (e) {
        console.error('service_ids parse hatası:', e);
        parsedServiceIds = [];
      }

      setFormData({
        title: project.title || '',
        description: project.description || '',
        service_ids: parsedServiceIds,
        status: project.status || 'In Progress',
      });
    } else {
      // Yeni proje için form'u sıfırla
      setFormData({
        title: '',
        description: '',
        service_ids: [],
        status: 'In Progress',
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (e) => {
    const { value } = e.target;
    const serviceId = parseInt(value);
    
    setFormData(prev => {
      const currentServiceIds = Array.isArray(prev.service_ids) ? prev.service_ids : [];
      return {
        ...prev,
        service_ids: currentServiceIds.includes(serviceId)
          ? currentServiceIds.filter(id => id !== serviceId)
          : [...currentServiceIds, serviceId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Hizmet seçimi kontrolü
    const serviceIds = Array.isArray(formData.service_ids) ? formData.service_ids : [];
    if (serviceIds.length === 0) {
      alert('En az bir hizmet seçmelisiniz');
      setIsLoading(false);
      return;
    }

    try {

      await onSave(formData);
    } catch (error) {
      logger.error('Proje kaydedilirken hata:', error);
      throw error; // Hatayı üst bileşene aktar
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'In Progress', label: 'Devam Ediyor' },
    { value: 'Completed', label: 'Tamamlandı' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Proje Adı */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Proje Adı *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Proje adını girin"
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
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Proje açıklamasını girin"
        />
      </div>

      {/* Hizmet Seçimi (Çoklu) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hizmetler * (Birden fazla seçebilirsiniz)
        </label>
        <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
          {services.map((service) => (
            <label key={service.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                value={service.id}
                checked={Array.isArray(formData.service_ids) && formData.service_ids.includes(service.id)}
                onChange={handleServiceChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{service.service}</span>
            </label>
          ))}
        </div>
        {(!Array.isArray(formData.service_ids) || formData.service_ids.length === 0) && (
          <p className="text-sm text-red-500 mt-1">En az bir hizmet seçmelisiniz</p>
        )}
      </div>

      {/* Durum */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Proje Durumu *
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>



      {/* Form Buttons */}
      <FormButtons
        onSave={handleSubmit}
        onCancel={onCancel}
        saveText={project ? "Güncelle" : "Kaydet"}
        isLoading={isLoading}
      />
    </form>
  );
};

export default AdminProjectForm;
