import React from "react";
import { WifiOff, ShieldCheck, HardDrive, RefreshCw, X, ArrowUpRight } from "lucide-react";

interface OfflineIndicatorProps {
  isOnline: boolean;
  isManualOffline: boolean;
  onOpenOfflineManager: () => void;
  onToggleManualOffline?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  isManualOffline,
  onOpenOfflineManager,
  onToggleManualOffline,
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  // If online, reset dismissed state so it triggers again next time connection drops
  React.useEffect(() => {
    if (isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  if (isOnline || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-md animate-in slide-in-from-bottom-3 duration-300">
      <div className="p-4 rounded-3xl bg-slate-900/95 text-white border border-amber-500/40 shadow-2xl backdrop-blur-md flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <WifiOff className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-amber-300">
                  {isManualOffline ? "وضع توفير الباقة (الأوفلاين اليدوي)" : "أنت الآن في وضع عدم الاتصال (أوفلاين)"}
                </h4>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                جميع المناهج، الدروس، الاختبارات التكيفية، والملخصات متاحة 100% بدون إنترنت.
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            title="إخفاء التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>يتم حفظ تقدمك محلياً</span>
          </div>

          <div className="flex items-center gap-2">
            {isManualOffline && onToggleManualOffline && (
              <button
                onClick={onToggleManualOffline}
                className="text-[11px] font-bold text-slate-300 hover:text-white underline transition"
              >
                إلغاء وضع التوفير
              </button>
            )}
            <button
              onClick={onOpenOfflineManager}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition flex items-center gap-1 shadow-xs"
            >
              <HardDrive className="w-3 h-3" />
              <span>فحص المحتوى المحفوظ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
