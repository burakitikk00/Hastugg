import { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import AdminProjectForm from '../../components/admin/AdminProjectForm';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoadingState from '../../components/admin/AdminLoadingState';
import adminService from '../../services/adminService';
import publicService from '../../services/publicService';
import API_CONFIG from '../../config/api';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [projectImages, setProjectImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [error, setError] = useState('');

  // Verileri yükle
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [projectsData, servicesData] = await Promise.all([
        adminService.getProjects(),
        adminService.getServices()
      ]);
      setProjects(projectsData);
      setServices(servicesData);
    } catch (error) {
      setError('Veriler yüklenirken hata oluştu: ' + error.message);
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
    } catch (error) {
      setError('Proje detayları yüklenirken hata oluştu: ' + error.message);
    }
  };

  // Yeni proje ekleme
  const handleAdd = () => {
    setSelectedProject(null);
    setShowForm(true);
    setExpandedProjectId(null);
    setProjectImages([]);
    setNewImages([]);
  };

  // Proje düzenleme
  const handleEdit = async (project) => {
    if (expandedProjectId === project.id) {
      // Zaten açık ise kapat
      setExpandedProjectId(null);
      setSelectedProject(null);
      setProjectImages([]);
    } else {
      // Yeni projeyi aç
      await loadProjectDetails(project.id);
      setExpandedProjectId(project.id);
      setShowForm(false); // Üstteki formu kapat
    }
    setNewImages([]);
  };

  // Proje kaydetme (ekleme veya güncelleme)
  const handleSave = async (formData) => {
    try {
      // Form verileri için tüm alanları ayarla
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



      if (selectedProject) {
        // Güncelleme - SADECE yeni görseller varsa ekle, mevcut görselleri silme
        if (newImages.length > 0) {
          // Yeni görseller varsa ekle
          await adminService.addProjectImages(selectedProject.id, newImages);
        }
        // Proje bilgilerini güncelle (görseller ayrı işleniyor)
        await adminService.updateProject(selectedProject.id, projectData);
      } else {
        // Yeni ekleme
        if (newImages.length === 0) {
          throw new Error('En az bir görsel yüklemelisiniz');
        }
        await adminService.addProject(projectData, newImages);
      }

      await loadData();
      setNewImages([]); // Her durumda yeni görseller state'ini temizle

      if (showForm) {
        handleCancel(); // Sadece üst form açıksa kapat
      } else {
        // Satır düzenlemede ise sadece o satırı kapat
        setExpandedProjectId(null);
        setSelectedProject(null);
        setProjectImages([]);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Formu iptal et
  const handleCancel = () => {
    setShowForm(false);
    setExpandedProjectId(null);
    setSelectedProject(null);
    setProjectImages([]);
    setNewImages([]);
    setError('');
  };

  // Proje silme
  const handleDelete = async (project) => {
    if (window.confirm(`"${project.title}" projesini silmek istediğinizden emin misiniz?`)) {
      try {
        await adminService.deleteProject(project.id);
        await loadData();
      } catch (error) {
        setError('Proje silinirken hata oluştu: ' + error.message);
      }
    }
  };

  // Mevcut görsel silme
  const handleDeleteImage = async (imageURL) => {
    if (!selectedProject) return;

    // Ana görsel siliniyorsa uyarı ver
    if (selectedProject.url === imageURL) {
      const remainingImages = projectImages.filter(img => img !== imageURL);
      if (remainingImages.length === 0) {
        alert('Bu projenin tek görseli. Silmeden önce başka görsel ekleyin veya ana görsel seçin.');
        return;
      }

      if (!window.confirm('Bu ana görsel! Silinirse başka bir görsel otomatik olarak ana görsel olarak seçilecek. Devam etmek istiyor musunuz?')) {
        return;
      }
    } else {
      if (!window.confirm('Bu görseli silmek istediğinizden emin misiniz?')) {
        return;
      }
    }

    try {
      await adminService.deleteProjectImage(selectedProject.id, imageURL);
      // Görsel listesini güncelle
      setProjectImages(prev => prev.filter(img => img !== imageURL));
      // Proje listesini yeniden yükle (ana görsel değişmiş olabilir)
      await loadData();
      // Proje detaylarını yeniden yükle
      await loadProjectDetails(selectedProject.id);
    } catch (error) {
      setError('Görsel silinirken hata oluştu: ' + error.message);
    }
  };

  // Yeni görsel ekleme
  const handleAddImages = async (files) => {
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);

    if (!selectedProject) {
      // Yeni proje için - henüz kaydetmeden görselleri tempte tutacağız
      setNewImages(prev => [...prev, ...fileArray]);
      return;
    }

    try {
      // Mevcut proje için görseller yükleniyor
      const response = await adminService.addProjectImages(selectedProject.id, fileArray);
      setProjectImages(prev => [...prev, ...response.uploadedImages]);
      setNewImages([]); // Yeni görseller state'ini temizle
    } catch (error) {
      setError('Görsel eklenirken hata oluştu: ' + error.message);
    }
  };

  // Yeni proje için görsel silme (henüz kaydedilmemiş)
  const handleDeleteNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Ana görsel seçimi
  const handleSetMainImage = async (imageURL) => {
    if (!selectedProject) return;

    try {
      await adminService.setMainImage(selectedProject.id, imageURL);
      // Proje listesini yeniden yükle
      await loadData();
      // Proje detaylarını yeniden yükle
      await loadProjectDetails(selectedProject.id);
    } catch (error) {
      setError('Ana görsel ayarlanırken hata oluştu: ' + error.message);
    }
  };

  // Tablo sütunları
  const columns = [
    {
      key: 'title',
      label: 'Proje Adı',
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'service_names',
      label: 'Hizmetler',
      render: (value, row) => {
        let serviceIds = [];

        try {
          // Eğer zaten array ise direkt kullan
          if (Array.isArray(row.service_ids)) {
            serviceIds = row.service_ids;
          } 
          // Eğer string ise parse et
          else if (row.service_ids && typeof row.service_ids === 'string') {
            // Boş string veya '[]' kontrolü
            const trimmed = row.service_ids.trim();
            if (trimmed === '' || trimmed === '[]') {
              serviceIds = [];
            } else {
              serviceIds = JSON.parse(row.service_ids);
            }
          }

          // Array kontrolü
          if (!Array.isArray(serviceIds)) {
            serviceIds = [];
          }

          // Tüm ID'leri number'a çevir ve 0/null değerlerini filtrele
          serviceIds = serviceIds
            .map(id => {
              const numId = typeof id === 'string' ? parseInt(id, 10) : Number(id);
              return isNaN(numId) ? null : numId;
            })
            .filter(id => id !== null && id !== 0);

        } catch (e) {
          console.error('service_ids parse hatası:', e, row);
          serviceIds = [];
        }

        // Service ID'leri ile eşleştir (tip uyumluluğu için number'a çevir)
        const serviceNames = services
          .filter(service => {
            const serviceId = Number(service.id);
            return serviceIds.includes(serviceId);
          })
          .map(service => service.service);

        return (
          <div className="flex flex-wrap gap-1">
            {serviceNames.length > 0 ? serviceNames.map((name, index) => (
              <span key={index} className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200/80">
                {name}
              </span>
            )) : (
              <span className="px-2 py-0.5 text-xs text-slate-400">
                Belirtilmemiş
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Durum',
      render: (value) => {
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
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusColors[value] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {statusTexts[value] || value}
          </span>
        );
      }
    },
    {
      key: 'url',
      label: 'Ana Görsel',
      render: (value) => value ? (
        <img
          src={publicService.getImageURL(value)}
          alt="Proje görseli"
          className="w-16 h-12 object-cover rounded-lg border border-slate-200 shadow-2xs"
        />
      ) : (
        <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs border border-slate-200">
          Görsel Yok
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminPageHeader
            title="Projeler & Portfolyo"
            subtitle="Tamamlanan ve devam eden mimari/mühendislik projelerini, teknik künyelerini ve galerilerini yönetin."
            badge="Portfolyo"
          />
          <AdminLoadingState type="table" message="Projeler yükleniyor..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Sayfa Başlığı ve Yeni Proje Ekle Butonu */}
        <AdminPageHeader
          title="Projeler & Portfolyo"
          subtitle="Tamamlanan ve devam eden mimari/mühendislik projelerini, teknik künyelerini ve galerilerini yönetin."
          badge={`${projects.length} Proje`}
          actions={
            !showForm && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs hover:shadow transition-all active:scale-[0.98]"
              >
                <FiPlus size={16} />
                <span>Yeni Proje Ekle</span>
              </button>
            )
          }
        />

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Yeni Proje Ekleme Formu - EN ÜSTTE */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 mb-6 shadow-xs">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">
              Yeni Proje Ekle
            </h3>

            <AdminProjectForm
              project={null}
              services={services}
              newImagesCount={newImages.length}
              onSave={handleSave}
              onCancel={handleCancel}
            >
              {/* Yeni Proje İçin Görsel Yükleme (Formun Altında, Kaydet Butonunun Üstünde) */}
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <h4 className="text-base font-semibold text-gray-900">Proje Görselleri <span className="text-red-500">*</span></h4>

                {/* Yeni Yüklenecek Görseller */}
                {newImages.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Yüklenecek Görseller ({newImages.length})
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {newImages.map((file, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Yeni görsel ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteNewImage(index)}
                            className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs shadow-md"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Görsel Yükleme Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Görsel Dosyaları Seç <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleAddImages(e.target.files)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    PNG, JPG, WEBP formatları desteklenir. Birden fazla dosya seçebilirsiniz.
                  </p>
                  {newImages.length === 0 && (
                    <p className="text-xs text-amber-600 font-medium mt-1">⚠️ Projeyi kaydetmek için en az bir görsel yüklemelisiniz.</p>
                  )}
                </div>
              </div>
            </AdminProjectForm>
          </div>
        )}

        {/* Proje Listesi */}
        <DataTable
          data={projects}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Henüz portfolyo projesi eklenmemiş."
          expandedRowId={expandedProjectId}
          renderExpandedRow={(project) => (
            <div className="p-6 bg-slate-50/70 border-t border-slate-200">
              <ProjectExpandedView
                project={selectedProject || project}
                services={services}
                projectImages={projectImages}
                newImages={newImages}
                onSave={handleSave}
                onCancel={() => setExpandedProjectId(null)}
                onDeleteImage={handleDeleteImage}
                onAddImages={handleAddImages}
                onDeleteNewImage={handleDeleteNewImage}
                onSetMainImage={handleSetMainImage}
              />
            </div>
          )}
        />
      </div>
    </AdminLayout>
  );
};

// Proje satırı genişletilmiş görünümü (Yeni Proje düzeniyle tam uyumlu, görseller altta, kaydet en altta)
const ProjectExpandedView = ({
  project,
  services,
  projectImages,
  newImages,
  onSave,
  onCancel,
  onDeleteImage,
  onAddImages,
  onDeleteNewImage,
  onSetMainImage
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Proje Düzenle: {project.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Proje temel bilgilerini, açıklamalarını, öne çıkan özelliklerini, konumunu ve görsellerini güncelleyin.
        </p>
      </div>

      <AdminProjectForm
        project={project}
        services={services}
        newImagesCount={newImages.length}
        onSave={onSave}
        onCancel={onCancel}
      >
        {/* Proje Görselleri Yönetimi (Form Sekmelerinin Altında, Güncelle Butonunun Üstünde) */}
        <div className="pt-6 border-t border-gray-200 space-y-5">
          <div>
            <h4 className="text-base font-semibold text-gray-900">
              Proje Görselleri Yönetimi
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Mevcut görselleri inceleyin, ana görseli seçin veya projeye yeni fotoğraflar ekleyin.
            </p>
          </div>

          {/* Mevcut Görseller */}
          <div>
            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
              Mevcut Görseller ({projectImages.length})
            </h5>
            {projectImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {projectImages.map((imageURL, index) => {
                  const isMain = project.url === imageURL;
                  return (
                    <div key={index} className="relative group rounded-lg overflow-hidden border-2 transition-all">
                      <img
                        src={publicService.getImageURL(imageURL) || '/api/placeholder/400/300'}
                        alt={`Proje görseli ${index + 1}`}
                        className={`w-full h-24 object-cover cursor-pointer transition-transform group-hover:scale-105 ${
                          isMain ? 'border-amber-500 ring-2 ring-amber-400' : 'border-gray-200'
                        }`}
                        onClick={() => onSetMainImage(imageURL)}
                        title={isMain ? 'Ana görsel' : 'Ana görsel olarak belirle'}
                      />
                      {isMain && (
                        <div className="absolute top-1.5 left-1.5 bg-amber-500 text-obsidian text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          ANA GÖRSEL
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteImage(imageURL)}
                        className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs shadow-md"
                        title="Görseli Sil"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-xs">Henüz görsel yüklenmemiş.</p>
            )}
          </div>

          {/* Yeni Görseller (Henüz kaydedilmemiş) */}
          {newImages.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                Yeni Eklenecek Görseller ({newImages.length})
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {newImages.map((file, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Yeni görsel ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteNewImage(index)}
                      className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs shadow-md"
                      title="Görseli Kaldır"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yeni Görsel Ekleme Inputu */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Yeni Görseller Yükle
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => onAddImages(e.target.files)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-xs file:font-semibold
                file:bg-amber-50 file:text-amber-800
                hover:file:bg-amber-100 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              PNG, JPG, WEBP desteklenir. Görsellerin üzerine tıklayarak ana görsel seçebilirsiniz.
            </p>
          </div>
        </div>
      </AdminProjectForm>
    </div>
  );
};

export default ProjectsPage;
