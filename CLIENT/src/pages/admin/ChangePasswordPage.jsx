import AdminLayout from '../../components/admin/AdminLayout';
import ChangePasswordForm from '../../components/admin/ChangePasswordForm';

const ChangePasswordPage = () => {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Hesap Ayarları</h1>
            <p className="mt-2 text-gray-600">
              Hesap güvenliğinizi artırmak için şifrenizi düzenli olarak güncelleyin.
            </p>
          </div>

          {/* Change Password Form */}
          <ChangePasswordForm />

          {/* Security Tips */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Güvenlik Uyarısı
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Şifrenizi değiştirdikten sonra, tüm oturumlarınız sonlandırılacak ve 
                    tekrar giriş yapmanız gerekecektir. Güvenliğiniz için şifrenizi kimseyle paylaşmayın.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChangePasswordPage;
