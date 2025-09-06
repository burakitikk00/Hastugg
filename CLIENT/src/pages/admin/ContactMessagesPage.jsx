import AdminLayout from '../../components/admin/AdminLayout';
import ContactMessagesEditor from '../../components/admin/ContactMessagesEditor';

const ContactMessagesPage = () => {
  const handleSave = (data) => {
    // Mesajlar için özel kaydetme işlemi gerekmiyor
  };

  const handleCancel = () => {
    // İptal işlemi
  };

  return (
    <AdminLayout>
      <ContactMessagesEditor
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={false}
      />
    </AdminLayout>
  );
};

export default ContactMessagesPage;