import { FiCheck } from 'react-icons/fi';

const FormButtons = ({
  onSave,
  onCancel,
  saveText = 'Kaydet',
  cancelText = 'Vazgeç',
  isLoading = false,
  isDisabled = false
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-6 border-t border-slate-200">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
        >
          {cancelText}
        </button>
      )}
      <button
        type="submit"
        onClick={onSave}
        disabled={isLoading || isDisabled}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            <span>Kaydediliyor...</span>
          </>
        ) : (
          <>
            <FiCheck size={16} />
            <span>{saveText}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default FormButtons;
