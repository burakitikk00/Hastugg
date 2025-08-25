import { useState } from 'react';
import FormButtons from './FormButtons';

const ContactEditor = ({ contactData = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    address: contactData?.address || 'İstanbul, Türkiye',
    phone: contactData?.phone || '+90 555 123 45 67',
    email: contactData?.email || 'info@hastugg.com',
    workingHours: contactData?.workingHours || 'Pazartesi - Cuma: 09:00 - 18:00',
    socialLinks: contactData?.socialLinks || {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    mapEmbedUrl: contactData?.mapEmbedUrl || ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Contact kaydedilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Contact Section Düzenle</h3>
        <p className="text-sm text-gray-600 mt-1">İletişim bölümünü özelleştirin</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* İletişim Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Adres *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Adres bilgisi"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefon *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+90 555 123 45 67"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-posta *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="info@example.com"
            />
          </div>

          <div>
            <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700 mb-2">
              Çalışma Saatleri *
            </label>
            <input
              type="text"
              id="workingHours"
              name="workingHours"
              value={formData.workingHours}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Pazartesi - Cuma: 09:00 - 18:00"
            />
          </div>
        </div>

        {/* Sosyal Medya Linkleri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Sosyal Medya Linkleri
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Facebook</label>
              <input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Facebook URL"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Twitter</label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Twitter URL"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Instagram</label>
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Instagram URL"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="LinkedIn URL"
              />
            </div>
          </div>
        </div>

        {/* Harita Embed URL */}
        <div>
          <label htmlFor="mapEmbedUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Google Maps Embed URL
          </label>
          <input
            type="url"
            id="mapEmbedUrl"
            name="mapEmbedUrl"
            value={formData.mapEmbedUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Google Maps'ten "Haritayı paylaş" > "Haritayı yerleştir" seçeneğinden alabilirsiniz
          </p>
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

export default ContactEditor;
