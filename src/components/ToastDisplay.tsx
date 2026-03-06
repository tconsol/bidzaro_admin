import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const ToastDisplay: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const [progress, setProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const intervals: { [key: string]: ReturnType<typeof setInterval> } = {};

    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        intervals[toast.id] = setInterval(() => {
          setProgress((prev) => {
            const current = prev[toast.id] || 0;
            const newProgress = current + (100 / (toast.duration! / 50));
            return { ...prev, [toast.id]: Math.min(newProgress, 100) };
          });
        }, 50);
      }
    });

    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
  }, [toasts]);

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5" />,
          bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
          border: 'border-emerald-200/50',
          text: 'text-emerald-900',
          progressBg: 'bg-emerald-500',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bg: 'bg-gradient-to-br from-red-50 to-rose-50',
          border: 'border-red-200/50',
          text: 'text-red-900',
          progressBg: 'bg-red-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
          border: 'border-amber-200/50',
          text: 'text-amber-900',
          progressBg: 'bg-amber-500',
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
          border: 'border-blue-200/50',
          text: 'text-blue-900',
          progressBg: 'bg-blue-500',
        };
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm">
      {toasts.map((toast) => {
        const { icon, bg, border, text, progressBg } = getIconAndColor(toast.type);

        return (
          <div
            key={toast.id}
            className={`
              animate-toast-enter
              ${bg}
              ${border}
              border rounded-2xl px-5 py-4 flex items-start gap-4 
              shadow-xl backdrop-blur-md
              pointer-events-auto
              hover:shadow-2xl transition-shadow duration-300
              overflow-hidden
            `}
          >
            {/* Icon */}
            <div className={`flex-shrink-0 pt-0.5 ${text}`}>
              {icon}
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${text} leading-snug`}>
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className={`flex-shrink-0 ${text} opacity-60 hover:opacity-100 transition-opacity p-0.5 -mr-1`}
            >
              <X size={18} />
            </button>

            {/* Progress Bar */}
            {toast.duration && toast.duration > 0 && (
              <div className="absolute bottom-0 left-0 h-1 bg-opacity-30 w-full">
                <div
                  className={`h-full ${progressBg} transition-all duration-100`}
                  style={{ width: `${Math.min(progress[toast.id] || 0, 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ToastDisplay;
