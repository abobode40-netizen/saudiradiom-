import React from "react";
import { StudentProfile, Subject, ViewMode } from "../../types";
import {
  Flame,
  Clock,
  Sparkles,
  Target,
  Play,
  ArrowLeft,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Award,
  Layers,
  GraduationCap,
} from "lucide-react";
import { StudentGuideSection } from "../StudentGuideSection";

interface HomeViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  onNavigate: (view: ViewMode) => void;
  onOpenSubjectDoor?: (subjectId: string) => void;
  onOpenLessonModal: (subjectId: string, lessonId: string) => void;
  onStartTimer: () => void;
  onShowToast: (msg: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  subjects,
  onNavigate,
  onOpenSubjectDoor,
  onOpenLessonModal,
  onStartTimer,
  onShowToast,
}) => {
  // Calculate overall progress across subjects
  const totalLessons = subjects.reduce((acc, s) => acc + s.totalLessons, 0);
  const completedLessons = subjects.reduce((acc, s) => acc + s.completedLessons, 0);
  const overallPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 37;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white p-6 sm:p-8 shadow-xl shadow-indigo-900/10 border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-xs border border-white/10 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              منظومة الأبواب التعليمية • العام الدراسي 2026 / 2027
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              جاهز لمذاكرة اليوم يا {profile.name}؟ 🚀
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
              كل مادة أصبحت الآن باباً مستقلاً يضم وحداتها وشروحاتها واختباراتها التكيفية، بالإضافة للباب المجمع للامتحانات الشهرية وتقييمات الأداء.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (onOpenSubjectDoor) {
                    onOpenSubjectDoor("math");
                  } else {
                    onNavigate("subject_portal");
                  }
                }}
                className="px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-lg shadow-indigo-950/20 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>دخول أبواب المواد</span>
              </button>
              <button
                onClick={() => onNavigate("monthly_exams")}
                className="px-4 py-3 rounded-2xl bg-amber-500/30 hover:bg-amber-500/40 text-amber-100 font-bold text-xs sm:text-sm border border-amber-300/30 transition flex items-center gap-2 backdrop-blur-xs"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>الامتحانات والتقييمات الشهرية</span>
              </button>
              <button
                onClick={() => onNavigate("external_books")}
                className="px-4 py-3 rounded-2xl bg-purple-500/30 hover:bg-purple-500/40 text-purple-100 font-bold text-xs sm:text-sm border border-purple-300/30 transition flex items-center gap-2 backdrop-blur-xs"
              >
                <BookOpen className="w-4 h-4 text-purple-300" />
                <span>الكتب الخارجية والـ PDF</span>
              </button>
            </div>
          </div>

          {/* Radial progress badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[170px] self-stretch md:self-auto flex flex-col items-center justify-center">
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {overallPercentage}%
            </div>
            <div className="text-xs text-indigo-100 font-semibold mt-1">
              إنجاز المنهج الدراسي
            </div>
            <div className="text-[11px] text-indigo-200 mt-0.5">
              {completedLessons} من {totalLessons} درس مكتمل
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Interactive Onboarding & Student Guide (شرح في البداية طريقة تشغيل البرنامج وكيف يستفيد منه الطالب) */}
      <StudentGuideSection
        onStartSubject={(subId) => {
          if (onOpenSubjectDoor) {
            onOpenSubjectDoor(subId);
          } else {
            onNavigate("subject_portal");
          }
        }}
        onNavigateToGeneralExams={() => onNavigate("monthly_exams")}
        onOpenYoutubeLessons={() => {
          if (onOpenSubjectDoor) {
            onOpenSubjectDoor("math");
          } else {
            onNavigate("subject_portal");
          }
        }}
      />

      {/* 4 Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 text-2xl shrink-0">
            🔥
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-800">
              {profile.streakDays} أيام
            </div>
            <div className="text-xs text-slate-500 font-medium">سلسلة المذاكرة</div>
          </div>
        </div>

        {/* Today Minutes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl shrink-0">
            ⏱️
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-800">
              {profile.todayMinutes} دقيقة
            </div>
            <div className="text-xs text-slate-500 font-medium">مذاكرة اليوم</div>
          </div>
        </div>

        {/* XP Points & Leaderboard Link */}
        <button
          onClick={() => onNavigate("achievements")}
          className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-amber-50/40 border border-slate-200/80 hover:border-amber-300 shadow-xs flex items-center gap-3.5 text-right transition group cursor-pointer"
          title="عرض لوحة الصدارة لأعلى 5 طلاب"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 text-2xl shrink-0 group-hover:scale-105 transition">
            🏆
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-bold text-slate-800 font-mono flex items-center gap-1.5">
              <span>{profile.xp} XP</span>
              <span className="text-[10px] font-sans font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                لوحة الصدارة
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium truncate">
              أعلى 5 طلاب • الترتيب
            </div>
          </div>
        </button>

        {/* Average Score */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-2xl shrink-0">
            🎯
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-800 font-mono">
              {profile.averageQuizScore}%
            </div>
            <div className="text-xs text-slate-500 font-medium">متوسط التقييمات</div>
          </div>
        </div>
      </div>

      {/* Highlighted Banner: Monthly Exams & Evaluations Portal */}
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-amber-600 via-orange-600 to-indigo-800 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold backdrop-blur-xs">
              الباب المشترك الشامل
            </span>
            <span className="text-xs text-amber-200 font-semibold">
              أكتوبر • نوفمبر • نصف العام
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            🏆 باب الامتحانات والتقييمات الشهرية العامة لكافة المواد
          </h3>
          <p className="text-xs text-amber-100 leading-relaxed font-normal">
            اختبارات مجمعة تحاكي الورقة الامتحانية الوزارية الشاملة لجميع المواد مع تشخيص آلي لمستوى التحصيل واستخراج شهادة التقييم.
          </p>
        </div>

        <button
          onClick={() => onNavigate("monthly_exams")}
          className="px-5 py-3 rounded-2xl bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
        >
          <span>دخول باب الامتحانات الشهرية</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* SUBJECT PORTALS GRID (كل مادة باب لوحدها) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>🚪 أبواب المواد الدراسية</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                شامل الشرح والاختبارات
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              كل مادة باب متكامل يحتوي على وحداتها، شروحاتها، اختبارات كل وحدة، واختباراتها العامة.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const pct = Math.round((subject.completedLessons / subject.totalLessons) * 100);

            return (
              <div
                key={subject.id}
                onClick={() => {
                  if (onOpenSubjectDoor) {
                    onOpenSubjectDoor(subject.id);
                  } else {
                    onNavigate("subject_portal");
                  }
                }}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition">
                      {subject.icon}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                      {subject.units.length} وحدات
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 mb-1">
                    باب {subject.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    شروحات كاملة • اختبارات الوحدات • اختبارات عامة
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">إنجاز الباب</span>
                    <span className="text-indigo-600 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{subject.completedLessons} من {subject.totalLessons} درساً</span>
                    <span className="text-indigo-600 font-bold group-hover:translate-x-[-2px] transition flex items-center">
                      <span>ادخل الباب</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Study Plan Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              جلسات تدريبية مقترحة اليوم
            </h3>
            <p className="text-xs text-slate-500">تم اختيارها لمساعدتك في الاستعداد للامتحانات الشهرية</p>
          </div>
          <button
            onClick={() => onNavigate("review")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
          >
            <span>عرض المراجعة الذكية</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-indigo-300 transition">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xl shrink-0">
                📐
              </div>
              <div>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  باب الرياضيات • الوحدة الأولى
                </span>
                <h4 className="font-bold text-sm text-slate-800 mt-1">
                  تحديد نوع جذري المعادلة التربيعية
                </h4>
                <p className="text-xs text-slate-500">تدريب تكيفي واختبار • 20 دقيقة</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onOpenSubjectDoor) {
                  onOpenSubjectDoor("math");
                } else {
                  onOpenLessonModal("math", "math_l2");
                }
              }}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition shrink-0"
            >
              فتح الباب
            </button>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-300 transition">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                🔬
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  باب العلوم المتكاملة • النظام البيئي
                </span>
                <h4 className="font-bold text-sm text-slate-800 mt-1">
                  خصائص الماء الفريدة وشذوذ الكثافة
                </h4>
                <p className="text-xs text-slate-500">شرح تفاعلي واختبار • 15 دقيقة</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onOpenSubjectDoor) {
                  onOpenSubjectDoor("integrated_science");
                } else {
                  onOpenLessonModal("integrated_science", "is_l1");
                }
              }}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition shrink-0"
            >
              فتح الباب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
