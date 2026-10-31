import { FiInbox } from 'react-icons/fi';

const AdminEmptyState = ({
  icon: Icon = FiInbox,
  title = 'Kayıt Bulunamadı',
  description = 'Bu bölümde henüz gösterilecek herhangi bir kayıt bulunmuyor.',
  action = null
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300/90 p-10 text-center shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3.5 shadow-[0_0_15px_rgba(229,169,60,0.1)]">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-5 flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

export default AdminEmptyState;
