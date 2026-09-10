import React from "react";
import { ViewMode, StudentProfile, Subject } from "../types";
import { INITIAL_SUBJECTS } from "../data/curriculumData";
import {
  Home,
  BookOpen,
  Bot,
  FileQuestion,
  Brain,
  BarChart3,
  Users,
  Search,
  Trophy,
  Flame,
  Sparkles,
  X,
  Award,
  Layers,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  currentView: ViewMode;
  activeSubjectPortalId?: string;
  subjects?: Subject[];
  onSelectView?: (view: ViewMode) => void;
  onNavigate?: (view: ViewMode) => void;
  onSelectSubjectDoor?: (subjectId: string) => void;
  isOpen?: boolean;
  isMobileOpen?: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
  profile: StudentProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeSubjectPortalId,
  subjects,
  onSelectView,
  onNavigate,
  onSelectSubjectDoor,
  isOpen,
  isMobileOpen,
  onClose,
  onCloseMobile,
  profile,
}) => {
  const subjectsList = subjects && subjects.length > 0 ? subjects : INITIAL_SUBJECTS;
  const mobileOpen = isOpen ?? isMobileOpen ?? false;

  const handleClose = () => {
    if (onClose) onClose();
    if (onCloseMobile) onCloseMobile();
  };

  const handleNav = (v: ViewMode) => {
    if (onNavigate) onNavigate(v);
    else if (onSelectView) onSelectView(v);
    handleClose();
  };

  const handleSubjectSelect = (subId: string) => {
    if (onSelectSubjectDoor) {
      onSelectSubjectDoor(subId);
    } else {
      handleNav("subject_portal");
    }
    handleClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 right-0 bottom-0 w-64 bg-slate-900 text-slate-100 flex flex-col z-40 transition-transform duration-300 ease-in-out border-l border-slate-800 ${
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 pb-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20">
              🎓
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                رفيق الثانوية
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
                  2026/2027
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">نظام الأبواب التعليمية</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Profile Card */}
        <button
          onClick={() => handleNav("achievements")}
          className="mx-3 mt-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-right transition cursor-pointer group"
          title="عرض لوحة الصدارة وقائمة الإنجازات"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1 group-hover:text-amber-300 transition">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              المستوى {profile.level}
            </span>
            <span className="text-indigo-300 font-bold font-mono">{profile.xp} XP</span>
          </div>
          <div className="w-full bg-slate-700/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (profile.xp % 500) / 5)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span className="flex items-center gap-1 text-orange-400 font-bold">
              <Flame className="w-3 h-3 fill-orange-400" />
              {profile.streakDays} أيام مستمرة
            </span>
            <span className="text-amber-300/80 group-hover:text-amber-300 font-bold flex items-center gap-0.5">
              <span>لوحة الصدارة</span>
              <ChevronLeft className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* Navigation Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Section 1: Home / Hub */}
          <div>
            <button
              onClick={() => handleNav("home")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                currentView === "home"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4" />
                <span>الرئيسية وفهرس الأبواب</span>
              </div>
            </button>
          </div>

          {/* Section 2: Subject Doors (كل مادة باب لوحدها) */}
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>🚪 أبواب المواد الدراسية</span>
              <span className="text-[10px] text-indigo-400 font-normal">شامل المنهج</span>
            </div>

            {subjectsList.map((sub) => {
              const isDoorActive =
                currentView === "subject_portal" && activeSubjectPortalId === sub.id;
              const completedRatio = `${sub.completedLessons}/${sub.totalLessons}`;

              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubjectSelect(sub.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isDoorActive
                      ? "bg-indigo-600 text-white font-bold shadow-xs"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base shrink-0">{sub.icon}</span>
                    <span className="truncate">باب {sub.title.split(" ")[0]}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full shrink-0 font-mono ${
                      isDoorActive
                        ? "bg-indigo-700 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {completedRatio}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Section 3: Monthly Comprehensive Exams Door */}
          <div>
            <div className="px-2 pb-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              <span>🏆 الباب المشترك لجميع المواد</span>
            </div>

            <button
              onClick={() => handleNav("monthly_exams")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border ${
                currentView === "monthly_exams"
                  ? "bg-linear-to-r from-amber-600 to-indigo-600 text-white border-amber-400 shadow-md font-bold"
                  : "bg-amber-950/20 text-amber-200 border-amber-500/30 hover:bg-amber-900/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="truncate">الامتحانات والتقييمات الشهرية</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0 font-bold">
                شامل
              </span>
            </button>
          </div>

          {/* Section 4: General Learning Tools */}
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>الأدوات والمتابعة</span>
            </div>

            <button
              onClick={() => handleNav("ai")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === "ai"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>المدرس الذكي العام</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300">
                AI
              </span>
            </button>

            <button
              onClick={() => handleNav("review")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === "review"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Brain className="w-4 h-4" />
                <span>المراجعة الذكية والبطاقات</span>
              </div>
            </button>

            <button
              onClick={() => handleNav("achievements")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === "achievements"
                  ? "bg-amber-600 text-white font-bold shadow-xs"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>لوحة الصدارة والإنجازات</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Top 5
              </span>
            </button>

            <button
              onClick={() => handleNav("progress")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === "progress"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>تحليلي وتقدمي الدراسي</span>
              </div>
            </button>

            <button
              onClick={() => handleNav("parent")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === "parent"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>بوابة ولي الأمر</span>
              </div>
            </button>

            <button
              onClick={() => handleNav("curriculum")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === "curriculum"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>فهرس المناهج والوحدات</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-center">
          <div className="text-[10px] text-slate-400 font-medium">
            مناهج وزارة التعليم المصرية 2026/2027
          </div>
        </div>
      </aside>
    </>
  );
};
