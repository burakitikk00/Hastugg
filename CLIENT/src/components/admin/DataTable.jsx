import React from 'react';
import { FiPlus, FiEye, FiEdit3, FiTrash2 } from 'react-icons/fi';
import AdminEmptyState from './AdminEmptyState';

const DataTable = ({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  onView,
  title = 'Veri Listesi',
  addButtonText = 'Yeni Ekle',
  onAdd,
  emptyMessage = 'Henüz veri bulunmuyor',
  expandedRowId = null,
  renderExpandedRow = null
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4.5 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200/70 text-slate-700">
            {data.length}
          </span>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xs transition-all active:scale-[0.98]"
          >
            <FiPlus size={15} />
            <span>{addButtonText}</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-8">
                  <AdminEmptyState title="Veri Bulunamadı" description={emptyMessage} />
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  <tr className="hover:bg-amber-50/25 transition-colors">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-700"
                      >
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Görüntüle"
                          >
                            <FiEye size={16} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className={`p-2 rounded-lg transition-colors ${
                              expandedRowId === item.id
                                ? 'text-amber-700 bg-amber-100/70'
                                : 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                            title={expandedRowId === item.id ? 'Kapat' : 'Düzenle'}
                          >
                            <FiEdit3 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Sil"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Genişletilmiş Satır */}
                  {expandedRowId === item.id && renderExpandedRow && (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-0 bg-slate-50/60 border-t border-slate-200">
                        {renderExpandedRow(item)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
