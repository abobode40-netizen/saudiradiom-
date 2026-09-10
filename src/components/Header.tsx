import React, { useState } from "react";
import { StudentProfile, GradeLevel, ViewMode, Subject } from "../types";
import {
  Menu,
  Timer,
  Bell,
  Sparkles,
  ChevronDown,
  Volume2,
  VolumeX,
  Award,
  BookOpen,
} from "lucide-react";
import {
  SubjectNavigationDropdown,
  GeneralExamsDropdown,
} from "./SubjectNavigationDropdown";

interface HeaderProps {
  profile: StudentProfile;
  currentView?: ViewMode;
  activeSubjectPortalTitle?: string;
  subjects?: Subject[];
  onSelectSubject?: (subjectId: string) => void;
  onNavigateToMonthlyExams?: () => void;
  onOpenGeneralExam?: (subjectId: string) => void;
  onOpenUnitNotes?: (subjectId: string, unitId: string) => void;
  onOpenUnitYoutube?: (subjectId: string, unitId: string) => void;
  onOpenUnitQuiz?: (subjectId: string, unitId: string) => void;
  onToggleSidebar: () => void;
  onOpenTimer: () => void;
  timerActive: boolean;
  timerSeconds: number;
  onGradeChange: (grade: GradeLevel) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onShowToast: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentView,
  activeSubjectPortalTitle,
  subjects = [],
  onSelectSubject,
  onNavigateToMonthlyExams,
  onOpenGeneralExam,
  onOpenUnitNotes,
  onOpenUnitYoutube,
  onOpenUnitQuiz,
  onToggleSidebar,
  onOpenTimer,
  timerActive,
  timerSeconds,
  onGradeChange,
  soundEnabled,
  onToggleSound,
  onShowToast,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const gradeNames: Record<GradeLevel, string> = {
    "1st_secondary": "الصف الأول الثانوي",
    "2nd_secondary": "الصف الثاني الثانوي",
    "3rd_secondary": "الصف الثالث الثانوي",
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-all">
      {/* Right Side: Sidebar Toggle, Greeting & Navigation Dropdowns */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition focus:outline-none shrink-0"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 tracking-tight">
                أهلاً يا {profile.name} 👋
              </h2>

              {/* Grade Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                  className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
                >
                  <span>{gradeNames[profile.gradeLevel]}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showGradeDropdown && (
                  <div className="absolute top-full right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase">
                      اختر المرحلة الدراسية
                    </div>
                    {(["1st_secondary", "2nd_secondary", "3rd_secondary"] as GradeLevel[]).map(
                      (g) => (
                        <button
                          key={g}
                          onClick={() => {
                            onGradeChange(g);
                            setShowGradeDropdown(false);
                            onShowToast(`تم الانتقال إلى منهج: ${gradeNames[g]}`);
                          }}
                          className={`w-full text-right px-3 py-2 text-xs font-semibold transition ${
                            profile.gradeLevel === g
                              ? "bg-indigo-50 text-indigo-700 font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {gradeNames[g]}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 hidden xl:block">
              المنظومة التعليمية المتكاملة 2026/2027 • قوائم منسدلة وشروحات معتمدة
            </p>
          </div>

          {/* Core Feature: Subjects & Units Dropdown */}
          {subjects.length > 0 && onSelectSubject && (
            <div className="hidden sm:block">
              <SubjectNavigationDropdown
                subjects={subjects}
                onSelectSubject={onSelectSubject}
                onOpenUnitNotes={onOpenUnitNotes}
                onOpenUnitYoutube={onOpenUnitYoutube}
                onOpenUnitQuiz={onOpenUnitQuiz}
                onOpenGeneralExam={onOpenGeneralExam}
                onNavigateToMonthlyExams={onNavigateToMonthlyExams}
                variant="header"
              />
            </div>
          )}

          {/* Core Feature: General Exams Dropdown */}
          {subjects.length > 0 && onOpenGeneralExam && onNavigateToMonthlyExams && (
            <div className="hidden md:block">
              <GeneralExamsDropdown
                subjects={subjects}
                onSelectSubjectGeneralExam={onOpenGeneralExam}
                onNavigateToMonthlyExams={onNavigateToMonthlyExams}
              />
            </div>
          )}
        </div>
      </div>

      {/* Left Side / Interactive Utilities */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Mobile quick subjects dropdown */}
        {subjects.length > 0 && onSelectSubject && (
          <div className="sm:hidden">
            <SubjectNavigationDropdown
              subjects={subjects}
              onSelectSubject={onSelectSubject}
              onOpenUnitNotes={onOpenUnitNotes}
              onOpenUnitYoutube={onOpenUnitYoutube}
              onOpenUnitQuiz={onOpenUnitQuiz}
              onOpenGeneralExam={onOpenGeneralExam}
              onNavigateToMonthlyExams={onNavigateToMonthlyExams}
              variant="header"
            />
          </div>
        )}

        {/* Study Timer Button */}
        <button
          onClick={onOpenTimer}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            timerActive
              ? "bg-emerald-600 text-white animate-pulse shadow-emerald-500/20"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
          }`}
          title="عداد المذاكرة المركز"
        >
          <Timer className="w-4 h-4" />
          <span className="hidden sm:inline">
            {timerActive ? formatTimer(timerSeconds) : "مؤقت التركيز"}
          </span>
        </button>

        {/* Sound Voice Assistant Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
          title={soundEnabled ? "الصوت مفعل" : "الصوت معطل"}
          aria-label="تبديل الصوت"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-indigo-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            aria-label="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-30 animate-in fade-in zoom-in-95 duration-150 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-800">تنبيهات منصة رفيق الثانوية</span>
                <span className="text-[10px] text-slate-400">اليوم</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100 flex items-start gap-2">
                  <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block">
                      القوائم المنسدلة وشروحات يوتيوب متاحة الآن!
                    </span>
                    <span className="text-amber-700 text-[11px]">
                      يمكنك تصفح كل مادة ووحداتها عبر القائمة المنسدلة بالأعلى، ومشاهدة ملخصات اليوتيوب المعتمدة.
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 block">
                      شرح أكاديمي منظم لكل وحدة
                    </span>
                    <span className="text-indigo-700 text-[11px]">
                      محرر بعناية بدون تشتت الذكاء الاصطناعي مع أمثلة محلولة بالورقة والقلم.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
