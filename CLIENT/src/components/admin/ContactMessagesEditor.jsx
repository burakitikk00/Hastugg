import { useState, useEffect, useMemo, useRef } from 'react';
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
  FiChevronRight,
  FiRotateCcw,
  FiX,
  FiAlertCircle,
  FiCheck,
  FiCheckSquare,
  FiArchive
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
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    sent: 0,
    passive: 0
  });
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, sent, passive
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [isBulkBusy, setIsBulkBusy] = useState(false);

  // Seçim state'i
  const [selectedIds, setSelectedIds] = useState([]);

  // Toast bildirim state'i
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });

  // E-Posta Gönderim Modal State'i
  const [emailModal, setEmailModal] = useState({
    isOpen: false,
    targetMessages: [],
    subject: 'Hastuğ İnşaat - İletişim Formu Talebiniz Hk.',
    content: '',
    targetMode: 'recipient', // 'recipient' | 'system'
    isSending: false
  });

  // Silme Onay Modalı State'i
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    subMessage: '',
    confirmText: '',
    cancelText: 'Vazgeç',
    type: 'warning', // 'warning' | 'danger'
    onConfirm: null,
    isBusy: false
  });

  const selectAllRef = useRef(null);

  // Toast gösterme ve otomatik kapanma (4 saniye)
  const showToast = ({ type = 'success', title, message }) => {
    setToast({ show: true, type, title, message });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Mesajları ve istatistikleri yükle
  useEffect(() => {
    loadMessagesAndStats();
  }, [pagination.currentPage, filter]);

  const loadMessagesAndStats = async () => {
    try {
      setIsLoadingMessages(true);
      const currentPage = pagination.currentPage || 1;
      const itemsPerPage = pagination.itemsPerPage || 10;

      const [data, statsData] = await Promise.all([
        adminService.getContactMessages(currentPage, itemsPerPage, filter),
        adminService.getContactMessagesStats()
      ]);

      setMessages(data.messages || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
      });

      if (statsData) {
        setStats({
          total: Number(statsData.total || 0),
          unread: Number(statsData.unread || 0),
          sent: Number(statsData.sent || 0),
          passive: Number(statsData.passive || 0)
        });
      }
    } catch (error) {
      logger.error('Mesajlar yüklenirken hata:', error);
      showToast({
        type: 'error',
        title: 'Yükleme Hatası',
        message: 'Mesajlar yüklenirken bir sorun oluştu.'
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const refreshStats = async () => {
    try {
      const statsData = await adminService.getContactMessagesStats();
      if (statsData) {
        setStats({
          total: Number(statsData.total || 0),
          unread: Number(statsData.unread || 0),
          sent: Number(statsData.sent || 0),
          passive: Number(statsData.passive || 0)
        });
      }
    } catch (err) {
      logger.error('İstatistik güncelleme hatası:', err);
    }
  };

  const handlePageChange = (newPage) => {
    setSelectedIds([]);
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleFilterChange = (newFilter) => {
    setSelectedIds([]);
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // ==================== SEÇİM YÖNETİMİ ====================
  const currentPageIds = useMemo(() => messages.map(m => m.id), [messages]);

  const isAllSelected = useMemo(() => {
    if (currentPageIds.length === 0) return false;
    return currentPageIds.every(id => selectedIds.includes(id));
  }, [currentPageIds, selectedIds]);

  const isPartialSelected = useMemo(() => {
    const selectedOnPage = currentPageIds.filter(id => selectedIds.includes(id));
    return selectedOnPage.length > 0 && selectedOnPage.length < currentPageIds.length;
  }, [currentPageIds, selectedIds]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isPartialSelected;
    }
  }, [isPartialSelected]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Bu sayfadakilerin seçimini kaldır
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      // Bu sayfadaki tüm mesajları seçime ekle
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ==================== TEKİL İŞLEMLER ====================
  const handleMarkAsRead = async (id) => {
    try {
      setActionLoadingId(id);
      await adminService.markContactMessageAsRead(id);
      setMessages(prev => prev.map(msg =>
        msg.id === id ? { ...msg, is_read: true } : msg
      ));
      await refreshStats();
      showToast({
        type: 'success',
        title: 'Okundu Olarak İşaretlendi',
        message: 'Mesaj başarıyla okundu olarak güncellendi.'
      });
    } catch (error) {
      logger.error('Mesaj okundu işaretlenirken hata:', error);
      showToast({
        type: 'error',
        title: 'İşlem Başarısız',
        message: error.message || 'Okundu işaretlenirken hata oluştu.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Tekil Mesaj Silme (Modalı Aç)
  const handleDeleteMessagePrompt = (message) => {
    const isPassiveTab = filter === 'passive';
    if (isPassiveTab) {
      setConfirmModal({
        isOpen: true,
        title: 'Mesajı Kalıcı Olarak Sil',
        message: `${message.first_name} ${message.last_name} isimli gönderene ait mesajı veritabanından KALICI OLARAK silmek istediğinizden emin misiniz?`,
        subMessage: 'Bu işlem geri alınamaz ve mesaj sistemden tamamen silinir.',
        confirmText: 'Kalıcı Olarak Sil',
        cancelText: 'Vazgeç',
        type: 'danger',
        isBusy: false,
        onConfirm: () => executeDeleteMessage(message.id, true)
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'Mesajı Pasife Al (Sil)',
        message: 'Bu iletişim mesajını silmek (pasife almak) istediğinizden emin misiniz?',
        subMessage: 'Dilediğinizde Çöp Kutusu sekmesinden geri yükleyebilirsiniz.',
        confirmText: 'Evet, Pasife Al',
        cancelText: 'Vazgeç',
        type: 'warning',
        isBusy: false,
        onConfirm: () => executeDeleteMessage(message.id, false)
      });
    }
  };

  const executeDeleteMessage = async (id, isPassiveTab) => {
    try {
      setConfirmModal(prev => ({ ...prev, isBusy: true }));
      setActionLoadingId(id);
      await adminService.deleteContactMessage(id, isPassiveTab);
      setMessages(prev => prev.filter(msg => msg.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      setPagination(prev => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
      await refreshStats();
      showToast({
        type: 'success',
        title: isPassiveTab ? 'Mesaj Kalıcı Olarak Silindi' : 'Mesaj Pasife Alındı',
        message: isPassiveTab
          ? 'Mesaj veritabanından tamamen silindi.'
          : 'Mesaj arşive / pasife kaldırıldı.'
      });
      setConfirmModal(prev => ({ ...prev, isOpen: false, isBusy: false }));
    } catch (error) {
      logger.error('Mesaj silinirken hata:', error);
      showToast({
        type: 'error',
        title: 'Silme Hatası',
        message: error.message || 'Mesaj silinirken bir hata oluştu.'
      });
      setConfirmModal(prev => ({ ...prev, isBusy: false }));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Tekil Mesajı Geri Yükle (Aktif yap)
  const handleRestoreMessage = async (id) => {
    try {
      setActionLoadingId(id);
      await adminService.restoreContactMessage(id);
      setMessages(prev => prev.filter(msg => msg.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      setPagination(prev => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
      await refreshStats();
      showToast({
        type: 'success',
        title: 'Mesaj Yeniden Aktif Edildi',
        message: 'Mesaj başarıyla gelen kutusuna geri yüklendi.'
      });
    } catch (error) {
      logger.error('Mesaj aktif edilirken hata:', error);
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.message || 'Mesaj aktif edilirken hata oluştu.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Tekil E-Posta Gönderme Modalını Aç
  const handleOpenSingleEmailModal = (message) => {
    setEmailModal({
      isOpen: true,
      targetMessages: [message],
      subject: `Hastuğ İnşaat - Sn. ${message.first_name} ${message.last_name} Talebiniz Hk.`,
      content: '',
      targetMode: 'recipient',
      isSending: false
    });
  };

  // ==================== TOPLU İŞLEMLER ====================
  // Toplu Okundu Olarak İşaretle
  const handleBulkMarkAsRead = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsBulkBusy(true);
      await adminService.bulkMarkContactMessagesAsRead(selectedIds);
      setMessages(prev => prev.map(msg =>
        selectedIds.includes(msg.id) ? { ...msg, is_read: true } : msg
      ));
      await refreshStats();
      showToast({
        type: 'success',
        title: 'Toplu İşlem Başarılı',
        message: `${selectedIds.length} adet mesaj okundu olarak işaretlendi.`
      });
      setSelectedIds([]);
    } catch (error) {
      logger.error('Toplu okundu işaretleme hatası:', error);
      showToast({
        type: 'error',
        title: 'İşlem Başarısız',
        message: error.message || 'Seçilenler okundu işaretlenirken hata oluştu.'
      });
    } finally {
      setIsBulkBusy(false);
    }
  };

  // Toplu Silme (Modalı Aç)
  const handleBulkDeletePrompt = () => {
    if (selectedIds.length === 0) return;
    const isPassiveTab = filter === 'passive';
    if (isPassiveTab) {
      setConfirmModal({
        isOpen: true,
        title: 'Seçilen Mesajları Kalıcı Sil',
        message: `Seçilen ${selectedIds.length} adet mesajı veritabanından KALICI OLARAK silmek istediğinizden emin misiniz?`,
        subMessage: 'Bu işlem geri alınamaz ve mesajlar sistemden tamamen silinir.',
        confirmText: `Kalıcı Olarak Sil (${selectedIds.length})`,
        cancelText: 'Vazgeç',
        type: 'danger',
        isBusy: false,
        onConfirm: () => executeBulkDelete(true)
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'Seçilen Mesajları Pasife Al',
        message: `Seçilen ${selectedIds.length} adet mesajı silmek (pasife almak) istediğinizden emin misiniz?`,
        subMessage: 'Dilediğinizde Çöp Kutusu sekmesinden geri yükleyebilirsiniz.',
        confirmText: `Evet, Pasife Al (${selectedIds.length})`,
        cancelText: 'Vazgeç',
        type: 'warning',
        isBusy: false,
        onConfirm: () => executeBulkDelete(false)
      });
    }
  };

  const executeBulkDelete = async (isPassiveTab) => {
    try {
      setConfirmModal(prev => ({ ...prev, isBusy: true }));
      setIsBulkBusy(true);
      await adminService.bulkDeleteContactMessages(selectedIds, isPassiveTab);
      setMessages(prev => prev.filter(msg => !selectedIds.includes(msg.id)));
      setPagination(prev => ({
        ...prev,
        totalItems: Math.max(0, prev.totalItems - selectedIds.length)
      }));
      await refreshStats();
      showToast({
        type: 'success',
        title: isPassiveTab ? 'Kalıcı Olarak Silindi' : 'Mesajlar Pasife Alındı',
        message: `${selectedIds.length} adet mesaj ${isPassiveTab ? 'kalıcı olarak silindi' : 'pasife alındı'}.`
      });
      setSelectedIds([]);
      setConfirmModal(prev => ({ ...prev, isOpen: false, isBusy: false }));
    } catch (error) {
      logger.error('Toplu silme hatası:', error);
      showToast({
        type: 'error',
        title: 'Toplu Silme Hatası',
        message: error.message || 'Seçilen mesajlar silinemedi.'
      });
      setConfirmModal(prev => ({ ...prev, isBusy: false }));
    } finally {
      setIsBulkBusy(false);
    }
  };

  // Toplu Geri Yükle (Aktif et)
  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsBulkBusy(true);
      await adminService.bulkRestoreContactMessages(selectedIds);
      setMessages(prev => prev.filter(msg => !selectedIds.includes(msg.id)));
      setPagination(prev => ({
        ...prev,
        totalItems: Math.max(0, prev.totalItems - selectedIds.length)
      }));
      await refreshStats();
      showToast({
        type: 'success',
        title: 'Mesajlar Geri Yüklendi',
        message: `${selectedIds.length} adet mesaj gelen kutusuna geri yüklendi.`
      });
      setSelectedIds([]);
    } catch (error) {
      logger.error('Toplu geri yükleme hatası:', error);
      showToast({
        type: 'error',
        title: 'Geri Yükleme Hatası',
        message: error.message || 'Mesajlar geri yüklenemedi.'
      });
    } finally {
      setIsBulkBusy(false);
    }
  };

  // Toplu E-Posta Gönderim Modalını Aç
  const handleOpenBulkEmailModal = () => {
    if (selectedIds.length === 0) return;
    const targetMessages = messages.filter(m => selectedIds.includes(m.id));
    setEmailModal({
      isOpen: true,
      targetMessages,
      subject: 'Hastuğ İnşaat - İletişim Formu Talebiniz Hk.',
      content: '',
      targetMode: 'recipient',
      isSending: false
    });
  };

  // E-Posta Gönderimini Tamamla
  const handleSendEmailSubmit = async (e) => {
    e.preventDefault();
    const ids = emailModal.targetMessages.map(m => m.id);
    if (ids.length === 0) return;

    try {
      setEmailModal(prev => ({ ...prev, isSending: true }));
      const result = await adminService.bulkSendContactMessagesEmail(ids, {
        subject: emailModal.subject,
        content: emailModal.content,
        target: emailModal.targetMode
      });

      // Mesajları gönderildi olarak işaretle
      setMessages(prev => prev.map(msg =>
        ids.includes(msg.id) ? { ...msg, is_sent: true } : msg
      ));
      await refreshStats();

      showToast({
        type: 'success',
        title: 'E-Posta Gönderildi',
        message: result.message || `${ids.length} adet e-posta başarıyla iletildi.`
      });

      setEmailModal(prev => ({ ...prev, isOpen: false }));
      setSelectedIds([]);
    } catch (error) {
      logger.error('E-posta gönderim hatası:', error);
      showToast({
        type: 'error',
        title: 'Gönderim Başarısız',
        message: error.message || 'E-postalar gönderilirken bir hata oluştu.'
      });
    } finally {
      setEmailModal(prev => ({ ...prev, isSending: false }));
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

  // Filtre Sekmeleri & Canlı Sayaçlar
  const filterTabs = [
    { key: 'all', label: 'Tüm Mesajlar', count: stats.total },
    { key: 'unread', label: 'Okunmamış', count: stats.unread },
    { key: 'sent', label: 'E-Posta İletildi', count: stats.sent },
    { key: 'passive', label: 'Pasif / Çöp Kutusu', count: stats.passive }
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
    <div className="space-y-6 relative">
      {/* SAĞ ÜST TOAST BİLDİRİMİ */}
      {toast && toast.show && (
        <div className="fixed top-6 right-6 z-[99999] max-w-sm sm:max-w-md w-[calc(100%-3rem)] animate-fadeIn transition-all duration-300">
          <div className={`relative overflow-hidden rounded-2xl bg-[#0c1017]/95 border p-4 text-white shadow-2xl backdrop-blur-xl ring-1 ${
            toast.type === 'error'
              ? 'border-rose-500/60 ring-rose-500/30'
              : toast.type === 'info'
              ? 'border-amber-500/60 ring-amber-500/30'
              : 'border-emerald-500/60 ring-emerald-500/30'
          }`}>
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              toast.type === 'error'
                ? 'from-rose-600 via-amber-500 to-rose-500'
                : toast.type === 'info'
                ? 'from-amber-500 via-amber-300 to-amber-600'
                : 'from-emerald-500 via-amber-400 to-emerald-400'
            }`} />

            <div className="flex items-start gap-3">
              <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border mt-0.5 ${
                toast.type === 'error'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : toast.type === 'info'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}>
                {toast.type === 'error' ? (
                  <FiAlertCircle size={18} />
                ) : (
                  <FiCheck size={18} />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-sm font-bold text-slate-100 tracking-tight">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className="shrink-0 text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Kapat"
              >
                <FiX size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sayfa Başlığı ve Filtre Butonları */}
      <AdminPageHeader
        title="Gelen İletişim Mesajları"
        subtitle="Web sitesi üzerinden gelen teklif, proje ve iş birliği taleplerini inceleyin ve yönetin."
        badge={`${stats.total} Aktif Talep`}
        actions={
          <div className="flex items-center flex-wrap gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-xs">
            {filterTabs.map(tab => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleFilterChange(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      active
                        ? 'bg-slate-950/15 text-slate-950'
                        : tab.key === 'unread' && tab.count > 0
                        ? 'bg-amber-500/20 text-amber-900 border border-amber-500/40'
                        : tab.key === 'passive' && tab.count > 0
                        ? 'bg-rose-500/10 text-rose-800 border border-rose-400/30'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        }
      />

      {/* TOPLU SEÇİM & AKSİYON ARAÇ ÇUBUĞU (SEÇİM KISMI) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Sol: Tümünü Seç Checkbox */}
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                disabled={messages.length === 0 || isBulkBusy}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer disabled:opacity-40"
              />
              <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                Tümünü Seç
              </span>
            </label>

            {messages.length > 0 && (
              <span className="text-xs text-slate-400 border-l border-slate-200 pl-3">
                Bu sayfada <strong className="text-slate-700 font-semibold">{messages.length}</strong> mesaj
              </span>
            )}

            {selectedIds.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-900 border border-amber-500/30">
                <FiCheckSquare size={13} />
                {selectedIds.length} mesaj seçildi
              </span>
            )}
          </div>

          {/* Sağ: Seçim Yapıldığında Görünen Toplu Aksiyon Butonları */}
          {selectedIds.length > 0 ? (
            <div className="flex items-center flex-wrap gap-2">
              {/* Okundu Olarak İşaretle */}
              {filter !== 'passive' && (
                <button
                  type="button"
                  onClick={handleBulkMarkAsRead}
                  disabled={isBulkBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
                  title="Seçilenleri okundu olarak işaretle"
                >
                  <FiEye size={13} className="text-slate-700" />
                  <span>Okundu İşaretle</span>
                </button>
              )}

              {/* Seçilenlere E-Posta Gönder */}
              <button
                type="button"
                onClick={handleOpenBulkEmailModal}
                disabled={isBulkBusy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                title="Seçilen alıcılara toplu e-posta gönder"
              >
                <FiSend size={13} />
                <span>E-Posta Gönder ({selectedIds.length})</span>
              </button>

              {/* Pasif Sekmesinde Geri Yükle / Kalıcı Sil */}
              {filter === 'passive' ? (
                <>
                  <button
                    type="button"
                    onClick={handleBulkRestore}
                    disabled={isBulkBusy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all active:scale-[0.98] disabled:opacity-50"
                    title="Seçilenleri gelen kutusuna geri yükle"
                  >
                    <FiRotateCcw size={13} />
                    <span>Geri Yükle</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkDeletePrompt}
                    disabled={isBulkBusy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all active:scale-[0.98] disabled:opacity-50"
                    title="Seçilenleri kalıcı olarak sil"
                  >
                    <FiTrash2 size={13} />
                    <span>Kalıcı Sil</span>
                  </button>
                </>
              ) : (
                /* Normal Sekmelerde Pasife Al (Sil) */
                <button
                  type="button"
                  onClick={handleBulkDeletePrompt}
                  disabled={isBulkBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all active:scale-[0.98] disabled:opacity-50"
                  title="Seçilen mesajları pasife al (arşivle)"
                >
                  <FiTrash2 size={13} />
                  <span>Sil (Pasife Al)</span>
                </button>
              )}

              {/* Seçimi Temizle */}
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                disabled={isBulkBusy}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
                title="Seçimi temizle"
              >
                <FiX size={13} />
                <span>Vazgeç</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              Toplu işlem yapmak için mesajları seçebilirsiniz.
            </div>
          )}
        </div>
      </div>

      {/* Mesaj Listesi */}
      {messages.length === 0 ? (
        <AdminEmptyState
          icon={filter === 'passive' ? FiArchive : FiMessageSquare}
          title={
            filter === 'passive'
              ? 'Çöp Kutusu Boş'
              : 'Mesaj Bulunamadı'
          }
          description={
            filter === 'unread'
              ? 'Okunmamış yeni bir iletişim mesajı bulunmuyor.'
              : filter === 'sent'
              ? 'Henüz email bildirimi iletilmiş mesaj bulunmuyor.'
              : filter === 'passive'
              ? 'Arşivlenmiş veya pasife alınmış mesaj bulunmuyor.'
              : 'Web sitenizden gelen iletişim formu mesajları burada listelenir.'
          }
          action={
            filter !== 'all' ? (
              <button
                type="button"
                onClick={() => handleFilterChange('all')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Tüm Aktif Mesajları Göster
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const isRead = Boolean(message.is_read);
            const isSent = Boolean(message.is_sent);
            const isPassive = message.is_active === false;
            const isSelected = selectedIds.includes(message.id);
            const isActionBusy = actionLoadingId === message.id || isBulkBusy;

            return (
              <div
                key={message.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 sm:p-6 shadow-xs hover:shadow-sm relative ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-50/20'
                    : isPassive
                    ? 'border-dashed border-slate-300 bg-slate-50/70 opacity-90'
                    : !isRead
                    ? 'border-amber-400/60 ring-1 ring-amber-400/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Sol & Gövde: Checkbox + Mesaj Detayı */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Seçim Kutusu */}
                    <div className="pt-1 shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(message.id)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        aria-label={`Mesajı seç: ${message.first_name} ${message.last_name}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2.5 mb-2.5">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {message.first_name} {message.last_name}
                        </h3>

                        {isPassive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-800 border border-rose-500/30">
                            <FiArchive size={12} />
                            Pasif / Çöp Kutusunda
                          </span>
                        ) : !isRead ? (
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
                  </div>

                  {/* Sağ: Aksiyon Butonları */}
                  <div className="flex lg:flex-col items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {!isPassive && !isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(message.id)}
                        disabled={isActionBusy}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
                        title="Okundu olarak işaretle"
                      >
                        <FiEye size={13} />
                        <span>Okundu İşaretle</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenSingleEmailModal(message)}
                      disabled={isActionBusy}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200/80 transition-colors disabled:opacity-50"
                      title="Kullanıcıya veya sisteme e-posta gönder"
                    >
                      <FiSend size={13} />
                      <span>E-Posta Gönder</span>
                    </button>

                    {isPassive ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestoreMessage(message.id)}
                          disabled={isActionBusy}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors disabled:opacity-50"
                          title="Gelen kutusuna geri yükle"
                        >
                          <FiRotateCcw size={13} />
                          <span>Geri Yükle</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessagePrompt(message)}
                          disabled={isActionBusy}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200/70 transition-colors disabled:opacity-50"
                          title="Veritabanından kalıcı olarak sil"
                        >
                          <FiTrash2 size={13} />
                          <span>Kalıcı Sil</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessagePrompt(message)}
                        disabled={isActionBusy}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200/70 transition-colors disabled:opacity-50"
                        title="Mesajı pasife al (sil)"
                      >
                        <FiTrash2 size={13} />
                        <span>Sil (Pasife Al)</span>
                      </button>
                    )}
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
                  type="button"
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
                      type="button"
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
                  type="button"
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

      {/* ==================== E-POSTA GÖNDERME MODALI ==================== */}
      {emailModal.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Başlık */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-900 flex items-center justify-center border border-amber-400/40">
                  <FiSend size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    E-Posta Gönderimi
                  </h3>
                  <p className="text-xs text-slate-500">
                    {emailModal.targetMessages.length} alıcıya e-posta iletisi gönderin
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEmailModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                aria-label="Kapat"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Formu */}
            <form onSubmit={handleSendEmailSubmit} className="p-5 space-y-4 flex-1">
              {/* Alıcılar Listesi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alıcılar ({emailModal.targetMessages.length})
                </label>
                <div className="max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5">
                  {emailModal.targetMessages.map(msg => (
                    <span
                      key={msg.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white text-slate-800 border border-slate-200 shadow-xs"
                    >
                      <FiMail size={11} className="text-amber-600" />
                      <span>{msg.first_name} {msg.last_name}</span>
                      <span className="text-slate-400">({msg.email})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Gönderim Türü Seçimi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gönderim Şekli
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailModal(prev => ({ ...prev, targetMode: 'recipient' }))}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                      emailModal.targetMode === 'recipient'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Alıcılara Özel Yanıt</div>
                    <div className="text-[10px] text-slate-500 font-normal">Kullanıcıların kendi e-posta adresine gider</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailModal(prev => ({ ...prev, targetMode: 'system' }))}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                      emailModal.targetMode === 'system'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Sistem Bildirimi İlet</div>
                    <div className="text-[10px] text-slate-500 font-normal">Yönetici gelen kutusuna form bildirimi gider</div>
                  </button>
                </div>
              </div>

              {/* Konu Başlığı */}
              {emailModal.targetMode === 'recipient' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      E-Posta Konusu
                    </label>
                    <input
                      type="text"
                      required
                      value={emailModal.subject}
                      onChange={(e) => setEmailModal(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Hastuğ İnşaat - İletişim Formu Talebiniz Hk."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-sans"
                    />
                  </div>

                  {/* Mesaj İçeriği */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mesaj / Yanıt Metniniz
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={emailModal.content}
                      onChange={(e) => setEmailModal(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Sayın ilgili, tarafımıza iletmiş olduğunuz talep incelenmiş olup..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-sans leading-relaxed resize-y"
                    />
                  </div>
                </>
              )}

              {/* Alt Butonlar */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEmailModal(prev => ({ ...prev, isOpen: false }))}
                  disabled={emailModal.isSending}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={emailModal.isSending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {emailModal.isSending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <FiSend size={13} />
                      <span>E-Postayı Gönder ({emailModal.targetMessages.length})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ONAY / UYARI MODALI ==================== */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full overflow-hidden p-6 sm:p-7 relative transition-all">
            {/* Üst Vurgulu Gradyan Çizgi */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                confirmModal.type === 'danger'
                  ? 'from-rose-600 via-rose-500 to-amber-500'
                  : 'from-amber-500 via-amber-400 to-amber-600'
              }`}
            />

            {/* İkon & Kapatma Butonu */}
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${
                  confirmModal.type === 'danger'
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-600'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-700'
                }`}
              >
                {confirmModal.type === 'danger' ? (
                  <FiTrash2 size={22} />
                ) : (
                  <FiAlertCircle size={22} />
                )}
              </div>

              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                disabled={confirmModal.isBusy}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
                aria-label="Kapat"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Başlık ve Ana Metin */}
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {confirmModal.title}
            </h3>

            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              {confirmModal.message}
            </p>

            {/* Alt Bilgi Kutusu */}
            {confirmModal.subMessage && (
              <div
                className={`mt-4 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed ${
                  confirmModal.type === 'danger'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-900 font-medium'
                    : 'bg-amber-50/80 border-amber-200/90 text-amber-950 font-medium'
                }`}
              >
                <span className="shrink-0 mt-0.5">
                  {confirmModal.type === 'danger' ? (
                    <FiAlertCircle size={15} className="text-rose-600" />
                  ) : (
                    <FiArchive size={15} className="text-amber-700" />
                  )}
                </span>
                <span>{confirmModal.subMessage}</span>
              </div>
            )}

            {/* Alt Butonlar */}
            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                disabled={confirmModal.isBusy}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {confirmModal.cancelText || 'Vazgeç'}
              </button>

              <button
                type="button"
                onClick={confirmModal.onConfirm}
                disabled={confirmModal.isBusy}
                className={`min-h-[40px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 ${
                  confirmModal.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold'
                }`}
              >
                {confirmModal.isBusy ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 size={13} />
                    <span>{confirmModal.confirmText || 'Sil'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesEditor;
