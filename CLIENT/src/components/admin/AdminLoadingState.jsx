const AdminLoadingState = ({ type = 'cards', message = 'İçerik yükleniyor...' }) => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-amber-400/50" />
          <div className="h-3 w-32 bg-slate-200 rounded-md" />
        </div>
        <div className="h-7 w-56 bg-slate-200 rounded-lg mb-2" />
        <div className="h-4 w-96 max-w-full bg-slate-100 rounded-md" />
      </div>

      {/* Content Skeleton based on type */}
      {type === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="h-5 w-40 bg-slate-200 rounded-md" />
            <div className="h-9 w-32 bg-slate-200 rounded-xl" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between px-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-36 bg-slate-200 rounded" />
                    <div className="h-2.5 w-24 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100" />
                  <div className="w-8 h-8 rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'messages' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex justify-between items-center">
            <div className="h-5 w-40 bg-slate-200 rounded-md" />
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-slate-200 rounded-full" />
              <div className="h-8 w-24 bg-slate-100 rounded-full" />
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3"
            >
              <div className="flex justify-between">
                <div className="h-5 w-48 bg-slate-200 rounded-md" />
                <div className="h-6 w-24 bg-slate-100 rounded-full" />
              </div>
              <div className="h-3 w-64 bg-slate-100 rounded" />
              <div className="h-12 w-full bg-slate-50 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {type === 'form' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-11 bg-slate-50 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-11 bg-slate-50 rounded-xl border border-slate-200" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-28 bg-slate-50 rounded-xl border border-slate-200" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <div className="h-10 w-24 bg-slate-100 rounded-xl" />
            <div className="h-10 w-32 bg-slate-200 rounded-xl" />
          </div>
        </div>
      )}

      {type === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-16 bg-slate-50 rounded-xl" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
                <div className="h-8 w-24 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Minimal status footnote */}
      <div className="flex items-center justify-center gap-2 pt-2 text-xs font-medium text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default AdminLoadingState;
