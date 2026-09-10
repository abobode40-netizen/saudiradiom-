import React, { useState } from "react";
import { Lesson, Subject, Unit } from "../../types";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  Bot,
  Search,
} from "lucide-react";

interface CurriculumViewProps {
  subjects: Subject[];
  onOpenLesson: (subjectId: string, lessonId: string) => void;
  onAskAi: (lessonTitle: string, subjectTitle: string) => void;
  onOpenUnitAi?: (unit: Unit, subject: Subject) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  subjects,
  onOpenLesson,
  onAskAi,
  onOpenUnitAi,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "math");
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>("math_u1");
  const [searchTerm, setSearchTerm] = useState("");

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const filteredUnits = currentSubject.units.map((unit) => ({
    ...unit,
    lessons: unit.lessons.filter((l) =>
      searchTerm.trim()
        ? l.title.includes(searchTerm) || l.description.includes(searchTerm)
        : true
    ),
  }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title & Official Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              📚 خريطة المناهج الدراسية
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              أولى ثانوي • 2026/2027
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            المحتوى المنظم وفق نواتج التعلم الوزارية والتقويم التربوي الشامل بجميع طرق الشرح بالذكاء الاصطناعي
          </p>
        </div>
      </div>

      {/* Official Guidelines Callout */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <div className="text-indigo-600 text-xl shrink-0 mt-0.5">ℹ️</div>
        <div className="text-xs text-indigo-900 leading-relaxed">
          <b>شرح تفاعلي شامل بالذكاء الاصطناعي:</b> يمكنك الآن شرح أي وحدة كاملة (Masterclass) أو فتح أي درس للاطلاع على 5 طرق شرح ذكية مختلفة (أكاديمي، تبسيط وقصص، خريطة ذهنية، حل خطوة بخطوة، وتريكات البابل شيت).
        </div>
      </div>

      {/* Subject Horizontal Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map((s) => {
          const isSelected = s.id === selectedSubjectId;
          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSubjectId(s.id);
                setExpandedUnitId(s.units[0]?.id || null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap border shrink-0 ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">{s.icon}</span>
              <span>{s.title.split(" ")[0]}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {s.units.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search within subject */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`ابحث عن أي درس أو مفهوم في ${currentSubject.title}...`}
          className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
      </div>

      {/* Units & Lessons List */}
      <div className="space-y-4">
        {filteredUnits.map((unit) => {
          const isExpanded = expandedUnitId === unit.id;
          return (
            <div
              key={unit.id}
              className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden transition"
            >
              {/* Unit Header */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <button
                  onClick={() => setExpandedUnitId(isExpanded ? null : unit.id)}
                  className="flex-1 flex items-center justify-between text-right hover:opacity-90 transition"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        الوحدة {unit.order}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {unit.lessons.length} دروس
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-800">{unit.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{unit.description}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-500 shrink-0 mr-3">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* AI Unit Explanation Action Button */}
                {onOpenUnitAi && (
                  <button
                    onClick={() => onOpenUnitAi(unit, currentSubject)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center"
                    title="شرح شامل ومترابط للوحدة كاملة بجميع الطرق بالذكاء الاصطناعي"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>شرح الوحدة بالذكاء الاصطناعي</span>
                  </button>
                )}
              </div>

              {/* Unit Lessons Accordion Body */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-slate-50/40 divide-y divide-slate-100">
                  {unit.lessons.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      لا توجد دروس تطابق بحثك
                    </div>
                  ) : (
                    unit.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="py-3.5 first:pt-3 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {lesson.isCompleted ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                مكتمل
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                قيد الدراسة
                              </span>
                            )}
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.durationMinutes} دقيقة
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-800">{lesson.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{lesson.description}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => onAskAi(lesson.title, currentSubject.title)}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition text-xs font-bold flex items-center gap-1"
                            title="اسأل المدرس الذكي عن هذا الدرس"
                          >
                            <Bot className="w-4 h-4" />
                            <span className="hidden sm:inline">اسأل AI</span>
                          </button>

                          <button
                            onClick={() => onOpenLesson(currentSubject.id, lesson.id)}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>فتح الدرس وشرح AI</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
