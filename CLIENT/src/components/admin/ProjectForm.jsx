import { useState } from 'react';
import FormButtons from './FormButtons';

const ProjectForm = ({ project = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || '',
    imageUrl: project?.imageUrl || '',
    technologies: project?.technologies || '',
    liveUrl: project?.liveUrl || '',
    githubUrl: project?.githubUrl || '',
  });

  const [isLoading, setIsLoading] = useState(false);

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
      await onSave(formData);
    } catch (error) {
      logger.error('Proje kaydedilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {project ? 'Proje Düzenle' : 'Yeni Proje Ekle'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

        {/* Kategori */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Kategori *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Kategori seçin</option>
            <option value="web">Web Geliştirme</option>
            <option value="mobile">Mobil Uygulama</option>
            <option value="design">UI/UX Tasarım</option>
            <option value="other">Diğer</option>
          </select>
        </div>

        {/* Teknolojiler */}
        <div>
          <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 mb-2">
            Kullanılan Teknolojiler
          </label>
          <input
            type="text"
            id="technologies"
            name="technologies"
            value={formData.technologies}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="React, Node.js, MongoDB (virgülle ayırın)"
          />
        </div>

        {/* Resim URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Proje Resmi URL
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Canlı URL */}
        <div>
          <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Canlı Demo URL
          </label>
          <input
            type="url"
            id="liveUrl"
            name="liveUrl"
            value={formData.liveUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            id="githubUrl"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://github.com/username/project"
          />
        </div>

        {/* Form Buttons */}
        <FormButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={project ? "Güncelle" : "Kaydet"}
          isLoading={isLoading}
        />
      </form>
    </div>
  );
};

export default ProjectForm;
