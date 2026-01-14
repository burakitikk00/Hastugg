import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaUser, FaLinkedin } from 'react-icons/fa';
import adminService from '../../services/adminService';
import API_CONFIG from '../../config/api';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';

const TeamEditor = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    namesurname: '',
    position: '',
    LinkedIn: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Team üyelerini yükle
  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTeam();
      setTeamMembers(data);
      setError(null);
    } catch (err) {
      setError('Team üyeleri yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  // Form verilerini sıfırla
  const resetForm = () => {
    setFormData({
      namesurname: '',
      position: '',
      LinkedIn: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingMember(null);
    setIsAddingNew(false);
  };

  // Resim seçimi
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
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
    
    if (!formData.namesurname || !formData.position) {
      setError('Ad Soyad ve Pozisyon zorunludur.');
      return;
    }

    try {
      setLoading(true);
      
      if (editingMember) {
        // Güncelleme
        await adminService.updateTeamMember(editingMember.id, formData, selectedImage);
      } else {
        // Yeni ekleme
        await adminService.addTeamMember(formData, selectedImage);
      }

      await loadTeamMembers();
      resetForm();
      setError(null);
    } catch (err) {
      logger.error('Form gönderimi hatası:', err);
      setError('İşlem sırasında hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Düzenleme modunu aç
  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      namesurname: member.namesurname || '',
      position: member.position || '',
      LinkedIn: member.LinkedIn || ''
    });
    setImagePreview(member.url ? publicService.getImageURL(member.url) : null);
    setSelectedImage(null);
  };

  // Yeni üye ekleme modunu aç
  const handleAddNew = () => {
    setEditingMember(null);
    setFormData({
      namesurname: '',
      position: '',
      LinkedIn: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setIsAddingNew(true);
  };

  // İptal et
  const handleCancel = () => {
    setEditingMember(null);
    setIsAddingNew(false);
    setFormData({
      namesurname: '',
      position: '',
      LinkedIn: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Üye sil
  const handleDelete = async (id) => {
    if (!window.confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      await adminService.deleteTeamMember(id);
      await loadTeamMembers();
      setError(null);
    } catch (err) {
      setError('Silme işlemi sırasında hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resim sil
  const handleDeleteImage = async (id) => {
    if (!window.confirm('Bu resmi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      await adminService.deleteTeamMemberImage(id);
      
      // Eğer düzenleme modundaysa, mevcut üyeyi güncelle
      if (editingMember && editingMember.id === id) {
        const updatedMember = { ...editingMember, url: null };
        setEditingMember(updatedMember);
        setImagePreview(null);
      }
      
      await loadTeamMembers();
      setError(null);
    } catch (err) {
      setError('Resim silme işlemi sırasında hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && teamMembers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Ekip Yönetimi</h3>
            <p className="text-sm text-gray-600 mt-1">Ekip üyelerini yönetin</p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus size={14} />
            Yeni Üye Ekle
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="p-6">
        {/* Ekip Üyeleri Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{member.namesurname}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Düzenle"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Sil"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>

              {/* Üye Resmi */}
              <div className="mb-3">
                {member.url ? (
                  <div className="relative">
                    <img
                      src={publicService.getImageURL(member.url)}
                      alt={member.namesurname}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDeleteImage(member.id)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      title="Resmi Sil"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FaUser size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Üye Bilgileri */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Pozisyon:</span> {member.position}
                </p>
                {member.LinkedIn && (
                  <div className="flex items-center gap-2">
                    <FaLinkedin className="text-blue-600" size={16} />
                    <a
                      href={member.LinkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      LinkedIn Profili
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Düzenleme/Ekleme Formu */}
        {(editingMember || isAddingNew) && (
          <div className="bg-gray-50 rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                {editingMember ? 'Üye Düzenle' : 'Yeni Üye Ekle'}
              </h4>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    value={formData.namesurname}
                    onChange={(e) => setFormData({...formData, namesurname: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ad Soyad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pozisyon *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pozisyon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.LinkedIn}
                  onChange={(e) => setFormData({...formData, LinkedIn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profil Resmi
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {(imagePreview || (editingMember && editingMember.url)) && (
                    <div className="flex items-start gap-2">
                      <div className="relative">
                        <img
                          src={imagePreview || publicService.getImageURL(editingMember.url)}
                          alt="Önizleme"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                      
                      {/* Yeni seçilen resim için silme butonu */}
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={removeImagePreview}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                          title="Yeni seçilen resmi kaldır"
                        >
                          <FaTimes size={14} />
                        </button>
                      )}
                      
                      {/* Mevcut resim için silme butonu (düzenleme modunda) */}
                      {editingMember && editingMember.url && !imagePreview && (
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(editingMember.id)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                          title="Mevcut resmi sil"
                        >
                          <FaTimes size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : (editingMember ? 'Güncelle' : 'Ekle')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamEditor;
