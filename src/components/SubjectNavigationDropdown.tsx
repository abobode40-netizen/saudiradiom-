import React, { useState, useRef, useEffect } from "react";
import { Subject, Unit, GradeLevel } from "../types";
import {
  ChevronDown,
  BookOpen,
  Award,
  Youtube,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  GraduationCap,
  Play,
  FileSpreadsheet,
} from "lucide-react";

interface SubjectNavigationDropdownProps {
  subjects: Subject[];
  activeSubjectId?: string;
  onSelectSubject: (subjectId: string) => void;
  onOpenUnitNotes?: (subjectId: string, unitId: string) => void;
  onOpenUnitYoutube?: (subjectId: string, unitId: string) => void;
  onOpenUnitQuiz?: (subjectId: string, unitId: string) => void;
  onOpenGeneralExam?: (subjectId: string) => void;
  onNavigateToMonthlyExams?: () => void;
  variant?: "header" | "inline";
}

export const SubjectNavigationDropdown: React.FC<SubjectNavigationDropdownProps> = ({
  subjects,
  activeSubjectId,
  onSelectSubject,
  onOpenUnitNotes,
  onOpenUnitYoutube,
  onOpenUnitQuiz,
  onOpenGeneralExam,
  onNavigateToMonthlyExams,
  variant = "header",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>(
    activeSubjectId || subjects[0]?.id || "math"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSubject =
    subjects.find((s) => s.id === activeSubjectTab) || subjects[0];

  const filteredUnits = currentSubject
    ? currentSubject.units.filter((u) =>
        searchTerm.trim()
          ? u.title.includes(searchTerm) || u.description.includes(searchTerm)
          : true
      )
    : [];

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
          isOpen
            ? "bg-indigo-600 text-white shadow-indigo-500/20"
            : variant === "header"
            ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
            : "bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 shadow-sm"
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <BookOpen className="w-4 h-4 text-indigo-500" />
        <span>قائمة المواد والوحدات</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-[340px] sm:w-[540px] md:w-[620px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ maxHeight: "85vh" }}
        >
          {/* Dropdown Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  فهرس المواد والوحدات المعتمد (2026/2027)
                </h4>
                <p className="text-[11px] text-slate-400">
                  اختر أي مادة لتصفح وحداتها، شروحاتها، يوتيوب، واختباراتها العامة
                </p>
              </div>
            </div>

            {onNavigateToMonthlyExams && (
              <button
                onClick={() => {
                  onNavigateToMonthlyExams();
                  setIsOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 text-[11px] font-bold transition flex items-center gap-1 shrink-0"
              >
                <span>🏆 الامتحانات الشهرية</span>
              </button>
            )}
          </div>

          {/* Subject Pills Tabs inside Dropdown */}
          <div className="flex items-center gap-1.5 p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-none">
            {subjects.map((s) => {
              const isSelected = s.id === activeSubjectTab;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSubjectTab(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200"
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.title.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Subject Details Bar */}
          {currentSubject && (
            <div className="p-3.5 bg-indigo-50/50 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-1.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                  {currentSubject.icon}
                </span>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                    باب {currentSubject.title}
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    {currentSubject.units.length} وحدات • {currentSubject.totalLessons} درساً
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectSubject(currentSubject.id);
                    setIsOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>دخول باب المادة بالكامل</span>
                </button>

                {onOpenGeneralExam && (
                  <button
                    onClick={() => {
                      onOpenGeneralExam(currentSubject.id);
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition flex items-center gap-1"
                    title="بدء اختبار عام على منهج هذه المادة"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>اختبار عام</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Units List with direct actions */}
          <div className="p-3.5 max-h-[340px] overflow-y-auto space-y-2.5 scrollbar-thin">
            <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
              <span>وحدات المادة المختارة:</span>
              <span>انقر للانتقال المباشر لأي قسم</span>
            </div>

            {filteredUnits.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                لا توجد وحدات
              </div>
            ) : (
              filteredUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 ml-1">
                        الوحدة {unit.order}
                      </span>
                      <h6 className="font-bold text-xs sm:text-sm text-slate-900 inline">
                        {unit.title}
                      </h6>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {unit.description}
                      </p>
                    </div>
                  </div>

                  {/* 4 Direct Shortcuts for this Unit */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-slate-100">
                    {/* 1. Academic Notes (No AI) */}
                    <button
                      onClick={() => {
                        if (onOpenUnitNotes) {
                          onOpenUnitNotes(currentSubject.id, unit.id);
                        } else {
                          onSelectSubject(currentSubject.id);
                        }
                        setIsOpen(false);
                      }}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-bold border border-slate-200 transition flex items-center justify-center gap-1"
                      title="شرح أكاديمي منظم ومحرر للوحدة بدون ذكاء اصطناعي"
                    >
                      <BookOpen className="w-3 h-3 text-indigo-600" />
                      <span>شرح الوحدة</span>
                    </button>

                    {/* 2. YouTube & Summary */}
                    <button
                      onClick={() => {
                        if (onOpenUnitYoutube) {
                          onOpenUnitYoutube(currentSubject.id, unit.id);
                        } else {
                          onSelectSubject(currentSubject.id);
                        }
                        setIsOpen(false);
                      }}
                      className="p-2 rounded-xl bg-rose-50/70 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 transition flex items-center justify-center gap-1"
                      title="شرح يوتيوب وتلخيص الحصة واختبارها"
                    >
                      <Youtube className="w-3 h-3 text-red-600" />
                      <span>يوتيوب وتلخيص</span>
                    </button>

                    {/* 3. Unit Quizzes */}
                    <button
                      onClick={() => {
                        if (onOpenUnitQuiz) {
                          onOpenUnitQuiz(currentSubject.id, unit.id);
                        } else {
                          onSelectSubject(currentSubject.id);
                        }
                        setIsOpen(false);
                      }}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition flex items-center justify-center gap-1"
                      title="اختبارات هذه الوحدة"
                    >
                      <Award className="w-3 h-3 text-amber-600" />
                      <span>اختبار الوحدة</span>
                    </button>

                    {/* 4. Open Door / Lessons */}
                    <button
                      onClick={() => {
                        onSelectSubject(currentSubject.id);
                        setIsOpen(false);
                      }}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200 transition flex items-center justify-center gap-1"
                    >
                      <Play className="w-3 h-3 text-indigo-600 fill-current" />
                      <span>دروس الوحدة</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Dropdown for General Exams across subjects
 */
interface GeneralExamsDropdownProps {
  subjects: Subject[];
  onSelectSubjectGeneralExam: (subjectId: string) => void;
  onNavigateToMonthlyExams: () => void;
}

export const GeneralExamsDropdown: React.FC<GeneralExamsDropdownProps> = ({
  subjects,
  onSelectSubjectGeneralExam,
  onNavigateToMonthlyExams,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-right" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
          isOpen
            ? "bg-purple-600 text-white"
            : "bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200"
        }`}
      >
        <Award className="w-4 h-4 text-purple-600" />
        <span>اختبارات عامة</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              الاختبارات العامة الشاملة
            </span>
            <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
              نماذج وزارية
            </span>
          </div>

          <div className="p-2 space-y-1">
            {/* Monthly comprehensive exam */}
            <button
              onClick={() => {
                onNavigateToMonthlyExams();
                setIsOpen(false);
              }}
              className="w-full text-right p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🏆</span>
                <div>
                  <span className="text-xs font-bold text-amber-950 block">
                    الامتحان الشهري المجمع (جميع المواد)
                  </span>
                  <span className="text-[10px] text-amber-800">
                    ورقة امتحانية مجمعة تحاكي امتحان الوزارة
                  </span>
                </div>
              </div>
            </button>

            <div className="pt-1 px-1 text-[11px] font-bold text-slate-400">
              اختبارات عامة لكل مادة:
            </div>

            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  onSelectSubjectGeneralExam(sub.id);
                  setIsOpen(false);
                }}
                className="w-full text-right p-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 hover:text-slate-900"
              >
                <div className="flex items-center gap-2">
                  <span>{sub.icon}</span>
                  <span className="font-semibold">امتحان عام: {sub.title}</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                  بدء
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
