import { useState } from 'react';
import FormButtons from './FormButtons';
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'
import logger from '../../utils/logger';


const ContactEditor = ({ contactData = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    address: contactData?.address || 'İstanbul, Türkiye',
    phone: contactData?.phone || '+90 555 123 45 67',
    email: contactData?.email || 'info@hastugg.com',
    workingHours: contactData?.workingHours || 'Pazartesi - Cuma: 09:00 - 18:00',
    socialLinks: {
      facebook: contactData?.socialLinks?.facebook || '',
      twitter: contactData?.socialLinks?.twitter || '',
      instagram: contactData?.socialLinks?.instagram || '',
      linkedin: contactData?.socialLinks?.linkedin || '',
      mapEmbedUrl: contactData?.socialLinks?.mapEmbedUrl || ''
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  // Telefonu "+90 xxx xxx xx xx" formatına çevir (10 hane + ülke kodu)
  const formatPhone = (value) => {
    // +90'ı temizle ve sadece rakamları al
    const digits = (value || '').replace(/\D/g, '').replace(/^90/, '').slice(0, 10);
    const parts = [];
    if (digits.length > 0) parts.push(digits.slice(0, 3));
    if (digits.length > 3) parts.push(digits.slice(3, 6));
    if (digits.length > 6) parts.push(digits.slice(6, 8));
    if (digits.length > 8) parts.push(digits.slice(8, 10));
    return parts.length > 0 ? '+90 ' + parts.join(' ') : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const formatted = formatPhone(value);
      setFormData(prev => ({ ...prev, phone: formatted }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSocialLinkChange = (platform, value) => {
    let finalValue = value;

    // Eğer mapEmbedUrl için tam iframe kodu yapıştırıldıysa, sadece src URL'sini çıkar
    if (platform === 'mapEmbedUrl' && value.includes('<iframe')) {
      const srcMatch = value.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        finalValue = srcMatch[1];
      }
    }

    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: finalValue
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { ...formData, phone: formatPhone(formData.phone) };
      await onSave(payload);
    } catch (error) {
      logger.error('Contact kaydedilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="px-6 py-4.5 border-b border-slate-200/80 bg-slate-50/50">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">İletişim & Harita Formu</h3>
        <p className="text-xs text-slate-500 mt-0.5">Ziyaretçilerin size ulaşabileceği kurumsal iletişim kanallarını güncelleyin.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
        {/* İletişim Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Fiziki Ofis Adresi <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white leading-relaxed"
              placeholder="Merkez ofis adres bilgisi"
            />
          </div>

          <div>
            <label htmlFor="workingHours" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Çalışma Saatleri & Günler <span className="text-red-500">*</span>
            </label>
            <textarea
              id="workingHours"
              name="workingHours"
              rows={3}
              value={formData.workingHours}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white leading-relaxed"
              placeholder={`Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 09:00 - 14:00`}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Telefon Numarası <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              inputMode="numeric"
              maxLength={17}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white font-mono"
              placeholder="+90 555 555 55 55"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Resmi E-Posta Adresi <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white"
              placeholder="info@hastugg.com"
            />
          </div>
        </div>

        {/* Sosyal Medya Linkleri */}
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 font-mono">
            Sosyal Medya Bağlantıları
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1.5 font-medium">
                <FaInstagram className="text-pink-600" />
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white"
                placeholder="https://instagram.com/hastugg"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1.5 font-medium">
                <FaLinkedin className="text-blue-600" />
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white"
                placeholder="https://linkedin.com/company/hastugg"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1.5 font-medium">
                <FaFacebook className="text-blue-700" />
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white"
                placeholder="https://facebook.com/hastugg"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1.5 font-medium">
                <FaTwitter className="text-slate-800" />
                X / Twitter URL
              </label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white"
                placeholder="https://x.com/hastugg"
              />
            </div>
          </div>
        </div>

        {/* Harita Embed URL */}
        <div className="pt-4 border-t border-slate-200">
          <label htmlFor="mapEmbedUrl" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
            Google Maps Harita Yerleştirme (Embed) URL
          </label>
          <input
            type="url"
            id="mapEmbedUrl"
            name="mapEmbedUrl"
            value={formData.socialLinks.mapEmbedUrl}
            onChange={(e) => handleSocialLinkChange('mapEmbedUrl', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white font-mono text-xs"
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Google Haritalar üzerinden "Paylaş" → "Haritayı Yerleştir" seçeneğindeki iframe src linkini yapıştırabilirsiniz.
          </p>
        </div>

        {/* Form Buttons */}
        <FormButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText="İletişim Bilgilerini Kaydet"
          isLoading={isLoading}
        />
      </form>
    </div>
  );
};

export default ContactEditor;
