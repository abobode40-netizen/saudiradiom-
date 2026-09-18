import React, { useState, useMemo, useEffect, useRef } from "react";
import { Subject, Unit, Lesson, QuizQuestion, ViewMode } from "../../types";
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
  Award,
  HelpCircle,
  RotateCcw,
  Send,
  Zap,
  FileText,
  Lightbulb,
  Check,
  X,
  Sliders,
  Flame,
  ArrowRight,
  GraduationCap,
  Layers,
  FileSpreadsheet,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Share2,
  Youtube,
} from "lucide-react";
import {
  getUnitMasteryInfo,
  getUnitDiverseQuestions,
  checkFillBlankAnswer,
} from "../../utils/quizUtils";
import confetti from "canvas-confetti";
import { YoutubeUnitLessonSection } from "../YoutubeUnitLessonSection";
import { getSubjectYoutubeLessons } from "../../data/youtubeLessonsData";
import { UnitAcademicNotesSection } from "../UnitAcademicNotesSection";
import { getUnitAcademicNote } from "../../data/unitAcademicNotesData";

interface SubjectPortalViewProps {
  subject: Subject;
  allSubjects: Subject[];
  onSelectSubject: (subjectId: string) => void;
  onNavigateToMonthlyExams: () => void;
  onOpenLesson: (subjectId: string, lessonId: string) => void;
  onAskAi: (prompt: string, subjectTitle: string) => void;
  onOpenUnitAi?: (unit: Unit, subject: Subject) => void;
  onOpenExternalBooks?: (subjectId: string, unitId?: string) => void;
  onShowToast: (msg: string) => void;
  onCompleteQuiz?: (score: number, total: number, xp: number) => void;
}

type SubjectPortalTab =
  | "curriculum"
  | "academic_notes"
  | "youtube_lectures"
  | "unit_quizzes"
  | "general_exams"
  | "laws_summary"
  | "subject_ai";

