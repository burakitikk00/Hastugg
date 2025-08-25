import AdminLayout from '../../components/admin/AdminLayout';
import TeamEditor from '../../components/admin/TeamEditor';
import { useState, useEffect } from 'react';

const TeamPage = () => {
  const [teamData, setTeamData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // localStorage'dan team verilerini yükle
    const savedTeamData = localStorage.getItem('teamData');
    if (savedTeamData) {
      try {
        const parsedData = JSON.parse(savedTeamData);
        setTeamData(parsedData);
      } catch (error) {
        console.error('Team verisi parse edilemedi:', error);
        // Hata durumunda varsayılan veriler
        setTeamData({
          members: [
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
      }
    } else {
      // Varsayılan veriler
      setTeamData({
        members: [
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
    }
  }, []);

  const handleSave = async (sectionData) => {
    setIsLoading(true);
    try {
      // Team verilerini localStorage'a kaydet
      localStorage.setItem('teamData', JSON.stringify(sectionData));
      setTeamData(sectionData);
      
      // Başarılı kayıt sonrası işlemler
      alert('Ekip bilgileri başarıyla kaydedildi!');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert(`Kaydetme sırasında bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // İptal işlemi - form verilerini sıfırla
    console.log('İptal edildi');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">Ekip Yönetimi</h1>
          <p className="text-gray-600 mt-2">Ekip bölümünü buradan düzenleyebilirsiniz</p>
        </div>

        {/* Team Editor */}
        {teamData && (
          <TeamEditor
            teamData={teamData}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default TeamPage;
