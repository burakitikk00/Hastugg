import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import AdminProjectForm from '../../components/admin/AdminProjectForm';
import adminService from '../../services/adminService';

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
      // Form verileri için service_ids'yi ayarla
      const projectData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        service_ids: JSON.stringify(formData.service_ids) // JSON string olarak kaydet
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
          // service_ids parse et, hata olursa boş array kullan
          if (row.service_ids && typeof row.service_ids === 'string') {
            serviceIds = JSON.parse(row.service_ids);
          }
          
          // Array değilse boş array yap
          if (!Array.isArray(serviceIds)) {
            serviceIds = [];
          }
          
          // 0'ları filtrele
          serviceIds = serviceIds.filter(id => id && id !== 0);
          
        } catch (e) {
          console.log('service_ids parse hatası:', e.message, 'row:', row);
          serviceIds = [];
        }
        
        const serviceNames = services.filter(service => serviceIds.includes(service.id)).map(service => service.service);
        
        return (
          <div className="flex flex-wrap gap-1">
            {serviceNames.length > 0 ? serviceNames.map((name, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {name}
              </span>
            )) : (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
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
          'Completed': 'bg-green-100 text-green-800',
          'In Progress': 'bg-yellow-100 text-yellow-800',
          'Planned': 'bg-blue-100 text-blue-800',
          'On Hold': 'bg-red-100 text-red-800'
        };
        const statusTexts = {
          'Completed': 'Tamamlandı',
          'In Progress': 'Devam Ediyor',
          'Planned': 'Planlandı',
          'On Hold': 'Beklemede'
        };
        return (
          <span className={`px-2 py-1 text-sm rounded-full ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
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
          src={`http://localhost:5000${value}`} 
          alt="Proje görseli" 
          className="w-16 h-16 object-cover rounded-lg"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
          Görsel Yok
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Yükleniyor...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Başlık ve Ekle Butonu */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Proje Yönetimi</h1>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Yeni Proje Ekle
          </button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Yeni Proje Ekleme Formu - EN ÜSTTE */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 mb-6">
            
            {/* Proje Temel Bilgileri Formu */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Yeni Proje Ekle
              </h3>
              
              <AdminProjectForm
                project={null}
                services={services}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>

            {/* Yeni Proje İçin Görsel Yükleme */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Proje Görselleri</h4>
              
              {/* Yeni Yüklenecek Görseller */}
              {newImages.length > 0 && (
                <div>
                  <h5 className="text-md font-medium text-gray-700 mb-3">Yeni Görseller</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Yeni görsel ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleDeleteNewImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Görsel Yükleme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proje Görselleri Ekle *
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleAddImages(e.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG, GIF dosyaları kabul edilir. Birden fazla dosya seçebilirsiniz.
                </p>
                {newImages.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">En az bir görsel yüklemelisiniz</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Proje Listesi */}
        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={projects}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="Henüz proje eklenmemiş"
            expandedRowId={expandedProjectId}
            renderExpandedRow={(project) => (
              <div className="px-6 py-4 bg-gray-50 border-t">
                <ProjectExpandedView 
                  project={project}
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
      </div>
    </AdminLayout>
  );
};

// Proje satırı genişletilmiş görünümü
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sol Taraf - Proje Düzenleme Formu */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Proje Düzenle
        </h3>
        
        <AdminProjectForm
          project={{
            title: project.title,
            description: project.description,
            service_ids: (() => {
              try {
                if (project.service_ids && typeof project.service_ids === 'string') {
                  const parsed = JSON.parse(project.service_ids);
                  return Array.isArray(parsed) ? parsed.filter(id => id && id !== 0) : [];
                }
                return [];
              } catch (e) {
                return [];
              }
            })(),
            status: project.status
          }}
          services={services}
          onSave={onSave}
          onCancel={onCancel}
        />
      </div>

      {/* Sağ Taraf - Görsel Yönetimi */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Proje Görselleri
        </h3>
        
        {/* Mevcut Görseller */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Mevcut Görseller ({projectImages.length})
          </h4>
          {projectImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {projectImages.map((imageURL, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`http://localhost:5000${imageURL}`}
                    alt={`Proje görseli ${index + 1}`}
                    className={`w-full h-20 object-cover rounded border-2 cursor-pointer transition-all ${
                      project.url === imageURL 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => onSetMainImage(imageURL)}
                    title={project.url === imageURL ? 'Ana görsel' : 'Ana görsel olarak seç'}
                  />
                  {project.url === imageURL && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                      Ana
                    </div>
                  )}
                  <button
                    onClick={() => onDeleteImage(imageURL)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Görseli Sil"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Henüz görsel eklenmemiş</p>
          )}
        </div>

        {/* Yeni Görseller (Henüz kaydedilmemiş) */}
        {newImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Yeni Görseller ({newImages.length})
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {newImages.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Yeni görsel ${index + 1}`}
                    className="w-full h-20 object-cover rounded border border-gray-200"
                  />
                  <button
                    onClick={() => onDeleteNewImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Görseli Kaldır"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Görsel Ekleme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yeni Görseller Ekle
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => onAddImages(e.target.files)}
            className="block w-full text-sm text-gray-500
              file:mr-2 file:py-1 file:px-2
              file:rounded file:border-0
              file:text-xs file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF desteklenir. Görsele tıklayarak ana görsel seçin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
