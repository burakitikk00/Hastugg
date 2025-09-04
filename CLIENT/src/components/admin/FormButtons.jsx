const FormButtons = ({ onSave, onCancel, saveText = "Kaydet", cancelText = "İptal", isLoading = false, isDisabled = false }) => {
  return (
    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {cancelText}
      </button>
      <button
        type="submit"
        onClick={onSave}
        disabled={isLoading || isDisabled}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Kaydediliyor...</span>
          </div>
        ) : (
          saveText
        )}
      </button>
    </div>
  );
};

export default FormButtons;
