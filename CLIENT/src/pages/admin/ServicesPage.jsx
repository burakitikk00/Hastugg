import AdminLayout from '../../components/admin/AdminLayout';
import ServicesEditor from '../../components/admin/ServicesEditor';
import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const ServicesPage = () => {
  const [servicesData, setServicesData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Services verilerini API'den yükle
    const loadServicesData = async () => {
      try {
        const services = await adminService.getServices();
        if (services && services.length > 0) {
          // Services verilerini ServicesEditor formatına dönüştür
          const formattedData = {
            services: services.map(service => ({
              id: service.id,
              service: service.service,
              description: service.description,
              url: service.url
            }))
          };
          setServicesData(formattedData);
        } else {
          // Varsayılan veriler
          setServicesData({
            services: [
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
            ]
          });
        }
      } catch (error) {
        console.error('Services verileri yüklenirken hata:', error);
        // Hata durumunda varsayılan veriler
        setServicesData({
          services: [
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
          ]
        });
      }
    };

    loadServicesData();
  }, []);

  const handleSave = async (sectionData) => {
    setIsLoading(true);
    try {
      console.log('ServicesPage handleSave çağrıldı:', sectionData);
      // Services verilerini API'ye kaydet
      await adminService.saveServices(sectionData);
      setServicesData(sectionData);
      
      // Başarılı kayıt sonrası işlemler - Artık ServicesEditor'da alert var
      console.log('Hizmetler başarıyla kaydedildi!');
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
          <h1 className="text-2xl font-bold text-gray-900">Hizmetler Yönetimi</h1>
          <p className="text-gray-600 mt-2">Hizmetler bölümünü buradan düzenleyebilirsiniz</p>
        </div>

        {/* Services Editor */}
        {servicesData && (
          <ServicesEditor
            servicesData={servicesData}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ServicesPage;
