import { useState, useEffect } from 'react';
import FormButtons from './FormButtons';
import logger from '../../utils/logger';
import {
  HIGHLIGHT_ICONS,
  HIGHLIGHT_ICON_OPTIONS,
  TRANSPORTATION_ICONS,
  TRANSPORTATION_ICON_OPTIONS,
  getHighlightIcon,
  getTransportationIcon
} from '../../utils/projectIcons';
import {
  FiInfo,
  FiFileText,
  FiStar,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiAlertTriangle,
  FiX
} from 'react-icons/fi';

const AdminProjectForm = ({
  project = null,
  services = [],
  newImagesCount = 0,
  onSave,
  onCancel,
  children
}) => {
  const [activeTab, setActiveTab] = useState('temel'); // 'temel' | 'aciklama' | 'ozellikler' | 'konum'

  // Doğrulama hataları durumu
  const [validationErrors, setValidationErrors] = useState({
    title: false,
    service_ids: false,
    description: false,
    images: false
  });

  // Sağ üst köşe şık bildirim (Toast) durumu
  const [toast, setToast] = useState({
    show: false,
    title: '',
    message: ''
  });

  // Toast otomatik kapanma süresi (5 saniye)
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // İlk service_ids parse
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
      console.error('service_ids parse error:', e);
    }
    return [];
  };

  const [formData, setFormData] = useState({
    title: project?.title || '',
    category: project?.category || 'Karma Konut & Ofis',
    status: project?.status || 'In Progress',
    service_ids: getInitialServiceIds(),
    location: project?.location || '',
    client: project?.client || '',
    total_area: project?.total_area ? String(project.total_area).replace(/\D/g, '') : '',
    land_area: project?.land_area ? String(project.land_area).replace(/\D/g, '') : '',
    delivery_date: project?.delivery_date || '',
    project_year: project?.project_year || '',
    description: project?.description || '',
    map_embed_url: project?.map_embed_url || '',
    map_address: project?.map_address || '',
    highlights: Array.isArray(project?.highlights) ? project.highlights : [],
    transportation: Array.isArray(project?.transportation) ? project.transportation : []
  });

  const [isLoading, setIsLoading] = useState(false);

  // Proje değiştiğinde formu senkronize et
  useEffect(() => {
    if (project) {
      let parsedServiceIds = [];
      try {
        if (Array.isArray(project.service_ids)) {
          parsedServiceIds = project.service_ids.filter(id => id && id !== 0);
        } else if (project.service_ids && typeof project.service_ids === 'string') {
          const parsed = JSON.parse(project.service_ids);
          parsedServiceIds = Array.isArray(parsed) ? parsed.filter(id => id && id !== 0) : [];
        }
      } catch (e) {
        parsedServiceIds = [];
      }

      setFormData({
        title: project.title || '',
        category: project.category || 'Karma Konut & Ofis',
        status: project.status || 'In Progress',
        service_ids: parsedServiceIds,
        location: project.location || '',
        client: project.client || '',
        total_area: project.total_area ? String(project.total_area).replace(/\D/g, '') : '',
        land_area: project.land_area ? String(project.land_area).replace(/\D/g, '') : '',
        delivery_date: project.delivery_date || '',
        project_year: project.project_year || '',
        description: project.description || '',
        map_embed_url: project.map_embed_url || '',
        map_address: project.map_address || '',
        highlights: Array.isArray(project.highlights) ? project.highlights : [],
        transportation: Array.isArray(project.transportation) ? project.transportation : []
      });
    } else {
      setFormData({
        title: '',
        category: 'Karma Konut & Ofis',
        status: 'In Progress',
        service_ids: [],
        location: '',
        client: '',
        total_area: '',
        land_area: '',
        delivery_date: '',
        project_year: '',
        description: '',
        map_embed_url: '',
        map_address: '',
        highlights: [
          {
            title: HIGHLIGHT_ICONS.sun.defaultTitle,
            description: HIGHLIGHT_ICONS.sun.defaultDescription,
            icon: 'sun'
          },
          {
            title: HIGHLIGHT_ICONS.park.defaultTitle,
            description: HIGHLIGHT_ICONS.park.defaultDescription,
            icon: 'park'
          }
        ],
        transportation: [
          {
            title: TRANSPORTATION_ICONS.subway.defaultTitle,
            description: TRANSPORTATION_ICONS.subway.defaultDescription,
            icon: 'subway'
          },
          {
            title: TRANSPORTATION_ICONS.car.defaultTitle,
            description: TRANSPORTATION_ICONS.car.defaultDescription,
            icon: 'car'
          }
        ]
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  // Toplam İnşaat Alanı & Arsa Alanı - Sadece rakam girişi kontrolü
  const handleAreaChange = (field, e) => {
    // Sadece rakamları al, boşluk ve karakterleri kaldır
    const cleanNumber = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      [field]: cleanNumber
    }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleServiceChange = (e) => {
    const serviceId = parseInt(e.target.value);
    setFormData(prev => {
      const currentServiceIds = Array.isArray(prev.service_ids) ? prev.service_ids : [];
      return {
        ...prev,
        service_ids: currentServiceIds.includes(serviceId)
          ? currentServiceIds.filter(id => id !== serviceId)
          : [...currentServiceIds, serviceId]
      };
    });
    if (validationErrors.service_ids) {
      setValidationErrors(prev => ({ ...prev, service_ids: false }));
    }
  };

  // Highlights Ekle / Çıkar / Güncelle
  const addHighlight = () => {
    const defaultIcon = HIGHLIGHT_ICONS.sun;
    setFormData(prev => ({
      ...prev,
      highlights: [
        ...prev.highlights,
        {
          title: defaultIcon.defaultTitle,
          description: defaultIcon.defaultDescription,
          icon: 'sun'
        }
      ]
    }));
  };

  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const updateHighlight = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.highlights];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, highlights: updated };
    });
  };

  // İkon değiştiğinde başlık ve açıklamayı otomatik doldur (Fikir vermesi için)
  const handleHighlightIconChange = (index, newIconKey) => {
    const iconConfig = HIGHLIGHT_ICONS[newIconKey];
    setFormData(prev => {
      const updated = [...prev.highlights];
      const current = updated[index];

      // Eğer mevcut başlık boşsa veya başka bir ikonun varsayılan başlığıysa güncelle
      const isDefaultTitle = !current.title?.trim() || Object.values(HIGHLIGHT_ICONS).some(h => h.defaultTitle === current.title);
      const isDefaultDesc = !current.description?.trim() || Object.values(HIGHLIGHT_ICONS).some(h => h.defaultDescription === current.description);

      updated[index] = {
        ...current,
        icon: newIconKey,
        title: isDefaultTitle && iconConfig?.defaultTitle ? iconConfig.defaultTitle : current.title,
        description: isDefaultDesc && iconConfig?.defaultDescription ? iconConfig.defaultDescription : current.description
      };
      return { ...prev, highlights: updated };
    });
  };

  // Transportation Ekle / Çıkar / Güncelle
  const addTransportation = () => {
    const defaultIcon = TRANSPORTATION_ICONS.subway;
    setFormData(prev => ({
      ...prev,
      transportation: [
        ...prev.transportation,
        {
          title: defaultIcon.defaultTitle,
          description: defaultIcon.defaultDescription,
          icon: 'subway'
        }
      ]
    }));
  };

  const removeTransportation = (index) => {
    setFormData(prev => ({
      ...prev,
      transportation: prev.transportation.filter((_, i) => i !== index)
    }));
  };

  const updateTransportation = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.transportation];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, transportation: updated };
    });
  };

  // Ulaşım ikonu değiştiğinde başlık ve açıklamayı otomatik doldur
  const handleTransportationIconChange = (index, newIconKey) => {
    const iconConfig = TRANSPORTATION_ICONS[newIconKey];
    setFormData(prev => {
      const updated = [...prev.transportation];
      const current = updated[index];

      const isDefaultTitle = !current.title?.trim() || Object.values(TRANSPORTATION_ICONS).some(t => t.defaultTitle === current.title);
      const isDefaultDesc = !current.description?.trim() || Object.values(TRANSPORTATION_ICONS).some(t => t.defaultDescription === current.description);

      updated[index] = {
        ...current,
        icon: newIconKey,
        title: isDefaultTitle && iconConfig?.defaultTitle ? iconConfig.defaultTitle : current.title,
        description: isDefaultDesc && iconConfig?.defaultDescription ? iconConfig.defaultDescription : current.description
      };
      return { ...prev, transportation: updated };
    });
  };

  // Form Gönderim & Doğrulama Kontrolü
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // 1. Proje Adı Kontrolü
    if (!formData.title?.trim()) {
      setValidationErrors(prev => ({ ...prev, title: true }));
      setActiveTab('temel');
      setToast({
        show: true,
        title: 'Zorunlu Alan Eksik',
        message: 'Lütfen zorunlu olan "Proje Adı" alanını doldurunuz.'
      });
      setTimeout(() => {
        const el = document.getElementById('title');
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 80);
      return;
    }

    // 2. Uygulanan Hizmetler Kontrolü
    const serviceIds = Array.isArray(formData.service_ids) ? formData.service_ids : [];
    if (serviceIds.length === 0) {
      setValidationErrors(prev => ({ ...prev, service_ids: true }));
      setActiveTab('temel');
      setToast({
        show: true,
        title: 'Hizmet Seçimi Gerekli',
        message: 'Lütfen projeye en az bir adet "Uygulanan Hizmet & Uzmanlık Alanı" seçiniz.'
      });
      setTimeout(() => {
        const el = document.getElementById('services-container');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 80);
      return;
    }

    // 3. Proje Mimari Açıklaması Kontrolü
    if (!formData.description?.trim()) {
      setValidationErrors(prev => ({ ...prev, description: true }));
      setActiveTab('aciklama');
      setToast({
        show: true,
        title: 'Açıklama Eksik',
        message: 'Lütfen zorunlu olan "Proje Mimari Açıklaması" metnini doldurunuz.'
      });
      setTimeout(() => {
        const el = document.getElementById('description');
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 80);
      return;
    }

    // 4. Yeni Proje Ekleme Durumunda Görsel Kontrolü
    if (!project && newImagesCount === 0) {
      setValidationErrors(prev => ({ ...prev, images: true }));
      setToast({
        show: true,
        title: 'Görsel Yüklenmedi',
        message: 'Yeni projeyi kaydetmek için lütfen en az bir adet görsel seçiniz.'
      });
      setTimeout(() => {
        const el = document.getElementById('project-images-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 80);
      return;
    }

    // Doğrulama başarılı - Hataları temizle ve kaydet
    setValidationErrors({
      title: false,
      service_ids: false,
      description: false,
      images: false
    });

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      logger.error('Proje kaydedilirken hata:', error);
      setToast({
        show: true,
        title: 'Kayıt Başarısız',
        message: error.message || 'Proje kaydedilirken beklenmeyen bir hata oluştu.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'In Progress', label: 'Devam Ediyor' },
    { value: 'Completed', label: 'Tamamlandı' },
    { value: 'Planned', label: 'Planlama Aşamasında' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {/* SAĞ ÜST ŞIK HATA BİLDİRİMİ (TOAST) */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[9999] max-w-sm sm:max-w-md w-full animate-fadeIn transition-all duration-300">
          <div className="relative overflow-hidden rounded-xl bg-[#0c1017] border border-red-500/60 p-4 text-white shadow-2xl backdrop-blur-xl ring-1 ring-red-500/30">
            {/* Üst Vurgulu Gradyan Çizgisi */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-500" />

            <div className="flex items-start gap-3.5">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mt-0.5">
                <FiAlertTriangle className="text-xl animate-pulse" />
              </div>

              <div className="flex-1 pr-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-red-200 tracking-wide">
                    {toast.title}
                  </h4>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60">
                    Gerekli
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className="shrink-0 text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Kapat"
              >
                <FiX className="text-base" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sekme Menüsü */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('temel')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'temel'
              ? 'border-b-2 border-amber-500 text-amber-700 bg-amber-50/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${validationErrors.title || validationErrors.service_ids ? 'border-red-400 text-red-600 font-semibold' : ''}`}
        >
          <FiInfo className="text-base" />
          <span>Temel Bilgiler & Künye</span>
          {(validationErrors.title || validationErrors.service_ids) && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aciklama')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'aciklama'
              ? 'border-b-2 border-amber-500 text-amber-700 bg-amber-50/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          } ${validationErrors.description ? 'border-red-400 text-red-600 font-semibold' : ''}`}
        >
          <FiFileText className="text-base" />
          <span>Açıklama & Mimari Vizyon</span>
          {validationErrors.description && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ozellikler')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'ozellikler'
              ? 'border-b-2 border-amber-500 text-amber-700 bg-amber-50/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FiStar className="text-base" />
          <span>Öne Çıkan Özellikler ({formData.highlights.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('konum')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'konum'
              ? 'border-b-2 border-amber-500 text-amber-700 bg-amber-50/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FiMapPin className="text-base" />
          <span>Konum & Ulaşım ({formData.transportation.length})</span>
        </button>
      </div>

      {/* SEKME 1: TEMEL BİLGİLER & KÜNYE */}
      {activeTab === 'temel' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Proje Adı & Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Proje Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none transition-all text-sm ${
                  validationErrors.title
                    ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20 text-red-900'
                    : 'border-gray-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500'
                }`}
                placeholder="Örn: Aura Yaşam & Ofis Kompleksi"
              />
              {validationErrors.title && (
                <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                  <span>⚠️ Proje adı zorunludur.</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                placeholder="Örn: Karma Konut & Ofis, Lüks Villa, Ticari"
              />
            </div>
          </div>

          {/* Durum & Lokasyon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Proje Durumu <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Lokasyon / Şehir
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                placeholder="Örn: Sarıyer, İstanbul"
              />
            </div>
          </div>

          {/* Toplam İnşaat Alanı & Teslim Tarihi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="total_area" className="block text-sm font-medium text-gray-700 mb-1">
                Toplam İnşaat Alanı (m²)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="total_area"
                  name="total_area"
                  value={formData.total_area}
                  onChange={(e) => handleAreaChange('total_area', e)}
                  className="w-full pl-3.5 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-mono"
                  placeholder="Örn: 18500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                  m²
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-1">
                <span>Yalnızca rakam giriniz (boşluksuz).</span>
                {formData.total_area && (
                  <span className="text-amber-700 font-semibold">
                    Ön yüzde: <strong>{Number(formData.total_area).toLocaleString('tr-TR')} m²</strong>
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                Teslim Tarihi
              </label>
              <input
                type="text"
                id="delivery_date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                placeholder="Örn: 2024 Q3 veya Aralık 2025"
              />
            </div>
          </div>

          {/* İşveren / Yatırımcı & Arsa Alanı & Proje Yılı */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
                İşveren / Yatırımcı
              </label>
              <input
                type="text"
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                placeholder="Örn: Özel Yatırım Grubu"
              />
            </div>

            <div>
              <label htmlFor="land_area" className="block text-sm font-medium text-gray-700 mb-1">
                Arsa Alanı (m²)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="land_area"
                  name="land_area"
                  value={formData.land_area}
                  onChange={(e) => handleAreaChange('land_area', e)}
                  className="w-full pl-3.5 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-mono"
                  placeholder="Örn: 4250"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                  m²
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-1">
                <span>Rakam giriniz (boşluksuz).</span>
                {formData.land_area && (
                  <span className="text-amber-700 font-semibold">
                    Ön yüzde: <strong>{Number(formData.land_area).toLocaleString('tr-TR')} m²</strong>
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="project_year" className="block text-sm font-medium text-gray-700 mb-1">
                Proje Yılı / Dönemi
              </label>
              <input
                type="text"
                id="project_year"
                name="project_year"
                value={formData.project_year}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                placeholder="Örn: 2022 - 2024"
              />
            </div>
          </div>

          {/* Hizmet Seçimi (Çoklu) */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Uygulanan Hizmet & Uzmanlık Alanları <span className="text-red-500">*</span>
            </label>
            <div
              id="services-container"
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 border rounded-lg p-3.5 max-h-44 overflow-y-auto transition-all ${
                validationErrors.service_ids
                  ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              {services.map((service) => {
                const isSelected = Array.isArray(formData.service_ids) && formData.service_ids.includes(service.id);
                return (
                  <label
                    key={service.id}
                    className={`flex items-center space-x-2.5 p-2 rounded-md border text-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={service.id}
                      checked={isSelected}
                      onChange={handleServiceChange}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="truncate">{service.service}</span>
                  </label>
                );
              })}
            </div>
            {validationErrors.service_ids && (
              <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                <span>⚠️ Lütfen en az bir hizmet seçiniz.</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* SEKME 2: AÇIKLAMA & MİMARİ VİZYON */}
      {activeTab === 'aciklama' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Proje Mimari Açıklaması <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500">Paragraflar halinde detaylı mimari konsepti girin</span>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={8}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-sm leading-relaxed transition-all ${
                validationErrors.description
                  ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20 text-red-900'
                  : 'border-gray-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
              placeholder="Örn: Sarıyer'de doğal ışığı merkezine alan modern mimari hatlar, esnek çalışma alanları ve zengin peyzaj düzenlemesiyle hayata geçirilen prestijli karma yaşam projesi..."
            />
            {validationErrors.description && (
              <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                <span>⚠️ Mimari açıklama alanı zorunludur.</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* SEKME 3: ÖNE ÇIKAN ÖZELLİKLER */}
      {activeTab === 'ozellikler' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Öne Çıkan Özellikler Kartları</h4>
              <p className="text-xs text-gray-500">
                İkon seçtiğinizde başlık ve açıklama fikir vermesi için otomatik önerilir; dilerseniz değiştirebilir veya doğrudan kaydedebilirsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={addHighlight}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-medium transition-colors"
            >
              <FiPlus />
              <span>Yeni Özellik Ekle</span>
            </button>
          </div>

          {formData.highlights.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <FiStar className="mx-auto text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">Henüz öne çıkan özellik eklenmedi.</p>
              <p className="text-xs text-gray-500 mt-1 mb-3">Yukarıdaki butonla projenize özel nitelikler ekleyebilirsiniz.</p>
              <button
                type="button"
                onClick={addHighlight}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:border-amber-500 transition-colors"
              >
                <FiPlus />
                <span>İlk Özelliği Ekle</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.highlights.map((item, index) => {
                const IconComponent = getHighlightIcon(item.icon);
                return (
                  <div
                    key={index}
                    className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-amber-300 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center"
                  >
                    {/* İkon Seçici */}
                    <div className="shrink-0 space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase">İkon</label>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                          <IconComponent className="text-lg" />
                        </div>
                        <select
                          value={item.icon || 'sun'}
                          onChange={(e) => handleHighlightIconChange(index, e.target.value)}
                          className="px-2.5 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {HIGHLIGHT_ICON_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                              {opt.shortName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Başlık */}
                    <div className="flex-1 w-full space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase">Özellik Başlığı</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateHighlight(index, 'title', e.target.value)}
                        placeholder="Örn: Doğal Aydınlatma & Cephe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        required
                      />
                    </div>

                    {/* Açıklama */}
                    <div className="flex-[2] w-full space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase">Açıklama</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateHighlight(index, 'description', e.target.value)}
                        placeholder="Örn: Gün ışığını optimize eden cephe çözümü..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        required
                      />
                    </div>

                    {/* Sil Butonu */}
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4 md:mt-0"
                      title="Özelliği Sil"
                    >
                      <FiTrash2 className="text-base" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SEKME 4: KONUM VE ULAŞIM */}
      {activeTab === 'konum' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Harita Bilgileri */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FiMapPin className="text-amber-600" />
              <span>Harita & Konum Ayarları</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Harita Üzeri Başlık / Açık Adres
                </label>
                <input
                  type="text"
                  name="map_address"
                  value={formData.map_address}
                  onChange={handleChange}
                  placeholder="Örn: Büyükdere Cad. No: 184 Sarıyer / İstanbul"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Google Maps Embed Iframe URL (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  name="map_embed_url"
                  value={formData.map_embed_url}
                  onChange={handleChange}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Ulaşım Noktaları Dinamik Listesi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Ulaşım ve Çevre Noktaları</h4>
                <p className="text-xs text-gray-500">
                  Ulaşım türü seçtiğinizde başlık ve süre açıklaması otomatik önerilir; kullanıcı dilerse değiştirebilir.
                </p>
              </div>
              <button
                type="button"
                onClick={addTransportation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-medium transition-colors"
              >
                <FiPlus />
                <span>Yeni Nokta Ekle</span>
              </button>
            </div>

            {formData.transportation.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <FiMapPin className="mx-auto text-3xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">Henüz ulaşım noktası eklenmedi.</p>
                <button
                  type="button"
                  onClick={addTransportation}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:border-amber-500 transition-colors"
                >
                  <FiPlus />
                  <span>Ulaşım Noktası Ekle</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.transportation.map((item, index) => {
                  const TransIcon = getTransportationIcon(item.icon);
                  return (
                    <div
                      key={index}
                      className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-amber-300 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center"
                    >
                      {/* İkon Seçici */}
                      <div className="shrink-0 space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase">Ulaşım Türü</label>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                            <TransIcon className="text-lg" />
                          </div>
                          <select
                            value={item.icon || 'subway'}
                            onChange={(e) => handleTransportationIconChange(index, e.target.value)}
                            className="px-2.5 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            {TRANSPORTATION_ICON_OPTIONS.map((opt) => (
                              <option key={opt.key} value={opt.key}>
                                {opt.shortName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Başlık */}
                      <div className="flex-1 w-full space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase">Ulaşım Noktası</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateTransportation(index, 'title', e.target.value)}
                          placeholder="Örn: Metro Durağı / TEM Otoyolu"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          required
                        />
                      </div>

                      {/* Açıklama / Süre */}
                      <div className="flex-[2] w-full space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase">Mesafe / Süre Açıklaması</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateTransportation(index, 'description', e.target.value)}
                          placeholder="Örn: Yürüme mesafesinde 3 dakika (250m)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          required
                        />
                      </div>

                      {/* Sil Butonu */}
                      <button
                        type="button"
                        onClick={() => removeTransportation(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4 md:mt-0"
                        title="Noktayı Sil"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ek İçerik Alanı (Proje Görselleri Bölümü) */}
      <div
        id="project-images-section"
        className={`transition-all rounded-xl ${
          validationErrors.images
            ? 'p-4 border-2 border-red-500 ring-4 ring-red-400/20 bg-red-50/20'
            : ''
        }`}
      >
        {children}
      </div>

      {/* Form Gönderim & İptal Butonları - EN ALTTA */}
      <div className="pt-6 border-t border-gray-200">
        <FormButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={project ? "Proje Bilgilerini Güncelle" : "Projeyi Kaydet"}
          isLoading={isLoading}
        />
      </div>
    </form>
  );
};

export default AdminProjectForm;
