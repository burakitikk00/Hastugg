import { useState, useEffect } from 'react';
import FormButtons from './FormButtons';
import LoadingImage from '../common/LoadingImage';
import adminService from '../../services/adminService';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import {
  SERVICE_ICON_OPTIONS,
  getServiceIcon
} from '../../utils/serviceIcons';
import {
  FiInfo,
  FiFileText,
  FiImage,
  FiLayers,
  FiClock,
  FiHelpCircle,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiTag
} from 'react-icons/fi';

const CATEGORY_PRESETS = [
  'Projelendirme & Tasarım',
  'Uygulama & Denetim',
  'İnşaat & Taahhüt',
  'Mühendislik & Yenileme',
  'Kentsel Dönüşüm',
  'Statik & Güçlendirme',
  'Danışmanlık & Ruhsat'
];

const STAMP_PRESETS = [
  'A+ MİMARİ STANDART',
  'ŞANTİYE GÜVENCESİ',
  'DEPREME TAM GÜVENCE',
  'TSE ONAYLI MÜHENDİSLİK',
  'BIM SIFIR HATA',
  'ANAHTAR TESLİM GÜVENCESİ'
];

const AdminServiceForm = ({
  service = null,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('temel'); // 'temel' | 'icerik' | 'gorsel' | 'ciktilar' | 'surec' | 'sss'

  // Toast bildirim durumu
  const [toast, setToast] = useState({
    show: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Form ana state'i
  const [formData, setFormData] = useState({
    service: service?.service || '',
    category: service?.category || 'Projelendirme & Tasarım',
    icon: service?.icon || 'compass',
    stamp: service?.stamp || 'A+ MİMARİ STANDART',
    url: service?.url || '',
    short_description: service?.short_description || service?.description || '',
    detailed_description: service?.detailed_description || service?.description || '',
    scope_tags: Array.isArray(service?.scope_tags) ? service.scope_tags : [],
    deliverables: Array.isArray(service?.deliverables) ? service.deliverables : [],
    process_steps: Array.isArray(service?.process_steps) ? service.process_steps : [],
    faqs: Array.isArray(service?.faqs) ? service.faqs : [],
    display_order: service?.display_order ?? 0,
    is_active: service?.is_active ?? true
  });

  // Yeni etiket girişi için geçici input state'i
  const [newTagInput, setNewTagInput] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    service: false,
    short_description: false
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  // Görsel yükleme (Supabase Storage)
  const handleCoverUpload = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const result = await adminService.uploadImage(file);
      handleChange('url', result.imageURL);
      setToast({
        show: true,
        title: 'Görsel Yüklendi',
        message: 'Kapak görseli başarıyla depolandı.'
      });
    } catch (err) {
      logger.error('Görsel yükleme hatası:', err);
      alert('Görsel yüklenirken hata oluştu: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Etiket (Scope Tags) İşlemleri
  const addTag = () => {
    const trimmed = newTagInput.trim().toUpperCase();
    if (!trimmed) return;
    if (formData.scope_tags.includes(trimmed)) {
      alert('Bu etiket zaten ekli.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      scope_tags: [...prev.scope_tags, trimmed]
    }));
    setNewTagInput('');
  };

  const removeTag = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      scope_tags: prev.scope_tags.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Çıktılar (Deliverables) İşlemleri
  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [
        ...prev.deliverables,
        {
          title: '',
          description: '',
          icon: 'file-text'
        }
      ]
    }));
  };

  const updateDeliverable = (index, field, value) => {
    const updated = [...formData.deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, deliverables: updated }));
  };

  const removeDeliverable = (index) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, idx) => idx !== index)
    }));
  };

  // İş Akışı Süreç Adımları (Process Steps) İşlemleri
  const addProcessStep = () => {
    const nextStep = formData.process_steps.length + 1;
    setFormData(prev => ({
      ...prev,
      process_steps: [
        ...prev.process_steps,
        {
          step: nextStep,
          title: '',
          description: '',
          duration: ''
        }
      ]
    }));
  };

  const updateProcessStep = (index, field, value) => {
    const updated = [...formData.process_steps];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, process_steps: updated }));
  };

  const removeProcessStep = (index) => {
    const updated = formData.process_steps
      .filter((_, idx) => idx !== index)
      .map((item, idx) => ({ ...item, step: idx + 1 }));
    setFormData(prev => ({ ...prev, process_steps: updated }));
  };

  // SSS (FAQs) İşlemleri
  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          question: '',
          answer: ''
        }
      ]
    }));
  };

  const updateFaq = (index, field, value) => {
    const updated = [...formData.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, faqs: updated }));
  };

  const removeFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, idx) => idx !== index)
    }));
  };

  // Form Gönderimi
  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {
      service: !formData.service.trim(),
      short_description: !formData.short_description.trim()
    };

    if (errors.service || errors.short_description) {
      setValidationErrors(errors);
      setActiveTab(errors.service ? 'temel' : 'icerik');
      setToast({
        show: true,
        title: 'Eksik Alanlar Var',
        message: 'Lütfen zorunlu hizmet başlığı ve kısa açıklama alanlarını doldurun.'
      });
      return;
    }

    onSave({
      ...formData,
      description: formData.short_description // geriye uyumluluk
    });
  };

  const tabs = [
    { id: 'temel', label: '1. Temel Bilgiler', icon: FiInfo },
    { id: 'icerik', label: '2. Mimari İçerik & Metin', icon: FiFileText },
    { id: 'gorsel', label: '3. Kapak Görseli', icon: FiImage },
    { id: 'ciktilar', label: `4. Çıktılar & Etiketler (${formData.deliverables.length})`, icon: FiLayers },
    { id: 'surec', label: `5. İş Akışı Süreci (${formData.process_steps.length})`, icon: FiClock },
    { id: 'sss', label: `6. Sıkça Sorulanlar (${formData.faqs.length})`, icon: FiHelpCircle }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden relative">
      {/* Toast Bildirimi */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-fadeIn">
          <div className="flex items-start gap-3 bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl border border-amber-500/30 max-w-sm backdrop-blur-md">
            <FiCheckCircle className="text-amber-400 text-lg shrink-0 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider">{toast.title}</h5>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="text-slate-400 hover:text-white">
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Form Üst Başlığı */}
      <div className="px-6 py-4.5 border-b border-slate-200/80 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {service ? `Hizmet Düzenle #${service.id}` : 'Yeni Hizmet Tanımlama'}
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1">
            {formData.service || 'İsimsiz Hizmet Kalemi'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || uploadingCover}
            className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Sekme Gezintisi */}
      <div className="px-6 border-b border-slate-200 bg-white flex overflow-x-auto gap-2 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${isActive
                ? 'border-amber-500 text-amber-900 bg-amber-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
            >
              <Icon className={isActive ? 'text-amber-600' : 'text-slate-400'} size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
        {/* ========================================================================= */}
        {/* SEKME 1: TEMEL BİLGİLER */}
        {/* ========================================================================= */}
        {activeTab === 'temel' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Hizmet Başlığı *
                </label>
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) => handleChange('service', e.target.value)}
                  placeholder="Örn: Mimari Tasarım & Projelendirme"
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm text-slate-900 bg-white ${validationErrors.service
                    ? 'border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-amber-500/20 focus:border-amber-500'
                    }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Hizmet Kategorisi
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 bg-white"
                  >
                    {CATEGORY_PRESETS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Rozet / Kalite Damgası (Stamp)
                </label>
                <input
                  type="text"
                  list="stamp-presets"
                  value={formData.stamp}
                  onChange={(e) => handleChange('stamp', e.target.value)}
                  placeholder="Örn: A+ MİMARİ STANDART"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 bg-white font-mono"
                />
                <datalist id="stamp-presets">
                  {STAMP_PRESETS.map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <p className="text-[11px] text-slate-400 mt-1">Kart üzerinde teknik mimari mühür olarak görünür.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Görüntüleme Sırası
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => handleChange('display_order', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">Düşük sayılar daha önce listelenir (0, 1, 2...).</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Yayın Durumu
                </label>
                <div className="pt-2 flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                  <span className={`text-xs font-semibold ${formData.is_active ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {formData.is_active ? 'Yayında (Aktif)' : 'Taslak (Gizli)'}
                  </span>
                </div>
              </div>
            </div>

            {/* İkon Seçici */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 font-mono">
                Mimari Vektör İkonu
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                {SERVICE_ICON_OPTIONS.map(opt => {
                  const IconComp = opt.icon;
                  const isSelected = formData.icon === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleChange('icon', opt.key)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 shadow-2xs font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      title={opt.label}
                    >
                      <IconComp size={20} className={isSelected ? 'text-amber-600' : 'text-slate-500'} />
                      <span className="text-[10px] mt-1.5 truncate max-w-full font-mono">{opt.key}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEKME 2: MİMARİ İÇERİK & METİNLER */}
        {/* ========================================================================= */}
        {activeTab === 'icerik' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                Kısa Açıklama (Ana Sayfa Kartı & Özet) *
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) => handleChange('short_description', e.target.value)}
                rows={3}
                placeholder="Hizmetin temel amacını ve kapsamını özetleyen 1-2 cümle..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 bg-white leading-relaxed"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Ana sayfadaki mimari hizmet kartlarında ve detay sayfasının en üst hero bölümünde görünür.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                Kapsamlı Mimari & Teknik Detay Açıklaması
              </label>
              <textarea
                value={formData.detailed_description}
                onChange={(e) => handleChange('detailed_description', e.target.value)}
                rows={8}
                placeholder="Hizmetin teknik metodolojisini, mevzuat standartlarını, arsa ve proje yaklaşımlarını anlatan kapsamlı metin (paragraflar halinde boşluk bırakarak yazabilirsiniz)..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 bg-white leading-relaxed font-sans"
              />
              <p className="text-[11px] text-slate-400 mt-1">Hizmet detay sayfasında (/hizmet/:id) müşterilere ve iş ortaklarına sunulan ana metin bloğudur.</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEKME 3: KAPAK GÖRSELİ */}
        {/* ========================================================================= */}
        {activeTab === 'gorsel' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <input
                type="file"
                id="service-cover-file"
                accept="image/*"
                onChange={(e) => handleCoverUpload(e.target.files[0])}
                className="hidden"
              />
              <label
                htmlFor="service-cover-file"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs transition-all active:scale-95"
              >
                <FiImage size={15} />
                <span>Yeni Kapak Görseli Seç ve Yükle</span>
              </label>
              <p className="text-xs text-slate-500 mt-2">Önerilen: 1920x1080px veya 1200x800px yüksek çözünürlüklü mimari fotoğraf.</p>
              {uploadingCover && (
                <div className="mt-3 text-xs text-amber-700 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Görsel Supabase Storage'a yükleniyor...
                </div>
              )}
            </div>

            {/* Manuel URL Girişi veya Mevcut Görsel Önizleme */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Görsel Doğrudan URL'si
                </label>
                <input
                  type="text"
                  value={formData.url || ''}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                  Mevcut Önizleme
                </label>
                {formData.url ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                    <LoadingImage
                      src={publicService.getImageURL(formData.url)}
                      alt="Service preview"
                      className="w-full h-full object-cover"
                      blurWhileLoading={true}
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                    Henüz görsel yüklenmedi
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEKME 4: ÇIKTILAR & ETİKETLER */}
        {/* ========================================================================= */}
        {activeTab === 'ciktilar' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Kapsam Etiketleri (Scope Tags) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FiTag className="text-amber-600" />
                    <span>Mimari Kapsam Etiketleri (Scope Tags)</span>
                  </h4>
                  <p className="text-xs text-slate-500">Ana sayfa kartlarında ve detay sayfasında pill rozetler olarak gösterilir.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Örn: 3D BIM MODELLEME, RUHSAT PROJESİ..."
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs uppercase font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  + Etiket Ekle
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {formData.scope_tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 rounded-lg text-xs font-mono font-semibold border border-amber-200"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(idx)}
                      className="text-amber-700 hover:text-rose-600 ml-1"
                    >
                      <FiX size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Teslim Edilen Belgeler / Çıktılar (Deliverables) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FiLayers className="text-amber-600" />
                    <span>Teslim Edilen Proje Çıktıları & Belgeler</span>
                  </h4>
                  <p className="text-xs text-slate-500">İşverene teslim edilen resmi paftalar, 3D renderlar, metraj dosyaları vb.</p>
                </div>
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
                >
                  <FiPlus size={14} />
                  <span>Yeni Çıktı Ekle</span>
                </button>
              </div>

              {formData.deliverables.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Henüz teslimat çıktısı tanımlanmadı. "+ Yeni Çıktı Ekle" butonuna basarak ekleyebilirsiniz.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.deliverables.map((deliv, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 font-mono">ÇIKTI #{dIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeDeliverable(dIdx)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold hover:bg-rose-50 p-1 rounded"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={deliv.title}
                          onChange={(e) => updateDeliverable(dIdx, 'title', e.target.value)}
                          placeholder="Çıktı Başlığı (Örn: 3D Render & Pafta)"
                          className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
                        />
                        <textarea
                          value={deliv.description}
                          onChange={(e) => updateDeliverable(dIdx, 'description', e.target.value)}
                          rows={2}
                          placeholder="Açıklama ve detay..."
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEKME 5: İŞ AKIŞI & SÜREÇ (PROCESS STEPS) */}
        {/* ========================================================================= */}
        {activeTab === 'surec' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FiClock className="text-amber-600" />
                  <span>Aşama Aşama Hizmet Metodolojisi</span>
                </h4>
                <p className="text-xs text-slate-500">Müşteriye işin nasıl ilerleyeceğini gösteren kronolojik yol haritası.</p>
              </div>
              <button
                type="button"
                onClick={addProcessStep}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                <FiPlus size={14} />
                <span> Adım Ekle</span>
              </button>
            </div>

            {formData.process_steps.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Henüz süreç adımı eklenmedi.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.process_steps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-start"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
                      0{step.step || sIdx + 1}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateProcessStep(sIdx, 'title', e.target.value)}
                          placeholder="Adım Başlığı (Örn: Konsept Tasarım)"
                          className="sm:col-span-2 px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
                        />
                        <input
                          type="text"
                          value={step.duration || ''}
                          onChange={(e) => updateProcessStep(sIdx, 'duration', e.target.value)}
                          placeholder="Süre / Not (Örn: 2-3. Hafta)"
                          className="px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
                        />
                      </div>
                      <textarea
                        value={step.description}
                        onChange={(e) => updateProcessStep(sIdx, 'description', e.target.value)}
                        rows={2}
                        placeholder="Bu aşamada ne yapılıyor?"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProcessStep(sIdx)}
                      className="text-rose-600 hover:text-rose-700 text-xs font-semibold hover:bg-rose-50 p-1.5 rounded"
                      title="Adımı Sil"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEKME 6: SSS (FAQS) */}
        {/* ========================================================================= */}
        {activeTab === 'sss' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FiHelpCircle className="text-amber-600" />
                  <span>Sıkça Sorulan Sorular & Cevaplar</span>
                </h4>
                <p className="text-xs text-slate-500">Müşterilerin en çok merak ettiği sorular ve mimari yanıtlar.</p>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                <FiPlus size={14} />
                <span> Soru Ekle</span>
              </button>
            </div>

            {formData.faqs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Henüz SSS eklenmedi.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.faqs.map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 font-mono">SORU #{fIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFaq(fIdx)}
                        className="text-rose-600 hover:text-rose-700 text-xs font-semibold hover:bg-rose-50 p-1 rounded"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(fIdx, 'question', e.target.value)}
                      placeholder="Soru metni (Örn: Ruhsat projesi ne kadar sürer?)"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(fIdx, 'answer', e.target.value)}
                      rows={2}
                      placeholder="Cevap metni..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alt Form Butonları */}
        <FormButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={service ? 'Hizmet Değişikliklerini Kaydet' : 'Yeni Hizmeti Oluştur'}
          isLoading={isLoading || uploadingCover}
          isDisabled={uploadingCover}
        />
      </form>
    </div>
  );
};

export default AdminServiceForm;
