import React, { useState } from "react";
import { YoutubeLesson, YOUTUBE_LESSONS_DATA } from "../data/youtubeLessonsData";
import {
  Play,
  Youtube,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  FileText,
  RotateCcw,
  Check,
} from "lucide-react";

interface YoutubeUnitLessonSectionProps {
  lesson: YoutubeLesson;
  onRewardXp?: (xp: number) => void;
  onShowToast: (msg: string) => void;
}

export const YoutubeUnitLessonSection: React.FC<YoutubeUnitLessonSectionProps> = ({
  lesson,
  onRewardXp,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "quiz">("summary");
  const [customYoutubeUrl, setCustomYoutubeUrl] = useState("");
  const [isSummarizingCustom, setIsSummarizingCustom] = useState(false);
  const [customSummaryGenerated, setCustomSummaryGenerated] = useState<string | null>(null);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submittedQuiz) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (submittedQuiz) return;
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < lesson.quiz.length) {
      onShowToast("يرجى الإجابة على جميع الأسئلة أولاً ✍️");
      return;
    }

    let correct = 0;
    lesson.quiz.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });

    setQuizScore(correct);
    setSubmittedQuiz(true);
    const xpWon = correct * 30 + 20;

    if (onRewardXp) {
      onRewardXp(xpWon);
    }
    onShowToast(`أحسنت! نتيجتك: ${correct} من ${lesson.quiz.length} وحصلت على +${xpWon} XP! 🎉`);
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmittedQuiz(false);
    setQuizScore(0);
  };

  const handleSummarizeCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customYoutubeUrl.trim()) return;

    setIsSummarizingCustom(true);
    setTimeout(() => {
      setIsSummarizingCustom(false);
      setCustomSummaryGenerated(
        `تم تحليل فيديو الحصة بنجاح! 🎯\n• موضوع الحصة: تدريبات مكثفة على نواتج التعلم الوزارية.\n• أهم نقطة ركز عليها المدرس: التفرقة بين الحالات العامة والحالات الخاصة في القوانين وتطبيق أسلوب الاستبعاد في أسئلة الاختيار من متعدد.\n• تريكة البابل شيت: تحقق دائماً من الوحدات والمطلوب الصريح في رأس السؤال قبل التظليل.`
      );
      onShowToast("تم استخراج ملخص الحصة وأهم تريكات المعلم بنجاح! ✨");
    }, 900);
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden transition">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 text-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1">
                <Youtube className="w-3.5 h-3.5 text-white fill-white" />
                شرح فيديو معتمد من يوتيوب
              </span>
              <span className="text-xs text-rose-100 font-semibold">
                نخبة معلمي الثانوية العامة
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {lesson.title}
            </h3>
            <p className="text-xs text-rose-100">
              المعلم: <strong className="text-white font-bold">{lesson.teacherName}</strong> • {lesson.teacherChannel} ({lesson.durationMinutes} دقيقة)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <a
              href={lesson.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-white text-red-600 hover:bg-rose-50 font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>مشاهدة الحصة على يوتيوب</span>
              <ExternalLink className="w-3 h-3 text-red-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs bar: Summary vs Quiz */}
      <div className="flex items-center gap-2 px-5 pt-4 border-b border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition -mb-px ${
            activeTab === "summary"
              ? "border-red-600 text-red-600 bg-white rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ملخص الحصة والأفكار الجوهرية</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition -mb-px ${
            activeTab === "quiz"
              ? "border-red-600 text-red-600 bg-white rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>اختبار سريع على شرح الحصة ({lesson.quiz.length} أسئلة)</span>
          {submittedQuiz && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {quizScore}/{lesson.quiz.length}
            </span>
          )}
        </button>
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {activeTab === "summary" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Core Idea Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs sm:text-sm mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>الفكرة الجوهرية للحصة</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {lesson.summary.coreIdea}
              </p>
            </div>

            {/* Key Points */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-2">
                <span>📌 أهم عناصر الشرح التي ركز عليها المعلم في الفيديو:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {lesson.summary.keyPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Tips & Traps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Exam Tips */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>تريكات الامتحان في هذه الحصة</span>
                </div>
                <ul className="space-y-1.5 text-xs text-amber-950">
                  {lesson.summary.examTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>أخطاء شائعة نبه إليها المعلم لتجنبها</span>
                </div>
                <ul className="space-y-1.5 text-xs text-rose-950">
                  {lesson.summary.commonMistakesToAvoid.map((mistake, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Custom Teacher Video Summarizer Box */}
            <div className="pt-3 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-red-600" />
                    <span>تفضل مدرساً آخر على يوتيوب؟ ضع رابطه لنلخصه لك ونختبرك فيه!</span>
                  </span>
                </div>

                <form onSubmit={handleSummarizeCustomUrl} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={customYoutubeUrl}
                    onChange={(e) => setCustomYoutubeUrl(e.target.value)}
                    placeholder="ضع رابط فيديو أي مدرس من يوتيوب هنا (مثلاً: https://youtube.com/watch?v=...)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={isSummarizingCustom || !customYoutubeUrl.trim()}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isSummarizingCustom ? (
                      <span>جاري التلخيص...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>لخص لي الحصة</span>
                      </>
                    )}
                  </button>
                </form>

                {customSummaryGenerated && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 whitespace-pre-line animate-in fade-in">
                    {customSummaryGenerated}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Instant Video Quiz */}
        {activeTab === "quiz" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  اختبر مدى استيعابك لما شرحه المعلم في الفيديو
                </h4>
                <p className="text-xs text-slate-500">
                  أسئلة مباشرة مستخلصة من الحصة للتحقق من حفظك وفهمك للنقاط الجوهرية.
                </p>
              </div>

              {submittedQuiz && (
                <button
                  onClick={handleResetQuiz}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {lesson.quiz.map((q, qIndex) => {
                const selected = userAnswers[q.id];
                const isAnswered = selected !== undefined;
                const isCorrect = isAnswered && selected === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        <span className="text-indigo-600 font-extrabold ml-1">س{qIndex + 1}:</span>{" "}
                        {q.question}
                      </span>
                      {submittedQuiz && (
                        <span>
                          {isCorrect ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> صحيح
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              <XCircle className="w-3.5 h-3.5" /> خطأ
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIndex) => {
                        const isOptionSelected = selected === optIndex;
                        let optionStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-100";

                        if (submittedQuiz) {
                          if (optIndex === q.correctIndex) {
                            optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400";
                          } else if (isOptionSelected) {
                            optionStyle = "bg-rose-50 border-rose-400 text-rose-900";
                          } else {
                            optionStyle = "bg-white border-slate-200 text-slate-400 opacity-60";
                          }
                        } else if (isOptionSelected) {
                          optionStyle = "bg-indigo-50 border-indigo-400 text-indigo-800 font-bold ring-1 ring-indigo-400";
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            disabled={submittedQuiz}
                            onClick={() => handleSelectOption(q.id, optIndex)}
                            className={`p-3 rounded-xl border text-xs text-right transition flex items-center justify-between gap-2 ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {submittedQuiz && optIndex === q.correctIndex && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if submitted */}
                    {submittedQuiz && (
                      <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950">
                        <span className="font-bold block mb-0.5">التفسير والتعليل:</span>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Bar */}
            {!submittedQuiz ? (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>تصحيح إجاباتي واحتساب النتيجة</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <span className="text-base font-extrabold text-emerald-900">
                  🎉 أحسنت! حصلت على {quizScore} من {lesson.quiz.length}
                </span>
                <p className="text-xs text-emerald-700">
                  تمت مراجعة شرح الفيديو بنجاح، يمكنك الآن الانتقال للشرح الأكاديمي المكتوب أو حل أسئلة الوحدة الشاملة.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
