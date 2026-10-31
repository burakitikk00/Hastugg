import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiLayers, FiClock, FiHelpCircle, FiCheck, FiEye } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoadingState from '../../components/admin/AdminLoadingState';
import AdminServiceForm from '../../components/admin/AdminServiceForm';
import LoadingImage from '../../components/common/LoadingImage';
import adminService from '../../services/adminService';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import { getServiceIcon } from '../../utils/serviceIcons';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Verileri yükle
  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminService.getServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.error('Hizmetler yüklenirken hata:', err);
      setError('Hizmetler yüklenirken hata oluştu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // Yeni hizmet ekleme butonuna basıldığında
  const handleAdd = () => {
    setSelectedService(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Düzenleme butonuna basıldığında
  const handleEdit = (service) => {
    setSelectedService(service);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formdan iptal edildiğinde
  const handleCancel = () => {
    setShowForm(false);
    setSelectedService(null);
  };

  // Kaydetme işlemi
  const handleSave = async (serviceFormData) => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (selectedService && selectedService.id) {
        // Mevcut hizmet güncelleme
        await adminService.updateService(selectedService.id, serviceFormData);
        setSuccessMessage(`"${serviceFormData.service}" hizmeti başarıyla güncellendi.`);
      } else {
        // Yeni hizmet oluşturma
        await adminService.createService(serviceFormData);
        setSuccessMessage(`"${serviceFormData.service}" hizmeti başarıyla oluşturuldu.`);
      }

      await loadServices();
      setShowForm(false);
      setSelectedService(null);
    } catch (err) {
      logger.error('Hizmet kaydetme hatası:', err);
      alert('Kaydetme sırasında bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  // Hizmet silme işlemi
  const handleDelete = async (service) => {
    const confirmMessage = `"${service.service}" hizmetini silmek istediğinize emin misiniz?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await adminService.deleteService(service.id, false);
      setSuccessMessage(`"${service.service}" hizmeti başarıyla silindi.`);
      await loadServices();
    } catch (err) {
      // Eğer bağlı projeler varsa
      if (err.data && err.data.connectedProjects) {
        const forceConfirm = window.confirm(
          `${err.message}\n\nYine de bu hizmeti silmek istiyor musunuz? (Projelerdeki etiketler kalabilir)`
        );
        if (forceConfirm) {
          try {
            await adminService.deleteService(service.id, true);
            setSuccessMessage(`"${service.service}" hizmeti zorla silindi.`);
            await loadServices();
          } catch (forceErr) {
            alert('Zorla silme sırasında hata oluştu: ' + forceErr.message);
          }
        }
      } else {
        alert('Hizmet silinirken hata oluştu: ' + err.message);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Sayfa Başlığı ve Yeni Hizmet Ekle Butonu */}
        <AdminPageHeader
          title="Hizmetler & Faaliyet Alanları"
          subtitle="Mimarlık, mühendislik, statik analiz ve kentsel dönüşüm alanındaki kurumsal faaliyet kalemlerini yönetin."
          badge={`${services.length} Hizmet`}
          actions={
            !showForm && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs hover:shadow transition-all active:scale-[0.98]"
              >
                <FiPlus size={16} />
                <span>Yeni Hizmet Ekle</span>
              </button>
            )
          }
        />

        {/* Başarı Bildirimi */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <FiCheck className="text-emerald-600 text-base" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-950 text-xs font-bold">
              Kapat
            </button>
          </div>
        )}

        {/* Hata Bildirimi */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-rose-700 hover:text-rose-950 text-xs font-bold">
              Kapat
            </button>
          </div>
        )}

        {/* Yükleniyor Durumu */}
        {isLoading && !showForm ? (
          <AdminLoadingState type="cards" message="Hizmetler listesi yükleniyor..." />
        ) : showForm ? (
          /* Düzenleme / Ekleme Formu */
          <AdminServiceForm
            service={selectedService}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        ) : (
          /* Hizmetler Kart Listesi */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {services.map((item, index) => {
                const IconComponent = getServiceIcon(item.icon);
                const deliverablesCount = Array.isArray(item.deliverables) ? item.deliverables.length : 0;
                const processStepsCount = Array.isArray(item.process_steps) ? item.process_steps.length : 0;
                const faqsCount = Array.isArray(item.faqs) ? item.faqs.length : 0;
                const tagsCount = Array.isArray(item.scope_tags) ? item.scope_tags.length : 0;

                return (
                  <div
                    key={item.id || index}
                    className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-xs space-y-4 relative flex flex-col justify-between group"
                  >
                    <div>
                      {/* Üst Kısım: Sıra, Kategori & Durum */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-800 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/20">
                            {item.display_order ?? (index + 1)}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.category || 'Mimarlık'}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            item.is_active !== false
                              ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {item.is_active !== false ? 'Yayında' : 'Taslak'}
                        </span>
                      </div>

                      {/* Görsel & Başlık Bloğu */}
                      <div className="flex items-start gap-4 mt-3">
                        <div className="w-20 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 shadow-2xs">
                          {item.url ? (
                            <LoadingImage
                              src={publicService.getImageURL(item.url)}
                              alt={item.service}
                              className="w-full h-full object-cover"
                              blurWhileLoading={true}
                              showLoadingSpinner={false}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <IconComponent size={24} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-amber-50 text-amber-700">
                              <IconComponent size={14} />
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {item.service}
                            </h4>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {item.short_description || item.description || 'Detaylı hizmet açıklaması belirtilmedi.'}
                          </p>

                          {item.stamp && (
                            <span className="inline-block mt-2 text-[10px] font-mono font-bold tracking-wider text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {item.stamp}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mimari İstatistik Göstergeleri */}
                      <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                        <div className="flex items-center gap-1.5" title="Teslim edilen doküman/çıktı sayısı">
                          <FiLayers size={13} className="text-amber-600 shrink-0" />
                          <span>{deliverablesCount} Çıktı</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Süreç adım sayısı">
                          <FiClock size={13} className="text-amber-600 shrink-0" />
                          <span>{processStepsCount} Adım</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Sıkça sorulan sorular">
                          <FiHelpCircle size={13} className="text-amber-600 shrink-0" />
                          <span>{faqsCount} SSS</span>
                        </div>
                      </div>
                    </div>

                    {/* Alt Aksiyon Butonları */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                      <a
                        href={`/hizmet/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-amber-800 transition-colors"
                      >
                        <FiEye size={13} />
                        <span>Canlı Önizle</span>
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
                        >
                          <FiEdit2 size={12} />
                          <span>Düzenle</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hizmeti Sil"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ServicesPage;
