import { useState } from 'react';
import FormButtons from './FormButtons';

const TeamEditor = ({ teamData = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: teamData?.title || 'Ekibimiz',
    subtitle: teamData?.subtitle || 'Kimler Çalışıyor?',
    description: teamData?.description || 'Profesyonel ekibimizle tanışın',
    members: teamData?.members || [
      {
        id: 1,
        name: 'Ahmet Yılmaz',
        position: 'Frontend Developer',
        bio: 'React ve modern web teknolojileri uzmanı',
        imageUrl: '',
        socialLinks: {
          linkedin: '',
          github: '',
          twitter: ''
        }
      }
    ]
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  const handleSocialLinkChange = (memberIndex, platform, value) => {
    const newMembers = [...formData.members];
    newMembers[memberIndex].socialLinks[platform] = value;
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  const addMember = () => {
    const newId = Math.max(...formData.members.map(m => m.id), 0) + 1;
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, {
        id: newId,
        name: 'Yeni Üye',
        position: 'Pozisyon',
        bio: 'Kısa biyografi',
        imageUrl: '',
        socialLinks: {
          linkedin: '',
          github: '',
          twitter: ''
        }
      }]
    }));
  };

  const removeMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Team kaydedilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Team Section Düzenle</h3>
        <p className="text-sm text-gray-600 mt-1">Ekip bölümünü özelleştirin</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Ana Başlık */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Ana Başlık *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ana başlık girin"
          />
        </div>

        {/* Alt Başlık */}
        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
            Alt Başlık *
          </label>
          <input
            type="text"
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Alt başlık girin"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ekip açıklamasını girin"
          />
        </div>

        {/* Ekip Üyeleri */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Ekip Üyeleri
            </label>
            <button
              type="button"
              onClick={addMember}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Üye Ekle
            </button>
          </div>
          
          <div className="space-y-6">
            {formData.members.map((member, memberIndex) => (
              <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Üye {memberIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeMember(memberIndex)}
                    className="px-2 py-1 text-red-600 hover:text-red-800"
                  >
                    ✕ Sil
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(memberIndex, 'name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ad soyad"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pozisyon *
                    </label>
                    <input
                      type="text"
                      value={member.position}
                      onChange={(e) => handleMemberChange(memberIndex, 'position', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Pozisyon"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biyografi *
                  </label>
                  <textarea
                    value={member.bio}
                    onChange={(e) => handleMemberChange(memberIndex, 'bio', e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kısa biyografi"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profil Resmi URL
                  </label>
                  <input
                    type="url"
                    value={member.imageUrl}
                    onChange={(e) => handleMemberChange(memberIndex, 'imageUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                
                {/* Sosyal Medya Linkleri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sosyal Medya Linkleri
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
                      <input
                        type="url"
                        value={member.socialLinks.linkedin}
                        onChange={(e) => handleSocialLinkChange(memberIndex, 'linkedin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">GitHub</label>
                      <input
                        type="url"
                        value={member.socialLinks.github}
                        onChange={(e) => handleSocialLinkChange(memberIndex, 'github', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="GitHub URL"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Twitter</label>
                      <input
                        type="url"
                        value={member.socialLinks.twitter}
                        onChange={(e) => handleSocialLinkChange(memberIndex, 'twitter', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Twitter URL"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Buttons */}
        <FormButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText="Kaydet"
          isLoading={isLoading}
        />
      </form>
    </div>
  );
};

export default TeamEditor;
