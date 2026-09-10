import React, { useState } from "react";
import { Subject, StudentProfile } from "../types";
import {
  MonthlyAchievementReport,
  AVAILABLE_REPORT_MONTHS,
  buildMonthlyAchievementReport,
  SmartTargetItem,
} from "../data/monthlyAchievementReportData";
import { MonthlyExamEvaluation } from "../data/monthlyExamsData";
import {
  Award,
  Sparkles,
  TrendingUp,
  Printer,
  Share2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  SlidersHorizontal,
  ChevronLeft,
  BookOpen,
  Target,
  GraduationCap,
  Brain,
  Lightbulb,
  Check,
} from "lucide-react";

interface MonthlyAchievementReportSectionProps {
  profile: StudentProfile;
  subjects: Subject[];
  evaluations: MonthlyExamEvaluation[];
  onOpenSubjectDoor: (subjectId: string) => void;
  onShowToast: (msg: string) => void;
}

export const MonthlyAchievementReportSection: React.FC<MonthlyAchievementReportSectionProps> = ({
  profile,
  subjects,
  evaluations,
  onOpenSubjectDoor,
  onShowToast,
}) => {
  const [selectedMonthId, setSelectedMonthId] = useState<string>("october");

  // Generate current report data
  const report: MonthlyAchievementReport = buildMonthlyAchievementReport(
    profile,
    subjects,
    evaluations,
    selectedMonthId
  );

  // Checkable checklist state
  const [checklist, setChecklist] = useState<SmartTargetItem[]>(() => {
    return report.actionPlan.smartActionChecklist;
  });

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
    onShowToast("تم تحديث حالة هدف التحسين في خطتك الشهرية! ✨");
  };

  // Interactive Target Simulator State
  const [simulatorBoost, setSimulatorBoost] = useState<number>(10);
  const lowestSubjects = [...report.subjectPerformances].sort(
    (a, b) => a.percentage - b.percentage
  ).slice(0, 2);

  const simulatedTotalScore = Math.min(
    report.maxScore,
    Math.round(
      report.totalScore +
        lowestSubjects.reduce(
          (acc, sub) => acc + (sub.maxScore * (simulatorBoost / 100)),
          0
        )
    )
  );
  const simulatedPercentage = Math.min(
    100,
    Math.round((simulatedTotalScore / report.maxScore) * 100)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Month Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Calendar className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800">
              تقرير شهر إنجاز العام (تجميع أداء كافة المواد)
            </h3>
            <p className="text-xs text-slate-500">
              اختر الشهر لعرض التحليل الشامل المجمع لنتائجك في كافة المواد
            </p>
          </div>
        </div>

        {/* Month Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {AVAILABLE_REPORT_MONTHS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMonthId(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                selectedMonthId === m.id
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= HERO ACHIEVEMENT CERTIFICATE ================= */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/15">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                تقرير شهر إنجاز الأكاديمي الشامل
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10 font-semibold">
                العام الدراسي {report.academicYear}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
              سجل الإنجاز الشهري المجمع: {report.monthName}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300">
              الطالب المعتمد: <span className="text-white font-bold">{report.studentName}</span> • الصف: الأول الثانوي • تاريخ الرصد: {report.generatedDate}
            </p>
          </div>

          {/* Master Aggregate Score Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[210px] self-start md:self-auto flex flex-col items-center justify-center">
            <div className="text-xs text-amber-200 font-bold mb-1">المعدل العام التراكمي</div>
            <div className="text-4xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight">
              {report.overallPercentage}%
            </div>
            <div className="text-xs text-white font-bold mt-1">
              {report.totalScore} من أصل {report.maxScore} درجة
            </div>
            <div className="mt-2 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {report.overallGrade}
            </div>
          </div>
        </div>

        {/* 4 Stat Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {report.subjectPerformances.length} مواد
            </div>
            <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
              تغطية المنهج الوزاري
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {report.studyHours} ساعة
            </div>
            <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
              ساعات المذاكرة الموثقة
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
              +{report.xpEarned} XP
            </div>
            <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
              نقاط الخبرة المكتسبة
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">
              {report.completedExamsCount} اختبار
            </div>
            <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
              نماذج شاملة منجزة
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة تقرير شهر إنجاز</span>
            </button>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(
                    `تقرير شهر إنجاز للطالب ${report.studentName} - النسبة المجمعة: ${report.overallPercentage}% (${report.overallGrade}) في العام الدراسي 2026/2027`
                  );
                  onShowToast("تم نسخ ملخص تقرير الإنجاز بنجاح للمشاركة! 📋");
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة ملخص الإنجاز</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            تحديث فوري بناءً على أحدث جلسات الاختبارات
          </div>
        </div>
      </div>

      {/* ================= CROSS-SUBJECT PERFORMANCE MATRIX ================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              مصفوفة أداء المواد الست (النتائج التفصيلية ونقاط الضعف)
            </h3>
            <p className="text-xs text-slate-500">
              تجميع نتائجك في كل مادة خلال هذا الشهر مع التوجيه العلاجي الخاص بكل باب
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            6 مواد معتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.subjectPerformances.map((sub) => (
            <div
              key={sub.subjectId}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-2xl bg-slate-50 border border-slate-100">
                      {sub.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {sub.subjectTitle}
                      </h4>
                      <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                        <span>{sub.score} من {sub.maxScore} درجة</span>
                        {sub.trend === "up" && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" />
                            +{sub.trendDelta}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${sub.gradeBadgeClass}`}>
                    {sub.percentage}% • {sub.gradeLabel}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.percentage >= 85
                        ? "bg-emerald-500"
                        : sub.percentage >= 75
                        ? "bg-indigo-500"
                        : sub.percentage >= 65
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${sub.percentage}%` }}
                  />
                </div>

                {/* Strengths & Weaknesses */}
                <div className="mt-4 space-y-2 text-xs">
                  {sub.strengths.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">أتقنت: </span>
                        {sub.strengths.join(" • ")}
                      </div>
                    </div>
                  )}

                  {sub.weaknesses.length > 0 ? (
                    <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-rose-900 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">يحتاج تركيز: </span>
                        {sub.weaknesses.join(" • ")}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">الحالة: </span>
                        إتقان كامل لأساسيات ونواتج تعلم الباب
                      </div>
                    </div>
                  )}

                  {/* Recommendation Quote */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">نصيحة المدرس: </span>
                      {sub.recommendation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Door Button */}
              <button
                onClick={() => onOpenSubjectDoor(sub.subjectId)}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-200 text-xs font-bold transition flex items-center justify-center gap-1.5 mt-2"
              >
                <span>فتح باب {sub.subjectTitle} ومراجعة الدروس</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= COGNITIVE TRACK BALANCE ================= */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Brain className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              مؤشر التوازن المعرفي (المسار العلمي والمسار الإنساني/اللغوي)
            </h3>
            <p className="text-xs text-slate-500">
              تحليل التناسق بين استيعابك للمفاهيم الرياضية والعلمية مقارنة باللغات والعلوم الإنسانية
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Science Track */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>🔬</span>
                <span>المسار العلمي (الرياضيات + العلوم المتكاملة)</span>
              </span>
              <span className="font-mono font-bold text-indigo-700 text-sm">
                {report.scienceTrackAvg}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${report.scienceTrackAvg}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              يقيس التفكير التجريدي، حل المسائل المركبة، واستيعاب المفاهيم البيئية والكيميائية.
            </p>
          </div>

          {/* Humanities Track */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>📖</span>
                <span>المسار الإنساني واللغوي (العربية + الإنجليزية + الفلسفة + التاريخ)</span>
              </span>
              <span className="font-mono font-bold text-amber-700 text-sm">
                {report.humanitiesTrackAvg}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${report.humanitiesTrackAvg}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              يقيس الفهم القرائي، القواعد النحوية، الثروة اللغوية، والتحليل المنطقي والتاريخي.
            </p>
          </div>
        </div>

        {/* Track Balance Conclusion */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">تشخيص التوازن التربوي: </span>
            {report.trackBalanceAnalysis}
          </div>
        </div>
      </div>

      {/* ================= HONORS & AWARDS OF THE MONTH ================= */}
      {report.topHonors.length > 0 && (
        <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-50/50 to-indigo-50/40 border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-800">
                أوسمة الإنجاز والتميز لشهر {report.monthName}
              </h3>
            </div>
            <span className="text-xs text-amber-700 font-bold">
              {report.topHonors.length} أوسمة فخرية
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {report.topHonors.map((honor) => (
              <div
                key={honor.id}
                className={`p-4 rounded-2xl bg-white border ${honor.borderColor} shadow-2xs space-y-1.5`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{honor.icon}</span>
                  <h4 className={`text-xs sm:text-sm font-bold ${honor.textColor}`}>
                    {honor.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {honor.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= KNOWLEDGE GAPS & TARGETED REMEDIES ================= */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
              <AlertCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                رادار الثغرات والمفاهيم المحتاجة لدعم فوري
              </h3>
              <p className="text-xs text-slate-500">
                المفاهيم التي رُصد فيها خطأ أثناء اختبارات الشهر، مرتبة حسب الأولوية لمعالجتها
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold">
            {report.knowledgeGaps.length} مفاهيم مستهدفة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {report.knowledgeGaps.map((gap) => (
            <div
              key={gap.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{gap.icon}</span>
                    <span className="text-xs font-bold text-slate-800">
                      باب {gap.subjectTitle}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      gap.priority === "high"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {gap.priority === "high" ? "أولوية قصوى ⚡" : "أولوية متوسطة ⏳"}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2">
                  {gap.concept}
                </h4>

                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {gap.impact}
                </p>
              </div>

              <button
                onClick={() => onOpenSubjectDoor(gap.subjectId)}
                className="w-full py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>{gap.actionText}</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= SMART ACTION PLAN & IMPROVEMENT SUGGESTIONS ================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Lightbulb className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                خطة التحسين المخصصة واقتراحات التطوير الذكية للشهر القادم
              </h3>
              <p className="text-xs text-slate-400">
                توجيهات تعليمية منهجية مخصصة ومبنية على نقاط ضعفك المرصودة
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold self-start sm:self-auto">
            مُحدثة بالذكاء الاصطناعي التربوي
          </span>
        </div>

        {/* AI Executive Summary */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>التقرير التشخيصي والتوجيه العام للمستقبل:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {report.actionPlan.aiExecutiveSummary}
          </p>
        </div>

        {/* 2 Methodologies Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <span>📐</span>
              <span>طريقة مذاكرة المواد العلمية والرياضية:</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.actionPlan.scienceMethodology}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>📖</span>
              <span>طريقة مذاكرة اللغات والعلوم الإنسانية:</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.actionPlan.languagesMethodology}
            </p>
          </div>
        </div>

        {/* 4-Week Study Booster Schedule */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>الجدول الأسبوعي المقترح لتنفيذ التحسين (4 أسابيع):</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.actionPlan.weeklySchedule.map((sch, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <span>{sch.icon}</span>
                      <span>{sch.week}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sch.suggestedHours} ساعات
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-semibold mt-2 leading-relaxed">
                    {sch.focus}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1">
                  {sch.subjectNames.map((sn, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-semibold"
                    >
                      {sn}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive SMART Target Checklist */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>أهداف التحسين المحددة (اضغط على الهدف عند إنجازه):</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {checklist.filter((c) => c.isCompleted).length} من {checklist.length} منجز
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {checklist.map((target) => (
              <button
                key={target.id}
                onClick={() => toggleChecklistItem(target.id)}
                className={`text-right p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  target.isCompleted
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-xl flex items-center justify-center border text-xs shrink-0 transition ${
                      target.isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-400 bg-transparent text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <div>
                    <div
                      className={`text-xs sm:text-sm font-semibold leading-relaxed ${
                        target.isCompleted ? "line-through opacity-70" : ""
                      }`}
                    >
                      {target.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      الموعد المقترح: {target.targetDate}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= INTERACTIVE TARGET SIMULATOR ================= */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-indigo-50 via-white to-amber-50 border border-indigo-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                محاكي تحسين الدرجات التفاعلي (Target Simulator)
              </h3>
              <p className="text-xs text-slate-600">
                شاهد كيف سيرتفع معدلك العام التراكمي بمجرد معالجة نقاط الضعف في أقل مادتين
              </p>
            </div>
          </div>

          {/* Simulated Result Tag */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-indigo-200 shadow-2xs self-start sm:self-auto">
            <span className="text-xs text-slate-600 font-bold">النسبة المتوقعة:</span>
            <span className="text-xl font-black text-indigo-700 font-mono">
              {simulatedPercentage}%
            </span>
            <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +{simulatedPercentage - report.overallPercentage}%
            </span>
          </div>
        </div>

        {/* Boost Level Range */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>نسبة التحسين المستهدفة في المادتين الأقل:</span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-mono">
              +{simulatorBoost}% تحسن
            </span>
          </div>

          <input
            type="range"
            min={5}
            max={25}
            step={5}
            value={simulatorBoost}
            onChange={(e) => setSimulatorBoost(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>+5% (تحسن تدريجي)</span>
            <span>+15% (قفزة نوعية)</span>
            <span>+25% (امتياز تام)</span>
          </div>
        </div>

        {/* Target Subjects Impact Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {lowestSubjects.map((sub) => {
            const boostedScore = Math.min(
              sub.maxScore,
              Math.round(sub.score + (sub.maxScore * (simulatorBoost / 100)))
            );
            const boostedPct = Math.min(
              100,
              Math.round((boostedScore / sub.maxScore) * 100)
            );

            return (
              <div
                key={sub.subjectId}
                className="p-3.5 rounded-2xl bg-white border border-indigo-100 text-xs flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{sub.icon}</span>
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {sub.subjectTitle}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      الحالي: {sub.score}/{sub.maxScore} ({sub.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="font-mono font-bold text-indigo-700 text-sm block">
                    {boostedScore}/{sub.maxScore}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {boostedPct}% بعد العلاج
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
