import React, { useState, useMemo } from "react";
import { QuizQuestion, StudentProfile, Subject, Unit, QuizQuestionType } from "../../types";
import {
  FileQuestion,
  Zap,
  Target,
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Clock,
  ArrowLeft,
  ChevronLeft,
  BookOpen,
  Brain,
  PenTool,
  Send,
  Lightbulb,
  Check,
  Layers,
  Award,
  ChevronDown,
  Scale,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  getUnitMasteryInfo,
  checkFillBlankAnswer,
  getNextAdaptiveDifficulty,
  getUnitDiverseQuestions,
} from "../../utils/quizUtils";

interface QuizzesViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  presetQuestions: QuizQuestion[];
  onFinishQuiz: (scorePercent: number, correctCount: number, totalCount: number, xpEarned: number) => void;
  onShowToast: (msg: string) => void;
}

export const QuizzesView: React.FC<QuizzesViewProps> = ({
  profile,
  subjects,
  presetQuestions,
  onFinishQuiz,
  onShowToast,
}) => {
  // Navigation & Selection States
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "math");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("all");

  // Active Quiz States
  const [activeQuizType, setActiveQuizType] = useState<
    "adaptive_unit" | "diverse_unit" | "essay_focus" | "fill_blank_focus" | "true_false_focus" | "quick" | "ai_custom" | null
  >(null);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState(false);

  // Question Interaction States
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<boolean | null>(null);
  const [fillBlankInput, setFillBlankInput] = useState("");
  const [essayInput, setEssayInput] = useState("");
  const [answeredState, setAnsweredState] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);
  const [essaySelfRating, setEssaySelfRating] = useState<"full" | "half" | "none" | null>(null);
  const [revealedHint, setRevealedHint] = useState(false);

  // Adaptive Engine States
  const [currentAdaptiveDifficulty, setCurrentAdaptiveDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [adaptiveMessage, setAdaptiveMessage] = useState("");
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  // Score Accumulator
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [earnedXpTotal, setEarnedXpTotal] = useState(0);

  // Custom AI quiz form states
  const [customTopic, setCustomTopic] = useState("");
  const [customQuestionType, setCustomQuestionType] = useState<QuizQuestionType | "mixed">("mixed");
  const [customDifficulty, setCustomDifficulty] = useState<"adaptive" | "easy" | "medium" | "hard">("adaptive");
  const [customCount, setCustomCount] = useState(4);

  // Active Subject & Unit Computations
  const currentSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) || subjects[0],
    [subjects, selectedSubjectId]
  );

  const currentUnit = useMemo(() => {
    if (selectedUnitId === "all" || !currentSubject) return null;
    return currentSubject.units.find((u) => u.id === selectedUnitId) || null;
  }, [currentSubject, selectedUnitId]);

  // Unit Mastery Calculations
  const unitMastery = useMemo(() => getUnitMasteryInfo(currentUnit), [currentUnit]);

  // Overall Subject Mastery
  const subjectTotalLessons = useMemo(() => {
    if (!currentSubject) return 0;
    return currentSubject.units.reduce((acc, u) => acc + u.lessons.length, 0);
  }, [currentSubject]);

  const subjectCompletedLessons = useMemo(() => {
    if (!currentSubject) return 0;
    return currentSubject.units.reduce(
      (acc, u) => acc + u.lessons.filter((l) => l.isCompleted).length,
      0
    );
  }, [currentSubject]);

  const subjectProgressPercent = subjectTotalLessons > 0
    ? Math.round((subjectCompletedLessons / subjectTotalLessons) * 100)
    : 0;

  // Reset answer states when loading questions
  const initQuizState = (questions: QuizQuestion[], mode: any) => {
    setCurrentQuestions(questions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setSelectedTrueFalse(null);
    setFillBlankInput("");
    setEssayInput("");
    setAnsweredState(false);
    setIsCurrentCorrect(null);
    setEssaySelfRating(null);
    setRevealedHint(false);
    setCorrectAnswersCount(0);
    setIsQuizCompleted(false);
    setAdaptiveMessage("");
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
    setActiveQuizType(mode);
  };

  // Launch Adaptive Unit Quiz
  const handleStartAdaptiveUnitQuiz = async (unitOverride?: Unit | null) => {
    const targetUnit = unitOverride !== undefined ? unitOverride : currentUnit;
    setIsGeneratingAiQuiz(true);
    onShowToast(`جاري تشغيل الاختبار التكيفي لوحدة "${targetUnit?.title || currentSubject?.title}"... 🎯`);

    const initialDiff = unitMastery.recommendedDifficulty;
    setCurrentAdaptiveDifficulty(initialDiff);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentSubject.title,
          unitTitle: targetUnit?.title || "الوحدة المحددة",
          topic: targetUnit ? targetUnit.lessons.map((l) => l.title).join(" و ") : currentSubject.title,
          grade: profile.gradeLevel,
          difficulty: "adaptive",
          studentLevel: unitMastery.level,
          questionTypes: "mixed",
          count: 6,
        }),
      });

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        initQuizState(data.questions, "adaptive_unit");
      } else {
        const fallbacks = getUnitDiverseQuestions(currentSubject, targetUnit, "mixed", "adaptive", 6);
        initQuizState(fallbacks, "adaptive_unit");
      }
    } catch (e) {
      console.error(e);
      const fallbacks = getUnitDiverseQuestions(currentSubject, targetUnit, "mixed", "adaptive", 6);
      initQuizState(fallbacks, "adaptive_unit");
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  // Launch Diverse Unit Quiz (Paper exam style)
  const handleStartDiverseUnitQuiz = async (
    filterType: QuizQuestionType | "mixed" = "mixed",
    unitOverride?: Unit | null,
    countOverride?: number
  ) => {
    const targetUnit = unitOverride !== undefined ? unitOverride : currentUnit;
    const targetCount = countOverride || (filterType === "mixed" ? 8 : 6);
    setIsGeneratingAiQuiz(true);
    onShowToast(
      filterType === "true_false"
        ? "جاري إعداد بنك الصواب والخطأ وتصويب المفاهيم الوزارية... ⚖️"
        : filterType === "multiple_choice"
        ? "جاري إعداد نماذج بابل شيت الوزارية... 🎯"
        : filterType === "essay"
        ? "جاري إعداد الأسئلة المقالية ونماذج الإجابة وسلالم الدرجات... ✍️"
        : "جاري إعداد أسئلة الاختبار المتنوعة وفق المواصفات الوزارية... 🌟"
    );

    const mode =
      filterType === "essay"
        ? "essay_focus"
        : filterType === "fill_blank"
        ? "fill_blank_focus"
        : filterType === "true_false"
        ? "true_false_focus"
        : "diverse_unit";

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentSubject.title,
          unitTitle: targetUnit?.title || "اختبار شامل للمنهج",
          topic: targetUnit ? targetUnit.lessons.map((l) => l.title).join(" و ") : "كافة فروع المادة",
          grade: profile.gradeLevel,
          difficulty: unitMastery.recommendedDifficulty,
          studentLevel: unitMastery.level,
          questionTypes: filterType,
          count: targetCount,
        }),
      });

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        initQuizState(data.questions, mode);
      } else {
        const fallbacks = getUnitDiverseQuestions(
          currentSubject,
          targetUnit,
          filterType,
          unitMastery.recommendedDifficulty,
          targetCount
        );
        initQuizState(fallbacks, mode);
      }
    } catch (e) {
      console.error(e);
      const fallbacks = getUnitDiverseQuestions(
        currentSubject,
        targetUnit,
        filterType,
        unitMastery.recommendedDifficulty,
        targetCount
      );
      initQuizState(fallbacks, mode);
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  // Launch Quick MCQ Quiz
  const handleStartQuickQuiz = () => {
    const subjectFiltered = presetQuestions.filter(
      (q) => q.subjectId === selectedSubjectId || (q.unitTitle && currentSubject && q.unitTitle.includes(currentSubject.title))
    );
    let questions = subjectFiltered.length > 0
      ? [...subjectFiltered].sort(() => Math.random() - 0.5)
      : getUnitDiverseQuestions(currentSubject, currentUnit, "multiple_choice");
    
    initQuizState(questions, "quick");
    onShowToast(`تم بدء الاختبار السريع في مادة "${currentSubject.title}"! بالتوفيق ⚡`);
  };

  // Launch Custom AI Quiz
  const handleGenerateCustomQuiz = async () => {
    setIsGeneratingAiQuiz(true);
    onShowToast("الذكاء الاصطناعي يقوم بصياغة اختبارك المخصص... ✨");

    const effectiveTopic = customTopic.trim() || (currentUnit ? currentUnit.title : currentSubject.title);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentSubject.title,
          unitTitle: currentUnit?.title || "",
          topic: effectiveTopic,
          count: customCount,
          grade: profile.gradeLevel,
          difficulty: customDifficulty,
          studentLevel: unitMastery.level,
          questionTypes: customQuestionType,
        }),
      });

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        initQuizState(data.questions, "ai_custom");
        onShowToast("تم تجهيز التحدي المخصص بالذكاء الاصطناعي بنجاح! 🚀");
      } else {
        const fallbacks = getUnitDiverseQuestions(currentSubject, currentUnit, customQuestionType, customDifficulty);
        initQuizState(fallbacks, "ai_custom");
      }
    } catch (e) {
      console.error(e);
      const fallbacks = getUnitDiverseQuestions(currentSubject, currentUnit, customQuestionType, customDifficulty);
      initQuizState(fallbacks, "ai_custom");
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  // Handle Multiple Choice Answer Selection
  const handleSelectOption = (idx: number) => {
    if (answeredState) return;
    setSelectedOption(idx);
    setAnsweredState(true);

    const currentQ = currentQuestions[currentIndex];
    const isCorrect = idx === currentQ.correctIndex;
    setIsCurrentCorrect(isCorrect);

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      setConsecutiveWrong(0);

      if (activeQuizType === "adaptive_unit") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, newStreak, 0);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("إجابة صحيحة! أحسنت 🎯");
    } else {
      const newStreak = consecutiveWrong + 1;
      setConsecutiveWrong(newStreak);
      setConsecutiveCorrect(0);

      if (activeQuizType === "adaptive_unit") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, 0, newStreak);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("إجابة غير صحيحة، راجع الشرح والتعليل النموذجي.");
    }
  };

  // Handle True / False Answer Selection with Ministry Scientific Correction
  const handleSelectTrueFalse = (userChoice: boolean) => {
    if (answeredState) return;
    setSelectedTrueFalse(userChoice);
    setAnsweredState(true);

    const currentQ = currentQuestions[currentIndex];
    const expected = currentQ.isTrue !== undefined ? currentQ.isTrue : true;
    const isCorrect = userChoice === expected;
    setIsCurrentCorrect(isCorrect);

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      setConsecutiveWrong(0);

      if (activeQuizType === "adaptive_unit") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, newStreak, 0);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("إجابة صحيحة ومتقنة! تقييم علمي دقيق للمفهوم 🎯");
    } else {
      const newStreak = consecutiveWrong + 1;
      setConsecutiveWrong(newStreak);
      setConsecutiveCorrect(0);

      if (activeQuizType === "adaptive_unit") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, 0, newStreak);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("إجابة غير صحيحة، راجع التصويب العلمي المعتمد للوزارة.");
    }
  };

  // Handle Fill-in-the-Blank Submission
  const handleCheckFillBlank = () => {
    if (answeredState || !fillBlankInput.trim()) return;
    setAnsweredState(true);

    const currentQ = currentQuestions[currentIndex];
    const isCorrect = checkFillBlankAnswer(
      fillBlankInput,
      currentQ.correctAnswer,
      currentQ.acceptedAnswers
    );
    setIsCurrentCorrect(isCorrect);

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      setConsecutiveWrong(0);

      if (activeQuizType === "adaptive_unit") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, newStreak, 0);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("إكمال دقيق ومطابق للمصطلح! 🌟");
    } else {
      const newStreak = consecutiveWrong + 1;
      setConsecutiveWrong(newStreak);
      setConsecutiveCorrect(0);

      if (activeQuizType === "adaptive_unit") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, 0, newStreak);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("المصطلح غير دقيق، راجع الإجابة المعتمدة في الشرح.");
    }
  };

  // Handle Essay Submission & Self-Rating
  const handleSubmitEssay = () => {
    if (!essayInput.trim()) {
      onShowToast("يرجى كتابة تحليلك أولاً قبل عرض النموذج والمعايير");
      return;
    }
    setAnsweredState(true);
  };

  const handleSelfRateEssay = (rating: "full" | "half" | "none") => {
    setEssaySelfRating(rating);
    if (rating === "full") {
      setCorrectAnswersCount((prev) => prev + 1);
      setIsCurrentCorrect(true);
      onShowToast("درجة كاملة مستحقة! تحليل متميز 🌟");
    } else if (rating === "half") {
      setCorrectAnswersCount((prev) => prev + 0.5);
      setIsCurrentCorrect(true);
      onShowToast("تم احتساب نصف الدرجة 💡 راجع بنود الإجابة لإتقان كامل");
    } else {
      setIsCurrentCorrect(false);
      onShowToast("لا بأس، التدريب على صياغة الأسئلة المقالية سر التفوق.");
    }
  };

  // Next Question or Complete Quiz
  const handleNext = () => {
    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSelectedTrueFalse(null);
      setFillBlankInput("");
      setEssayInput("");
      setAnsweredState(false);
      setIsCurrentCorrect(null);
      setEssaySelfRating(null);
      setRevealedHint(false);
      setAdaptiveMessage("");
    } else {
      // Completed quiz
      setIsQuizCompleted(true);
      const total = currentQuestions.length;
      const scorePct = Math.round((correctAnswersCount / total) * 100);
      const calculatedXp = Math.round(correctAnswersCount * 35 + (scorePct >= 80 ? 60 : 25));
      setEarnedXpTotal(calculatedXp);

      try {
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
      } catch (e) {
        console.error(e);
      }

      onFinishQuiz(scorePct, Math.floor(correctAnswersCount), total, calculatedXp);
    }
  };

  const currentQ = currentQuestions[currentIndex];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200" id="quizzes-view-container">
      {/* View Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>📝 الاختبارات الذكية التكيفية والتقييمات الشاملة</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          بناء وتوليد اختبارات تكيفية تقيس مستويات التفكير (MCQ، مقالي تحليلي، وإكمال) مبنية على مستواك في كل وحدة دراسية
        </p>
      </div>

      {/* Active Quiz Runner */}
      {activeQuizType && currentQ && !isQuizCompleted && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-5 sm:p-8 space-y-6 animate-in zoom-in-95">
          {/* Top Bar: Quiz Info & Adaptive Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {activeQuizType === "adaptive_unit"
                  ? "🎯 اختبار تكيفي ذكي للوحدة"
                  : activeQuizType === "diverse_unit"
                  ? "🌟 اختبار وزاري شامل"
                  : activeQuizType === "essay_focus"
                  ? "✍️ اختبار مقالي تحليلي"
                  : activeQuizType === "fill_blank_focus"
                  ? "🔤 اختبار إكمال المفاهيم"
                  : activeQuizType === "true_false_focus"
                  ? "⚖️ بنك الصواب والخطأ وتصويب المفاهيم الوزارية"
                  : activeQuizType === "quick"
                  ? "⚡ اختبار سريع"
                  : "🤖 تحدي الذكاء الاصطناعي"}
              </span>

              {/* Adaptive Dynamic Difficulty Pill */}
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  currentAdaptiveDifficulty === "hard"
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : currentAdaptiveDifficulty === "medium"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                {currentAdaptiveDifficulty === "hard"
                  ? "مستوى: تفكير عليا 🏆"
                  : currentAdaptiveDifficulty === "medium"
                  ? "مستوى: متوسط ⚡"
                  : "مستوى: تأسيسي مباشر 🌱"}
              </span>

              <span className="text-xs text-slate-500 font-semibold">
                السؤال {currentIndex + 1} من {currentQuestions.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentQ.hint && (
                <button
                  onClick={() => setRevealedHint(!revealedHint)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold flex items-center gap-1 transition"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>{revealedHint ? "إخفاء التلميح" : "تلميح 💡"}</span>
                </button>
              )}

              <button
                onClick={() => setActiveQuizType(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold transition px-2 py-1 rounded-lg"
              >
                إنهاء الاختبار
              </button>
            </div>
          </div>

          {/* Dynamic Adaptive Alert if triggered */}
          {adaptiveMessage && (
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-950 animate-in fade-in flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{adaptiveMessage}</span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }}
            />
          </div>

          {/* Hint Drawer */}
          {revealedHint && currentQ.hint && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 leading-relaxed animate-in fade-in flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">تلميح تربوي:</span>
                <span>{currentQ.hint}</span>
              </div>
            </div>
          )}

          {/* Question Prompt Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                {currentQ.type === "multiple_choice" || (!currentQ.type && currentQ.options)
                  ? "اختيار من متعدد (بابل شيت)"
                  : currentQ.type === "true_false"
                  ? "صواب وخطأ وتصويب المفاهيم (معيار الوزارة)"
                  : currentQ.type === "fill_blank"
                  ? "إكمال فراغات ومصطلحات"
                  : "سؤال مقالي تحليلي وتطبيقي"}
              </span>
              {currentQ.ministryStandard && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>{currentQ.ministryStandard}</span>
                </span>
              )}
              {currentQ.unitTitle && (
                <span className="text-[11px] font-medium text-slate-500">
                  {currentQ.unitTitle}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* 1. Multiple Choice Options */}
          {(currentQ.type === "multiple_choice" || (!currentQ.type && currentQ.options)) && (
            <div className="space-y-3">
              <div className="grid gap-3">
                {currentQ.options?.map((opt, idx) => {
                  let btnClass = "bg-white hover:bg-slate-50 border-slate-200 text-slate-800";
                  if (answeredState) {
                    if (idx === currentQ.correctIndex) {
                      btnClass = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs";
                    } else if (idx === selectedOption) {
                      btnClass = "bg-rose-50 border-rose-400 text-rose-950 shadow-xs";
                    } else {
                      btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={answeredState}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-right p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition flex items-center justify-between gap-2 ${btnClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                          {["أ", "ب", "ج", "د"][idx]}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {answeredState && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {answeredState && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Distractor Analysis & Exclusion Reasoning */}
              {answeredState && currentQ.exclusionReasoning && currentQ.exclusionReasoning.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>تحليل استبعاد المشتتات وتفنيد البدائل (معيار البابل شيت الوزاري):</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {currentQ.exclusionReasoning.map((reason, rIdx) => (
                      <div
                        key={rIdx}
                        className={`p-2 rounded-xl flex items-start gap-2 ${
                          rIdx === currentQ.correctIndex
                            ? "bg-emerald-50/90 text-emerald-950 border border-emerald-200 font-semibold"
                            : "bg-white text-slate-700 border border-slate-200/80"
                        }`}
                      >
                        <span className="shrink-0 font-bold">
                          {["أ", "ب", "ج", "د"][rIdx] || `#${rIdx + 1}`}:
                        </span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. True / False Question Form with Ministry Scientific Correction */}
          {currentQ.type === "true_false" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  disabled={answeredState}
                  onClick={() => handleSelectTrueFalse(true)}
                  className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2.5 ${
                    answeredState
                      ? currentQ.isTrue === true
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : selectedTrueFalse === true
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-slate-100 text-slate-400 border-slate-200 opacity-60"
                      : "bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-400 shadow-xs"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>(صواب ✔️) - العبارة صحيحة</span>
                </button>

                <button
                  type="button"
                  disabled={answeredState}
                  onClick={() => handleSelectTrueFalse(false)}
                  className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2.5 ${
                    answeredState
                      ? currentQ.isTrue === false
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : selectedTrueFalse === false
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-slate-100 text-slate-400 border-slate-200 opacity-60"
                      : "bg-white hover:bg-rose-50 text-rose-900 border-rose-200 hover:border-rose-400 shadow-xs"
                  }`}
                >
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>(خطأ ✖️) - العبارة غير صحيحة</span>
                </button>
              </div>

              {/* True/False Instant Verdict & Correction */}
              {answeredState && (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm font-medium border flex items-start gap-3 animate-in fade-in ${
                    isCurrentCorrect
                      ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                      : "bg-rose-50 text-rose-950 border-rose-200"
                  }`}
                >
                  {isCurrentCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-2 flex-1">
                    <div className="font-bold">
                      {isCurrentCorrect
                        ? `🎯 تقييم إجابتك: إجابة صحيحة ومتقنة! (${currentQ.isTrue ? "صواب ✔️" : "خطأ ✖️"})`
                        : `⚠️ إجابة غير صحيحة - التقييم العلمي الدقيق للعبارة: ${currentQ.isTrue ? "صواب (صح ✔️)" : "خطأ (✖️)"}`}
                    </div>
                    {currentQ.correction && (
                      <div className="text-slate-800 bg-white/95 p-3.5 rounded-xl border border-slate-200 shadow-2xs leading-relaxed">
                        <span className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>التصويب العلمي المعتمد والتعليل لوزارة التربية والتعليم:</span>
                        </span>
                        <span>{currentQ.correction}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Fill-in-the-Blank Question Form */}
          {currentQ.type === "fill_blank" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <input
                  type="text"
                  value={fillBlankInput}
                  disabled={answeredState}
                  onChange={(e) => setFillBlankInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !answeredState && fillBlankInput.trim()) {
                      handleCheckFillBlank();
                    }
                  }}
                  placeholder="اكتب الكلمة أو المصطلح الناقص هنا..."
                  className="flex-1 text-xs sm:text-sm p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                />
                <button
                  disabled={answeredState || !fillBlankInput.trim()}
                  onClick={handleCheckFillBlank}
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>تحقق من الإجابة</span>
                </button>
              </div>

              {answeredState && (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm font-medium border flex items-center gap-3 ${
                    isCurrentCorrect
                      ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                      : "bg-rose-50 text-rose-950 border-rose-200"
                  }`}
                >
                  {isCurrentCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span>
                      {isCurrentCorrect ? "إجابة صحيحة ومطابقة للمصطلح! " : "الإجابة النموذجية المعتمدة هي: "}
                    </span>
                    <strong className="font-bold underline">{currentQ.correctAnswer}</strong>
                    {currentQ.acceptedAnswers && currentQ.acceptedAnswers.length > 1 && (
                      <span className="text-xs opacity-75 mr-2">
                        (صيغ مقبولة أخرى: {currentQ.acceptedAnswers.join("، ")})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Analytical Essay Question Form */}
          {currentQ.type === "essay" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  اكتب تحليلك وإجابتك الكاملة مع التعليل:
                </label>
                <textarea
                  rows={4}
                  disabled={answeredState}
                  value={essayInput}
                  onChange={(e) => setEssayInput(e.target.value)}
                  placeholder="صِغ خطوات الحل والبرهان العلمي بأسلوبك المنظم..."
                  className="w-full text-xs sm:text-sm p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 leading-relaxed"
                />
              </div>

              {!answeredState && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitEssay}
                    disabled={!essayInput.trim()}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-xs"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>اعتماد الإجابة وعرض النموذج الوزاري</span>
                  </button>
                </div>
              )}

              {answeredState && (
                <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-4 animate-in fade-in">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-purple-950 block mb-1.5">
                      📄 النموذج الإرشادي المعتمد للإجابة:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white/90 p-4 rounded-xl border border-purple-100 font-medium">
                      {currentQ.modelAnswer || currentQ.explanation}
                    </p>
                  </div>

                  {currentQ.rubric && currentQ.rubric.length > 0 && (
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-purple-950 block mb-1.5">
                        ⚖️ معايير التقييم وتوزيع الدرجات الوزارية:
                      </span>
                      <ul className="text-xs sm:text-sm text-slate-700 space-y-1.5 bg-white/90 p-3.5 rounded-xl border border-purple-100">
                        {currentQ.rubric.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Self-Rating evaluation for essay */}
                  <div className="pt-3 border-t border-purple-200/60">
                    <span className="text-xs sm:text-sm font-bold text-purple-950 block mb-2">
                      قيّم إجابتك بموضوعية مقارنة بالنموذج الوزاري:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => handleSelfRateEssay("full")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          essaySelfRating === "full"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>إجابة متطابقة تماماً (درجة كاملة)</span>
                      </button>

                      <button
                        onClick={() => handleSelfRateEssay("half")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          essaySelfRating === "half"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "bg-white border border-amber-300 text-amber-800 hover:bg-amber-50"
                        }`}
                      >
                        <span>إجابة جزئية (نصف الدرجة)</span>
                      </button>

                      <button
                        onClick={() => handleSelfRateEssay("none")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          essaySelfRating === "none"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-white border border-rose-300 text-rose-800 hover:bg-rose-50"
                        }`}
                      >
                        <span>بحاجة لمراجعة الفكرة (0%)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Explanation Box (Shows after answering) */}
          {answeredState && currentQ.explanation && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs sm:text-sm animate-in fade-in">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                الشرح النموذجي والتأصيل المعرفي:
              </span>
              <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {answeredState && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
              >
                <span>
                  {currentIndex + 1 === currentQuestions.length
                    ? "عرض النتيجة النهائية والتكريم 🏆"
                    : "السؤال التالي"}
                </span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quiz Result Screen */}
      {isQuizCompleted && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-4xl mx-auto shadow-lg shadow-orange-500/30">
            🏆
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              أحسنت يا بطل! أنهيت الاختبار بنجاح
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              تم تسجيل إنجازك وتحديث سجلك الدراسي ونقاط خبرتك وفق معايير الامتحانات الحديثة
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-2xl font-black text-indigo-600 font-mono">
                {Math.round((correctAnswersCount / currentQuestions.length) * 100)}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium">النسبة المئوية</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {correctAnswersCount} / {currentQuestions.length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">إجابات محتسبة</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600 font-mono">
                +{earnedXpTotal} XP
              </div>
              <div className="text-[11px] text-slate-500 font-medium">نقاط مكتسبة</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveQuizType(null)}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition"
            >
              العودة لقائمة الاختبارات
            </button>
            <button
              onClick={handleStartAdaptiveUnitQuiz}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>اختبار تكيفي جديد</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Quizzes Explorer Screen (when not in quiz) */}
      {!activeQuizType && !isQuizCompleted && (
        <div className="space-y-6">
          {/* Unit & Subject Selector Bar */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  حدد المادة والوحدة الدراسية لبناء الاختبار التكيفي:
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  يتعرف النظام التكيفي تلقائياً على دروسك المكتملة ومستوى إتقانك لكل وحدة ليقدم أسئلة مخصصة تماماً
                </p>
              </div>

              {/* Quick Subject & Unit Dropdowns */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Subject Selector */}
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedUnitId("all");
                  }}
                  className="text-xs font-bold p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title}
                    </option>
                  ))}
                </select>

                {/* Unit Selector */}
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="text-xs font-bold p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">🌟 جميع وحدات المنهج (اختبار عام)</option>
                  {currentSubject?.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      الوحدة {u.order}: {u.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mastery & Student Level Status Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-slate-50 border border-indigo-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/20">
                  {currentUnit ? `${unitMastery.progressPercent}%` : `${subjectProgressPercent}%`}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {currentUnit
                        ? `مستواك في وحدة "${currentUnit.title}":`
                        : `مستواك العام في مادة "${currentSubject.title}":`}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        currentUnit ? unitMastery.badgeClass : "bg-indigo-50 text-indigo-800 border-indigo-200"
                      }`}
                    >
                      {currentUnit ? unitMastery.levelLabel : `${subjectCompletedLessons} من ${subjectTotalLessons} درساً`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {currentUnit
                      ? `تم إنهاء ${unitMastery.completedLessons} من أصل ${unitMastery.totalLessons} دروس بالوحدة • الصعوبة المقترحة: ${
                          unitMastery.recommendedDifficulty === "hard"
                            ? "تفكير عليا 🏆"
                            : unitMastery.recommendedDifficulty === "medium"
                            ? "متوسط ⚡"
                            : "تأسيسي 🌱"
                        }`
                      : `يشمل جميع وحدات المادة • جاهز للاختبارات الشاملة`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartAdaptiveUnitQuiz}
                  disabled={isGeneratingAiQuiz}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>بدء الاختبار التكيفي للوحدة 🚀</span>
                </button>
              </div>
            </div>
          </div>

          {/* Featured Quiz Modes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Adaptive Unit Quiz */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl mb-3 shadow-xs">
                  🎯
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    نظام التكيف التلقائي
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-1">
                  اختبار تكيفي ذكي (Adaptive)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  يبدأ بمستوى إتقانك الحالي في الوحدة، ويتدرج تلقائياً (سهل ⬅️ متوسط ⬅️ تفكير عليا) وفق سرعة وصحة إجاباتك.
                </p>
              </div>
              <button
                onClick={handleStartAdaptiveUnitQuiz}
                disabled={isGeneratingAiQuiz}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Target className="w-4 h-4" />
                <span>بدء الاختبار التكيفي</span>
              </button>
            </div>

            {/* Card 2: Diverse Questions Exam (MCQ + Essay + Blank) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-2xl mb-3 shadow-xs">
                  🌟
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    المواصفات الوزارية 2026/2027
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-1">
                  اختبار وزاري شامل متنوع
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  تشكيلة متكاملة تجمع بين بابل شيت اختيار من متعدد، وأسئلة مقالية تحليلية مع نموذج إجابة، وإكمال مفاهيم.
                </p>
              </div>
              <button
                onClick={() => handleStartDiverseUnitQuiz("mixed")}
                disabled={isGeneratingAiQuiz}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Layers className="w-4 h-4" />
                <span>بدء الامتحان الشامل المتنوع</span>
              </button>
            </div>

            {/* Card 3: Quick Bubble Sheet Practice */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 text-2xl mb-3 shadow-xs">
                  ⚡
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    تدريب سريع
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-1">
                  اختبار سريع (5 أسئلة بابل شيت)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  مجموعة أسئلة فورية اختيار من متعدد لتثبيت المفاهيم وتنشيط الذاكرة قبل الانتقال للدرس التالي.
                </p>
              </div>
              <button
                onClick={handleStartQuickQuiz}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>بدء الاختبار السريع</span>
              </button>
            </div>
          </div>

          {/* Specialized Question Types Quick Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* True / False & Correction Bank Focus */}
            <div className="p-5 rounded-3xl bg-linear-to-br from-emerald-50/80 to-white border border-emerald-200 flex flex-col justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">بنك الصواب والخطأ وتصويب المفاهيم</h4>
                  <p className="text-xs text-slate-500">
                    كشف الفخاخ الامتحانية وتصويب علمي دقيق معتمد لوزارة التعليم
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleStartDiverseUnitQuiz("true_false", currentUnit, 8)}
                disabled={isGeneratingAiQuiz}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-2xs"
              >
                <Scale className="w-4 h-4" />
                <span>بدء بنك الصواب والخطأ ⚖️</span>
              </button>
            </div>

            {/* Analytical Essay Focus */}
            <div className="p-5 rounded-3xl bg-linear-to-br from-amber-50/80 to-white border border-amber-200 flex flex-col justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">تدريب مقالي تحليلي مقنن</h4>
                  <p className="text-xs text-slate-500">
                    أسئلة علل وفسر واستنتج مع نماذج إجابة رسمية وسلالم التصحيح
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleStartDiverseUnitQuiz("essay", currentUnit, 4)}
                disabled={isGeneratingAiQuiz}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-2xs"
              >
                <PenTool className="w-4 h-4" />
                <span>بدء المقالي الإرشادي ✍️</span>
              </button>
            </div>

            {/* Fill-in-the-blank Focus */}
            <div className="p-5 rounded-3xl bg-linear-to-br from-blue-50/80 to-white border border-blue-200 flex flex-col justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">إكمال المفاهيم والمصطلحات</h4>
                  <p className="text-xs text-slate-500">
                    تدريب دقيق على القوانين والمصطلحات الأساسية مع فحص ذكي للكلمات
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleStartDiverseUnitQuiz("fill_blank", currentUnit, 6)}
                disabled={isGeneratingAiQuiz}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-2xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>بدء الإكمال والمصطلحات 🔤</span>
              </button>
            </div>
          </div>

          {/* Unit-by-Unit Comprehensive Ministry Quiz Vault */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <span>بنك اختبارات وحدات المنهج (وفق المعايير الوزارية 2026/2027)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  اختبارات مكثفة ومتنوعة لكل وحدة في مادة "{currentSubject.title}" مع تصويب المفاهيم وتحليل استبعاد المشتتات
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 w-fit">
                {currentSubject.units.length} وحدات دراسية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {currentSubject.units.map((unit) => {
                const info = getUnitMasteryInfo(unit);
                return (
                  <div
                    key={unit.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-indigo-300 hover:shadow-sm transition space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            الوحدة {unit.order}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {unit.lessons.length} دروس
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{unit.title}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${info.badgeClass}`}>
                        {info.levelLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/70">
                      <button
                        onClick={() => handleStartDiverseUnitQuiz("mixed", unit, 10)}
                        disabled={isGeneratingAiQuiz}
                        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 shadow-2xs disabled:opacity-50"
                        title="امتحان شامل يضم كافة الأنماط (بابل شيت + صواب وخطأ + مقالي)"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>شامل (10)</span>
                      </button>

                      <button
                        onClick={() => handleStartDiverseUnitQuiz("multiple_choice", unit, 8)}
                        disabled={isGeneratingAiQuiz}
                        className="p-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 shadow-2xs disabled:opacity-50"
                        title="بابل شيت مع تحليل استبعاد المشتتات"
                      >
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        <span>بابل شيت (8)</span>
                      </button>

                      <button
                        onClick={() => handleStartDiverseUnitQuiz("true_false", unit, 8)}
                        disabled={isGeneratingAiQuiz}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 shadow-2xs disabled:opacity-50"
                        title="أسئلة صواب وخطأ مع التصويب العلمي المعتمد والتعليل"
                      >
                        <Scale className="w-3.5 h-3.5 text-emerald-700" />
                        <span>صواب/خطأ (8)</span>
                      </button>

                      <button
                        onClick={() => handleStartDiverseUnitQuiz("essay", unit, 4)}
                        disabled={isGeneratingAiQuiz}
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 shadow-2xs disabled:opacity-50"
                        title="أسئلة مقالية مع نموذج الإجابة وسلم التصحيح"
                      >
                        <PenTool className="w-3.5 h-3.5 text-amber-700" />
                        <span>مقالي (4)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom AI Quiz Creator Form */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              تخصيص كامل للاختبار الذكي بالذكاء الاصطناعي
            </h3>
            <p className="text-xs text-slate-500">
              حدد أي فكرة أو جزئية أو مستوى صعوبة ونمط أسئلة محدد ليقوم الذكاء الاصطناعي بصياغة امتحان فوري لك
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">المادة والوحدة:</label>
                <div className="text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                  {currentSubject.title} • {currentUnit ? currentUnit.title : "كل الوحدات"}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الموضوع أو الفكرة المحددة:</label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="مثال: كان التامة، الأعداد المركبة، قانون كيرشوف..."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">نمط الأسئلة:</label>
                <select
                  value={customQuestionType}
                  onChange={(e) => setCustomQuestionType(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option value="mixed">🌟 منوع وفق مواصفات الوزارة (بابل شيت + صواب وخطأ + مقالي)</option>
                  <option value="multiple_choice">🎯 اختيار من متعدد فقط (بابل شيت)</option>
                  <option value="true_false">⚖️ صواب وخطأ وتصويب المفاهيم الوزارية</option>
                  <option value="essay">✍️ مقالي تحليلي مع نموذج الإجابة</option>
                  <option value="fill_blank">🔤 إكمال فراغات ومصطلحات</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">مستوى الصعوبة والتكيف:</label>
                <select
                  value={customDifficulty}
                  onChange={(e) => setCustomDifficulty(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option value="adaptive">🎯 تكيّفي ذكي (يتدرج أثناء الحل)</option>
                  <option value="easy">🌱 مباشر (تأسيسي وقوانين مباشرة)</option>
                  <option value="medium">⚡ متوسط (فهم وتطبيق وتحليل)</option>
                  <option value="hard">🏆 مستويات تفكير عليا وربط</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateCustomQuiz}
                disabled={isGeneratingAiQuiz}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingAiQuiz ? "جاري التوليد بالذكاء الاصطناعي..." : "إنشاء وبدء الاختبار المخصص"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
