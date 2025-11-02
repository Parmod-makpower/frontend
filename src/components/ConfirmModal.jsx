import { Loader2 } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  confirmColor = "bg-blue-500 hover:bg-blue-600",
  loading = false,
  onCancel,
  onConfirm,
  icon: Icon,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          {Icon && <Icon className="text-red-500" />} {title}
        </h3>
        <p className="text-gray-600 mb-6 text-sm">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white cursor-pointer ${loading
              ? "bg-gray-400 cursor-not-allowed "
              : confirmColor
            }`}
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
