import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCheck,
  FiX,
  FiUploadCloud,
  FiUser,
  FiLinkedin,
  FiExternalLink,
  FiLayers,
  FiCompass,
  FiTool,
  FiBriefcase,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import AdminPageHeader from './AdminPageHeader';
import AdminLoadingState from './AdminLoadingState';
import {
  ROLE_CATEGORIES,
  detectRoleCategory,
  getTeamDisciplines,
  getRoleMeta
} from '../../config/teamRoles';

// İsimleri Baş Harfleri Büyük formatlama
const formatName = (name) => {
  if (!name) return '';
  return name
    .trim()
    .toLocaleLowerCase('tr-TR')
    .split(/\s+/)
    .map((word) => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');
};

// Kategori ikonu bileşeni
const CategoryIcon = ({ id, size = 16, className = '' }) => {
  switch (id) {
    case 'muhendis':
      return <FiCompass size={size} className={className} />;
    case 'mimar':
      return <FiLayers size={size} className={className} />;
    case 'usta':
      return <FiTool size={size} className={className} />;
    case 'yonetim':
      return <FiBriefcase size={size} className={className} />;
    default:
      return <FiUser size={size} className={className} />;
  }
};

const TeamEditor = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [editingMember, setEditingMember] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form durumu
  const [selectedCategory, setSelectedCategory] = useState('muhendis');
  const [formData, setFormData] = useState({
    namesurname: '',
    position: 'İnşaat Mühendisi',
    LinkedIn: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Ekip üyelerini yükle
  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTeam();
      setTeamMembers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Ekip üyeleri yüklenirken hata oluştu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      namesurname: '',
      position: '',
      LinkedIn: ''
    });
    setSelectedCategory('muhendis');
    setSelectedImage(null);
    setImagePreview(null);
    setEditingMember(null);
    setIsAddingNew(false);
  };

  // Yeni üye ekleme modunu aç
  const handleAddNew = () => {
    setEditingMember(null);
    setSelectedCategory('muhendis');
    setFormData({
      namesurname: '',
      position: 'İnşaat Mühendisi',
      LinkedIn: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setIsAddingNew(true);
    setError(null);
    setSuccessMessage(null);
  };

  // Düzenleme modunu aç
  const handleEdit = (member) => {
    setEditingMember(member);
    setIsAddingNew(false);
    const category = detectRoleCategory(member.position);
    setSelectedCategory(category);
    setFormData({
      namesurname: member.namesurname || '',
      position: member.position || '',
      LinkedIn: member.LinkedIn || ''
    });
    setImagePreview(member.url ? publicService.getImageURL(member.url) : null);
    setSelectedImage(null);
    setError(null);
    setSuccessMessage(null);

    // Form alanına yumuşak kaydırma
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Kategori değiştiğinde
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    const cat = ROLE_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.defaultTitle) {
      setFormData((prev) => ({
        ...prev,
        position: cat.defaultTitle
      }));
    }
  };

  // Hazır önerilen unvana tıklandığında
  const handleSelectSuggestedTitle = (title) => {
    setFormData((prev) => ({
      ...prev,
      position: title
    }));
  };

  // Resim seçimi
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Görsel boyutu en fazla 5MB olabilir.');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Resim önizlemesini kaldır
  const removeImagePreview = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.namesurname.trim() || !formData.position.trim()) {
      setError('Ad Soyad ve Pozisyon alanları zorunludur.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingMember) {
        await adminService.updateTeamMember(editingMember.id, formData, selectedImage);
        setSuccessMessage(`"${formData.namesurname}" üyesi başarıyla güncellendi.`);
      } else {
        await adminService.addTeamMember(formData, selectedImage);
        setSuccessMessage(`"${formData.namesurname}" başarıyla ekibe eklendi.`);
      }

      await loadTeamMembers();
      resetForm();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      logger.error('Form gönderimi hatası:', err);
      setError('İşlem sırasında hata oluştu: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Üye sil
  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name || 'Bu üyeyi'}" silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      setLoading(true);
      await adminService.deleteTeamMember(id);
      setSuccessMessage('Ekip üyesi başarıyla silindi.');
      await loadTeamMembers();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setError('Silme işlemi sırasında hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mevcut kayıtlı resmi sil
  const handleDeleteImage = async (id) => {
    if (!window.confirm('Bu görseli silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      await adminService.deleteTeamMemberImage(id);
      if (editingMember && editingMember.id === id) {
        setEditingMember({ ...editingMember, url: null });
        setImagePreview(null);
      }
      await loadTeamMembers();
      setSuccessMessage('Görsel silindi.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Resim silme hatası: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeCategory = ROLE_CATEGORIES.find((c) => c.id === selectedCategory) || ROLE_CATEGORIES[0];
  const activeSkills = getTeamDisciplines(formData.position);

  if (loading && teamMembers.length === 0) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Ekip Kadrosu & Uzmanlıklar"
          subtitle="Mimari, mühendislik ve saha kadrosunu yönetin. Seçtiğiniz unvana göre uzmanlık becerileri otomatik eşleşir."
          badge="Kadro Yönetimi"
        />
        <AdminLoadingState type="cards" message="Ekip üyeleri yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Üst Yönetim Barı */}
      <AdminPageHeader
        title="Ekip Kadrosu & Uzmanlıklar"
        subtitle="Mimari, mühendislik ve saha kadrosunu yönetin. Seçtiğiniz unvana göre uzmanlık becerileri otomatik eşleşir."
        badge={`${teamMembers.length} Aktif Üye`}
        actions={
          !isAddingNew && !editingMember && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs hover:shadow transition-all active:scale-[0.98]"
            >
              <FiPlus size={16} />
              <span>Yeni Üye Ekle</span>
            </button>
          )
        }
      />

      {/* Bildirim / Hata Mesajları */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 text-sm">
            <FiAlertCircle className="text-rose-600 shrink-0" size={18} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 text-sm">
            <FiCheckCircle className="text-emerald-600 shrink-0" size={18} />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Üye Ekleme / Düzenleme Formu */}
      {(isAddingNew || editingMember) && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden animate-fade-in">
          {/* Form Başlığı */}
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-base font-bold text-slate-900">
                {editingMember ? 'Ekip Üyesini Düzenle' : 'Yeni Ekip Üyesi Tanımla'}
              </h3>
            </div>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Vazgeç"
            >
              <FiX size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 1. AD SOYAD & LİNKEDİN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.namesurname}
                  onChange={(e) => setFormData({ ...formData, namesurname: e.target.value })}
                  placeholder="Örn: Burak İtik"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm text-slate-900 bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  LinkedIn Profili (İsteğe Bağlı)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiLinkedin size={15} />
                  </div>
                  <input
                    type="url"
                    value={formData.LinkedIn}
                    onChange={(e) => setFormData({ ...formData, LinkedIn: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm text-slate-900 bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* 2. ROL & POZİSYON MENÜSÜ (Kategori Seçici) */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Pozisyon Kategorisi & Rolü
                  </h4>
                  <p className="text-xs text-slate-500">
                    Mühendis, Mimar veya Usta menüsünden seçim yapın; uzmanlık becerileri otomatik eşleştirilir.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-semibold self-start sm:self-auto">
                  OTOMATİK SKILL EŞLEŞTİRME
                </span>
              </div>

              {/* Rol Kategori Menü Butonları */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {ROLE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                          : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`p-1.5 rounded-lg ${
                            isSelected ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <CategoryIcon id={cat.id} size={15} />
                        </span>
                        {isSelected && <FiCheck className="text-amber-600" size={14} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {cat.shortLabel}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                          {cat.label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Hazır Önerilen Pozisyon Çipleri */}
              {activeCategory.suggestedTitles.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-2">
                    Hazır Seçilebilir Unvanlar:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeCategory.suggestedTitles.map((title, idx) => {
                      const isMatch = formData.position === title;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestedTitle(title)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            isMatch
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                          }`}
                        >
                          {title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Unvan Manuel Yazma / Düzenleme Alanı */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Pozisyon / Unvan Metni <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Örn: Statik Hesap & Deprem Mühendisi"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm text-slate-900 bg-white transition-all font-medium"
                />
              </div>

              {/* Eşleşen Beceriler Önizleme Paneli */}
              <div className="pt-2 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <FiInfo className="text-amber-500" size={13} />
                  <span>Web Sitesinde Görünecek Otomatik Beceriler (Skills):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeSkills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 text-amber-300 border border-slate-800 shadow-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. PROFİL GÖRSELİ */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Profil Görseli (Fotoğraf)
              </label>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Resim Önizleme */}
                <div className="w-28 h-36 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Önizleme"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImagePreview}
                        className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-colors"
                        title="Seçilen resmi kaldır"
                      >
                        <FiX size={12} />
                      </button>
                    </>
                  ) : editingMember && editingMember.url ? (
                    <>
                      <img
                        src={publicService.getImageURL(editingMember.url)}
                        alt="Kayıtlı Profil"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(editingMember.id)}
                        className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-colors"
                        title="Mevcut resmi sil"
                      >
                        <FiX size={12} />
                      </button>
                    </>
                  ) : (
                    <FiUser size={36} className="text-slate-300" />
                  )}
                </div>

                {/* Yükleme Butonu & Bilgilendirme */}
                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/40 text-xs font-semibold text-slate-700 transition-all shadow-2xs">
                    <FiUploadCloud size={16} className="text-amber-500" />
                    <span>Yeni Fotoğraf Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-slate-500">
                    Önerilen: Dikey portre, minimum 600x800px çözünürlük. Maksimum dosya boyutu 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Butonları */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 shadow-sm transition-all"
              >
                <FiCheck size={16} />
                <span>{saving ? 'Kaydediliyor...' : editingMember ? 'Değişiklikleri Güncelle' : 'Ekip Üyesini Ekle'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ekip Kartları Izgarası */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const formatted = formatName(member.namesurname);
          const meta = getRoleMeta(member.position);
          const disciplines = getTeamDisciplines(member.position);
          const photoUrl = member.url ? publicService.getImageURL(member.url) : null;

          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
            >
              {/* Üst: Portre & Hızlı Aksiyonlar */}
              <div>
                <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={formatted}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                      <FiUser size={44} className="text-slate-600" />
                      <span className="text-xs text-slate-500">Fotoğraf Yok</span>
                    </div>
                  )}

                  {/* Kategori Rozeti */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md ${meta.badgeClass}`}
                    >
                      <CategoryIcon id={meta.id} size={11} />
                      {meta.shortLabel}
                    </span>
                  </div>

                  {/* Aksiyon Butonları (Düzenle & Sil) */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 rounded-lg bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 backdrop-blur-md transition-colors shadow-sm"
                      title="Düzenle"
                    >
                      <FiEdit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.namesurname)}
                      className="p-2 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors shadow-sm"
                      title="Sil"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* İçerik Gövdesi */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {formatted}
                    </h3>
                    <p className="text-xs font-semibold text-amber-600 mt-0.5">
                      {member.position || 'Belirtilmemiş'}
                    </p>
                  </div>

                  {/* Uzmanlık Alanları / Çipler */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Ön Yüzde Gösterilen Beceriler:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {disciplines.map((item, dIdx) => (
                        <span
                          key={dIdx}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Taban: LinkedIn veya Durum */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                {member.LinkedIn ? (
                  <a
                    href={member.LinkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-semibold transition-colors"
                  >
                    <FiLinkedin size={13} />
                    <span>LinkedIn Profili</span>
                    <FiExternalLink size={11} />
                  </a>
                ) : (
                  <span className="text-slate-400 text-[11px]">LinkedIn eklenmemiş</span>
                )}
                <span className="text-[11px] font-mono text-slate-400">ID: #{member.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ekip Boş Durumu */}
      {!loading && teamMembers.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center mb-3">
            <FiUser size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Henüz ekip üyesi bulunmuyor</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Yeni bir mimar, mühendis veya usta ekleyerek web sitenizin ekip bölümünü zenginleştirin.
          </p>
          <button
            onClick={handleAddNew}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
          >
            <FiPlus size={14} />
            <span>İlk Üyeyi Ekle</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamEditor;
