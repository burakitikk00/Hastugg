import AdminLayout from '../../components/admin/AdminLayout';
import ContactEditor from '../../components/admin/ContactEditor';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoadingState from '../../components/admin/AdminLoadingState';
import { useState, useEffect } from 'react';
import publicService from '../../services/publicService';
import adminService from '../../services/adminService';
import logger from '../../utils/logger';

const ContactPage = () => {
  const [contactData, setContactData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicService.getContact();
        if (data && data.length > 0) {
          const c = data[0];
          const hoursLocal = localStorage.getItem('workingHours');
          setContactData({
            id: c.id,
            address: c.address || 'İstanbul, Türkiye',
            phone: c.phone || '+90 555 123 45 67',
            email: c.email || 'info@hastugg.com',
            workingHours: hoursLocal || 'Pazartesi - Cuma: 09:00 - 18:00',
            socialLinks: {
              facebook: c.facebook || '',
              twitter: c.twitter || '',
              instagram: c.instagram || '',
              linkedin: c.linkedin || '',
              mapEmbedUrl: c.mapEmbedUrl || ''
            },

          });
        } else {
          setContactData({
            address: 'İstanbul, Türkiye',
            phone: '+90 555 123 45 67',
            email: 'info@hastugg.com',
            workingHours: localStorage.getItem('workingHours') || 'Pazartesi - Cuma: 09:00 - 18:00',
            socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
            mapEmbedUrl: ''
          });
        }
      } catch (e) {
        setContactData({
          address: 'İstanbul, Türkiye',
          phone: '+90 555 123 45 67',
          email: 'info@hastugg.com',
          workingHours: localStorage.getItem('workingHours') || 'Pazartesi - Cuma: 09:00 - 18:00',
          socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
          mapEmbedUrl: ''
        });
      }
    };
    load();
  }, []);

  const handleSave = async (sectionData) => {
    setIsLoading(true);
    try {
      const payload = {
        id: sectionData.id,
        address: sectionData.address,
        phone: sectionData.phone,
        email: sectionData.email,
        facebook: sectionData.socialLinks?.facebook || '',
        twitter: sectionData.socialLinks?.twitter || '',
        instagram: sectionData.socialLinks?.instagram || '',
        linkedin: sectionData.socialLinks?.linkedin || '',
        mapEmbedUrl: sectionData.socialLinks?.mapEmbedUrl || ''
      };
      await adminService.saveContact(payload);
      localStorage.setItem('workingHours', sectionData.workingHours || '');
      alert('İletişim bilgileri başarıyla kaydedildi!');
    } catch (error) {
      logger.error('Kaydetme hatası:', error);
      alert(`Kaydetme sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // İptal işlemi
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="İletişim & Ofis Bilgileri"
          subtitle="Merkez ofis adresi, doğrudan irtibat telefonları, resmi e-posta, çalışma saatleri ve harita konumunu yapılandırın."
          badge="Kurumsal İletişim"
        />

        {!contactData ? (
          <AdminLoadingState type="form" message="İletişim bilgileri yükleniyor..." />
        ) : (
          <ContactEditor
            contactData={contactData}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ContactPage;
