import React, { useState, useEffect, useRef } from "react";
import {
  ExternalBook,
  ExternalBookStudyGuide,
  ExternalBookChatMessage,
  Subject,
} from "../../types";
import {
  getOrGenerateBookStudyGuide,
  askBookQuestion,
} from "../../utils/externalBooksHelper";
import {
  Sparkles,
  Bot,
  FileText,
  Send,
  Headphones,
  Brain,
  ListChecks,
  Key,
  Flame,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  BookOpen,
  Volume2,
  Share2,
  Download,
  Eye,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

interface ExternalBookAiStudioProps {
  book: ExternalBook;
  activeUnitTitle: string;
  subject: Subject;
  onShowToast: (msg: string) => void;
  onRewardXp?: (xp: number) => void;
}

export const ExternalBookAiStudio: React.FC<ExternalBookAiStudioProps> = ({
  book,
  activeUnitTitle,
  subject,
  onShowToast,
  onRewardXp,
}) => {
  const [activeStudioMode, setActiveStudioMode] = useState<
    "study_guide" | "chat" | "audio_overview" | "mindmap"
  >("study_guide");

  // Study Guide state
  const [studyGuide, setStudyGuide] = useState<ExternalBookStudyGuide | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Chat Q&A state
  const [chatMessages, setChatMessages] = useState<ExternalBookChatMessage[]>([
    {
      id: "msg_init",
      role: "assistant",
      content: `أهلاً بك! لقد قرأت واستوعبت محتوى كتاب (${book.title}) الخاص بوحدة "${activeUnitTitle}".\nيمكنك سؤالي عن أي مفهوم، استنتاج أي قانون، طلب حل مسائل من الكتاب، أو كشف خدع البابل شيت والمصايد الصعبة.`,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      sourcesCited: [`كتاب ${book.title}`, `وحدة ${activeUnitTitle}`],
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Audio Podcast state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);

  // Load or generate study guide when book or unit changes
  useEffect(() => {
    let isMounted = true;
    async function loadGuide() {
      setIsLoadingGuide(true);
      try {
        const guide = await getOrGenerateBookStudyGuide(
          book,
          activeUnitTitle,
          subject.title,
          book.extractedTextSample
        );
        if (isMounted) {
          setStudyGuide(guide);
        }
      } catch (err) {
        console.error("Failed to load study guide:", err);
        onShowToast("تعذر توليد الدليل الذكي للكتاب");
      } finally {
        if (isMounted) {
          setIsLoadingGuide(false);
        }
      }
    }

    loadGuide();
    return () => {
      isMounted = false;
    };
  }, [book.id, activeUnitTitle]);

  useEffect(() => {
    if (activeStudioMode === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeStudioMode]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    onShowToast("تم نسخ النص بنجاح 📋");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSendQuestion = async (presetQ?: string) => {
    const q = presetQ || inputQuestion.trim();
    if (!q || isAsking) return;

    const userMsg: ExternalBookChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!presetQ) setInputQuestion("");
    setIsAsking(true);

    try {
      const response = await askBookQuestion(
        book,
        activeUnitTitle,
        subject.title,
        q,
        book.extractedTextSample || "",
        chatMessages
      );

      const aiMsg: ExternalBookChatMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        sourcesCited: response.sourcesCited || [`كتاب ${book.title}`],
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      if (onRewardXp) onRewardXp(10);
    } catch (err) {
      console.error(err);
      onShowToast("حدث خطأ أثناء معالجة السؤال بواسطة الذكاء الاصطناعي");
    } finally {
      setIsAsking(false);
    }
  };

  const suggestedQuestions = [
    `ما هي القوانين الذهبية الأساسية لفصل "${activeUnitTitle}"؟`,
    `كيف أفرق بين المسائل المباشرة وأسئلة التفكير العليا في هذا الفصل؟`,
    `اذكر أهم 3 أخطاء شائعة يقع فيها طلاب الثانوية في هذا الجزء.`,
    `اشرح لي بمثال عملي مسألة مقالية من تدريبات الكتاب وطريقة كتابة خطوات الحل.`,
  ];

  return (
    <div className="space-y-6">
      {/* NotebookLM Header & Mode Switcher */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                استوديو القراءة والتحليل الذكي (NotebookLM Engine)
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {book.isCustomUploaded ? "كتاب PDF مرفوع ومفحوص بالذكاء الاصطناعي" : `كتاب معتمد: ${book.title}`}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{book.title}</span>
              <span className="text-slate-400 text-sm font-normal">• وحدة: {activeUnitTitle}</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تم تشغيل محرك الذكاء الاصطناعي لقراءة نصوص الكتاب وتلخيصها وتفكيكها إلى دليل دراسي متكامل، مع إمكانية محاورة الكتاب بالأسئلة وسماع نظرة صوتية بودكاست.
            </p>
          </div>

          {/* Quick Stats / Meta */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 block">الصفحات المحللة</span>
              <span className="text-sm font-black text-amber-300">
                {book.pageCount || 50} صفحة
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 block">مستوى المعالجة</span>
              <span className="text-sm font-black text-emerald-300">تأصيل + حلول</span>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        <button
          id="btn-mode-study-guide"
          onClick={() => setActiveStudioMode("study_guide")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeStudioMode === "study_guide"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>الدليل الدراسي الشامل (Study Guide)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
            ملخص + تعاريف
          </span>
        </button>

        <button
          id="btn-mode-chat"
          onClick={() => setActiveStudioMode("chat")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeStudioMode === "chat"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>اسأل الكتاب مباشرة (Chat With Book)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
            سؤال وجواب
          </span>
        </button>

        <button
          id="btn-mode-audio"
          onClick={() => setActiveStudioMode("audio_overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeStudioMode === "audio_overview"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>نظرة صوتية حوارية (Audio Overview)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
            بودكاست ملهم
          </span>
        </button>

        <button
          id="btn-mode-mindmap"
          onClick={() => setActiveStudioMode("mindmap")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeStudioMode === "mindmap"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>الخريطة المفاهيمية للوحدة</span>
        </button>
      </div>

      {/* ================= MODE 1: STUDY GUIDE ================= */}
      {activeStudioMode === "study_guide" && (
        <div className="space-y-6">
          {isLoadingGuide ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                جاري تحليل وقراءة نصوص الكتاب وتوليد الدليل الدراسي الشامل...
              </h3>
              <p className="text-xs text-slate-500">
                يقوم الذكاء الاصطناعي باستخراج الخلاصة التنفيذية، القوانين الذهبية، وتريكات الامتحانات.
              </p>
            </div>
          ) : studyGuide ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Executive Summary Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                      📝
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-800">
                        الخلاصة التنفيذية الشاملة للفصل
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        قراءة مركّزة تلخص جوهر الطرح الأكاديمي لكتاب ({book.title})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyText(studyGuide.executiveSummary, "exec_summary")}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition flex items-center gap-1"
                    title="نسخ الخلاصة"
                  >
                    {copiedSection === "exec_summary" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">نسخ</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {studyGuide.executiveSummary}
                </p>

                {/* Key Bullet Takeaways */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-black text-indigo-900 block flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-indigo-600" />
                    أهم النقاط المفتاحية المستخلصة من الكتاب:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {studyGuide.bulletSummary.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-2.5 text-xs text-indigo-950 font-medium leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Definitions and Terminology */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">
                      معجم المفاهيم والمصطلحات الدقيقة من الكتاب
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      التعريفات المعتمدة وزارياً التي تتكرر في أسئلة الامتحان
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {studyGuide.keyDefinitions.map((def, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-2 hover:border-amber-400 transition"
                    >
                      <span className="text-xs font-black text-amber-950 block">
                        📌 {def.term}
                      </span>
                      <p className="text-xs text-amber-900/90 leading-relaxed font-normal">
                        {def.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Golden Formulas & Rules */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">
                      القوانين الحاكمة والقواعد الذهبية لحل المسائل
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      الصيغ الرياضية والشروط الفيزيائية وسياق استخدام كل قانون
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {studyGuide.goldenFormulasAndRules.map((formula, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-purple-50/40 border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 max-w-xl">
                        <span className="text-xs font-black text-purple-950 block">
                          {formula.name}
                        </span>
                        <p className="text-xs text-purple-900/80 leading-relaxed">
                          {formula.context}
                        </p>
                      </div>

                      <div className="px-4 py-2 rounded-xl bg-white border border-purple-200 shadow-xs font-mono font-bold text-sm text-purple-700 text-center shrink-0 w-full sm:w-auto">
                        {formula.rule}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traps and Tricks */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-rose-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 border-b border-rose-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-rose-950">
                      أسرار ومصايد البابل شيت التي يحذر منها الكتاب
                    </h3>
                    <p className="text-[11px] text-rose-500">
                      الأفخاخ التي يقع فيها 80% من الطلاب وتفاصيل تجنبها
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studyGuide.examTricksAndTraps.map((trick, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs text-rose-900 font-medium leading-relaxed flex items-start gap-2"
                    >
                      <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                      <span>{trick}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200">
              لا يتوفر دليل دراسي حالياً. يرجى اختيار وحدة من القائمة.
            </div>
          )}
        </div>
      )}

      {/* ================= MODE 2: CHAT WITH BOOK ================= */}
      {activeStudioMode === "chat" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
          {/* Chat Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  مساعد الدراسة الذكي لكتاب ({book.title})
                </h3>
                <p className="text-[11px] text-slate-500">
                  يجيب حصرياً ومباشرة من نصوص ومسائل الكتاب المرفوع
                </p>
              </div>
            </div>

            <span className="text-[11px] px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-100 hidden sm:inline-block">
              جلسة متصلة بالذكاء الاصطناعي ⚡
            </span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  msg.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-purple-600 text-white shadow-xs"
                  }`}
                >
                  {msg.role === "user" ? "أنت" : "AI"}
                </div>

                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/10"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {msg.sourcesCited && msg.sourcesCited.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex items-center flex-wrap gap-1.5 text-[10px] text-slate-400">
                      <span>المصادر:</span>
                      {msg.sourcesCited.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <span
                    className={`text-[10px] block text-left ${
                      msg.role === "user" ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isAsking && (
              <div className="flex gap-3 max-w-md ml-auto animate-in fade-in">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                  AI
                </div>
                <div className="p-4 rounded-3xl bg-white border border-slate-200 rounded-tl-xs shadow-xs text-xs text-slate-600 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span>جاري قراءة نصوص الكتاب وتنسيق الإجابة الدقيقة...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">أسئلة مقترحة:</span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuestion(q)}
                disabled={isAsking}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-xs font-medium whitespace-nowrap transition border border-slate-200/60 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuestion();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder={`اطرح أي سؤال حول نصوص وشروحات كتاب (${book.title})...`}
                className="flex-1 text-xs sm:text-sm p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-purple-500 outline-hidden"
                disabled={isAsking}
              />

              <button
                type="submit"
                disabled={!inputQuestion.trim() || isAsking}
                className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 transition disabled:opacity-50 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODE 3: AUDIO OVERVIEW (PODCAST) ================= */}
      {activeStudioMode === "audio_overview" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  النظرة الصوتية البودكاست (Audio Overview)
                </h3>
                <p className="text-xs text-slate-500">
                  حوار تحليلي شيق ومبسط بين معلمين لتفكيك أفكار كتاب ({book.title})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPlayingAudio(!isPlayingAudio);
                  if (!isPlayingAudio) {
                    onShowToast("تم بدء تشغيل الحوار الصوتي للكتاب 🎙️");
                  }
                }}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 ${
                  isPlayingAudio
                    ? "bg-rose-600 text-white shadow-rose-600/20 animate-pulse"
                    : "bg-amber-600 text-white shadow-amber-600/20 hover:bg-amber-700"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingAudio ? "إيقاف مؤقت" : "تشغيل الحوار الصوتي"}</span>
              </button>
            </div>
          </div>

          {/* Podcast Script Turns */}
          {studyGuide?.audioOverviewScript && studyGuide.audioOverviewScript.length > 0 ? (
            <div className="space-y-4">
              {studyGuide.audioOverviewScript.map((script, idx) => (
                <div key={idx} className="space-y-3 p-4 sm:p-5 rounded-2xl bg-amber-50/30 border border-amber-100">
                  {/* Speaker 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      أ
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-amber-800 block">المعلم الأول (الأستاذ أحمد):</span>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                        {script.host1}
                      </p>
                    </div>
                  </div>

                  {/* Speaker 2 */}
                  <div className="flex items-start gap-3 pt-2 border-t border-amber-100/60">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      م
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-indigo-800 block">المعلم الثاني (الأستاذ محمود):</span>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                        {script.host2}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              جاري تجهيز النص الحواري من فصول الكتاب...
            </div>
          )}
        </div>
      )}

      {/* ================= MODE 4: MIND MAP ================= */}
      {activeStudioMode === "mindmap" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                الخريطة المفاهيمية والهيكلية لوحدة ({activeUnitTitle})
              </h3>
              <p className="text-xs text-slate-500">
                مخطط بصري يربط المدخل الأساسي بالقوانين والتطبيقات وتريكات الامتحان
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyGuide?.mindMapConceptNodes.map((node, idx) => (
              <div
                key={node.id || idx}
                className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200 space-y-2 hover:shadow-md transition relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                    {node.branch}
                  </span>
                  <span className="text-xs font-mono text-teal-600 font-bold">#{idx + 1}</span>
                </div>

                <h4 className="text-sm font-black text-teal-950">{node.label}</h4>

                <p className="text-xs text-teal-900/80 leading-relaxed">{node.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
