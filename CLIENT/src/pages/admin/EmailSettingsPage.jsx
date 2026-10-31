import AdminLayout from '../../components/admin/AdminLayout';
import EmailSettingsEditor from '../../components/admin/EmailSettingsEditor';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useState } from 'react';
import adminService from '../../services/adminService';
import logger from '../../utils/logger';
import { FiShield, FiKey, FiCheckCircle } from 'react-icons/fi';

const EmailSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (emailData) => {
    setIsLoading(true);
    try {
      await adminService.saveEmailSettings(emailData);
      alert('Email ayarları başarıyla kaydedildi!');
    } catch (error) {
      logger.error('Email ayarları kaydedilirken hata:', error);
      alert(`Email ayarları kaydedilirken bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.reload();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="E-Posta Servis Ayarları"
          subtitle="İletişim formundan gelen müşteri mesajlarının yönetici adresine iletilmesini sağlayan SMTP / Gmail yapılandırması."
          badge="SMTP & Bildirim"
        />

        {/* Email Settings Editor */}
        <EmailSettingsEditor
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />

        {/* İki Kolonlu Bilgilendirme ve Güvenlik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gmail Uygulama Şifresi Rehberi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <FiKey size={18} />
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Gmail Uygulama Şifresi (App Password)
              </h3>
            </div>
            
            <ol className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-sans">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>Google Hesabınızda <strong>Güvenlik</strong> sekmesine gidin.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span><strong>2 Adımlı Doğrulama</strong>'yı etkinleştirin.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>Arama kısmına <strong>Uygulama Şifreleri</strong> yazarak ilgili menüyü açın.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
                <span>Uygulama adı olarak "Hastug Web" belirleyip 16 haneli şifreyi oluşturun.</span>
              </li>
            </ol>
          </div>

          {/* Güvenlik & Şifreleme Bilgisi */}
          <div className="bg-[#0b101b] text-slate-200 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <FiShield size={18} />
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                AES-256 Veri Güvenliği
              </h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              E-posta servis şifreleriniz sunucuda AES-256-CBC algoritmasıyla çift katmanlı şifrelenerek saklanmaktadır.
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-amber-400 shrink-0" size={14} />
                <span>Kişisel şifrenizi değil, yalnızca App Password kullanın.</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-amber-400 shrink-0" size={14} />
                <span>Şifreler veritabanında asla açık metin tutulmaz.</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-amber-400 shrink-0" size={14} />
                <span>SSL/TLS şifreli SMTP protokolüyle aktarım sağlanır.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmailSettingsPage;
