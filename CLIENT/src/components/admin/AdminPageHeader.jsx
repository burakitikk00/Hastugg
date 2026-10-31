const AdminPageHeader = ({
  title,
  subtitle,
  badge = null,
  kicker = 'HASTUĞ YÖNETİM SİSTEMİ',
  actions = null,
  children = null
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {kicker && (
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                {kicker}
              </span>
            </div>
          )}

          <div className="flex items-center flex-wrap gap-3">
            <h1 className="text-2xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 border border-amber-500/30">
                {badge}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {(actions || children) && (
          <div className="flex items-center flex-wrap gap-2.5 self-start md:self-auto shrink-0">
            {actions}
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPageHeader;
