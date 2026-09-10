import React, { useState } from "react";
import { AcademicUnitNote, UNIT_ACADEMIC_NOTES } from "../data/unitAcademicNotesData";
import { Unit, Subject } from "../types";
import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  Sparkles,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

interface UnitAcademicNotesSectionProps {
  unit: Unit;
  subject: Subject;
  academicNote?: AcademicUnitNote | null;
  onOpenLesson: (subjectId: string, lessonId: string) => void;
  onShowToast: (msg: string) => void;
}

export const UnitAcademicNotesSection: React.FC<UnitAcademicNotesSectionProps> = ({
  unit,
  subject,
  academicNote,
  onOpenLesson,
  onShowToast,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Fallback if specific academic note is not pre-defined
  const noteData = academicNote || UNIT_ACADEMIC_NOTES[unit.id] || null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    onShowToast("تم نسخ الشرح بنجاح 📋");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Academic Verified Badge */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                شرح أكاديمي منظم ومحرر (معتمد وزارياً)
              </span>
              <span className="text-xs text-indigo-300 font-semibold">
                بدون ذكاء اصطناعي • وفق نواتج تعلم 2026/2027
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {unit.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              ملخص تربوي مركز يشرح المفاهيم والقوانين بالورقة والقلم، يليه أمثلة محلولة بالخطوات لتثبيت المعلومة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-slate-200 border border-white/10">
              {unit.lessons.length} دروس في هذه الوحدة
            </span>
          </div>
        </div>
      </div>

      {noteData ? (
        <div className="space-y-6">
          {/* 1. Syllabus Objectives (مخرجات التعلم ونواتج الوحدة) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span>مخرجات ونواتج التعلم المستهدفة في امتحانات هذه الوحدة</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {noteData.syllabusObjectives.map((obj, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2"
                >
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Structured Theory (الشرح الأكاديمي المنظم) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>الشرح الأكاديمي المركز لعناصر الوحدة</span>
              </h4>
            </div>

            <div className="space-y-4">
              {noteData.structuredTheory.map((section, sIdx) => (
                <div
                  key={sIdx}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm sm:text-base text-slate-900">
                      {section.sectionTitle}
                    </h5>
                    <button
                      onClick={() => handleCopy(section.content.join("\n"), sIdx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-xs flex items-center gap-1"
                      title="نسخ هذا الجزء"
                    >
                      {copiedIndex === sIdx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[11px]">{copiedIndex === sIdx ? "تم النسخ" : "نسخ"}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {section.content.map((p, pIdx) => (
                      <p key={pIdx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        • {p}
                      </p>
                    ))}
                  </div>

                  {section.highlightBox && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{section.highlightBox}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Golden Rules & Definitions (القوانين والمفاهيم الذهبية) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="text-amber-500">⭐</span>
              <span>القوانين والمفاهيم الحاكمة في هذه الوحدة</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {noteData.keyRulesAndDefinitions.map((item, rIdx) => (
                <div
                  key={rIdx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {item.termOrLaw}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.importance === "تريك امتحانات"
                          ? "bg-rose-100 text-rose-800"
                          : item.importance === "عالي الأهمية"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {item.importance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-mono">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Step-by-Step Solved Examples (أمثلة وتطبيقات محلولة خطوة بخطوة) */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>✍️ مسائل وتطبيقات نموذجية محلولة بالخطوات</span>
            </h4>

            <div className="space-y-4">
              {noteData.stepByStepSolvedExamples.map((eg, eIdx) => (
                <div
                  key={eIdx}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        مثال نموذجي {eIdx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                        {eg.question}
                      </p>
                    </div>
                  </div>

                  {/* Solution Steps */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">خطوات الحل التفصيلية:</span>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      {eg.solutionSteps.map((step, s) => (
                        <div key={s} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {s + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-emerald-700">
                      <span>الناتج النهائي: {eg.result}</span>
                    </div>
                  </div>

                  {/* Teacher Insight */}
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-950 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">توجيه المعلم: </strong>
                      {eg.teacherInsight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Exam Tactics (تكتيكات امتحان البابل شيت) */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>تكتيكات امتحانية خاصة بهذه الوحدة</span>
            </h4>
            <div className="space-y-1.5 text-xs text-amber-900">
              {noteData.examTactics.map((tac, t) => (
                <div key={t} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{tac}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Standard generic structured academic view using the unit's lessons */
        <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-4">
          <FileText className="w-10 h-10 text-indigo-600 mx-auto" />
          <div>
            <h4 className="font-bold text-base text-slate-800">
              شرح الوحدة الأكاديمي المكتوب: {unit.title}
            </h4>
            <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1">
              تضم هذه الوحدة {unit.lessons.length} دروس رئيسية معتمدة في المنهج الوزاري 2026/2027. يمكنك الاطلاع على الشرح التفصيلي لكل درس مباشرة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
            {unit.lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => onOpenLesson(subject.id, lesson.id)}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-white transition cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    درس تفصيلي
                  </span>
                  <span className="text-xs text-slate-400">{lesson.durationMinutes} دقيقة</span>
                </div>
                <h5 className="font-bold text-sm text-slate-900">{lesson.title}</h5>
                <p className="text-xs text-slate-500 line-clamp-2">{lesson.simplifiedSummary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
