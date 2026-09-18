import React, { useState, useEffect } from "react";
import { Unit, Subject, StudentProfile, QuizQuestion, QuizQuestionType } from "../types";
import {
  X,
  Sparkles,
  Bot,
  Layers,
  Link2,
  FileSpreadsheet,
  Zap,
  HelpCircle,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Target,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lightbulb,
  Award,
  Trophy,
  ChevronLeft,
  Brain,
  PenTool,
  Send,
  GitBranch,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import confetti from "canvas-confetti";
import { InteractiveMindMap } from "./InteractiveMindMap";
import { MindMapTreeData } from "../utils/curriculumAiExplainer";
import {
  getUnitMasteryInfo,
  checkFillBlankAnswer,
  getNextAdaptiveDifficulty,
  getUnitDiverseQuestions,
} from "../utils/quizUtils";

interface UnitAiModalProps {
  isOpen: boolean;
  unit: Unit | null;
  subject: Subject | null;
  gradeLevel?: string;
  profile?: StudentProfile;
  onClose: () => void;
  onOpenLesson?: (subjectId: string, lessonId: string) => void;
  onAskAi: (prompt: string, subjectTitle: string) => void;
  onFinishQuiz?: (scorePercent: number, correctCount: number, totalCount: number, xpEarned: number) => void;
  onShowToast: (msg: string) => void;
}

export const UnitAiModal: React.FC<UnitAiModalProps> = ({
  isOpen,
  unit,
  subject,
  gradeLevel = "1st_secondary",
  profile,
  onClose,
  onOpenLesson,
  onAskAi,
  onFinishQuiz,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "mindmap" | "formulas" | "exam_review" | "quiz"
  >("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [unitData, setUnitData] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [expandedProblemIndex, setExpandedProblemIndex] = useState<number | null>(0);
  const [forecastAnswers, setForecastAnswers] = useState<Record<number, number>>({});
  const [forecastFeedback, setForecastFeedback] = useState<Record<number, boolean>>({});

  const getUnitMindMapData = (): MindMapTreeData => {
    if (unitData?.mindMapTree && Array.isArray(unitData.mindMapTree.branches) && unitData.mindMapTree.branches.length > 0) {
      return unitData.mindMapTree;
    }
    return {
      title: `الخريطة المفاهيمية لوحدة: ${unit?.title || ""}`,
      centralConcept: unit?.title || "الوحدة الدراسية",
      subjectTitle: subject?.title || "",
      branches: [
        {
          id: "b1",
          title: "المحور الأول: المفاهيم والتأصيل العلمي",
          badge: "التأصيل النظري",
          color: "indigo",
          items: unit?.lessons?.slice(0, 2).map((l) => `${l.title}: المبادئ الحاكمة والمصطلحات الأساسية`) || [
            "المبادئ الأساسية والقواعد التأسيسية للوحدة",
            "المصطلحات العلمية والتعريفات الدقيقة",
          ],
        },
        {
          id: "b2",
          title: "المحور الثاني: القوانين والعلاقات الرياضية",
          badge: "العلاقات والصيغ",
          color: "emerald",
          items: [
            "الصيغ الرياضية المباشرة وقيم الثوابت المعيارية",
            "العلاقات التناسبية الطردية والعكسية وتأثير الشروط",
            "مجال تطبيق القوانين والحالات الخاصة",
          ],
        },
        {
          id: "b3",
          title: "المحور الثالث: خطوات التفكير وخوارزمية الحل",
          badge: "طريقة الحل",
          color: "amber",
          items: [
            "استخراج المعطيات وتوحيد وحدات القياس للنظام الدولي",
            "اختيار القانون المناسب والتعويض المنظم خطوة بخطوة",
            "التحقق من صحة الناتج وملاءمته الفيزيائية/الرياضية",
          ],
        },
        {
          id: "b4",
          title: "المحور الرابع: الحالات الحرجة وتريكات الامتحان",
          badge: "أسرار الامتحان",
          color: "rose",
          items: [
            "ماذا يحدث عند انعدام المتغيرات أو تضاعفها؟",
            "طرق الاستبعاد الذكي للخيارات في نظام البابل شيت",
            "تجنب الأخطاء الشائعة والفخاخ الشبيهة",
          ],
        },
      ],
    };
  };

  // Unit Adaptive Quiz States
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizFilterType, setQuizFilterType] = useState<QuizQuestionType | "mixed">("mixed");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"adaptive" | "easy" | "medium" | "hard">("adaptive");
  const [currentAdaptiveDifficulty, setCurrentAdaptiveDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [adaptiveMessage, setAdaptiveMessage] = useState("");
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(6);

  // Interactive Answers per question
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<boolean | null>(null);
  const [fillBlankInput, setFillBlankInput] = useState("");
  const [essayInput, setEssayInput] = useState("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);
  const [essaySelfRating, setEssaySelfRating] = useState<"full" | "half" | "none" | null>(null);
  const [revealedHint, setRevealedHint] = useState(false);

  // Completed Summary State
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);

  // Calculate mastery info for this unit
  const masteryInfo = getUnitMasteryInfo(unit);

  const fetchUnitExplanation = async () => {
    if (!unit || !subject) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/explain-unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitTitle: unit.title,
          unitOrder: unit.order,
          subjectTitle: subject.title,
          grade: gradeLevel,
          lessons: unit.lessons.map((l) => ({ id: l.id, title: l.title, desc: l.description })),
        }),
      });

      const data = await response.json();
      setUnitData(data);
    } catch (e) {
      console.error("Error fetching unit explanation:", e);
      onShowToast("حدث خطأ أثناء تحميل شرح الوحدة");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && unit) {
      setActiveTab("overview");
      setIsQuizActive(false);
      setIsQuizFinished(false);
      setQuizQuestions([]);
      setCurrentQuizIndex(0);
      setIsAnswerSubmitted(false);
      setSelectedOption(null);
      setSelectedTrueFalse(null);
      setFillBlankInput("");
      setEssayInput("");
      setRevealedHint(false);
      fetchUnitExplanation();
    }
  }, [isOpen, unit?.id]);

  if (!isOpen || !unit || !subject) return null;

  // Start or Generate Adaptive Unit Quiz
  const handleStartUnitQuiz = async () => {
    setIsGeneratingQuiz(true);
    onShowToast("الذكاء الاصطناعي يقوم بصياغة اختبار تكيفي مخصص للوحدة... 🎯");

    const initialDiff: "easy" | "medium" | "hard" =
      selectedDifficulty === "adaptive" ? masteryInfo.recommendedDifficulty : selectedDifficulty;
    setCurrentAdaptiveDifficulty(initialDiff);
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
    setAdaptiveMessage("");

    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.title,
          unitTitle: unit.title,
          topic: unit.lessons.map((l) => l.title).join(" و "),
          grade: gradeLevel,
          difficulty: selectedDifficulty,
          studentLevel: masteryInfo.level,
          questionTypes: quizFilterType,
          count: quizQuestionCount,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions);
      } else {
        const fallbacks = getUnitDiverseQuestions(subject, unit, quizFilterType, selectedDifficulty, quizQuestionCount);
        setQuizQuestions(fallbacks);
      }
    } catch (e) {
      console.error("Failed to generate quiz, using robust fallbacks:", e);
      const fallbacks = getUnitDiverseQuestions(subject, unit, quizFilterType, selectedDifficulty, quizQuestionCount);
      setQuizQuestions(fallbacks);
    } finally {
      setIsGeneratingQuiz(false);
      setIsQuizActive(true);
      setCurrentQuizIndex(0);
      setSelectedOption(null);
      setSelectedTrueFalse(null);
      setFillBlankInput("");
      setEssayInput("");
      setIsAnswerSubmitted(false);
      setIsCurrentCorrect(null);
      setEssaySelfRating(null);
      setRevealedHint(false);
      setCorrectCount(0);
      setIsQuizFinished(false);
    }
  };

  const handleSelectMcq = (optIdx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optIdx);
    setIsAnswerSubmitted(true);

    const currentQ = quizQuestions[currentQuizIndex];
    const isCorrect = optIdx === currentQ.correctIndex;
    setIsCurrentCorrect(isCorrect);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      setConsecutiveWrong(0);

      if (selectedDifficulty === "adaptive") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, newStreak, 0);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("إجابة صحيحة وممتازة! 🎯 أحسنت");
    } else {
      const newStreak = consecutiveWrong + 1;
      setConsecutiveWrong(newStreak);
      setConsecutiveCorrect(0);

      if (selectedDifficulty === "adaptive") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, 0, newStreak);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("إجابة غير صحيحة، طالع الشرح والتعليل النموذجي.");
    }
  };

  const handleSelectTrueFalse = (userChoice: boolean) => {
    if (isAnswerSubmitted) return;
    setSelectedTrueFalse(userChoice);
    setIsAnswerSubmitted(true);

    const currentQ = quizQuestions[currentQuizIndex];
    const expected = currentQ.isTrue !== undefined ? currentQ.isTrue : true;
    const isCorrect = userChoice === expected;
    setIsCurrentCorrect(isCorrect);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      setConsecutiveWrong(0);

      if (selectedDifficulty === "adaptive") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, newStreak, 0);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("إجابة صحيحة ومتقنة! 🎯 أحسنت");
    } else {
      const newStreak = consecutiveWrong + 1;
      setConsecutiveWrong(newStreak);
      setConsecutiveCorrect(0);

      if (selectedDifficulty === "adaptive") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, 0, newStreak);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("إجابة غير صحيحة، طالع التصويب والتعليل المعتمد.");
    }
  };

  const handleCheckFillBlank = () => {
    if (isAnswerSubmitted || !fillBlankInput.trim()) return;
    setIsAnswerSubmitted(true);

    const currentQ = quizQuestions[currentQuizIndex];
    const isCorrect = checkFillBlankAnswer(
      fillBlankInput,
      currentQ.correctAnswer,
      currentQ.acceptedAnswers
    );
    setIsCurrentCorrect(isCorrect);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      setConsecutiveWrong(0);

      if (selectedDifficulty === "adaptive") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, newStreak, 0);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("إكمال دقيق وصحيح للمصطلح! 🌟");
    } else {
      const newStreak = consecutiveWrong + 1;
      setConsecutiveWrong(newStreak);
      setConsecutiveCorrect(0);

      if (selectedDifficulty === "adaptive") {
        const { nextDifficulty, message } = getNextAdaptiveDifficulty(currentAdaptiveDifficulty, 0, newStreak);
        if (nextDifficulty !== currentAdaptiveDifficulty) {
          setCurrentAdaptiveDifficulty(nextDifficulty);
          setAdaptiveMessage(message);
        }
      }
      onShowToast("المصطلح غير دقيق، راجع الإجابة المعتمدة في الشرح.");
    }
  };

  const handleSubmitEssay = () => {
    if (!essayInput.trim()) {
      onShowToast("يرجى كتابة تحليلك أولاً قبل عرض النموذج والمعايير");
      return;
    }
    setIsAnswerSubmitted(true);
  };

  const handleSelfRateEssay = (rating: "full" | "half" | "none") => {
    setEssaySelfRating(rating);
    if (rating === "full") {
      setCorrectCount((prev) => prev + 1);
      setIsCurrentCorrect(true);
      onShowToast("درجة كاملة مستحقة! بارك الله في جهودك 🌟");
    } else if (rating === "half") {
      setCorrectCount((prev) => prev + 0.5);
      setIsCurrentCorrect(true);
      onShowToast("تم احتساب نصف الدرجة 💡 راجع بنود الإجابة لإتقان كامل");
    } else {
      setIsCurrentCorrect(false);
      onShowToast("لا بأس، التدريب على الأسئلة المقالية سر التفوق.");
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSelectedTrueFalse(null);
      setFillBlankInput("");
      setEssayInput("");
      setIsAnswerSubmitted(false);
      setIsCurrentCorrect(null);
      setEssaySelfRating(null);
      setRevealedHint(false);
      setAdaptiveMessage("");
    } else {
      // Completed Quiz
      setIsQuizFinished(true);
      const total = quizQuestions.length;
      const scorePct = Math.round((correctCount / total) * 100);
      const calculatedXp = Math.round(correctCount * 35 + (scorePct >= 80 ? 60 : 25));
      setEarnedXp(calculatedXp);

      try {
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
      } catch (e) {
        console.error(e);
      }

      if (onFinishQuiz) {
        onFinishQuiz(scorePct, Math.floor(correctCount), total, calculatedXp);
      }
    }
  };

  const currentQ = quizQuestions[currentQuizIndex];

  const readAloud = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      onShowToast("جاري القراءة الصوتية للشرح 🔊");
    }
  };

  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onShowToast("تم نسخ الشرح للحافظة 📋");
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      id="unit-ai-modal-container"
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] flex flex-col"
        id="unit-ai-modal-dialog"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                  الوحدة {unit.order} • {subject.title}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  ماستركلاس الذكاء الاصطناعي
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                الشرح الشامل لوحدة: {unit.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تحليل تكاملي لكافة دروس الوحدة ({unit.lessons.length} دروس) واختبارات تكيفية تقيس الفهم والتطبيق
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUnitExplanation}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition disabled:opacity-50"
              title="إعادة التوليد"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl mb-4 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>الشرح والتأصيل الأكاديمي</span>
          </button>
          <button
            onClick={() => setActiveTab("mindmap")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "mindmap"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>الخريطة الذهنية التفاعلية</span>
          </button>
          <button
            onClick={() => setActiveTab("formulas")}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "formulas"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ميثاق القوانين والقواعد</span>
          </button>
          <button
            onClick={() => setActiveTab("exam_review")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "exam_review"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>أسرار الامتحان وتريكات الحل</span>
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "quiz"
                ? "bg-white text-indigo-700 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>الاختبار التكيفي للوحدة 🎯</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-sm text-slate-700">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">
                الذكاء الاصطناعي يقوم بتحليل وتأصيل الوحدة بالكامل وبناء الخريطة الذهنية...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                يتم تأصيل المفاهيم العلمية واستخراج القوانين وبناء الخريطة الذهنية والمسائل المحلولة لامتحانات 2026/2027
              </p>
            </div>
          ) : (
            <>
              {/* Overview Tab (Masterclass, Feynman, Step-by-Step Solved) */}
              {activeTab === "overview" && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Masterclass Overview */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[11px] font-bold">
                          التأصيل الشامل للوحدة
                        </span>
                        <h3 className="font-bold text-indigo-950 text-sm sm:text-base">
                          الشرح الأكاديمي المتعمق لمفاهيم الوحدة
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyText(unitData?.masterOverview || "")}
                          className="p-2 rounded-xl bg-white text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition"
                          title="نسخ الشرح"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => readAloud(unitData?.masterOverview || "")}
                          className="p-2 rounded-xl bg-white text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition"
                          title="استماع صوتي للشرح"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-indigo-950 leading-relaxed whitespace-pre-line bg-white/90 p-4 rounded-xl border border-indigo-100 shadow-xs">
                      {unitData?.masterOverview ||
                        "تجمع هذه الوحدة الأساس النظري والتطبيقي لكافة موضوعات الفصل، مع التركيز على فهم العلاقات الرياضية والعلمية وتطبيقها في مسائل مستويات التفكير العليا."}
                    </div>
                  </div>

                  {/* Feynman Explanation Card (Simple Way to Understand) */}
                  {unitData?.feynmanSummary && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                            طريقة فاينمان: فكرة الوحدة بأسهل تشبيه وقصة واقعية
                          </h4>
                        </div>
                        <button
                          onClick={() => readAloud(unitData.feynmanSummary)}
                          className="p-1.5 rounded-lg bg-white text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs flex items-center gap-1"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>استماع</span>
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-950 leading-relaxed whitespace-pre-line bg-white/80 p-3.5 rounded-xl border border-amber-200">
                        {unitData.feynmanSummary}
                      </p>
                    </div>
                  )}

                  {/* Step-by-Step Solved High School Problems */}
                  {unitData?.stepByStepSolved && Array.isArray(unitData.stepByStepSolved) && unitData.stepByStepSolved.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-indigo-600" />
                          مسائل وتطبيقات نموذجية محلولة بالخطوات المعيارية ({unitData.stepByStepSolved.length} مسائل):
                        </h4>
                        <span className="text-[11px] text-slate-400">نظام الثانوية الحديث</span>
                      </div>

                      <div className="space-y-2.5">
                        {unitData.stepByStepSolved.map((item: any, idx: number) => {
                          const isOpenProblem = expandedProblemIndex === idx;
                          return (
                            <div
                              key={idx}
                              className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition shadow-xs"
                            >
                              <button
                                onClick={() => setExpandedProblemIndex(isOpenProblem ? null : idx)}
                                className="w-full p-3.5 text-right flex items-center justify-between gap-2 hover:bg-slate-50 transition"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                                    {idx + 1}
                                  </span>
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                    {item.title || `المسألة النموذجية ${idx + 1}`}
                                  </span>
                                </div>
                                {isOpenProblem ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </button>

                              {isOpenProblem && (
                                <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs sm:text-sm">
                                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-bold text-indigo-600 block mb-1">نص المسألة:</span>
                                    <p className="font-medium text-slate-800 leading-relaxed">{item.problem}</p>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                                      <span className="text-[11px] font-bold text-slate-500 block mb-1">١. تفريغ المعطيات والمطلوب:</span>
                                      <p className="text-slate-700 whitespace-pre-line">{item.givenData}</p>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                                      <span className="text-[11px] font-bold text-slate-500 block mb-1">٢. القانون المستخدم:</span>
                                      <p className="font-mono text-indigo-700 font-bold whitespace-pre-line">{item.ruleOrLaw}</p>
                                    </div>
                                  </div>

                                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-bold text-slate-500 block mb-1">٣. خطوات التعويض الرياضي:</span>
                                    <p className="font-mono text-slate-700 whitespace-pre-line leading-relaxed">{item.substitution}</p>
                                  </div>

                                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                                    <div>
                                      <span className="text-[11px] font-bold text-emerald-800 block">٤. الناتج النهائي مع وحدة القياس:</span>
                                      <span className="font-mono font-bold text-emerald-900 text-sm">{item.finalResult}</span>
                                    </div>
                                    {item.tip && (
                                      <span className="text-[11px] text-emerald-700 bg-white/70 px-2.5 py-1 rounded-lg border border-emerald-200">
                                        💡 {item.tip}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Lessons Grid Overview */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      دروس الوحدة المشمولة في هذا الشرح:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {unit.lessons.map((les) => (
                        <div
                          key={les.id}
                          className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 transition flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              {les.isCompleted && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                              <h5 className="font-bold text-slate-900 text-xs">{les.title}</h5>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{les.description}</p>
                          </div>
                          {onOpenLesson && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenLesson(subject.id, les.id);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-indigo-600 hover:text-white text-indigo-600 text-xs font-bold transition flex items-center gap-1 shrink-0"
                            >
                              <span>عرض</span>
                              <ArrowRight className="w-3 h-3 rotate-180" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Mind Map Tab */}
              {activeTab === "mindmap" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3 sm:p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-indigo-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <GitBranch className="w-4 h-4 text-indigo-600" />
                        الخريطة المفاهيمية البصرية للوحدة
                      </h3>
                      <p className="text-[11px] text-indigo-800/80 mt-0.5">
                        اضغط على أي فرع لتوسيعه أو طيه، ويمكنك نسخ أي مسار أو الاستماع الصوتي له
                      </p>
                    </div>
                    <button
                      onClick={() => readAloud(unitData?.connectionsMap || unit.title)}
                      className="px-2.5 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>قراءة الفكرة العامة</span>
                    </button>
                  </div>

                  <InteractiveMindMap
                    treeData={getUnitMindMapData()}
                    outlineText={unitData?.connectionsMap}
                    onReadAloud={readAloud}
                    onSaveToNote={(txt) => {
                      navigator.clipboard.writeText(txt);
                      onShowToast("تم نسخ فرع الخريطة للحافظة 📋");
                    }}
                    onShowToast={onShowToast}
                  />

                  {unitData?.connectionsMap && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                        خيط الترابط بين مفاهيم دروس الوحدة:
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {unitData.connectionsMap}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Formulas Sheet Tab */}
              {activeTab === "formulas" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-amber-950 text-sm sm:text-base flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-amber-800" />
                        الميثاق الشامل لجميع قوانين ومفاهيم الوحدة:
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyText(unitData?.formulaSheet || "")}
                          className="p-1.5 rounded-lg bg-white text-amber-800 hover:bg-amber-100 border border-amber-300 text-xs flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ القوانين</span>
                        </button>
                        <button
                          onClick={() => readAloud(unitData?.formulaSheet || "")}
                          className="p-1.5 rounded-lg bg-white text-amber-800 hover:bg-amber-100 border border-amber-300 text-xs flex items-center gap-1"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>استماع</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-amber-950 leading-relaxed whitespace-pre-line font-mono bg-white/90 p-4 rounded-xl border border-amber-200 shadow-xs">
                      {unitData?.formulaSheet ||
                        "1. القانون الأساسي الأول للوحدة\n2. علاقة الربط بين المتغيرات\n3. القوانين الخاصة بالحالات الحرجة"}
                    </div>
                  </div>
                </div>
              )}

              {/* Exam Review Tab (Secrets + Forecast Questions) */}
              {activeTab === "exam_review" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-emerald-950 text-sm sm:text-base flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-700" />
                        تريكات الامتحانات ونقاط المفاضلة في البابل شيت:
                      </h3>
                      <button
                        onClick={() => readAloud(unitData?.comprehensiveReview || "")}
                        className="p-1.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>استماع</span>
                      </button>
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-line bg-white/90 p-4 rounded-xl border border-emerald-200 shadow-xs">
                      {unitData?.comprehensiveReview ||
                        "ركز واضعو الامتحانات دائماً على الدمج بين أكثر من درس في السؤال الواحد لاختبار عمق الفهم والقدرة على الربط التحليلي واستبعاد الخيارات غير المنطقية."}
                    </div>
                  </div>

                  {/* Interactive Forecast Questions */}
                  {unitData?.forecastQuestions && Array.isArray(unitData.forecastQuestions) && unitData.forecastQuestions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        أسئلة التوقع والربط البيني المتوقعة لامتحانات 2026/2027:
                      </h4>

                      <div className="space-y-3">
                        {unitData.forecastQuestions.map((q: any, qIdx: number) => {
                          const selectedOpt = forecastAnswers[qIdx];
                          const isAnswered = selectedOpt !== undefined;
                          const isCorrect = isAnswered && selectedOpt === q.correctIndex;

                          return (
                            <div
                              key={qIdx}
                              className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs"
                            >
                              <div className="flex items-start gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 shrink-0 mt-0.5">
                                  {qIdx + 1}
                                </span>
                                <p className="font-bold text-slate-900 text-xs sm:text-sm leading-relaxed">
                                  {q.question}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt: string, optIdx: number) => {
                                  const isThisSelected = selectedOpt === optIdx;
                                  const isThisCorrect = optIdx === q.correctIndex;

                                  let btnStyle = "bg-slate-50 hover:bg-indigo-50/50 border-slate-200 text-slate-800";
                                  if (isAnswered) {
                                    if (isThisCorrect) {
                                      btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold";
                                    } else if (isThisSelected && !isThisCorrect) {
                                      btnStyle = "bg-rose-50 border-rose-400 text-rose-950 line-through";
                                    } else {
                                      btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                                    }
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      disabled={isAnswered}
                                      onClick={() => {
                                        setForecastAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                                        if (optIdx === q.correctIndex) {
                                          onShowToast("إجابة صحيحة وممتازة! 🌟");
                                        } else {
                                          onShowToast("إجابة غير صحيحة، راجع التفسير العلمي أدناه.");
                                        }
                                      }}
                                      className={`p-2.5 rounded-xl border text-right text-xs transition flex items-center justify-between gap-2 ${btnStyle}`}
                                    >
                                      <span>{opt}</span>
                                      {isAnswered && isThisCorrect && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      )}
                                      {isAnswered && isThisSelected && !isThisCorrect && (
                                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {isAnswered && (
                                <div
                                  className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in ${
                                    isCorrect
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                      : "bg-slate-50 border-slate-200 text-slate-800"
                                  }`}
                                >
                                  <span className="font-bold block mb-0.5">التفسير الأكاديمي وطريقة الاستبعاد:</span>
                                  <p>{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Adaptive Quiz Tab */}
              {activeTab === "quiz" && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Unit Mastery Status Banner */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {masteryInfo.progressPercent}%
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">مستوى الطالب في الوحدة:</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${masteryInfo.badgeClass}`}>
                            {masteryInfo.levelLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          تم إنجاز {masteryInfo.completedLessons} من أصل {masteryInfo.totalLessons} دروس بالوحدة
                        </p>
                      </div>
                    </div>

                    {!isQuizActive && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">الصعوبة المقترحة:</span>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                          {masteryInfo.recommendedDifficulty === "hard"
                            ? "مستويات تفكير عليا 🏆"
                            : masteryInfo.recommendedDifficulty === "medium"
                            ? "متوسط / تحليلي ⚡"
                            : "تأسيسي ومباشر 🌱"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quiz Configuration Panel (when quiz is not running) */}
                  {!isQuizActive && !isQuizFinished && (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-slate-50 border border-indigo-200/80 space-y-4">
                      <div>
                        <h4 className="font-bold text-indigo-950 text-sm sm:text-base flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-600" />
                          إعداد وتخصيص الاختبار التكيفي للوحدة:
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          يقوم الذكاء الاصطناعي ببناء أسئلة متدرجة تتكيف مع استجابتك وتجمع بين أنماط الأسئلة المختلفة
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Question Types Selector */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            تنويع أنماط الأسئلة:
                          </label>
                          <select
                            value={quizFilterType}
                            onChange={(e) => setQuizFilterType(e.target.value as any)}
                            className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="mixed">🌟 شامل ومتنوع وفق معايير الوزارة (بابل شيت + صح وخطأ + مقالي)</option>
                            <option value="multiple_choice">🎯 اختيار من متعدد بابل شيت (MCQ)</option>
                            <option value="true_false">⚖️ صواب وخطأ (كشف المغالطات والتصويب)</option>
                            <option value="essay">✍️ مقالي تحليلي مقنن (سلالم تصحيح وزارية)</option>
                            <option value="fill_blank">🔤 إكمال فراغات ومصطلحات علمية</option>
                          </select>
                        </div>

                        {/* Difficulty Selector */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            نظام مستوى الصعوبة:
                          </label>
                          <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                            className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="adaptive">🎯 تكيّفي ذكي (يتدرج تلقائياً حسب إجاباتك)</option>
                            <option value="easy">🌱 مباشر وتأسيسي (مفاهيم أساسية)</option>
                            <option value="medium">⚡ متوسط (فهم وتطبيق وتحليل)</option>
                            <option value="hard">🏆 مستويات تفكير عليا وربط بيني</option>
                          </select>
                        </div>

                        {/* Question Count Selector */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            عدد أسئلة الاختبار:
                          </label>
                          <select
                            value={quizQuestionCount}
                            onChange={(e) => setQuizQuestionCount(Number(e.target.value))}
                            className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value={4}>4 أسئلة (اختبار سريع مركز)</option>
                            <option value={6}>6 أسئلة (اختبار شامل متوازن)</option>
                            <option value={8}>8 أسئلة (محاكاة امتحانية موسعة)</option>
                            <option value={10}>10 أسئلة (شامل لكافة نواتج التعلم)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleStartUnitQuiz}
                          disabled={isGeneratingQuiz}
                          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-2 disabled:opacity-50"
                        >
                          {isGeneratingQuiz ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>جاري إعداد الاختبار بالذكاء الاصطناعي...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              <span>بدء الاختبار التكيفي للوحدة الآن 🚀</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active Quiz Runner */}
                  {isQuizActive && currentQ && !isQuizFinished && (
                    <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4 animate-in zoom-in-95">
                      {/* Top Bar Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            السؤال {currentQuizIndex + 1} من {quizQuestions.length}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
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

                          <span className="text-[11px] text-slate-500 font-semibold">
                            {currentQ.type === "multiple_choice" || (!currentQ.type && currentQ.options)
                              ? "اختيار من متعدد (بابل شيت)"
                              : currentQ.type === "true_false"
                              ? "صواب وخطأ (مفاهيمي)"
                              : currentQ.type === "fill_blank"
                              ? "إكمال مصطلح"
                              : "سؤال مقالي تحليلي"}
                          </span>

                          {currentQ.ministryStandard && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                              <Award className="w-3 h-3 text-purple-600" />
                              <span className="truncate max-w-[140px] sm:max-w-none">{currentQ.ministryStandard}</span>
                            </span>
                          )}

                          {currentQ.marks && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {currentQ.marks} {currentQ.marks === 1 ? "درجة" : "درجات"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {currentQ.hint && (
                            <button
                              onClick={() => setRevealedHint(!revealedHint)}
                              className="text-[11px] px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold flex items-center gap-1 transition"
                            >
                              <Lightbulb className="w-3 h-3 text-amber-600" />
                              <span>{revealedHint ? "إخفاء التلميح" : "تلميح 💡"}</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setIsQuizActive(false);
                              setIsQuizFinished(false);
                            }}
                            className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                          >
                            إنهاء الاختبار
                          </button>
                        </div>
                      </div>

                      {/* Adaptive Alert Banner if level adapted */}
                      {adaptiveMessage && (
                        <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900 animate-in fade-in flex items-center gap-2">
                          <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{adaptiveMessage}</span>
                        </div>
                      )}

                      {/* Hint Drawer */}
                      {revealedHint && currentQ.hint && (
                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed animate-in fade-in flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block mb-0.5">تلميح تربوي:</span>
                            <span>{currentQ.hint}</span>
                          </div>
                        </div>
                      )}

                      {/* Question Text Prompt */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                          {currentQ.question}
                        </h3>
                      </div>

                      {/* 1. Multiple Choice Options */}
                      {(currentQ.type === "multiple_choice" || (!currentQ.type && currentQ.options)) && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {currentQ.options?.map((opt, idx) => {
                            let btnStyle = "bg-white border-slate-200 text-slate-800 hover:bg-slate-50";
                            if (isAnswerSubmitted) {
                              if (idx === currentQ.correctIndex) {
                                btnStyle = "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs";
                              } else if (idx === selectedOption) {
                                btnStyle = "bg-rose-600 text-white border-rose-600 font-bold shadow-xs";
                              } else {
                                btnStyle = "bg-slate-100 text-slate-400 border-slate-200 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={idx}
                                disabled={isAnswerSubmitted}
                                onClick={() => handleSelectMcq(idx)}
                                className={`p-3 rounded-xl border text-xs sm:text-sm text-right transition flex items-center justify-between gap-2 ${btnStyle}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-md bg-black/5 flex items-center justify-center text-xs font-bold">
                                    {["أ", "ب", "ج", "د"][idx]}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                {isAnswerSubmitted && idx === currentQ.correctIndex && (
                                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                                )}
                                {isAnswerSubmitted && idx === selectedOption && idx !== currentQ.correctIndex && (
                                  <XCircle className="w-4 h-4 text-white shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Bubble Sheet Exclusion Reasoning */}
                        {isAnswerSubmitted && currentQ.exclusionReasoning && currentQ.exclusionReasoning.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5 animate-in fade-in">
                            <div className="flex items-center gap-1.5 font-bold text-amber-900">
                              <Target className="w-4 h-4 text-amber-700 shrink-0" />
                              <span>تحليل استبعاد المشتتات والبدائل (نظام البابل شيت الوزاري):</span>
                            </div>
                            <ul className="space-y-1 text-slate-800 pr-2 border-r-2 border-amber-300 mr-1">
                              {currentQ.exclusionReasoning.map((reason, rIdx) => (
                                <li key={rIdx} className="leading-relaxed">
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. True / False Question Form */}
                    {currentQ.type === "true_false" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            disabled={isAnswerSubmitted}
                            onClick={() => handleSelectTrueFalse(true)}
                            className={`p-4 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                              isAnswerSubmitted
                                ? (currentQ.isTrue === true
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                    : selectedTrueFalse === true
                                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                    : "bg-slate-100 text-slate-400 border-slate-200 opacity-60")
                                : "bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-400 shadow-2xs"
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <span>(صواب ✔️) - العبارة صحيحة</span>
                          </button>

                          <button
                            type="button"
                            disabled={isAnswerSubmitted}
                            onClick={() => handleSelectTrueFalse(false)}
                            className={`p-4 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                              isAnswerSubmitted
                                ? (currentQ.isTrue === false
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                    : selectedTrueFalse === false
                                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                    : "bg-slate-100 text-slate-400 border-slate-200 opacity-60")
                                : "bg-white hover:bg-rose-50 text-rose-800 border-rose-200 hover:border-rose-400 shadow-2xs"
                            }`}
                          >
                            <XCircle className="w-5 h-5 shrink-0" />
                            <span>(خطأ ✖️) - العبارة غير صحيحة</span>
                          </button>
                        </div>

                        {/* Instant correction box for True/False */}
                        {isAnswerSubmitted && (
                          <div
                            className={`p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
                              isCurrentCorrect
                                ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                                : "bg-rose-50 text-rose-950 border-rose-200"
                            }`}
                          >
                            {isCurrentCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-1.5 flex-1">
                              <div className="font-bold">
                                {isCurrentCorrect
                                  ? "🎯 تقييم إجابتك: صحيحة ومتقنة تماماً!"
                                  : `⚠️ الحكم العلمي الدقيق على العبارة: ${currentQ.isTrue ? "صواب (صح ✔️)" : "خطأ (✖️)"}`}
                              </div>
                              {currentQ.correction && (
                                <div className="text-slate-800 bg-white/90 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                                  <span className="font-bold text-slate-900 block mb-0.5">التصويب العلمي المعتمد والتعليل:</span>
                                  <span>{currentQ.correction}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Fill-in-the-blank Question Form */}
                      {currentQ.type === "fill_blank" && (
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={fillBlankInput}
                              disabled={isAnswerSubmitted}
                              onChange={(e) => setFillBlankInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !isAnswerSubmitted && fillBlankInput.trim()) {
                                  handleCheckFillBlank();
                                }
                              }}
                              placeholder="اكتب الكلمة أو المصطلح الناقص هنا..."
                              className="flex-1 text-xs sm:text-sm p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                            />
                            <button
                              disabled={isAnswerSubmitted || !fillBlankInput.trim()}
                              onClick={handleCheckFillBlank}
                              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>تحقق من الإجابة</span>
                            </button>
                          </div>

                          {isAnswerSubmitted && (
                            <div
                              className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                                isCurrentCorrect
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                                  : "bg-rose-50 text-rose-900 border-rose-200"
                              }`}
                            >
                              {isCurrentCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                              <div>
                                <span>
                                  {isCurrentCorrect ? "إجابة صحيحة! " : "الإجابة النموذجية المعتمدة هي: "}
                                </span>
                                <strong className="font-bold underline">{currentQ.correctAnswer}</strong>
                                {currentQ.acceptedAnswers && currentQ.acceptedAnswers.length > 1 && (
                                  <span className="text-[11px] opacity-80 mr-2">
                                    (صيغ مقبولة أخرى: {currentQ.acceptedAnswers.join("، ")})
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Essay Question Form */}
                      {currentQ.type === "essay" && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              اكتب تحليلك وإجابتك النموذجية:
                            </label>
                            <textarea
                              rows={3}
                              disabled={isAnswerSubmitted}
                              value={essayInput}
                              onChange={(e) => setEssayInput(e.target.value)}
                              placeholder="صِغ إجابتك العلمية والتعليل المنطقي بأسلوبك..."
                              className="w-full text-xs sm:text-sm p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                            />
                          </div>

                          {!isAnswerSubmitted && (
                            <div className="flex justify-end">
                              <button
                                onClick={handleSubmitEssay}
                                disabled={!essayInput.trim()}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <PenTool className="w-3.5 h-3.5" />
                                <span>اعتماد الإجابة وعرض النموذج الوزاري</span>
                              </button>
                            </div>
                          )}

                          {isAnswerSubmitted && (
                            <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 space-y-3 animate-in fade-in">
                              <div>
                                <span className="text-xs font-bold text-purple-900 block mb-1">
                                  📄 النموذج الإرشادي المعتمد للإجابة:
                                </span>
                                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/80 p-3 rounded-lg border border-purple-100">
                                  {currentQ.modelAnswer || currentQ.explanation}
                                </p>
                              </div>

                              {currentQ.rubric && currentQ.rubric.length > 0 && (
                                <div>
                                  <span className="text-xs font-bold text-purple-900 block mb-1">
                                    ⚖️ معايير التقييم وتوزيع الدرجات:
                                  </span>
                                  <ul className="text-xs text-slate-700 space-y-1 bg-white/80 p-2.5 rounded-lg border border-purple-100">
                                    {currentQ.rubric.map((item, idx) => (
                                      <li key={idx} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Self-Rating evaluation for essay */}
                              <div className="pt-2 border-t border-purple-200/60">
                                <span className="text-xs font-bold text-purple-950 block mb-2">
                                  قيّم مدى مطابقة إجابتك للنموذج المعتمد:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleSelfRateEssay("full")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                      essaySelfRating === "full"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>إجابة متطابقة تماماً (درجة كاملة)</span>
                                  </button>

                                  <button
                                    onClick={() => handleSelfRateEssay("half")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                      essaySelfRating === "half"
                                        ? "bg-amber-600 text-white"
                                        : "bg-white border border-amber-300 text-amber-800 hover:bg-amber-50"
                                    }`}
                                  >
                                    <span>نصف إجابة صحيحة (50%)</span>
                                  </button>

                                  <button
                                    onClick={() => handleSelfRateEssay("none")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                      essaySelfRating === "none"
                                        ? "bg-rose-600 text-white"
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

                      {/* Explanation Box after submission */}
                      {isAnswerSubmitted && currentQ.explanation && (
                        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs animate-in fade-in">
                          <span className="font-bold text-indigo-900 block mb-1">
                            💡 الشرح والتحليل المعرفي:
                          </span>
                          <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
                        </div>
                      )}

                      {/* Next Question / Finish Button */}
                      {isAnswerSubmitted && (
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={handleNextQuizQuestion}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                          >
                            <span>
                              {currentQuizIndex + 1 === quizQuestions.length
                                ? "عرض نتيجة الاختبار التكيفي"
                                : "السؤال التالي"}
                            </span>
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Quiz Screen */}
                  {isQuizFinished && (
                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95 max-w-lg mx-auto">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md shadow-orange-500/30">
                        🏆
                      </div>

                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                          أحسنت! أتممت التحدي التكيفي لوحدة: {unit.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          تم تقييم مستواك وتحديث نقاط خبرتك وفق معايير الامتحانات الحديثة
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div>
                          <div className="text-xl font-black text-indigo-600 font-mono">
                            {Math.round((correctCount / quizQuestions.length) * 100)}%
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold">النسبة المئوية</div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-emerald-600 font-mono">
                            {correctCount} / {quizQuestions.length}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold">إجابات محتسبة</div>
                        </div>
                        <div>
                          <div className="text-xl font-black text-amber-600 font-mono">
                            +{earnedXp} XP
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold">نقاط مكتسبة</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setIsQuizActive(false);
                            setIsQuizFinished(false);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                          العودة لإعدادات الاختبار
                        </button>
                        <button
                          onClick={handleStartUnitQuiz}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>إعادة الاختبار بأسئلة جديدة</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const text =
                  activeTab === "overview"
                    ? unitData?.masterOverview
                    : activeTab === "connections"
                    ? unitData?.connectionsMap
                    : activeTab === "formulas"
                    ? unitData?.formulaSheet
                    : unitData?.comprehensiveReview;
                handleCopyText(text || "");
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "تم النسخ" : "نسخ الشرح"}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onAskAi(
                  `أريد مناقشة وحدة "${unit.title}" في مادة ${subject.title}: ما هي أهم الأفكار المركبة التي تجمع دروسها؟`,
                  subject.title
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>مناقشة الوحدة مع AI</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
