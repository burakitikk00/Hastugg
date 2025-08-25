import AdminLayout from '../../components/admin/AdminLayout';
import ContactEditor from '../../components/admin/ContactEditor';
import { useState, useEffect } from 'react';

const ContactPage = () => {
  const [contactData, setContactData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // localStorage'dan contact verilerini yükle
    const savedContactData = localStorage.getItem('contactData');
    if (savedContactData) {
      try {
        const parsedData = JSON.parse(savedContactData);
        setContactData(parsedData);
      } catch (error) {
        console.error('Contact verisi parse edilemedi:', error);
        // Hata durumunda varsayılan veriler
        setContactData({
          address: 'İstanbul, Türkiye',
          phone: '+90 555 123 45 67',
          email: 'info@hastugg.com',
          workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
          socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
          },
          mapEmbedUrl: ''
        });
      }
    } else {
      // Varsayılan veriler
      setContactData({
        address: 'İstanbul, Türkiye',
        phone: '+90 555 123 45 67',
        email: 'info@hastugg.com',
        workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
        socialLinks: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: ''
        },
        mapEmbedUrl: ''
      });
    }
  }, []);

  const handleSave = async (sectionData) => {
    setIsLoading(true);
    try {
      // Contact verilerini localStorage'a kaydet
      localStorage.setItem('contactData', JSON.stringify(sectionData));
      setContactData(sectionData);
      
      // Başarılı kayıt sonrası işlemler
      alert('İletişim bilgileri başarıyla kaydedildi!');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert(`Kaydetme sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // İptal işlemi - form verilerini sıfırla
    console.log('İptal edildi');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">İletişim Yönetimi</h1>
          <p className="text-gray-600 mt-2">İletişim bölümünü buradan düzenleyebilirsiniz</p>
        </div>

        {/* Contact Editor */}
        {contactData && (
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
