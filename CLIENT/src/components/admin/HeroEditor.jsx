import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiBarChart2, FiEye, FiCheck } from 'react-icons/fi';
import FormButtons from './FormButtons';
import adminService from '../../services/adminService';
import logger from '../../utils/logger';

const DEFAULT_METRICS = [
  { value: '150+', label: 'Tamamlanan Prestij Projesi', order_index: 1 },
  { value: '%100', label: 'Statik & Deprem Güvencesi', order_index: 2 },
  { value: '15+', label: 'Yıllık Mimari Deneyim', order_index: 3 },
  { value: 'A+', label: 'Enerji & Malzeme Kalitesi', order_index: 4 }
];

const HeroEditor = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    mainTitle: 'Siz İsteyin, Biz İnşa Edelim',
    subheading: 'Profesyonel ekibimizle isteğinizi birebir yerine getiriyoruz. Hemen teklif alabilirsiniz.',
  });

  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Veritabanından verileri yükle
  useEffect(() => {
    let isMounted = true;
    const fetchHeroData = async () => {
      try {
        const heroData = await adminService.getHero();
        if (isMounted && heroData) {
          setFormData({
            mainTitle: heroData.mainTitle || 'Siz İsteyin, Biz İnşa Edelim',
            subheading: heroData.subheading || 'Profesyonel ekibimizle isteğinizi birebir yerine getiriyoruz. Hemen teklif alabilirsiniz.'
          });

          if (Array.isArray(heroData.metrics) && heroData.metrics.length > 0) {
            setMetrics(heroData.metrics);
          }
        }
      } catch (error) {
        logger.error('Hero verileri getirilemedi:', error);
      }
    };

    fetchHeroData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Metrik Alanlarını Güncelleme
  const handleMetricChange = (index, field, value) => {
    setMetrics(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  // Yeni Metrik Ekleme
  const handleAddMetric = () => {
    setMetrics(prev => [
      ...prev,
      {
        value: '',
        label: '',
        order_index: prev.length + 1
      }
    ]);
  };

  // Metrik Silme
  const handleRemoveMetric = (index) => {
    if (metrics.length <= 1) {
      alert('En az bir mimari metrik bulunmalıdır.');
      return;
    }
    setMetrics(prev => prev.filter((_, idx) => idx !== index));
  };

  // Metrik Sırasını Değiştirme (Yukarı / Aşağı)
  const handleMoveMetric = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= metrics.length) return;

    setMetrics(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated.map((m, i) => ({ ...m, order_index: i + 1 }));
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setSaveSuccess(false);

    try {
      const payload = {
        mainTitle: formData.mainTitle,
        subheading: formData.subheading,
        metrics: metrics.map((m, idx) => ({
          id: m.id,
          value: m.value.trim(),
          label: m.label.trim(),
          order_index: idx + 1
        }))
      };

      const response = await adminService.saveHero(payload);
      if (response && response.metrics) {
        setMetrics(response.metrics);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);

      if (onSave) {
        await onSave(payload);
      }
    } catch (error) {
      logger.error('Hero kaydedilirken hata:', error);
      alert(`Kaydetme sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="px-6 py-4.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Hero Karşılama Alanı & Metrikler</h3>
          <p className="text-xs text-slate-500 mt-0.5">Ana sayfa manşetini ve altındaki mimari başarı & güvence istatistiklerini yönetin.</p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold animate-fade-in">
            <FiCheck className="text-emerald-600" />
            <span>Tüm Değişiklikler Kaydedildi</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-7">
        {/* BÖLÜM 1: MANŞET & SPOT METİN */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">1. Ana Manşet & Açıklama</h4>
          </div>

          <div>
            <label htmlFor="mainTitle" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Ana Manşet Başlığı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="mainTitle"
              name="mainTitle"
              value={formData.mainTitle}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-semibold text-slate-900 transition-all bg-white"
              placeholder="Örn: Hayalinizdeki Yapıları Kusursuz İşçilikle Gerçeğe Dönüştürüyoruz"
            />
          </div>

          <div>
            <label htmlFor="subheading" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Spot Alt Açıklama Metni <span className="text-red-500">*</span>
            </label>
            <textarea
              id="subheading"
              name="subheading"
              value={formData.subheading}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 transition-all bg-white leading-relaxed"
              placeholder="Modern mimari vizyon, ileri statik mühendislik ve şeffaf süreç yönetimiyle..."
            />
          </div>
        </div>

        {/* BÖLÜM 2: MİMARİ BAŞARI & GÜVENCE METRİKLERİ */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">2. Mimari Başarı & Güvence Metrikleri</h4>
                <p className="text-xs text-slate-500 mt-0.5">Hero alanının alt şeridinde yer alan istatistik ve kalite rozetleri.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMetric}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300/80 rounded-lg transition-all shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <FiPlus className="text-amber-800" />
              <span>Yeni Metrik Ekle</span>
            </button>
          </div>

          {/* Metrik Giriş Kartları Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {metrics.map((metric, index) => (
              <div
                key={metric.id || index}
                className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-xl space-y-3 relative group hover:border-amber-400/60 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-slate-200/80 text-slate-700">
                    #{index + 1}
                  </span>

                  {/* Sıralama ve Silme Aksiyonları */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveMetric(index, -1)}
                      disabled={index === 0}
                      title="Yukarı Taşı"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveMetric(index, 1)}
                      disabled={index === metrics.length - 1}
                      title="Aşağı Taşı"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveMetric(index)}
                      title="Metriği Sil"
                      className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors ml-1"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Değer / Vurgu (örn: 150+, %100, A+) */}
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-mono">
                      Değer / Rakam <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={metric.value}
                      onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                      required
                      placeholder="Örn: 150+, %100"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-mono font-bold text-slate-900 bg-white"
                    />
                  </div>

                  {/* Etiket / Başlık (örn: Tamamlanan Prestij Projesi) */}
                  <div className="sm:col-span-7">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-mono">
                      Açıklama / Başlık <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={metric.label}
                      onChange={(e) => handleMetricChange(index, 'label', e.target.value)}
                      required
                      placeholder="Örn: Tamamlanan Prestij Projesi"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BÖLÜM 3: CANLI HUD ÖNİZLEME */}
          <div className="mt-5 p-5 bg-[#07090e] border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
              <FiEye className="text-amber-400" />
              <span className="font-bold uppercase tracking-wider text-slate-300">Canlı Hero HUD Önizleme</span>
              <span className="text-[10px] text-slate-500">(Web sitesindeki gerçek koyu mimari görünüm)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80">
              {metrics.map((metric, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="font-mono text-xl font-bold text-slate-100 tracking-tight">
                    {metric.value || '---'}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium leading-tight">
                    {metric.label || 'Başlık Bekleniyor'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Buttons */}
        <FormButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText="Hero & Metrikleri Kaydet"
          isLoading={isLoading}
        />
      </form>
    </div>
  );
};

export default HeroEditor;

