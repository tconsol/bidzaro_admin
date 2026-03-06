import React from 'react';
import { X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const ToastDisplay: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            animate-slide-in-right
            ${getStyles(toast.type)}
            border rounded-lg px-4 py-3 flex items-start gap-3 max-w-sm shadow-lg pointer-events-auto
          `}
        >
          <div className="flex-shrink-0 text-lg font-bold pt-0.5">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1 text-sm font-medium pt-0.5">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-lg hover:opacity-70 transition-opacity"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastDisplay;
