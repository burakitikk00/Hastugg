import AdminLayout from '../../components/admin/AdminLayout';
import ContactMessagesEditor from '../../components/admin/ContactMessagesEditor';

const ContactMessagesPage = () => {
  const handleSave = (data) => {
    // Mesajlar için özel kaydetme işlemi gerekmiyor
    console.log('Contact messages data:', data);
  };

  const handleCancel = () => {
    // İptal işlemi
    console.log('Contact messages cancelled');
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