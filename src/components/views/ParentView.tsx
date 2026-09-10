import React, { useState } from "react";
import { StudentProfile, Subject } from "../../types";
import {
  Users,
  Clock,
  BookCheck,
  Target,
  Flame,
  Sparkles,
  Share2,
  Copy,
  CheckCircle2,
  RefreshCw,
  HeartHandshake,
} from "lucide-react";

interface ParentViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  onShowToast: (msg: string) => void;
}

export const ParentView: React.FC<ParentViewProps> = ({
  profile,
  subjects,
  onShowToast,
}) => {
  const [aiReport, setAiReport] = useState<string>(
    `تقرير المتابعة الأسبوعي لولي الأمر (الطالب ${profile.name}):\n\n1. ملخص الإنجاز والجهد: أظهر الطالب التزاماً ممتازاً بالمذاكرة اليومية مسجلاً 48 دقيقة اليوم مع سلسلة استمرارية بلغت 6 أيام متواصلة.\n2. التحصيل الدراسي: حقق نسبة نجاح 82% في الاختبارات التقييمية التفاعلية مع تميز خاص في استيعاب المفاهيم العلمية الأساسية.\n3. التوجيهات المقترحة للمنزل: تشجيع الطالب على تخصيص 15 دقيقة إضافية لحل المسائل الرياضية متعددة الخطوات، وتوفير بيئة هادئة خلال جلسات التركيز.\n4. رسالة تحفيزية: "فخورون بجهدك وانضباطك المستمر يا ${profile.name}، استمرارك سر تفوقك!"`
  );
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const totalCompletedLessons = subjects.reduce((acc, s) => acc + s.completedLessons, 0);

  const generateNewAiReport = async () => {
    setIsLoadingReport(true);
    onShowToast("جاري إعداد تقرير تحليلي ذكي وشامل لولي الأمر... ✨");

    try {
      const response = await fetch("/api/parent-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: profile.name,
          stats: {
            weeklyMinutes: profile.weeklyMinutes,
            streakDays: profile.streakDays,
            averageScore: profile.averageQuizScore,
          },
          completedLessons: ["الرياضيات (الأعداد المركبة)", "العلوم المتكاملة (الأنظمة البيئية المائية)", "اللغة العربية (كان التامة)"],
          weakTopics: ["المسائل متعددة الخطوات في الرياضيات"],
        }),
      });

      const data = await response.json();
      if (data.report) {
        setAiReport(data.report);
        onShowToast("تم تحديث تقرير ولي الأمر بنجاح!");
      }
    } catch (e) {
      console.error(e);
      onShowToast("تعذر الاتصال بخدمة الذكاء الاصطناعي، يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoadingReport(false);
    }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(aiReport);
    onShowToast("تم نسخ التقرير إلى الحافظة جاهزاً للإرسال! 📋");
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(aiReport);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              👨‍👦 لوحة متابعة ولي الأمر
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              تقرير فوري
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ملخص مبسط وموثوق لمتابعة تقدم الطالب الدراسي، ساعات المذاكرة، والتوصيات الداعمة له في المنزل
          </p>
        </div>

        <button
          onClick={generateNewAiReport}
          disabled={isLoadingReport}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReport ? "animate-spin" : ""}`} />
          <span>{isLoadingReport ? "جاري التحديث..." : "تحديث التقرير بالذكاء الاصطناعي"}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold">مذاكرة اليوم</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono">
            {profile.todayMinutes} دقيقة
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            الهدف اليومي: {profile.dailyGoalMinutes} دقيقة
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <BookCheck className="w-4 h-4" />
            <span className="text-xs font-bold">الدروس المنجزة</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono">
            {totalCompletedLessons} دروس
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            منهج الترم الأول
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs font-bold">متوسط الاختبارات</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono">
            {profile.averageQuizScore}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            مستوى متفوق
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-bold">الاستمرارية</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            {profile.streakDays} أيام
          </div>
          <div className="text-[11px] text-orange-600 font-medium mt-0.5">
            التزام يومي منتظم
          </div>
        </div>
      </div>

      {/* AI Smart Report Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                التقرير الأسبوعي الذكي الموجه لولي الأمر
              </h3>
              <p className="text-xs text-slate-500">تم توليده وتلخيصه استناداً لأداء الطالب الفعلي</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyReport}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition flex items-center gap-1"
              title="نسخ التقرير"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">نسخ</span>
            </button>

            <button
              onClick={shareViaWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shadow-emerald-600/20"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة عبر واتساب</span>
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
          {aiReport}
        </div>

        {/* Home Support Guidance Checklist */}
        <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
          <h4 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-indigo-600" />
            نصائح عملية لدعم الطالب هذا الأسبوع:
          </h4>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <b>تنظيم فترات الراحة:</b> تشجيع الطالب على المذاكرة بنظام 25 دقيقة تركيز تليها 5 دقائق راحة بدلاً من الجلسات الطويلة المرهقة.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <b>التحفيز الإيجابي:</b> الإشادة بحفاظه على سلسلة الأيام الـ 6 المتواصلة كعامل نفسي أساسي لبناء الثقة.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <b>المتابعة دون ضغط:</b> مراجعة بطاقات المراجعة الذكية معه في نهاية الأسبوع للتأكد من زوال صعوبات الرياضيات.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
