import AdminLayout from '../../components/admin/AdminLayout';
import EmailSettingsEditor from '../../components/admin/EmailSettingsEditor';
import { useState } from 'react';
import adminService from '../../services/adminService';

const EmailSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (emailData) => {
    setIsLoading(true);
    try {
      await adminService.saveEmailSettings(emailData);
      alert('Email ayarları başarıyla kaydedildi!');
    } catch (error) {
      console.error('Email ayarları kaydedilirken hata:', error);
      alert(`Email ayarları kaydedilirken bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // İptal işlemi - sayfayı yenile
    window.location.reload();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">Email Ayarları</h1>
          <p className="text-gray-600 mt-2">
            İletişim formundan gelen mesajların gönderileceği email ayarlarını yapılandırın
          </p>
        </div>

        {/* Email Settings Editor */}
        <EmailSettingsEditor
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />

        {/* Bilgi Kutusu */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Gmail App Password Nasıl Oluşturulur?</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Google hesabınıza giriş yapın</li>
              <li>Hesap güvenliği bölümüne gidin</li>
              <li>2-Factor Authentication (2FA) aktif edin</li>
              <li>"App passwords" bölümüne gidin</li>
              <li>Yeni bir App Password oluşturun</li>
              <li>Oluşturulan 16 haneli şifreyi buraya girin</li>
            </ol>
            
            <p className="mt-4"><strong>Test Etme:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Ayarları kaydettikten sonra "Test Et" butonuna tıklayın</li>
              <li>Test e-postası kendi email adresinize gönderilecektir</li>
              <li>E-posta gelirse ayarlarınız doğru çalışıyor demektir</li>
            </ul>
          </div>
        </div>

        {/* Güvenlik Bilgisi */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-800 mb-3">🔒 Güvenlik Bilgisi</h3>
          <div className="text-sm text-green-700 space-y-2">
            <p>
              Email şifreleriniz artık AES-256-CBC algoritması ile şifrelenerek güvenli bir şekilde saklanmaktadır.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>App Password kullanın, normal şifrenizi değil</li>
              <li>Şifreler veritabanında şifrelenmiş olarak saklanır</li>
              <li>Otomatik email sistemi güvenli şekilde çalışır</li>
              <li>Üretim ortamında SSL/TLS kullanın</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmailSettingsPage;
