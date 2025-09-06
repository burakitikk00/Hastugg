import { useState, useEffect } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaPaperPlane, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import adminService from '../../services/adminService';

const ContactMessagesEditor = ({ onSave, onCancel, isLoading }) => {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
   const [filter, setFilter] = useState('all'); // all, unread, sent

  // İlk yükleme
  useEffect(() => {
    loadMessages();
  }, []);

  // Sayfa veya filtre değişikliklerinde yükleme
  useEffect(() => {
    if (pagination.currentPage > 0) {
      loadMessages();
    }
  }, [pagination.currentPage, filter]);

  const loadMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const currentPage = pagination.currentPage || 1;
      const itemsPerPage = pagination.itemsPerPage || 10;
      
      const data = await adminService.getContactMessages(currentPage, itemsPerPage, filter);
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      alert('Mesajlar yüklenirken bir hata oluştu: ' + error.message);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleMarkAsRead = async (id) => {
    try {
      await adminService.markContactMessageAsRead(id);
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, is_read: 1 } : msg
      ));
    } catch (error) {
      console.error('Mesaj okundu işaretlenirken hata:', error);
      alert('Mesaj okundu işaretlenirken bir hata oluştu: ' + error.message);
    }
  };

  const handleSendEmail = async (id) => {
    try {
      await adminService.sendContactMessageEmail(id);
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, is_sent: 1 } : msg
      ));
      alert('Email başarıyla gönderildi!');
    } catch (error) {
      console.error('Email gönderilirken hata:', error);
      alert('Email gönderilirken bir hata oluştu: ' + error.message);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await adminService.deleteContactMessage(id);
      setMessages(messages.filter(msg => msg.id !== id));
      alert('Mesaj başarıyla silindi!');
    } catch (error) {
      console.error('Mesaj silinirken hata:', error);
      alert('Mesaj silinirken bir hata oluştu: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  if (isLoadingMessages) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtre Seçenekleri */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Contact Mesajları</h3>
            <p className="text-gray-600 mt-1">Gelen iletişim mesajlarını buradan yönetebilirsiniz. Email'ler otomatik olarak gönderilir.</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tümü ({pagination.totalItems})
              </button>
              <button
                onClick={() => handleFilterChange('unread')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'unread' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Okunmamış
              </button>
              <button
                onClick={() => handleFilterChange('sent')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'sent' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Email Gönderilmiş
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Mesajlar ({pagination.totalItems})
            </h3>
            <div className="text-sm text-gray-500">
              Sayfa {pagination.currentPage} / {pagination.totalPages}
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {messages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Henüz mesaj bulunmuyor.
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {message.first_name} {message.last_name}
                      </h4>
                      {!message.is_read && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FaEyeSlash className="w-3 h-3 mr-1" />
                          Okunmamış
                        </span>
                      )}
                      {message.is_sent && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaPaperPlane className="w-3 h-3 mr-1" />
                          Email Gönderildi
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {message.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Telefon:</strong> {message.phone}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Mesaj:</strong> {message.message}
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      {formatDate(message.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {!message.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                      >
                        <FaEye className="w-3 h-3 mr-1" />
                        Okundu İşaretle
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleSendEmail(message.id)}
                      className="flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                    >
                      <FaPaperPlane className="w-3 h-3 mr-1" />
                      Email Tekrar Gönder
                    </button>
                    
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 transition-colors"
                    >
                      <FaTrash className="w-3 h-3 mr-1" />
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Sayfalama Kontrolleri */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} / {pagination.totalItems} mesaj
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const startPage = Math.max(1, pagination.currentPage - 2);
                  const pageNum = startPage + i;
                  
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ContactMessagesEditor;
