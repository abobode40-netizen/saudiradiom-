import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Youtube,
  Award,
  Bot,
  ChevronDown,
  ChevronUp,
  Play,
  Layers,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";

interface StudentGuideSectionProps {
  onStartSubject: (subjectId: string) => void;
  onNavigateToGeneralExams: () => void;
  onOpenYoutubeLessons?: () => void;
}

export const StudentGuideSection: React.FC<StudentGuideSectionProps> = ({
  onStartSubject,
  onNavigateToGeneralExams,
  onOpenYoutubeLessons,
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem("rafiq_guide_collapsed") !== "true";
  });

  const toggleExpanded = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    localStorage.setItem("rafiq_guide_collapsed", next ? "false" : "true");
  };

  const steps = [
    {
      step: 1,
      icon: "📚",
      badge: "الخطوة الأولى",
      title: "اختر المادة والوحدة من القائمة المنسدلة",
      desc: "كل مادة مقسمة إلى وحدات مستقلة ومبوبة وفق النظام الوزاري الحديث 2026/2027. اختر المادة التي ترغب في مذاكرتها.",
    },
    {
      step: 2,
      icon: "✍️",
      badge: "الخطوة الثانية",
      title: "ابدأ بالشرح الأكاديمي المكتوب (بدون AI)",
      desc: "اقرأ عناصر الوحدة، الشرح المركز، بطاقات القوانين الذهبية، والأمثلة المحلولة خطوة بخطوة بالورقة والقلم لترسيخ الفهم الأكاديمي أولاً.",
    },
    {
      step: 3,
      icon: "🎬",
      badge: "الخطوة الثالثة",
      title: "شاهد حصة نخبة معلمي يوتيوب واقرأ التلخيص",
      desc: "فيديوهات مختارة من أفضل معلمي الثانوية العامة في مصر لكل وحدة مع تلخيص ذكي لأهم النقاط وتريكات الامتحان واختبار فوري بعد المشاهدة.",
    },
    {
      step: 4,
      icon: "🎯",
      badge: "الخطوة الرابعة",
      title: "حل اختبارات الوحدات والاختبارات العامة",
      desc: "تدرّب على أسئلة الاختيار من متعدد بنمط البابل شيت، أكمل الفراغ، والأسئلة المقالية لتقييم مستواك الفعلي والحصول على درجات إتقان.",
    },
    {
      step: 5,
      icon: "🤖",
      badge: "الخطوة الخامسة",
      title: "استعن بالمعلم الذكي AI عند الحاجة",
      desc: "إذا استعصت عليك فكرة أو مسألة، اطلب من المعلم الذكي أن يبسطها، يشرحها بطرق متعددة، أو يحلها لك خطوة بخطوة مع أسئلة مشابهة.",
    },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white border border-indigo-500/20 shadow-xl overflow-hidden transition">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-950/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-2xl shrink-0">
            💡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                دليل الطالب السريع 2026/2027
              </span>
              <span className="text-[11px] text-amber-300 font-semibold">
                طريقة تشغيل البرنامج وتحقيق أقصى استفادة
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
              كيف تستفيد من منصة "رفيق الثانوية" خطوة بخطوة؟ 🚀
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={toggleExpanded}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
          >
            <span>{isExpanded ? "طي الدليل" : "عرض دليل الاستخدام"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body: 5 Interactive Steps */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/50 hover:bg-white/10 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-white/10 border border-white/10">
                      {s.icon}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                      {s.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white mb-1.5 group-hover:text-indigo-200 transition">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center text-[11px] text-indigo-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                  <span>خطوة معتمدة في المذاكرة</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Shortcuts inside Guide */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
            <div className="text-xs text-slate-300">
              ⚡ <strong>نصيحة ذهبية:</strong> ابدأ دائماً بالشرح الأكاديمي المكتوب أولاً لتكوين الأساس، ثم استعن بفيديو يوتيوب أو المعلم الذكي.
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onStartSubject("math")}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>ابدأ بمادة الرياضيات</span>
              </button>

              <button
                onClick={() => onStartSubject("integrated_science")}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs transition flex items-center gap-1.5 border border-white/10"
              >
                <span>العلوم المتكاملة</span>
              </button>

              <button
                onClick={onNavigateToGeneralExams}
                className="px-3.5 py-2 rounded-xl bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 font-bold text-xs transition flex items-center gap-1.5 border border-purple-400/30"
              >
                <Award className="w-3.5 h-3.5 text-purple-300" />
                <span>تصفح الاختبارات العامة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
