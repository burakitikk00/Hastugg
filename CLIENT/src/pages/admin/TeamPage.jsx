import AdminLayout from '../../components/admin/AdminLayout';
import TeamEditor from '../../components/admin/TeamEditor';

const TeamPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">Ekip Yönetimi</h1>
          <p className="text-gray-600 mt-2">Ekip üyelerini buradan yönetebilirsiniz</p>
        </div>

        {/* Team Editor */}
        <TeamEditor />
      </div>
    </AdminLayout>
  );
};

export default TeamPage;
