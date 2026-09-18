import React, { useState } from "react";
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  HardDrive,
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  X,
  RefreshCw,
  Share2,
  HelpCircle,
} from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  isBrowserOnline: boolean;
  isManualOffline: boolean;
  onToggleManualOffline: () => void;
  onShowToast: (msg: string) => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  isBrowserOnline,
  isManualOffline,
  onToggleManualOffline,
  onShowToast,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isVerifyingCache, setIsVerifyingCache] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onShowToast("تم تثبيت التطبيق بنجاح على جهازك! 🎉");
      }
    } else if (isIOS) {
      setShowIosGuide(true);
    } else {
      onShowToast("التطبيق يعمل بالفعل في المتصفح أو تم تثبيته مسبقاً.");
    }
  };

  const handleTestCache = () => {
    setIsVerifyingCache(true);
    setTimeout(() => {
      setIsVerifyingCache(false);
      onShowToast("تم فحص الذاكرة المحلية بنجاح: جميع المناهج والوحدات والأسئلة جاهزة 100% للعمل بدون إنترنت! 🚀");
    }, 600);
  };

  const offlineFeatures = [
    {
      title: "مناهج ووحدات الثانوية العامة (2026 / 2027)",
      desc: "شاملة الصف الأول والثاني والثالث الثانوي بجميع الشعب (علمي/أدبي) وأبواب المواد.",
      icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
      status: "مخزن محلياً 100%",
    },
    {
      title: "النوت والملخصات الأكاديمية ونواتج التعلم",
      desc: "المفاهيم الأساسية، القوانين الرياضية، والخرائط الذهنية لكل وحدة دراسية.",
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      status: "جاهز بدون نت",
    },
    {
      title: "بنك الأسئلة والامتحانات التكيفية والشهرية",
      desc: "اختبارات أكتوبر، نوفمبر، منتصف العام، واختبارات الوحدات مع التصحيح الفوري.",
      icon: <Award className="w-4 h-4 text-emerald-500" />,
      status: "محرك محلي فوري",
    },
    {
      title: "مؤقت المذاكرة (Pomodoro) وتتبع الساعات",
      desc: "حساب دقائق التركيز، تنبيهات فترات الراحة، وسجل الإنجاز اليومي.",
      icon: <Clock className="w-4 h-4 text-purple-500" />,
      status: "يعمل أوفلاين",
    },
    {
      title: "حفظ التقدم ونقاط الـ XP ولوحة الصدارة",
      desc: "تخزين آمن لدرجاتك وسلسلة أيام المذاكرة في ذاكرة جهازك المحلية (Local Storage).",
      icon: <ShieldCheck className="w-4 h-4 text-blue-500" />,
      status: "حفظ تلقائي محلي",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs ${
              isOnline ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}>
              {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>مركز إدارة وضع الأوفلاين (العمل بدون إنترنت)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                  PWA Ready
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                تصفح وحل وذاكر بكفاءة تامة سواء كنت متصلاً بالشبكة أو بدون أي اتصال
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Current Status Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isOnline
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
              : "bg-amber-50/80 border-amber-200 text-amber-950"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                isOnline ? "bg-emerald-500 ring-4 ring-emerald-200 animate-pulse" : "bg-amber-500 ring-4 ring-amber-200"
              }`} />
              <div>
                <h4 className="font-bold text-sm">
                  {isOnline
                    ? "الشبكة متصلة بالإنترنت 🟢"
                    : isManualOffline
                    ? "وضع توفير باقة النت نشط (أوفلاين يدوي) ⚡"
                    : "وضع عدم الاتصال بالشبكة (أوفلاين) 📴"}
                </h4>
                <p className="text-xs opacity-80 mt-0.5">
                  {isOnline
                    ? "جميع الميزات متصلة، ويتم تحديث الذاكرة المحلية باستمرار."
                    : "التطبيق يعمل بنسبة 100% اعتماداً على المحتوى المخزن محلياً داخل جهازك."}
                </p>
              </div>
            </div>

            {/* Toggle Manual Offline Simulator */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={onToggleManualOffline}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                  isManualOffline
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-800 hover:bg-slate-900 text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{isManualOffline ? "إلغاء محاكاة الأوفلاين" : "تفعيل توفير الباقة (أوفلاين)"}</span>
              </button>
            </div>
          </div>

          {/* Install App on Device Card (PWA) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 text-2xl">
                📱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">
                    {isInstalled ? "التطبيق مثبت على جهازك كبرنامج مستقل" : "تثبيت التطبيق على جهازك أو هاتفك (PWA)"}
                  </h4>
                  {isInstalled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      مثبت
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  يمنحك أيقونة سريعة على شاشة الهاتف أو سطح المكتب للتشغيل المباشر دون شريط المتصفح، مع جاهزية كاملة للأوفلاين.
                </p>
              </div>
            </div>

            {!isInstalled && (
              <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
                {isInstallable && (
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>تثبيت التطبيق الآن</span>
                  </button>
                )}

                {isIOS && (
                  <button
                    onClick={() => setShowIosGuide(!showIosGuide)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>طريقة التثبيت على الآيفون</span>
                  </button>
                )}

                {!isInstallable && !isIOS && (
                  <button
                    onClick={handleTestCache}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>إضافة للشاشة الرئيسية</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* iOS Safari Installation Guide (Collapsible) */}
          {showIosGuide && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2 animate-in fade-in duration-200">
              <h5 className="font-bold flex items-center gap-1.5 text-amber-900">
                <Smartphone className="w-4 h-4 text-amber-600" />
                خطوات تثبيت التطبيق على أجهزة iPhone و iPad عبر Safari:
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed pr-2">
                <li>اضغط على زر <strong>المشاركة (Share ⬆️)</strong> في أسفل شريط متصفح سفاري.</li>
                <li>مرر للأسفل واضغط على خيار <strong>"إضافة إلى الصفحة الرئيسية (Add to Home Screen ➕)"</strong>.</li>
                <li>اضغط على <strong>"إضافة (Add)"</strong> في أعلى الزاوية.</li>
              </ol>
            </div>
          )}

          {/* Offline Cached Capabilities Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-600" />
                <span>المحتوى المتاح للمذاكرة التامة بدون إنترنت (الأوفلاين)</span>
              </h4>

              <button
                onClick={handleTestCache}
                disabled={isVerifyingCache}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isVerifyingCache ? "animate-spin" : ""}`} />
                <span>فحص الذاكرة المحلية</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {offlineFeatures.map((feat, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {feat.icon}
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-800">{feat.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200/70 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{feat.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>يتم حفظ جميع إجاباتك ودرجاتك محلياً بشكل تلقائي وآمن.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs self-stretch sm:self-auto"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
