import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, GradeLevel } from "../../types";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Copy,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Calculator,
  Lightbulb,
  Check,
} from "lucide-react";

interface AiTutorViewProps {
  gradeLevel: GradeLevel;
  messages: ChatMessage[];
  onSendMessage: (text: string, mode: ChatMessage["mode"], subject?: string) => Promise<void>;
  onClearChat: () => void;
  isLoading: boolean;
  onShowToast: (msg: string) => void;
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({
  gradeLevel,
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  onShowToast,
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedMode, setSelectedMode] = useState<ChatMessage["mode"]>("explain");
  const [selectedSubject, setSelectedSubject] = useState<string>("الرياضيات");
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle Speech Recognition
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onShowToast("الميكروفون والتعرف الصوتي غير مدعوم في متصفحك الحالي.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ar-EG";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        onShowToast("تحدث الآن، المدرس الذكي يستمع إليك... 🎙️");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setIsRecording(false);
        onShowToast("تعذر التقاط الصوت، يمكنك الكتابة في المربع.");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      onShowToast("تعذر تشغيل الميكروفون.");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText("");
    await onSendMessage(text, selectedMode, selectedSubject);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast("تم نسخ الرد إلى الحافظة!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      onShowToast("جاري القراءة الصوتية... 🔊");
    } else {
      onShowToast("ميزة النطق غير مدعومة في المتصفح.");
    }
  };

  const modeOptions: { id: ChatMessage["mode"]; label: string; icon: React.ReactNode }[] = [
    { id: "explain", label: "شرح تفصيلي", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "simplify", label: "بسطها جداً", icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { id: "socratic", label: "اختبرني وسألني", icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: "solve_step_by_step", label: "حل مسألة خطوة بخطوة", icon: <Calculator className="w-3.5 h-3.5" /> },
    { id: "exam_prep", label: "توقع أسئلة امتحان", icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  const suggestedQuestions = [
    "كيف أفرق بين كان الناقصة وكان التامة بسهولة في النحو؟",
    "اشرح لي فكرة الأعداد المركبة ولماذا ت² = -1 بمثال واقعي؟",
    "لماذا يطفو الجليد فوق الماء وما علاقة ذلك بالروابط الهيدروجينية وحماية الأسماك؟",
    "اختبرني بسؤال اختيار من متعدد في العلوم المتكاملة عن الضغط والطفو.",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] pb-4 animate-in fade-in duration-200">
      {/* Top Bar / Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs mb-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-md shadow-indigo-500/20">
              🤖
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                المدرس الذكي
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  متصل ومستعد
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                مساعدك التفاعلي في الشرح وحل المسائل بنظام 2026/2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="الرياضيات">📐 مادة الرياضيات</option>
              <option value="العلوم المتكاملة">🔬 مادة العلوم المتكاملة</option>
              <option value="اللغة العربية">📖 مادة اللغة العربية</option>
              <option value="اللغة الإنجليزية">🌐 مادة اللغة الإنجليزية</option>
              <option value="الفلسفة">💡 مادة الفلسفة والتفكير العلمي</option>
              <option value="التاريخ">🏛️ مادة التاريخ</option>
            </select>

            <button
              onClick={onClearChat}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 transition text-xs flex items-center gap-1 font-semibold"
              title="بدء محادثة جديدة"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مسح المحادثة</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">نمط الشرح:</span>
          {modeOptions.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                selectedMode === mode.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-3xl mb-4 shadow-inner">
              🎓
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              مرحباً بك! أنا مدرسك الذكي للثانوية العامة
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              اسألني عن أي مفهوم غامض، اطلب حلاً لمسألة، أو اطلب مني اختبارك في أي درس من دروس منهج 2026/2027.
            </p>

            <div className="w-full space-y-2 text-right">
              <span className="text-xs font-bold text-slate-400 block mb-1">أسئلة شائعة يمكنك تجربتها:</span>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(q, selectedMode, selectedSubject)}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition text-right flex items-center justify-between group"
                >
                  <span>{q}</span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-600 shrink-0 mr-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm shrink-0 font-bold ${
                    isUser
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-purple-100 text-purple-700 border border-purple-200"
                  }`}
                >
                  {isUser ? "أنت" : "AI"}
                </div>

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs pr-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 hover:text-slate-700 rounded transition flex items-center gap-1"
                        title="نسخ النص"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px]">نسخ</span>
                      </button>

                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="p-1 hover:text-slate-700 rounded transition flex items-center gap-1"
                        title="استماع صوتي"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">استماع</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold border border-purple-200 animate-pulse">
              AI
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
              <span
                className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
              <span>المدرس الذكي يحلل السؤال ويصيغ الشرح...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`p-3.5 rounded-2xl border transition flex items-center justify-center shrink-0 ${
            isRecording
              ? "bg-rose-500 text-white border-rose-500 animate-pulse shadow-md shadow-rose-500/20"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
          title={isRecording ? "إيقاف التسجيل الصوتي" : "تحدث بالصوت"}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`اكتب سؤالك في ${selectedSubject} أو قل: "اشرح لي"، "اختبرني"، "حل مسألة"...`}
          className="flex-1 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0"
        >
          <span>إرسال</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