export const SubjectPortalView: React.FC<SubjectPortalViewProps> = ({
  subject,
  allSubjects,
  onSelectSubject,
  onNavigateToMonthlyExams,
  onOpenLesson,
  onAskAi,
  onOpenUnitAi,
  onOpenExternalBooks,
  onShowToast,
  onCompleteQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<SubjectPortalTab>("curriculum");
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(subject.units[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnitForQuizId, setSelectedUnitForQuizId] = useState<string>(subject.units[0]?.id || "");
  const [selectedAcademicUnitId, setSelectedAcademicUnitId] = useState<string>(subject.units[0]?.id || "");
  const [selectedYoutubeUnitId, setSelectedYoutubeUnitId] = useState<string>(subject.units[0]?.id || "");

  // Dropdown states for header navigation
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);
  const unitDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subject.units.length > 0) {
      setSelectedAcademicUnitId(subject.units[0].id);
      setSelectedYoutubeUnitId(subject.units[0].id);
      setSelectedUnitForQuizId(subject.units[0].id);
      setExpandedUnitId(subject.units[0].id);
    }
  }, [subject.id]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(e.target as Node)) {
        setShowSubjectDropdown(false);
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(e.target as Node)) {
        setShowUnitDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Unit Quiz States
  const [activeQuizTitle, setActiveQuizTitle] = useState<string | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [fillBlankInput, setFillBlankInput] = useState("");
  const [essayInput, setEssayInput] = useState("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [showEssayModelAnswer, setShowEssayModelAnswer] = useState(false);

  // Subject AI Chat within portal
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: `أهلاً بك في باب ${subject.title}! أنا معلمك الذكي الخاص بهذه المادة، مستعد لشرح أي درس أو تبسيط أي قانون أو تدريبك على تريكات امتحانات البابل شيت. ماذا نذاكر اليوم؟ 🚀`,
    },
  ]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Selected Unit for Unit Quiz Tab
  const selectedUnitForQuiz = useMemo(() => {
    return subject.units.find((u) => u.id === selectedUnitForQuizId) || subject.units[0] || null;
  }, [subject, selectedUnitForQuizId]);

  const unitMastery = useMemo(() => {
    return getUnitMasteryInfo(selectedUnitForQuiz);
  }, [selectedUnitForQuiz]);

  // Overall Subject Progress
  const totalLessons = subject.totalLessons || 1;
  const completedLessons = subject.completedLessons || 0;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Filtered units for search
  const filteredUnits = subject.units.map((unit) => ({
    ...unit,
    lessons: unit.lessons.filter((l) =>
      searchTerm.trim()
        ? l.title.includes(searchTerm) || l.description.includes(searchTerm)
        : true
    ),
  }));

  // Handlers for starting quizzes
  const handleStartUnitQuiz = (
    unit: Unit,
    quizType: "adaptive" | "standard" | "essay" | "fill" | "quick",
    customTitle?: string
  ) => {
    const rawQuestions = getUnitDiverseQuestions(
      subject,
      unit,
      quizType === "essay" ? "essay" : quizType === "fill" ? "fill_blank" : "mixed"
    );

    let questionsToUse = [...rawQuestions];
    if (quizType === "quick") {
      questionsToUse = questionsToUse.slice(0, 3);
    } else if (quizType === "adaptive") {
      // Adaptive ordering according to student mastery
      if (unitMastery.level === "beginner") {
        questionsToUse.sort((a, b) => (a.difficulty === "easy" ? -1 : 1));
      } else if (unitMastery.level === "advanced") {
        questionsToUse.sort((a, b) => (a.difficulty === "hard" ? -1 : 1));
      }
    }

    // Add lesson test question if available
    unit.lessons.forEach((l, idx) => {
      if (l.testQuestion && !questionsToUse.some((q) => q.question.includes(l.title))) {
        questionsToUse.push({
          id: `lesson_test_${l.id}_${idx}`,
          type: "multiple_choice",
          question: `[${l.title}] ${l.testQuestion.question}`,
          options: l.testQuestion.options,
          correctIndex: l.testQuestion.correctIndex,
          explanation: l.testQuestion.explanation,
          difficulty: "medium",
          subjectId: subject.id,
          unitId: unit.id,
          unitTitle: unit.title,
        });
      }
    });

    setActiveQuizTitle(customTitle || `اختبار ${unit.title}`);
    setActiveQuizQuestions(questionsToUse);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setFillBlankInput("");
    setEssayInput("");
    setIsAnswerSubmitted(false);
    setIsAnswerCorrect(null);
    setScore(0);
    setShowExplanation(false);
    setShowHint(false);
    setIsQuizCompleted(false);
    setShowEssayModelAnswer(false);
    setQuizStartTime(Date.now());
    setActiveTab("unit_quizzes");
    setSelectedUnitForQuizId(unit.id);
  };

  const handleStartGeneralSubjectExam = (examTitle: string) => {
    // Generate comprehensive multi-unit questions from all units of this subject
    const allQuestions: QuizQuestion[] = [];
    subject.units.forEach((u) => {
      const uQuestions = getUnitDiverseQuestions(subject, u, "mixed");
      allQuestions.push(...uQuestions);
      u.lessons.forEach((l) => {
        if (l.testQuestion) {
          allQuestions.push({
            id: `gen_${l.id}`,
            type: "multiple_choice",
            question: `[${u.title} • ${l.title}] ${l.testQuestion.question}`,
            options: l.testQuestion.options,
            correctIndex: l.testQuestion.correctIndex,
            explanation: l.testQuestion.explanation,
            difficulty: "hard",
            subjectId: subject.id,
            unitId: u.id,
            unitTitle: u.title,
          });
        }
      });
    });

    setActiveQuizTitle(examTitle);
    setActiveQuizQuestions(allQuestions.slice(0, 10)); // 10 comprehensive questions
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setFillBlankInput("");
    setEssayInput("");
    setIsAnswerSubmitted(false);
    setIsAnswerCorrect(null);
    setScore(0);
    setShowExplanation(false);
    setShowHint(false);
    setIsQuizCompleted(false);
    setShowEssayModelAnswer(false);
    setQuizStartTime(Date.now());
    setActiveTab("unit_quizzes");
  };

  const currentQ = activeQuizQuestions[currentQuestionIndex];

  const handleCheckAnswer = () => {
    if (!currentQ || isAnswerSubmitted) return;

    let correct = false;
    if (currentQ.type === "multiple_choice") {
      if (selectedOption === null) {
        onShowToast("يرجى اختيار إجابة أولاً");
        return;
      }
      correct = selectedOption === currentQ.correctIndex;
    } else if (currentQ.type === "fill_blank") {
      if (!fillBlankInput.trim()) {
        onShowToast("يرجى كتابة الإجابة في الفراغ");
        return;
      }
      correct = checkFillBlankAnswer(fillBlankInput, currentQ.correctAnswer, currentQ.acceptedAnswers);
    } else if (currentQ.type === "essay") {
      if (!essayInput.trim()) {
        onShowToast("يرجى كتابة تحليلك أو خطوات الإجابة");
        return;
      }
      correct = true; // essay is self-evaluated / rubric based
      setShowEssayModelAnswer(true);
    }

    setIsAnswerCorrect(correct);
    setIsAnswerSubmitted(true);
    setShowExplanation(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setFillBlankInput("");
      setEssayInput("");
      setIsAnswerSubmitted(false);
      setIsAnswerCorrect(null);
      setShowExplanation(false);
      setShowHint(false);
      setShowEssayModelAnswer(false);
    } else {
      // Finished Quiz
      setIsQuizCompleted(true);
      const totalQ = activeQuizQuestions.length;
      const finalScore = score + (isAnswerCorrect ? 0 : 0);
      const xpWon = finalScore * 25 + 50;

      if (onCompleteQuiz) {
        onCompleteQuiz(finalScore, totalQ, xpWon);
      }

      if (finalScore >= totalQ * 0.7) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if unavailable
        }
      }
    }
  };

  const handleSendAiChatMessage = (textToSend?: string) => {
    const query = textToSend || aiChatInput;
    if (!query.trim()) return;

    const userMsg = { sender: "user" as const, text: query };
    setAiChatMessages((prev) => [...prev, userMsg]);
    setAiChatInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      let aiReply = "";
      if (query.includes("قانون") || query.includes("قوانين")) {
        aiReply = `في منهج ${subject.title}، هذه هي القوانين الحاكمة الأهم:\n${subject.units
          .flatMap((u) => u.lessons.flatMap((l) => l.keyLaws))
          .map((k) => `• ${k.title}: ${k.formula} (${k.explanation})`)
          .slice(0, 3)
          .join("\n")}\n\nهل تود تطبيق مسألة مباشرة على أحد هذه القوانين؟`;
      } else if (query.includes("امتحان") || query.includes("بابل شيت") || query.includes("تريك")) {
        aiReply = `أهم تريكات ${subject.title} في البابل شيت 2026/2027:\n1. انتبه دائماً إلى الشروط الخاصة بالقانون (مثل أن يكون المميز ≥ 0، أو عند 4 درجات مئوية للماء).\n2. في أسئلة الاختيار من متعدد، استبعد الخيارات المستحيلة أولاً لتزيد نسبة الصواب.\n3. تحقق من وحدات القياس والمطلوب بالضبط قبل تظليل الدائرة.`;
      } else {
        aiReply = `سؤال ممتاز في ${subject.title}! نواتج التعلم الوزارية تركز على الفهم والتطبيق بدلاً من الحفظ المجرد. بناءً على سؤالك، ننصحك أيضاً بمراجعة درس "${subject.units[0]?.lessons[0]?.title}" وحل امتحانه التكيفي المتاح في هذا الباب.`;
      }

      setAiChatMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
      setIsAiTyping(false);
    }, 700);
  };

  // Collect all formulas in subject for Laws Hub
  const allSubjectLaws = useMemo(() => {
    const list: {
      unitTitle: string;
      lessonTitle: string;
      lessonId: string;
      lawTitle: string;
      formula: string;
      explanation: string;
    }[] = [];

    subject.units.forEach((u) => {
      u.lessons.forEach((l) => {
        l.keyLaws.forEach((k) => {
          list.push({
            unitTitle: u.title,
            lessonTitle: l.title,
            lessonId: l.id,
            lawTitle: k.title,
            formula: k.formula,
            explanation: k.explanation,
          });
        });
      });
    });
    return list;
  }, [subject]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Subject Portal Big Door Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            {/* Door Badge & Quick Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                <GraduationCap className="w-3.5 h-3.5" />
                باب المادة المعتمد • الصف الأول الثانوي 2026/2027
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {subject.units.length} وحدات دراسية
              </span>
            </div>

            {/* Subject Title */}
            <div className="flex items-center gap-3.5">
              <span className="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                {subject.icon}
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>باب {subject.title}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  الباب الشامل للمادة: شروحات تفاعلية، اختبارات كل وحدة، امتحانات عامة، وبنك قوانين معتمد.
                </p>
              </div>
            </div>

            {/* Subject Dropdowns & Quick Switcher */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {/* Dropdown 1: Switch Subject */}
              <div className="relative" ref={subjectDropdownRef}>
                <button
                  onClick={() => {
                    setShowSubjectDropdown(!showSubjectDropdown);
                    setShowUnitDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>تبديل المادة: {subject.title}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSubjectDropdown ? "rotate-180" : ""}`} />
                </button>

                {showSubjectDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 text-slate-800">
                    <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                      اختر مادة للانتقال إلى بابها:
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                      {allSubjects.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            onSelectSubject(s.id);
                            setShowSubjectDropdown(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-right flex items-center justify-between hover:bg-indigo-50 transition text-xs font-bold ${
                            s.id === subject.id ? "bg-indigo-50/80 text-indigo-700" : "text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{s.icon}</span>
                            <span>باب {s.title}</span>
                          </div>
                          {s.id === subject.id && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-semibold">
                              الحالي
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown 2: Jump to Unit */}
              <div className="relative" ref={unitDropdownRef}>
                <button
                  onClick={() => {
                    setShowUnitDropdown(!showUnitDropdown);
                    setShowSubjectDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 text-xs font-semibold border border-white/15 transition shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-300" />
                  <span>انتقال سريع لوحدة ▾</span>
                </button>

                {showUnitDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 text-slate-800">
                    <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                      وحدات باب {subject.title}:
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                      {subject.units.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setExpandedUnitId(u.id);
                            setSelectedAcademicUnitId(u.id);
                            setSelectedYoutubeUnitId(u.id);
                            setSelectedUnitForQuizId(u.id);
                            setShowUnitDropdown(false);
                            onShowToast(`تم الانتقال إلى: ${u.title}`);
                          }}
                          className="w-full px-3.5 py-2.5 text-right flex flex-col hover:bg-indigo-50 transition text-xs font-bold text-slate-700"
                        >
                          <span className="text-indigo-600 font-semibold text-[10px]">الوحدة {u.order}</span>
                          <span className="line-clamp-1">{u.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly All Subjects Portal Button */}
              <button
                onClick={onNavigateToMonthlyExams}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 hover:bg-amber-500/40 text-amber-200 text-xs font-bold border border-amber-500/40 transition whitespace-nowrap"
              >
                <span>🏆</span>
                <span>باب الامتحانات الشهرية العامة</span>
              </button>
            </div>
          </div>

          {/* Door Progress & Vital Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[200px] w-full lg:w-auto flex flex-col items-center justify-center text-center">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {progressPercent}%
            </div>
            <div className="text-xs text-indigo-200 font-bold mt-1">نسبة إنجاز هذا الباب</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {completedLessons} من {totalLessons} درساً مكتمل
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-linear-to-r from-emerald-400 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Subject Portal Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "curriculum"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الوحدات والدروس</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "curriculum" ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-500"}`}>
            {subject.units.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("academic_notes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "academic_notes"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === "academic_notes" ? "text-white" : "text-emerald-600"}`} />
          <span>شرح الوحدة الأكاديمي (بدون AI)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            شرح منظم
          </span>
        </button>

        <button
          onClick={() => setActiveTab("youtube_lectures")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "youtube_lectures"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Youtube className={`w-4 h-4 ${activeTab === "youtube_lectures" ? "text-white" : "text-red-600"}`} />
          <span>شروحات يوتيوب وتلخيصها</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-800 font-bold">
            معلمين + اختبار
          </span>
        </button>

        <button
          onClick={() => setActiveTab("unit_quizzes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "unit_quizzes"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>اختبارات الوحدات الخاصة</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
            تكيفية + مقالي
          </span>
        </button>

        <button
          onClick={() => setActiveTab("general_exams")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "general_exams"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>اختبارات عامة على المادة</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-bold">
            نماذج شاملة
          </span>
        </button>

        <button
          onClick={() => setActiveTab("laws_summary")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "laws_summary"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>ملخصات وقوانين الباب</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "laws_summary" ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-500"}`}>
            {allSubjectLaws.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("subject_ai")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "subject_ai"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Bot className="w-4 h-4 text-amber-500" />
          <span>معلم الباب الذكي</span>
        </button>

        {onOpenExternalBooks && (
          <button
            onClick={() => onOpenExternalBooks(subject.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 shadow-xs"
            title="تصفح الكتب الخارجية المعتمدة (المعاصر، الامتحان) وإدراج ملفات PDF"
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>الكتب الخارجية والـ PDF</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-900 font-bold">
              المعاصر والامتحان
            </span>
          </button>
        )}
      </div>

      {/* ================= TAB 1: CURRICULUM, UNITS & LESSONS ================= */}
      {activeTab === "curriculum" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Search bar inside this door */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`ابحث عن أي درس أو قانون أو تريك في باب ${subject.title}...`}
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          </div>

          {/* Units in this Door */}
          <div className="space-y-4">
            {filteredUnits.map((unit) => {
              const isExpanded = expandedUnitId === unit.id;
              return (
                <div
                  key={unit.id}
                  className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden transition"
                >
                  {/* Unit Bar */}
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

                    {/* Quick Actions for Unit */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                      {/* Academic Notes Button (بدون AI) */}
                      <button
                        onClick={() => {
                          setSelectedAcademicUnitId(unit.id);
                          setActiveTab("academic_notes");
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
                        title="شرح أكاديمي منظم ومفصل بدون ذكاء اصطناعي"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>شرح الوحدة الأكاديمي</span>
                      </button>

                      {/* YouTube Lecture & Summary Button */}
                      <button
                        onClick={() => {
                          setSelectedYoutubeUnitId(unit.id);
                          setActiveTab("youtube_lectures");
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
                        title="فيديو يوتيوب مع تلخيص واختبار تفاعلي"
                      >
                        <Youtube className="w-3.5 h-3.5 text-rose-600" />
                        <span>يوتيوب وتلخيص</span>
                      </button>

                      {/* Open Unit Tests Button */}
                      <button
                        onClick={() => {
                          setSelectedUnitForQuizId(unit.id);
                          setActiveTab("unit_quizzes");
                          handleStartUnitQuiz(unit, "adaptive", `الاختبار التكيفي: ${unit.title}`);
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition flex items-center gap-1.5"
                        title="الانتقال لاختبارات هذه الوحدة"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>اختبارات الوحدة</span>
                      </button>

                      {/* External Books Button */}
                      {onOpenExternalBooks && (
                        <button
                          onClick={() => onOpenExternalBooks(subject.id, unit.id)}
                          className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition flex items-center gap-1.5"
                          title="شرح تفصيلي واختبارات الوحدة من الكتب الخارجية المعتمدة (المعاصر، الامتحان...)"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                          <span>كتب خارجية واختبارات</span>
                        </button>
                      )}

                      {/* AI Masterclass Button */}
                      {onOpenUnitAi && (
                        <button
                          onClick={() => onOpenUnitAi(unit, subject)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                          title="شرح شامل ومترابط للوحدة كاملة بجميع الطرق بالذكاء الاصطناعي"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                          <span>شرح Masterclass</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unit Lessons Accordion Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-slate-50/40 divide-y divide-slate-100">
                      {unit.lessons.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">
                          لا توجد دروس تطابق بحثك في هذا الباب
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

                            {/* Actions for Lesson */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                onClick={() => onAskAi(lesson.title, subject.title)}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition text-xs font-bold flex items-center gap-1"
                                title="اسأل المدرس الذكي عن هذا الدرس"
                              >
                                <Bot className="w-4 h-4" />
                                <span className="hidden sm:inline">اسأل AI</span>
                              </button>

                              <button
                                onClick={() => onOpenLesson(subject.id, lesson.id)}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>شرح الدرس والمذاكرة</span>
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
      )}

      {/* ================= TAB 2: ACADEMIC NOTES (شرح الوحدة المنظم بدون AI) ================= */}
      {activeTab === "academic_notes" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Unit selector pills */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  شرح أكاديمي منظم ومحرر
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  اختر الوحدة لقراءة شرحها الأكاديمي الشامل (بدون ذكاء اصطناعي)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                مفاهيم وقوانين وأمثلة محلولة وتريكات امتحانات
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              {subject.units.map((u) => {
                const isSelected = u.id === selectedAcademicUnitId;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedAcademicUnitId(u.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 border ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    الوحدة {u.order}: {u.title.split(":")[1]?.trim() || u.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render Unit Academic Notes Component */}
          {(() => {
            const activeUnit = subject.units.find((u) => u.id === selectedAcademicUnitId) || subject.units[0];
            if (!activeUnit) return null;
            return (
              <UnitAcademicNotesSection
                unit={activeUnit}
                subject={subject}
                academicNote={getUnitAcademicNote(activeUnit.id)}
                onOpenLesson={onOpenLesson}
                onShowToast={onShowToast}
              />
            );
          })()}
        </div>
      )}

      {/* ================= TAB 3: YOUTUBE TEACHER LECTURES & SUMMARIES ================= */}
      {activeTab === "youtube_lectures" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Unit selector pills */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit">
                  <Youtube className="w-3.5 h-3.5 text-red-600" />
                  شروحات يوتيوب لنخبة المعلمين
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  اختر الوحدة لعرض فيديو الشرح وتلخيص الحصة واختبارها
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                تلخيص ذكي بنقاط مركزة + اختبار فوري على ما فهمته
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              {subject.units.map((u) => {
                const isSelected = u.id === selectedYoutubeUnitId;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedYoutubeUnitId(u.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 border ${
                      isSelected
                        ? "bg-red-600 text-white border-red-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    الوحدة {u.order}: {u.title.split(":")[1]?.trim() || u.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render YouTube Lesson Section */}
          {(() => {
            const activeUnit = subject.units.find((u) => u.id === selectedYoutubeUnitId) || subject.units[0];
            const ytLessons = getSubjectYoutubeLessons(subject.id, activeUnit?.id, activeUnit?.title, subject.title);
            const ytLesson = ytLessons[0];

            if (!ytLesson) {
              return (
                <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl">
                    <Youtube className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">
                    شروحات يوتيوب لوحدة: {activeUnit?.title}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    تم إدراج تلخيصات ونماذج فيديوهات يوتيوب لأهم وحدات المنهج. كما يمكنك وضع رابط أي حصة يوتيوب لمعلمك المفضل لتلخيصها وحل اختبارها فوراً!
                  </p>
                </div>
              );
            }

            return (
              <YoutubeUnitLessonSection
                lesson={ytLesson}
                onRewardXp={(xp) => {
                  if (onCompleteQuiz) {
                    onCompleteQuiz(ytLesson.quiz.length, ytLesson.quiz.length, xp);
                  }
                }}
                onShowToast={onShowToast}
              />
            );
          })()}
        </div>
      )}

      {/* ================= TAB 4: UNIT-SPECIFIC QUIZZES ================= */}
      {activeTab === "unit_quizzes" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Unit selector pills */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-500">اختر الوحدة لبدء اختباراتها المخصصة:</div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {subject.units.map((u) => {
                const isSelected = u.id === selectedUnitForQuizId;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUnitForQuizId(u.id);
                      setActiveQuizTitle(null); // reset active quiz view
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 border ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    الوحدة {u.order}: {u.title.split(":")[1]?.trim() || u.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Active Quiz is Running */}
          {activeQuizTitle && currentQ && !isQuizCompleted ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
              {/* Quiz Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {activeQuizTitle}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      السؤال {currentQuestionIndex + 1} من {activeQuizQuestions.length}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 mt-1">
                    {currentQ.unitTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                    الدرجة: {score}
                  </span>
                  <button
                    onClick={() => setActiveQuizTitle(null)}
                    className="text-xs text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition font-bold"
                  >
                    خروج من الاختبار
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / activeQuizQuestions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {currentQ.type === "multiple_choice"
                      ? "اختيار من متعدد (بابل شيت)"
                      : currentQ.type === "fill_blank"
                      ? "إكمال المصطلح/القانون"
                      : "سؤال مقالي تحليلي"}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      currentQ.difficulty === "easy"
                        ? "bg-emerald-50 text-emerald-700"
                        : currentQ.difficulty === "medium"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {currentQ.difficulty === "easy"
                      ? "مستوى مباشر"
                      : currentQ.difficulty === "medium"
                      ? "تطبيق وفهم"
                      : "مستويات تفكير عليا"}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* Interactive Input based on Question Type */}
              {currentQ.type === "multiple_choice" && currentQ.options && (
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    let optionStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100";
                    if (isAnswerSubmitted) {
                      if (optIdx === currentQ.correctIndex) {
                        optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
                      } else if (isSelected) {
                        optionStyle = "bg-rose-50 border-rose-300 text-rose-900";
                      } else {
                        optionStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                      }
                    } else if (isSelected) {
                      optionStyle = "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs";
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswerSubmitted}
                        onClick={() => setSelectedOption(optIdx)}
                        className={`w-full text-right p-3.5 sm:p-4 rounded-2xl border transition flex items-center justify-between gap-3 text-xs sm:text-sm ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-slate-300 text-slate-600"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isAnswerSubmitted && optIdx === currentQ.correctIndex && (
                          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && optIdx !== currentQ.correctIndex && (
                          <X className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === "fill_blank" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    disabled={isAnswerSubmitted}
                    value={fillBlankInput}
                    onChange={(e) => setFillBlankInput(e.target.value)}
                    placeholder="اكتب الإجابة أو المصطلح المناسب هنا..."
                    className="w-full p-3.5 rounded-2xl bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  {isAnswerSubmitted && currentQ.correctAnswer && (
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200">
                      الإجابة المعتمدة: {currentQ.correctAnswer}
                    </div>
                  )}
                </div>
              )}

              {currentQ.type === "essay" && (
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    disabled={isAnswerSubmitted}
                    value={essayInput}
                    onChange={(e) => setEssayInput(e.target.value)}
                    placeholder="اكتب خطوات حلك أو التعليل المقالي بالتفصيل..."
                    className="w-full p-3.5 rounded-2xl bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  {showEssayModelAnswer && currentQ.modelAnswer && (
                    <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2 text-xs">
                      <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        النموذج الوزاري الإرشادي للإجابة ومعايير التصحيح:
                      </div>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed font-mono text-[11px] bg-white p-3 rounded-xl border border-indigo-100">
                        {currentQ.modelAnswer}
                      </p>
                      {currentQ.rubric && (
                        <div className="pt-1">
                          <span className="font-bold text-slate-800">توزيع الدرجات:</span>
                          <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                            {currentQ.rubric.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Hint Box */}
              {showHint && currentQ.hint && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 animate-in fade-in">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>تلميح: {currentQ.hint}</span>
                </div>
              )}

              {/* Explanation Box */}
              {showExplanation && currentQ.explanation && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-700">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    الشرح وتوضيح نواتج التعلم:
                  </div>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  {!isAnswerSubmitted && currentQ.hint && (
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>عرض تلميح</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleCheckAnswer}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition"
                    >
                      تأكيد الإجابة
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5"
                    >
                      <span>
                        {currentQuestionIndex < activeQuizQuestions.length - 1
                          ? "السؤال التالي"
                          : "إنهاء الاختبار وعرض النتيجة"}
                      </span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : isQuizCompleted ? (
            /* Quiz Completed View */
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
                🏆
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">أحسنت! أتممت الاختبار بنجاح</h3>
                <p className="text-xs text-slate-500 mt-1">
                  لقد حصلت على {score} من أصل {activeQuizQuestions.length} أسئلة
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-800 min-w-[120px]">
                  <div className="text-2xl font-black">{Math.round((score / activeQuizQuestions.length) * 100)}%</div>
                  <div className="text-xs">النسبة المئوية</div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 text-amber-800 min-w-[120px]">
                  <div className="text-2xl font-black">+{score * 25 + 50} XP</div>
                  <div className="text-xs">نقاط خبرة مكتسبة</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (selectedUnitForQuiz) {
                      handleStartUnitQuiz(selectedUnitForQuiz, "adaptive");
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة الاختبار</span>
                </button>
                <button
                  onClick={() => setActiveQuizTitle(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  العودة لقائمة الاختبارات
                </button>
              </div>
            </div>
          ) : (
            /* Quizzes Showcase for Selected Unit */
            selectedUnitForQuiz && (
              <div className="space-y-4">
                {/* Unit Mastery Card */}
                <div className="p-5 rounded-2xl bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
                        الوحدة {selectedUnitForQuiz.order}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${unitMastery.badgeClass}`}>
                        مستوى إتقانك: {unitMastery.levelLabel}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-800 mt-1">
                      {selectedUnitForQuiz.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">{selectedUnitForQuiz.description}</p>
                  </div>

                  <button
                    onClick={() => handleStartUnitQuiz(selectedUnitForQuiz, "adaptive", `🎯 الاختبار التكيفي للوحدة ${selectedUnitForQuiz.order}`)}
                    className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 shrink-0"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>بدء الاختبار التكيفي الذكي</span>
                  </button>
                </div>

                {/* 4 Specialized Quiz Cards for this Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Card 1: Adaptive Quiz */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 text-xl">🎯</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          موصى به
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">
                        الاختبار التكيفي الذكي للوحدة
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        يقيس مستواك الفعلي ويتدرج في الصعوبة تلقائياً مع تنوع الأسئلة (بابل شيت ومقالي وإكمال).
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartUnitQuiz(selectedUnitForQuiz, "adaptive", `🎯 الاختبار التكيفي: ${selectedUnitForQuiz.title}`)}
                      className="mt-4 w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>بدء الاختبار</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card 2: Analytical Essay Focus */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-purple-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-purple-50 text-purple-600 text-xl">✍️</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          مقالي تحليلي
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">
                        اختبار الأسئلة المقالية للوحدة
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        أسئلة علل وفسر وأثبت مع نموذج الإجابة الوزاري وتوزيع الدرجات الدقيق.
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartUnitQuiz(selectedUnitForQuiz, "essay", `✍️ الاختبار المقالي: ${selectedUnitForQuiz.title}`)}
                      className="mt-4 w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>بدء المقالي</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card 3: Fill-in Laws and Definitions */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-teal-50 text-teal-600 text-xl">🔤</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                          إكمال المفاهيم
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">
                        اختبار إكمال القوانين والمصطلحات
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        تثبيت المفاهيم الأساسية والقوانين عبر كتابة الكلمات الدالة وتصحيح التسامح الإملائي.
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartUnitQuiz(selectedUnitForQuiz, "fill", `🔤 اختبار القوانين: ${selectedUnitForQuiz.title}`)}
                      className="mt-4 w-full py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>بدء الإكمال</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card 4: Quick 5-Question Blitz */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-amber-50 text-amber-600 text-xl">⚡</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          سريع (3 دقائق)
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">
                        اختبار خاطف للوحدة (Quick Blitz)
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        3 أسئلة بابل شيت مركزة لاختبار الاستيعاب السريع في نهاية كل جلسة مذاكرة.
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartUnitQuiz(selectedUnitForQuiz, "quick", `⚡ اختبار خاطف: ${selectedUnitForQuiz.title}`)}
                      className="mt-4 w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>بدء الخاطف</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ================= TAB 3: GENERAL SUBJECT EXAMS ================= */}
      {activeTab === "general_exams" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
            <div className="text-purple-600 text-xl shrink-0 mt-0.5">🏛️</div>
            <div className="text-xs text-purple-900 leading-relaxed">
              <b>الامتحانات العامة الشاملة على المادة:</b> هذه الامتحانات تغطي جميع وحدات {subject.title} مجتمعة، وتحاكي بدقة مواصفات الورقة الامتحانية لوزارة التربية والتعليم للعام الدراسي 2026/2027.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exam 1: Term End Mock */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  نموذج تجريبي رقم 1
                </span>
                <span className="text-xs text-slate-400 font-semibold">10 أسئلة • شامل</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">
                  امتحان نهاية الفصل الدراسي الأول التجريبي في {subject.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  يغطي كل مفاهيم وقوانين وحدات المادة مجتمعة بنظام البابل شيت الحديث والمقالي.
                </p>
              </div>
              <button
                onClick={() => handleStartGeneralSubjectExam(`امتحان نهاية الفصل التجريبي: ${subject.title}`)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>بدء الامتحان الشامل</span>
              </button>
            </div>

            {/* Exam 2: Ministry Guide Mock */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 transition space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  النماذج الاسترشادية
                </span>
                <span className="text-xs text-slate-400 font-semibold">معتمد وزارياً</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">
                  اختبار النماذج الاسترشادية لوزارة التربية والتعليم في {subject.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  تدريبات مكثفة على الأسئلة الواردة في الكتب والمذكرات الاسترشادية للمركز القومي للامتحانات.
                </p>
              </div>
              <button
                onClick={() => handleStartGeneralSubjectExam(`النماذج الاسترشادية: ${subject.title}`)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>بدء النماذج الاسترشادية</span>
              </button>
            </div>

            {/* Exam 3: Question Bank Challenge */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 transition space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                  تحدي السرعة
                </span>
                <span className="text-xs text-slate-400 font-semibold">تراكمي</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">
                  ماراثون بنك الأسئلة التراكمي الشامل
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  تحدي الأسئلة المتتالية لرفع سرعة الحل ودقة التعامل مع وقت الاختبار.
                </p>
              </div>
              <button
                onClick={() => handleStartGeneralSubjectExam(`ماراثون بنك الأسئلة التراكمي: ${subject.title}`)}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>بدء ماراثون الأسئلة</span>
              </button>
            </div>

            {/* Link to Monthly All Subjects Exam */}
            <div className="p-5 rounded-2xl bg-linear-to-br from-indigo-900 to-purple-900 text-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-amber-300">
                  الباب الأخير المشترك
                </span>
                <span className="text-xs text-slate-300 font-semibold">لكافة المواد</span>
              </div>
              <div>
                <h4 className="font-bold text-base text-white">
                  الامتحانات الشهرية العامة لجميع المواد 🏆
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  هل تريد اختبار شهر أكتوبر أو نوفمبر أو نصف العام الذي يجمع {subject.title} مع باقي المواد مع تقرير التقييم؟
                </p>
              </div>
              <button
                onClick={onNavigateToMonthlyExams}
                className="w-full py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>الانتقال لباب الامتحانات والتقييمات الشهرية</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: LAWS & SUMMARY HUB ================= */}
      {activeTab === "laws_summary" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                بنك القوانين والملخصات الذهبية لباب {subject.title}
              </h3>
              <p className="text-xs text-slate-500">تم تجميع جميع القواعد ونواتج التعلم الأساسية للمذاكرة السريعة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allSubjectLaws.map((law, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-indigo-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {law.unitTitle.split(":")[0]}
                  </span>
                  <button
                    onClick={() => onOpenLesson(subject.id, law.lessonId)}
                    className="text-[11px] text-indigo-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>عرض في الدرس</span>
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{law.lawTitle}</h4>
                <div className="p-3 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs text-left" dir="ltr">
                  {law.formula}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{law.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: SUBJECT AI TUTOR ================= */}
      {activeTab === "subject_ai" && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px] animate-in fade-in duration-150">
          {/* Chat Header */}
          <div className="p-4 bg-linear-to-r from-indigo-50 via-purple-50 to-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-xs">
                {subject.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  المعلم الذكي الخاص بـ {subject.title}
                </h3>
                <p className="text-[11px] text-slate-500">متخصص في شرح وحل مسائل منهج 2026/2027</p>
              </div>
            </div>

            {/* Suggested prompts */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => handleSendAiChatMessage("ما هي أهم القوانين التي يجب حفظها في هذه المادة؟")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                💡 أهم القوانين
              </button>
              <button
                onClick={() => handleSendAiChatMessage("ما هي تريكات البابل شيت الشائعة في الامتحانات؟")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                🎯 تريكات البابل شيت
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
            {aiChatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "mr-auto flex-row-reverse" : "ml-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-amber-300"
                  }`}
                >
                  {msg.sender === "user" ? "أنت" : "AI"}
                </div>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tl-xs"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tr-xs"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isAiTyping && (
              <div className="flex gap-2.5 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center text-xs shrink-0">
                  AI
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 rounded-tr-xs flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="mr-1">جاري كتابة الشرح والتوضيح...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={aiChatInput}
              onChange={(e) => setAiChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendAiChatMessage()}
              placeholder={`اسأل عن أي نقطة في ${subject.title}، مسألة، أو تريك امتحاني...`}
              className="flex-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <button
              onClick={() => handleSendAiChatMessage()}
              className="px-4 py-2.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <span>إرسال</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
