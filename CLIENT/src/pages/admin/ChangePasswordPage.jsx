import AdminLayout from '../../components/admin/AdminLayout';
import ChangePasswordForm from '../../components/admin/ChangePasswordForm';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { FiAlertTriangle } from 'react-icons/fi';

const ChangePasswordPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Güvenlik & Şifre Değiştir"
          subtitle="Yönetici hesabınızın şifresini düzenli olarak güncelleyin ve hesap güvenliğinizi koruyun."
          badge="Hesap Güvenliği"
        />

        {/* Change Password Form */}
        <ChangePasswordForm />

        {/* Güvenlik Uyarısı Kartı */}
        <div className="max-w-2xl mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 shrink-0">
              <FiAlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-mono">
                Önemli Güvenlik Bildirimi
              </h3>
              <p className="mt-1 text-xs text-amber-950/80 leading-relaxed font-sans">
                Şifrenizi başarıyla değiştirdikten sonra mevcut oturumunuz güvenlik nedeniyle sonlandırılacak 
                ve sisteme yeni şifrenizle tekrar giriş yapmanız gerekecektir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChangePasswordPage;
