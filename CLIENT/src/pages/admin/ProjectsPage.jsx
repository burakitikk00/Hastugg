import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiSearch,
  FiLayers,
  FiMapPin,
  FiClock,
  FiImage,
  FiUploadCloud,
  FiGrid,
  FiList,
  FiAlertCircle,
  FiInfo,
  FiLoader,
  FiRotateCcw
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminProjectForm from '../../components/admin/AdminProjectForm';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoadingState from '../../components/admin/AdminLoadingState';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import adminService from '../../services/adminService';
import publicService from '../../services/publicService';
import { scrollToAndHighlight } from '../../utils/scrollAndHighlight';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectImages, setProjectImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [stagedDeletedImages, setStagedDeletedImages] = useState([]);
  const [selectedMainNewIndex, setSelectedMainNewIndex] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Ana Görsel Seçim State'i (Kaydet butonuna basılana kadar sunucuya istek atmaz)
  const [selectedMainImage, setSelectedMainImage] = useState(null);

  // Görsel Yükleme Durumu & Sayacı (Boş div & dönen yükleme efekti için)
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  // Sağ Üst Toast Bildirim State'i
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });

  // Filtreleme ve Görünüm State'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Toast gösterme ve otomatik kapanma (4 saniye)
  const showToast = ({ type = 'success', title, message }) => {
    setToast({ show: true, type, title, message });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Verileri yükle
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [projectsData, servicesData] = await Promise.all([
        adminService.getProjects(),
        adminService.getServices()
      ]);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Proje detaylarını yükle
  const loadProjectDetails = async (projectId) => {
    try {
      const projectDetails = await adminService.getProject(projectId);
      setSelectedProject(projectDetails);
      setProjectImages(projectDetails.images || []);
      setStagedDeletedImages([]);
      setNewImages([]);
      setSelectedMainNewIndex(null);
      // Ana görseli başlangıçta projenin mevcut URL'i olarak ayarla
      setSelectedMainImage(projectDetails.url || (projectDetails.images?.[0] || null));
    } catch (err) {
      setError('Proje detayları yüklenirken hata oluştu: ' + err.message);
    }
  };

  // Yeni proje ekleme
  const handleAdd = () => {
    setSelectedProject(null);
    setProjectImages([]);
    setNewImages([]);
    setStagedDeletedImages([]);
    setSelectedMainNewIndex(null);
    setSelectedMainImage(null);
    setIsUploadingImages(false);
    setUploadingCount(0);
    setShowForm(true);
    setError('');
    scrollToAndHighlight('project-form-container', { delay: 80, duration: 3200, block: 'start' });
  };

  // Proje düzenleme
  const handleEdit = async (project) => {
    try {
      setError('');
      await loadProjectDetails(project.id);
      setShowForm(true);
      setNewImages([]);
      setStagedDeletedImages([]);
      setSelectedMainNewIndex(null);
      setIsUploadingImages(false);
      setUploadingCount(0);
      scrollToAndHighlight('project-form-container', { delay: 80, duration: 3200, block: 'start' });
    } catch (err) {
      setError('Proje düzenleme yüklenirken hata: ' + err.message);
    }
  };

  // Formu iptal et / kapat
  const handleCancel = () => {
    setShowForm(false);
    setSelectedProject(null);
    setProjectImages([]);
    setNewImages([]);
    setStagedDeletedImages([]);
    setSelectedMainNewIndex(null);
    setSelectedMainImage(null);
    setIsUploadingImages(false);
    setUploadingCount(0);
    setError('');
  };

  // Mevcut görsellerden ana görsel seçimi (İstek atmaz! Sadece local state'i günceller)
  const handleSelectMainImage = (imageURL) => {
    if (stagedDeletedImages.includes(imageURL)) return;
    setSelectedMainImage(imageURL);
    setSelectedMainNewIndex(null);
    showToast({
      type: 'info',
      title: 'Ana Görsel Seçildi',
      message: 'Seçim işaretlendi. Kalıcı olması için "Proje Bilgilerini Güncelle" butonuna basınız.'
    });
  };

  // Yeni yüklenen görsellerden ana görsel seçimi
  const handleSelectMainNewImage = (index) => {
    setSelectedMainNewIndex(index);
    setSelectedMainImage(null);
    showToast({
      type: 'info',
      title: 'Ana Görsel Seçildi',
      message: 'Yeni seçilen görsel ana vitrin görseli olarak belirlendi (Kaydedilince atanacak).'
    });
  };

  // Proje kaydetme (ekleme veya güncelleme)
  const handleSave = async (formData) => {
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        service_ids: JSON.stringify(formData.service_ids),
        category: formData.category || 'Karma Konut & Ofis',
        total_area: formData.total_area || '',
        delivery_date: formData.delivery_date || '',
        location: formData.location || '',
        client: formData.client || '',
        land_area: formData.land_area || '',
        project_year: formData.project_year || '',
        map_embed_url: formData.map_embed_url || '',
        map_address: formData.map_address || '',
        highlights: JSON.stringify(formData.highlights || []),
        transportation: JSON.stringify(formData.transportation || [])
      };

      let targetProjectId = selectedProject ? selectedProject.id : null;

      if (selectedProject) {
        // Kalan aktif görsellerin kontrolü
        const activeExisting = projectImages.filter(img => !stagedDeletedImages.includes(img));
        const totalRemaining = activeExisting.length + newImages.length;
        if (totalRemaining === 0) {
          throw new Error('Projede en az bir adet görsel bulunmalıdır. Lütfen tüm görselleri silmeyiniz veya yeni bir görsel ekleyiniz.');
        }

        // 1. Silinmek üzere işaretlenmiş görselleri sunucudan ve veritabanından kalıcı olarak sil
        if (stagedDeletedImages.length > 0) {
          for (const imgUrl of stagedDeletedImages) {
            try {
              await adminService.deleteProjectImage(selectedProject.id, imgUrl);
            } catch (delErr) {
              console.warn('Görsel silinirken uyarı:', delErr);
            }
          }
        }

        // 2. Yeni seçilmiş görselleri sunucuya yükle
        let uploadedUrls = [];
        if (newImages.length > 0) {
          const uploadResponse = await adminService.addProjectImages(selectedProject.id, newImages);
          uploadedUrls = uploadResponse?.uploadedImages || [];
        }

        // 3. Ana görseli belirle ve gerekiyorsa güncelle
        let finalMainImage = null;
        if (selectedMainNewIndex !== null && uploadedUrls[selectedMainNewIndex]) {
          finalMainImage = uploadedUrls[selectedMainNewIndex];
        } else if (selectedMainImage && !stagedDeletedImages.includes(selectedMainImage)) {
          finalMainImage = selectedMainImage;
        } else {
          // Ana görsel silindiyse veya seçilmediyse kalan ilk görseli ana görsel yap
          finalMainImage = activeExisting[0] || uploadedUrls[0] || null;
        }

        if (finalMainImage && finalMainImage !== selectedProject.url) {
          await adminService.setMainImage(selectedProject.id, finalMainImage);
        }

        // 4. Proje metin bilgilerini güncelle
        await adminService.updateProject(selectedProject.id, projectData);

        showToast({
          type: 'success',
          title: 'Güncelleme Başarılı',
          message: `"${formData.title}" projesi ve tüm görsel değişiklikleri başarıyla güncellendi.`
        });
      } else {
        // Yeni proje ekleme
        if (newImages.length === 0) {
          throw new Error('En az bir görsel yüklemelisiniz');
        }

        // Eğer ilk görsel dışında bir görsel ana görsel seçildiyse, onu ilk sıraya al (sunucu ilk görseli ana görsel yapar)
        let imagesToUpload = newImages;
        if (selectedMainNewIndex !== null && selectedMainNewIndex > 0 && selectedMainNewIndex < newImages.length) {
          const mainFile = newImages[selectedMainNewIndex];
          const others = newImages.filter((_, idx) => idx !== selectedMainNewIndex);
          imagesToUpload = [mainFile, ...others];
        }

        const createdResult = await adminService.addProject(projectData, imagesToUpload);
        targetProjectId = createdResult?.id || createdResult?.project?.id || createdResult?.projectId || null;

        showToast({
          type: 'success',
          title: 'Proje Oluşturuldu',
          message: `"${formData.title}" projesi portfolyoya başarıyla eklendi.`
        });
      }

      await loadData();
      handleCancel();

      if (targetProjectId) {
        scrollToAndHighlight(`project-card-${targetProjectId}`, { delay: 180, duration: 3500, block: 'center' });
        scrollToAndHighlight(`project-row-${targetProjectId}`, { delay: 180, duration: 3500, block: 'center' });
      }
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Proje silme
  const handleDelete = async (project) => {
    if (window.confirm(`"${project.title}" projesini silmek istediğinizden emin misiniz?`)) {
      try {
        await adminService.deleteProject(project.id);
        showToast({
          type: 'success',
          title: 'Proje Silindi',
          message: `"${project.title}" projesi sistemden kaldırıldı.`
        });
        if (selectedProject?.id === project.id) {
          handleCancel();
        }
        await loadData();
      } catch (err) {
        setError('Proje silinirken hata oluştu: ' + err.message);
      }
    }
  };

  // Mevcut görseli silinmek üzere işaretleme (İstek atmaz! Sadece local state'te işaretler)
  const handleDeleteImage = (imageURL) => {
    if (!imageURL) return;

    setStagedDeletedImages(prev => {
      if (prev.includes(imageURL)) return prev;
      return [...prev, imageURL];
    });

    // Eğer silinmek istenen görsel şu anda seçili ana görselse
    if (selectedMainImage === imageURL) {
      const remainingExisting = projectImages.filter(img => img !== imageURL && !stagedDeletedImages.includes(img));
      if (remainingExisting.length > 0) {
        setSelectedMainImage(remainingExisting[0]);
      } else if (newImages.length > 0) {
        setSelectedMainImage(null);
        setSelectedMainNewIndex(0);
      } else {
        setSelectedMainImage(null);
      }
    }

    showToast({
      type: 'info',
      title: 'Görsel Silinmek Üzere İşaretlendi',
      message: 'Görsel kaydedilince sunucudan silinecektir. Dilerseniz "Geri Al" butonuyla iptal edebilirsiniz.'
    });
  };

  // Silinmek üzere işaretlenen görseli geri al (Undo)
  const handleUndoDeleteImage = (imageURL) => {
    setStagedDeletedImages(prev => prev.filter(img => img !== imageURL));
    showToast({
      type: 'success',
      title: 'Görsel Geri Alındı',
      message: 'Silme işlemi iptal edildi.'
    });
  };

  // Yeni görsel ekleme (dosya seçici & dinamik yerel yükleme efekti)
  const handleAddImages = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    setIsUploadingImages(true);
    setUploadingCount(fileArray.length);
    const startIndex = newImages.length;

    setTimeout(() => {
      setNewImages(prev => [...prev, ...fileArray]);
      setIsUploadingImages(false);
      setUploadingCount(0);

      showToast({
        type: 'success',
        title: 'Görseller Listeye Eklendi',
        message: `${fileArray.length} adet görsel listeye eklendi. Kaydetmek için formu onaylayın.`
      });
      scrollToAndHighlight(`new-img-${startIndex}`, { delay: 100, duration: 3200, block: 'center' });
    }, 350);
  };

  // Henüz kaydedilmemiş yeni görseli listeden silme
  const handleDeleteNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    if (selectedMainNewIndex === index) {
      setSelectedMainNewIndex(null);
    } else if (selectedMainNewIndex !== null && selectedMainNewIndex > index) {
      setSelectedMainNewIndex(prev => prev - 1);
    }
  };

  // Hizmet ID'lerinden isimleri çözümleme
  const getServiceNames = (serviceIdsRaw) => {
    let serviceIds = [];
    try {
      if (Array.isArray(serviceIdsRaw)) {
        serviceIds = serviceIdsRaw;
      } else if (serviceIdsRaw && typeof serviceIdsRaw === 'string') {
        const trimmed = serviceIdsRaw.trim();
        if (trimmed !== '' && trimmed !== '[]') {
          serviceIds = JSON.parse(trimmed);
        }
      }
      if (Array.isArray(serviceIds)) {
        serviceIds = serviceIds
          .map(id => (typeof id === 'string' ? parseInt(id, 10) : Number(id)))
          .filter(id => !isNaN(id) && id > 0);
      }
    } catch (e) {
      serviceIds = [];
    }

    return services
      .filter(service => serviceIds.includes(Number(service.id)))
      .map(service => service.service);
  };

  const statusColors = {
    'Completed': 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30',
    'In Progress': 'bg-amber-500/10 text-amber-800 border-amber-500/30',
    'Planned': 'bg-slate-100 text-slate-700 border-slate-200',
    'On Hold': 'bg-rose-500/10 text-rose-800 border-rose-500/30'
  };

  const statusTexts = {
    'Completed': 'Tamamlandı',
    'In Progress': 'Devam Ediyor',
    'Planned': 'Planlandı',
    'On Hold': 'Beklemede'
  };

  // Proje Listesini Filtreleme
  const filteredProjects = projects.filter((project) => {
    if (statusFilter !== 'ALL' && project.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = project.title?.toLowerCase().includes(q);
      const categoryMatch = project.category?.toLowerCase().includes(q);
      const locationMatch = project.location?.toLowerCase().includes(q);
      const serviceNames = getServiceNames(project.service_ids);
      const serviceMatch = serviceNames.some(s => s.toLowerCase().includes(q));
      return titleMatch || categoryMatch || locationMatch || serviceMatch;
    }
    return true;
  });

  if (isLoading && !showForm) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminPageHeader
            title="Projeler & Portfolyo"
            subtitle="Tamamlanan ve devam eden mimari/mühendislik projelerini, teknik künyelerini ve galerilerini yönetin."
            badge="Yükleniyor..."
          />
          <AdminLoadingState type="cards" message="Projeler yükleniyor..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden relative">
        {/* SAĞ ÜST KÖŞE ŞIK BİLDİRİM (TOAST) */}
        {toast && toast.show && (
          <div className="fixed top-6 right-6 z-[99999] max-w-sm sm:max-w-md w-[calc(100%-3rem)] animate-fadeIn transition-all duration-300">
            <div className={`relative overflow-hidden rounded-2xl bg-[#0c1017]/95 border p-4 text-white shadow-2xl backdrop-blur-xl ring-1 ${
              toast.type === 'error'
                ? 'border-rose-500/60 ring-rose-500/30'
                : toast.type === 'info'
                ? 'border-amber-500/60 ring-amber-500/30'
                : 'border-emerald-500/60 ring-emerald-500/30'
            }`}>
              {/* Üst Vurgulu Gradyan Çizgisi */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                toast.type === 'error'
                  ? 'from-rose-600 via-amber-500 to-rose-500'
                  : toast.type === 'info'
                  ? 'from-amber-500 via-amber-300 to-amber-600'
                  : 'from-emerald-500 via-amber-400 to-emerald-400'
              }`} />

              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border mt-0.5 ${
                  toast.type === 'error'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : toast.type === 'info'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                }`}>
                  {toast.type === 'error' ? (
                    <FiAlertCircle size={18} />
                  ) : toast.type === 'info' ? (
                    <FiInfo size={18} />
                  ) : (
                    <FiCheck size={18} />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-bold tracking-wide ${
                      toast.type === 'error'
                        ? 'text-rose-200'
                        : toast.type === 'info'
                        ? 'text-amber-200'
                        : 'text-emerald-200'
                    }`}>
                      {toast.title}
                    </h4>
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      toast.type === 'error'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                        : toast.type === 'info'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                    }`}>
                      {toast.type === 'error' ? 'Hata' : toast.type === 'info' ? 'Bilgi' : 'Başarılı'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setToast(prev => ({ ...prev, show: false }))}
                  className="text-slate-400 hover:text-white p-1 transition-colors rounded-lg hover:bg-white/10 shrink-0"
                  title="Kapat"
                >
                  <FiX size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sayfa Başlığı */}
        <AdminPageHeader
          title="Projeler & Portfolyo"
          subtitle="Tamamlanan ve devam eden mimari/mühendislik projelerini, teknik künyelerini ve galerilerini yönetin."
          badge={`${projects.length} Proje`}
          actions={
            !showForm && (
              <button
                onClick={handleAdd}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs hover:shadow transition-all active:scale-[0.98]"
              >
                <FiPlus size={16} />
                <span>Yeni Proje Ekle</span>
              </button>
            )
          }
        />

        {/* Hata Bildirimi (Sabit banner) */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-rose-600 text-base shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-rose-700 hover:text-rose-950 text-xs font-bold shrink-0 p-1"
            >
              Kapat
            </button>
          </div>
        )}

        {/* DÜZENLEME & EKLEME FORMU - Tamamen Odaklanmış ve Responsive */}
        {showForm && (
          <div
            id="project-form-container"
            className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-7 space-y-6 shadow-xs scroll-mt-6 animate-fadeIn"
          >
            {/* Form Üst Başlığı */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {selectedProject ? `Projeyi Düzenle: ${selectedProject.title}` : 'Yeni Proje Ekle'}
                  </h3>
                  {selectedProject && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-mono font-semibold">
                      ID: #{selectedProject.id}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedProject
                    ? 'Projenin künye bilgilerini, açıklamalarını, öne çıkan özelliklerini ve görsellerini güncelleyin.'
                    : 'Portfolyonuza yeni mimari veya mühendislik projesi ekleyin. Zorunlu alanları (*) doldurunuz.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-center"
              >
                <FiX size={15} />
                <span>Kapat / Vazgeç</span>
              </button>
            </div>

            <AdminProjectForm
              project={selectedProject}
              services={services}
              newImagesCount={(projectImages.filter(img => !stagedDeletedImages.includes(img)).length) + newImages.length}
              onSave={handleSave}
              onCancel={handleCancel}
            >
              {/* Proje Görselleri Yönetimi (Temel Bilgiler Sekmesi İçerisinde Gösterilir) */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FiImage className="text-amber-500" />
                      <span>Proje Görselleri Yönetimi</span>
                      <span className="text-rose-500">*</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedProject
                        ? 'İstediğiniz görsele tıklayarak ana vitrin görseli yapabilirsiniz. Silinen veya eklenen görseller "Proje Bilgilerini Güncelle" butonuna basınca geçerli olur.'
                        : 'Projeyi kaydetmek için en az bir adet görsel yüklemelisiniz. İstediğiniz görsele tıklayarak ana görsel yapabilirsiniz.'}
                    </p>
                  </div>
                  {selectedProject && (
                    <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                      {stagedDeletedImages.length > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-800 border border-rose-500/30">
                          {stagedDeletedImages.length} Silinecek
                        </span>
                      )}
                      {newImages.length > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 border border-amber-500/30">
                          {newImages.length} Yeni Eklenecek
                        </span>
                      )}
                      {selectedMainImage && selectedMainImage !== selectedProject.url && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-800 border border-sky-500/30 animate-pulse">
                          Ana Görsel Değişti
                        </span>
                      )}
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        {projectImages.filter(img => !stagedDeletedImages.includes(img)).length + newImages.length} Aktif Görsel
                      </span>
                    </div>
                  )}
                </div>

                {/* Mevcut Görseller (Düzenleme Sırasında) */}
                {selectedProject && projectImages.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                      Mevcut Görseller ({projectImages.length})
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {projectImages.map((imageURL, index) => {
                        const isDeleted = stagedDeletedImages.includes(imageURL);
                        const isMain = selectedMainNewIndex === null && (
                          selectedMainImage
                            ? selectedMainImage === imageURL
                            : selectedProject.url === imageURL
                        );

                        return (
                          <div
                            key={index}
                            id={`project-img-${index}`}
                            className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-4/3 sm:aspect-square scroll-mt-8 ${
                              isDeleted
                                ? 'border-rose-400 bg-rose-950/20 opacity-80'
                                : isMain
                                ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-md scale-[1.01] bg-slate-100'
                                : 'border-slate-200 hover:border-amber-400 cursor-pointer bg-slate-100'
                            }`}
                            onClick={() => {
                              if (!isDeleted && !isMain) {
                                handleSelectMainImage(imageURL);
                              }
                            }}
                            title={
                              isDeleted
                                ? 'Bu görsel silinmek üzere işaretlendi (Kaydedilince silinir)'
                                : isMain
                                ? 'Şu An Seçili Ana Vitrin Görseli'
                                : 'Ana görsel olarak seçmek için tıklayın'
                            }
                          >
                            <img
                              src={publicService.getImageURL(imageURL) || '/api/placeholder/400/300'}
                              alt={`Proje görseli ${index + 1}`}
                              className={`w-full h-full object-cover transition-all duration-300 ${
                                isDeleted ? 'grayscale blur-[1px]' : 'group-hover:scale-105'
                              }`}
                            />

                            {/* SİLİNDİ / GERİ AL OVERLAY */}
                            {isDeleted ? (
                              <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center p-2 text-center z-20 animate-fadeIn">
                                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-2">
                                  Silinecek
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUndoDeleteImage(imageURL);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md transition-all"
                                  title="Silme işlemini iptal et"
                                >
                                  <FiRotateCcw size={12} />
                                  <span>Geri Al</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                {/* Ana Görsel Rozeti */}
                                {isMain ? (
                                  <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 z-10">
                                    <FiCheck size={11} />
                                    <span>Ana Görsel</span>
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="text-[10px] sm:text-[11px] font-bold text-white bg-slate-900/85 px-2 py-1 rounded-md backdrop-blur-xs">
                                      Ana Görsel Seç
                                    </span>
                                  </div>
                                )}

                                {/* Silme Butonu */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(imageURL);
                                  }}
                                  className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white w-7 h-7 flex items-center justify-center rounded-full opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-xs font-bold shadow-md z-20"
                                  title="Görseli Silinmek Üzere İşaretle"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}

                      {/* GÖRSEL EKLENİRKEN BELİREN DİNAMİK YÜKLEME EFEKTİ */}
                      {isUploadingImages && (
                        <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-amber-500/80 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-slate-900/10 aspect-4/3 sm:aspect-square flex flex-col items-center justify-center p-3 text-center shadow-md animate-pulse">
                          <div className="relative w-11 h-11 flex items-center justify-center mb-2">
                            <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping opacity-60" />
                            <div className="w-9 h-9 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                            <FiImage className="absolute text-amber-600 text-sm" />
                          </div>
                          <span className="text-xs font-bold text-amber-900 tracking-wide">
                            Görseller Ekleniyor...
                          </span>
                          {uploadingCount > 1 && (
                            <span className="text-[10px] text-amber-700 font-mono mt-0.5">
                              ({uploadingCount} dosya işleniyor)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Yeni Seçilen Görseller (Henüz kaydedilmemiş) */}
                {newImages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h5 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                        Yüklenecek Yeni Görseller ({newImages.length})
                      </h5>
                      <span className="text-[11px] text-amber-600 font-medium">
                        Tıklayarak ana vitrin görseli yapabilirsiniz
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {newImages.map((file, index) => {
                        const isNewMain = selectedMainNewIndex === index;
                        return (
                          <div
                            key={index}
                            id={`new-img-${index}`}
                            onClick={() => handleSelectMainNewImage(index)}
                            className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-4/3 sm:aspect-square scroll-mt-8 cursor-pointer ${
                              isNewMain
                                ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-md scale-[1.01] bg-amber-50'
                                : 'border-amber-300 hover:border-amber-400 bg-amber-50/40'
                            }`}
                            title={isNewMain ? 'Seçili Ana Görsel (Kaydedilince atanacak)' : 'Ana görsel yapmak için tıklayın'}
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Yeni görsel ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            
                            {/* Ana Görsel Rozeti */}
                            {isNewMain ? (
                              <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 z-10">
                                <FiCheck size={11} />
                                <span>★ Ana Görsel</span>
                              </div>
                            ) : (
                              <div className="absolute top-2 left-2 bg-slate-900/70 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs z-10">
                                Yeni
                              </div>
                            )}

                            <div className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded truncate max-w-[85%]">
                              {file.name}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNewImage(index);
                              }}
                              className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white w-7 h-7 flex items-center justify-center rounded-full opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-xs font-bold shadow-md z-20"
                              title="Listeden Kaldır"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        );
                      })}

                      {/* Yeni Projede Yükleme Efekti */}
                      {!selectedProject && isUploadingImages && (
                        <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-amber-500/80 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-slate-900/10 aspect-4/3 sm:aspect-square flex flex-col items-center justify-center p-3 text-center shadow-md animate-pulse">
                          <div className="relative w-11 h-11 flex items-center justify-center mb-2">
                            <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping opacity-60" />
                            <div className="w-9 h-9 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                            <FiImage className="absolute text-amber-600 text-sm" />
                          </div>
                          <span className="text-xs font-bold text-amber-900 tracking-wide">
                            Görseller Ekleniyor...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Görsel Yükleme Dropzone */}
                <div className={`p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all text-center space-y-2 ${
                  isUploadingImages
                    ? 'border-amber-500 bg-amber-50/40 cursor-wait'
                    : 'border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/20'
                }`}>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    {isUploadingImages ? (
                      <div className="w-5 h-5 border-2 border-amber-600/30 border-t-amber-700 rounded-full animate-spin" />
                    ) : (
                      <FiUploadCloud size={20} />
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="project-images-input"
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                        isUploadingImages
                          ? 'bg-amber-100 text-amber-600 pointer-events-none'
                          : 'text-amber-900 bg-amber-200/80 hover:bg-amber-300'
                      }`}
                    >
                      {isUploadingImages ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-amber-700/30 border-t-amber-800 rounded-full animate-spin" />
                          <span>Görseller Yükleniyor...</span>
                        </>
                      ) : (
                        <span>Görsel Dosyaları Seç</span>
                      )}
                    </label>
                    <input
                      id="project-images-input"
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={isUploadingImages}
                      onChange={(e) => {
                        handleAddImages(e.target.files);
                        e.target.value = null; // Aynı dosya tekrar seçildiğinde tetiklenmesi için
                      }}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    PNG, JPG, WEBP formatları desteklenir. Birden fazla dosya seçebilirsiniz.
                  </p>
                  {!selectedProject && newImages.length === 0 && (
                    <p className="text-xs text-rose-600 font-semibold pt-1">
                      ⚠️ Yeni projeyi kaydetmek için lütfen en az bir görsel yükleyiniz.
                    </p>
                  )}
                </div>
              </div>
            </AdminProjectForm>
          </div>
        )}

        {/* FİLTRELEME & ARAMA ÇUBUĞU */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Arama Input */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Proje adı, kategori, lokasyon veya hizmet ara..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Masaüstünde Görünüm Modu Değiştirici (Kart / Tablo) */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Kart Görünümü"
              >
                <FiGrid size={14} />
                <span>Kart</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tablo Görünümü"
              >
                <FiList size={14} />
                <span>Tablo</span>
              </button>
            </div>
          </div>

          {/* Durum Filtreleme Butonları (Hızlı Dokunmatik Filtreler) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'ALL', label: 'Tümü', count: projects.length },
              { key: 'Completed', label: 'Tamamlandı', count: projects.filter(p => p.status === 'Completed').length },
              { key: 'In Progress', label: 'Devam Ediyor', count: projects.filter(p => p.status === 'In Progress').length },
              { key: 'Planned', label: 'Planlandı', count: projects.filter(p => p.status === 'Planned').length }
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatusFilter(filter.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  statusFilter === filter.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{filter.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  statusFilter === filter.key ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PROJE LİSTESİ - Tamamen Responsive Görünüm */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
            <AdminEmptyState
              title="Proje Bulunamadı"
              description={
                searchQuery || statusFilter !== 'ALL'
                  ? 'Arama kriterlerinize uygun portfolyo projesi bulunamadı.'
                  : 'Henüz portfolyo projesi eklenmemiş.'
              }
            />
          </div>
        ) : viewMode === 'table' ? (
          /* MASAÜSTÜ TABLO GÖRÜNÜMÜ (Sabit genişlikli, yatay kaydırma yapmayan akıllı tablo) */
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <table className="w-full table-fixed divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="w-5/12 px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Proje / Kategori
                  </th>
                  <th className="w-4/12 px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Hizmetler & Lokasyon
                  </th>
                  <th className="w-2/12 px-4 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Durum
                  </th>
                  <th className="w-1/12 px-4 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredProjects.map((project) => {
                  const serviceNames = getServiceNames(project.service_ids);
                  return (
                    <tr
                      key={project.id}
                      id={`project-row-${project.id}`}
                      className={`hover:bg-amber-50/30 transition-colors scroll-mt-12 ${
                        selectedProject?.id === project.id ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      {/* Görsel & Proje Adı */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {project.url ? (
                              <img
                                src={publicService.getImageURL(project.url)}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                                Görsel Yok
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-900 truncate">
                              {project.title}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {project.category || 'Karma Konut & Ofis'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Hizmetler & Lokasyon */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {serviceNames.length > 0 ? (
                              serviceNames.slice(0, 2).map((name, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200/80"
                                >
                                  {name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">Belirtilmemiş</span>
                            )}
                            {serviceNames.length > 2 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded-md">
                                +{serviceNames.length - 2}
                              </span>
                            )}
                          </div>
                          {project.location && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <FiMapPin size={11} className="text-amber-500 shrink-0" />
                              <span className="truncate">{project.location}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Durum */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                          statusColors[project.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {statusTexts[project.status] || project.status}
                        </span>
                      </td>

                      {/* İşlemler */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(project)}
                            className={`p-2 rounded-lg transition-colors ${
                              selectedProject?.id === project.id
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                            title="Projeyi Düzenle"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(project)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Projeyi Sil"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* MOBİL VE KART GÖRÜNÜMÜ - Her ekranda tek bakışta görünen sıfır taşmalı kartlar */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 ${
          viewMode === 'table' ? 'md:hidden' : ''
        }`}>
          {filteredProjects.map((project) => {
            const serviceNames = getServiceNames(project.service_ids);
            const isEditingThis = selectedProject?.id === project.id && showForm;

            return (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between gap-4 scroll-mt-12 ${
                  isEditingThis
                    ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-50/10'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Kart Üst Başlık & Görsel */}
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail */}
                    <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      {project.url ? (
                        <img
                          src={publicService.getImageURL(project.url)}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          Görsel Yok
                        </div>
                      )}
                    </div>

                    {/* Proje Başlığı & Kategori */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                          {project.category || 'Karma Konut & Ofis'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border shrink-0 ${
                          statusColors[project.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {statusTexts[project.status] || project.status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                        {project.title}
                      </h4>

                      {/* Önemli Künye Bilgileri */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2 font-medium">
                        {project.location && (
                          <span className="flex items-center gap-1">
                            <FiMapPin className="text-amber-500 shrink-0" size={12} />
                            <span className="truncate max-w-[140px]">{project.location}</span>
                          </span>
                        )}
                        {project.total_area && (
                          <span className="flex items-center gap-1">
                            <FiLayers className="text-amber-500 shrink-0" size={12} />
                            <span>
                              {Number(String(project.total_area).replace(/\D/g, '')).toLocaleString('tr-TR')} m²
                            </span>
                          </span>
                        )}
                        {project.project_year && (
                          <span className="flex items-center gap-1">
                            <FiClock className="text-amber-500 shrink-0" size={12} />
                            <span>{project.project_year}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Uygulanan Hizmetler Etiketleri */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Uygulanan Hizmetler
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {serviceNames.length > 0 ? (
                        serviceNames.map((name, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200/80"
                          >
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Belirtilmemiş</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alt Aksiyon Butonları (Dokunmatik ekran dostu - min 42px yükseklik) */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleEdit(project)}
                    className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
                      isEditingThis
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80'
                    }`}
                  >
                    <FiEdit2 size={14} />
                    <span>{isEditingThis ? 'Düzenleniyor' : 'Düzenle'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(project)}
                    className="min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all active:scale-[0.98]"
                  >
                    <FiTrash2 size={14} />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProjectsPage;
