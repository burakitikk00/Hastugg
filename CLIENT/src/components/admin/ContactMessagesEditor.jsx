import { useState, useEffect } from 'react';
import {
  FiMail,
  FiPhone,
  FiClock,
  FiSend,
  FiTrash2,
  FiCheckCircle,
  FiEye,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import logger from '../../utils/logger';
import AdminPageHeader from './AdminPageHeader';
import AdminLoadingState from './AdminLoadingState';
import AdminEmptyState from './AdminEmptyState';

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
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    loadMessages();
  }, [pagination.currentPage, filter]);

  const loadMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const currentPage = pagination.currentPage || 1;
      const itemsPerPage = pagination.itemsPerPage || 10;

      const data = await adminService.getContactMessages(currentPage, itemsPerPage, filter);
      setMessages(data.messages || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
      });
    } catch (error) {
      logger.error('Mesajlar yüklenirken hata:', error);
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
      setActionLoadingId(id);
      await adminService.markContactMessageAsRead(id);
      setMessages(messages.map(msg =>
        msg.id === id ? { ...msg, is_read: 1 } : msg
      ));
    } catch (error) {
      logger.error('Mesaj okundu işaretlenirken hata:', error);
      alert('İşlem sırasında hata oluştu: ' + error.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendEmail = async (id) => {
    try {
      setActionLoadingId(id);
      await adminService.sendContactMessageEmail(id);
      setMessages(messages.map(msg =>
        msg.id === id ? { ...msg, is_sent: 1 } : msg
      ));
      alert('Email bildirimi başarıyla gönderildi!');
    } catch (error) {
      logger.error('Email gönderilirken hata:', error);
      alert('Email gönderilirken hata oluştu: ' + error.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Bu iletişim mesajını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setActionLoadingId(id);
      await adminService.deleteContactMessage(id);
      setMessages(messages.filter(msg => msg.id !== id));
      setPagination(prev => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
    } catch (error) {
      logger.error('Mesaj silinirken hata:', error);
      alert('Mesaj silinirken hata oluştu: ' + error.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterTabs = [
    { key: 'all', label: 'Tüm Mesajlar', count: filter === 'all' ? pagination.totalItems : null },
    { key: 'unread', label: 'Okunmamış' },
    { key: 'sent', label: 'Email Gönderilmiş' }
  ];

  if (isLoadingMessages && messages.length === 0) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Gelen İletişim Mesajları"
          subtitle="Web sitesi üzerinden gelen teklif ve iletişim taleplerini inceleyin."
          badge="Mesaj Havuzu"
        />
        <AdminLoadingState type="messages" message="Mesaj havuzu yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı ve Filtre Butonları */}
      <AdminPageHeader
        title="Gelen İletişim Mesajları"
        subtitle="Web sitesi üzerinden gelen teklif, proje ve iş birliği taleplerini inceleyin ve yönetin."
        badge={`${pagination.totalItems} Talep`}
        actions={
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            {filterTabs.map(tab => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleFilterChange(tab.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/15">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        }
      />

      {/* Mesaj Listesi */}
      {messages.length === 0 ? (
        <AdminEmptyState
          icon={FiMessageSquare}
          title="Mesaj Bulunamadı"
          description={
            filter === 'unread'
              ? 'Okunmamış yeni bir iletişim mesajı bulunmuyor.'
              : filter === 'sent'
              ? 'Henüz email bildirimi iletilmiş mesaj bulunmuyor.'
              : 'Web sitenizden gelen iletişim formu mesajları burada listelenir.'
          }
          action={
            filter !== 'all' ? (
              <button
                onClick={() => handleFilterChange('all')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Tüm Mesajları Göster
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const isRead = Boolean(message.is_read);
            const isSent = Boolean(message.is_sent);
            const isActionBusy = actionLoadingId === message.id;

            return (
              <div
                key={message.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-6 shadow-xs hover:shadow-sm ${
                  !isRead
                    ? 'border-amber-400/60 ring-1 ring-amber-400/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Sol & Gövde: Mesaj Detayı */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2.5 mb-2.5">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {message.first_name} {message.last_name}
                      </h3>

                      {!isRead ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Okunmamış
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <FiEye size={12} />
                          Okundu
                        </span>
                      )}

                      {isSent && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30">
                          <FiCheckCircle size={12} />
                          E-Posta İletildi
                        </span>
                      )}
                    </div>

                    {/* Meta Bilgileri: Email, Telefon, Tarih */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-500 mb-3.5">
                      <a
                        href={`mailto:${message.email}`}
                        className="inline-flex items-center gap-1.5 hover:text-amber-700 transition-colors font-medium text-slate-700"
                      >
                        <FiMail size={13} className="text-amber-600 shrink-0" />
                        <span>{message.email}</span>
                      </a>
                      {message.phone && (
                        <a
                          href={`tel:${message.phone}`}
                          className="inline-flex items-center gap-1.5 hover:text-amber-700 transition-colors font-medium text-slate-700"
                        >
                          <FiPhone size={13} className="text-amber-600 shrink-0" />
                          <span>{message.phone}</span>
                        </a>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <FiClock size={13} className="shrink-0" />
                        <span>{formatDate(message.created_at)}</span>
                      </span>
                    </div>

                    {/* Mesaj İçeriği */}
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {message.message}
                    </div>
                  </div>

                  {/* Sağ: Aksiyon Butonları */}
                  <div className="flex lg:flex-col items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        disabled={isActionBusy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
                        title="Okundu olarak işaretle"
                      >
                        <FiEye size={13} />
                        <span>Okundu İşaretle</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleSendEmail(message.id)}
                      disabled={isActionBusy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 rounded-xl border border-amber-200/80 transition-colors disabled:opacity-50"
                      title="Sistem e-posta bildirimini tekrar tetikle"
                    >
                      <FiSend size={13} />
                      <span>E-Posta Yeniden İlet</span>
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      disabled={isActionBusy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200/70 transition-colors disabled:opacity-50"
                      title="Mesajı kalıcı olarak sil"
                    >
                      <FiTrash2 size={13} />
                      <span>Sil</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Sayfalama Kontrolleri */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Toplam <span className="font-bold text-slate-800">{pagination.totalItems}</span> mesaj arasından{' '}
                <span className="font-bold text-slate-800">
                  {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} -{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                gösteriliyor
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="p-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Önceki Sayfa"
                >
                  <FiChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const startPage = Math.max(1, pagination.currentPage - 2);
                  const pageNum = startPage + i;
                  if (pageNum > pagination.totalPages) return null;

                  const isActive = pageNum === pagination.currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-8 h-8 px-2 text-xs font-bold rounded-lg border transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="p-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Sonraki Sayfa"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactMessagesEditor;
