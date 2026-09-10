import React, { useState, useEffect, useRef } from "react";
import { Lesson, Subject, NotePhoto } from "../types";
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Volume2,
  Bot,
  Lightbulb,
  ArrowRight,
  Calculator,
  FileText,
  Save,
  Trash2,
  Copy,
  Check,
  Clock,
  Send,
  PenTool,
  Pin,
  Bookmark,
  AlertTriangle,
  Zap,
  ListPlus,
  Quote,
  Hash,
  Camera,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  Eye,
  FileImage,
  Edit2,
  Mic,
  MicOff,
  Radio,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CameraCaptureModal } from "./CameraCaptureModal";
import { PhotoLightboxModal } from "./PhotoLightboxModal";

interface LessonModalProps {
  lesson: Lesson | null;
  subject?: Subject;
  isOpen: boolean;
  onClose: () => void;
  onCompleteLesson: (lessonId: string) => void;
  onAskAiAboutLesson: (lessonTitle: string, subjectTitle: string) => void;
  onShowToast: (msg: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  subject,
  isOpen,
  onClose,
  onCompleteLesson,
  onAskAiAboutLesson,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    "summary" | "ai_explain" | "laws" | "example" | "quiz" | "notes"
  >("summary");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // AI Multi-Method Explanation state
  const [aiExplanationMethod, setAiExplanationMethod] = useState<
    "academic" | "simplifiedStory" | "mindmap" | "stepByStep" | "examTricks"
  >("academic");
  const [aiLessonData, setAiLessonData] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Lesson Notes State
  const [userNote, setUserNote] = useState<string>("");
  const [notePhotos, setNotePhotos] = useState<NotePhoto[]>([]);
  const [noteLastSaved, setNoteLastSaved] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Camera & Photo Modal states
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<NotePhoto | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const notesFileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice Dictation (Speech-to-Text) state
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Stop voice dictation if modal is closed or unmounted
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  // Load note when lesson opens or changes
  useEffect(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");

    if (lesson?.id) {
      const savedNotesDict = localStorage.getItem("rafiq_lesson_notes");
      if (savedNotesDict) {
        try {
          const parsed = JSON.parse(savedNotesDict);
          const savedData = parsed[lesson.id];
          if (savedData) {
            setUserNote(savedData.text || "");
            setNotePhotos(savedData.photos || []);
            setNoteLastSaved(savedData.updatedAt || null);
          } else {
            setUserNote("");
            setNotePhotos([]);
            setNoteLastSaved(null);
          }
        } catch (e) {
          console.error(e);
          setUserNote("");
          setNotePhotos([]);
          setNoteLastSaved(null);
        }
      } else {
        setUserNote("");
        setNotePhotos([]);
        setNoteLastSaved(null);
      }
      setSelectedOption(null);
      setHasAnswered(false);
      setActiveTab("summary");
      setAiLessonData(null);
      setIsCameraModalOpen(false);
      setActiveLightboxPhoto(null);
    }
  }, [lesson?.id]);

  const fetchAiExplanation = async () => {
    if (!lesson) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/explain-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: lesson.title,
          subjectTitle: subject?.title || "الرياضيات",
          grade: subject?.grade || "1st_secondary",
          method: "all",
        }),
      });
      const data = await res.json();
      setAiLessonData(data);
    } catch (e) {
      console.error("AI explanation error:", e);
      onShowToast("تعذر جلب شرح الذكاء الاصطناعي");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOpenAiTab = () => {
    setActiveTab("ai_explain");
    if (!aiLessonData && !isAiLoading) {
      fetchAiExplanation();
    }
  };

  if (!isOpen || !lesson) return null;

  // Save Note & Photos to localStorage
  const handleSaveNote = (textToSave = userNote, photosToSave = notePhotos) => {
    try {
      const savedNotesDict = localStorage.getItem("rafiq_lesson_notes");
      const notesObj = savedNotesDict ? JSON.parse(savedNotesDict) : {};
      const now = new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      });

      if (textToSave.trim() || photosToSave.length > 0) {
        notesObj[lesson.id] = {
          text: textToSave,
          photos: photosToSave,
          lessonTitle: lesson.title,
          subjectTitle: subject?.title || "عام",
          updatedAt: now,
        };
      } else {
        delete notesObj[lesson.id];
      }

      localStorage.setItem("rafiq_lesson_notes", JSON.stringify(notesObj));
      setNoteLastSaved(textToSave.trim() || photosToSave.length > 0 ? now : null);
      onShowToast("تم حفظ المفكرة والملاحظات المصورة بنجاح 📝");
    } catch (e) {
      console.error(e);
      onShowToast("تعذر حفظ الملاحظة محلياً");
    }
  };

  // Add photo captured from Camera
  const handlePhotoCaptured = (newPhoto: NotePhoto) => {
    const updatedPhotos = [newPhoto, ...notePhotos];
    setNotePhotos(updatedPhotos);
    handleSaveNote(userNote, updatedPhotos);
  };

  // Delete photo
  const handleDeletePhoto = (photoId: string) => {
    const updatedPhotos = notePhotos.filter((p) => p.id !== photoId);
    setNotePhotos(updatedPhotos);
    handleSaveNote(userNote, updatedPhotos);
  };

  // Process File Upload for photos
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      onShowToast("يرجى اختيار ملف صورة صالح");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1600;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.78);
          const now = new Date().toLocaleDateString("ar-EG", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          const newPhoto: NotePhoto = {
            id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            dataUrl: compressed,
            capturedAt: now,
            caption: file.name.replace(/\.[^/.]+$/, "") || `صورة كشكول - ${lesson.title}`,
          };

          handlePhotoCaptured(newPhoto);
          onShowToast("تم رفع وربط الصورة بالدرس بنجاح 📎");
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Ask AI about photographed note
  const handleAskAiWithPhoto = (photo: NotePhoto) => {
    onClose();
    onAskAiAboutLesson(
      `لقد قمت بتصوير ملاحظاتي الورقية/كشكول الحصة لدرس "${lesson.title}" بعنوان: (${photo.caption || "ملاحظة ورقية"}). هل يمكنك مراجعة الأفكار الأساسية، وتلخيص أهم القوانين والتريكات الامتحانية المستنبطة من هذا الدرس للتأكد من اكتمال مذاكرتي؟`,
      subject?.title || "المنهج"
    );
  };

  const handleClearNote = () => {
    if (!userNote.trim()) return;
    setUserNote("");
    try {
      const savedNotesDict = localStorage.getItem("rafiq_lesson_notes");
      if (savedNotesDict) {
        const notesObj = JSON.parse(savedNotesDict);
        delete notesObj[lesson.id];
        localStorage.setItem("rafiq_lesson_notes", JSON.stringify(notesObj));
      }
      setNoteLastSaved(null);
      onShowToast("تم مسح الملاحظة بنجاح 🗑️");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyNote = () => {
    if (!userNote) return;
    navigator.clipboard.writeText(userNote);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onShowToast("تم نسخ الملاحظة إلى الحافظة 📋");
  };

  const handleAddQuickSnippet = (snippet: string) => {
    const newText = userNote ? `${userNote.trim()}\n• ${snippet}` : `• ${snippet}`;
    setUserNote(newText);
    handleSaveNote(newText);
  };

  const handleInsertFormat = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("textarea-lesson-notes") as HTMLTextAreaElement | null;
    if (!textarea) {
      const newText = userNote ? `${userNote}\n${prefix}${suffix}` : `${prefix}${suffix}`;
      setUserNote(newText);
      handleSaveNote(newText);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = userNote.substring(start, end);
    const before = userNote.substring(0, start);
    const after = userNote.substring(end);

    const replacement = `${prefix}${selected || "نص الملاحظة"}${suffix}`;
    const newText = `${before}${replacement}${after}`;
    setUserNote(newText);
    handleSaveNote(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : "نص الملاحظة".length)
      );
    }, 50);
  };

  // Voice Dictation (Speech-to-Text) functions
  const isSpeechSupported =
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const startVoiceDictation = () => {
    if (!isSpeechSupported) {
      onShowToast("ميزة الإملاء الصوتي غير مدعومة في متصفحك الحالي. يرجى تجربة متصفح يدعم Web Speech API كـ Chrome أو Edge.");
      return;
    }

    try {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = "ar-EG";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript("");
        onShowToast("🎙️ الميكروفون يستمع الآن... تحدّث بوضوح ليتم تدوين كلامك");
      };

      recognition.onresult = (event: any) => {
        let finalChunk = "";
        let interimChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            interimChunk += transcript;
          }
        }

        setInterimTranscript(interimChunk);

        if (finalChunk.trim()) {
          setUserNote((prev) => {
            const current = prev.trim();
            const addition = finalChunk.trim();
            const updated = current ? `${current} ${addition}` : addition;
            handleSaveNote(updated, notePhotos);
            return updated;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event?.error);
        if (event?.error === "not-allowed" || event?.error === "permission-denied") {
          onShowToast("يرجى تفعيل صلاحية الميكروفون في المتصفح لاستخدام الإملاء الصوتي 🎙️");
        } else if (event?.error === "no-speech") {
          // No speech detected, keep waiting or stop gracefully
        } else {
          onShowToast("تعذر استقبال الصوت بدقة، يرجى إعادة المحاولة.");
        }
        setIsListening(false);
        setInterimTranscript("");
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setIsListening(false);
      onShowToast("حدث خطأ أثناء تشغيل الميكروفون");
    }
  };

  const stopVoiceDictation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
    onShowToast("تم إيقاف التسجيل الصوتي وتثبيت الملاحظات بنجاح ⏹️");
  };

  const toggleVoiceDictation = () => {
    if (isListening) {
      stopVoiceDictation();
    } else {
      startVoiceDictation();
    }
  };

  const handleAnswer = (optionIdx: number) => {
    setSelectedOption(optionIdx);
    setHasAnswered(true);
    if (optionIdx === lesson.testQuestion.correctIndex) {
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } catch (e) {
        console.error(e);
      }
      onShowToast("إجابة صحيحة وممتازة! +25 XP 🎯");
    } else {
      onShowToast("إجابة غير دقيقة — راجع التوضيح في الأسفل");
    }
  };

  const handleFinish = () => {
    if (userNote.trim()) {
      handleSaveNote(userNote);
    }
    onCompleteLesson(lesson.id);
    onShowToast(`تم إنهاء دراسة "${lesson.title}" بنجاح! +50 XP 🎉`);
    onClose();
  };

  const readAloud = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      onShowToast("جاري القراءة الصوتية للدرس... 🔊");
    } else {
      onShowToast("خاصية القراءة الصوتية غير مدعومة في متصفحك الحالي.");
    }
  };

  const hasExistingNote = userNote.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in" id="lesson-modal-container">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] flex flex-col" id="lesson-modal-dialog">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4" id="lesson-modal-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                {subject?.title || "المادة الدراسية"}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ⏱️ {lesson.durationMinutes} دقيقة
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              {lesson.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            id="btn-close-lesson-modal"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl mb-4 overflow-x-auto text-xs font-bold scrollbar-none" id="lesson-tab-navigation">
          <button
            id="tab-summary"
            onClick={() => setActiveTab("summary")}
            className={`flex-1 min-w-[75px] sm:min-w-[90px] py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "summary"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>الشرح الأساسي</span>
          </button>
          <button
            id="tab-ai-explain"
            onClick={handleOpenAiTab}
            className={`flex-1 min-w-[85px] sm:min-w-[100px] py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "ai_explain"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                : "text-purple-700 hover:text-purple-900 bg-purple-50/70 border border-purple-200/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-300" />
            <span>شرح AI بجميع الطرق</span>
          </button>
          <button
            id="tab-laws"
            onClick={() => setActiveTab("laws")}
            className={`flex-1 min-w-[75px] sm:min-w-[90px] py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "laws"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 shrink-0" />
            <span>القوانين</span>
          </button>
          <button
            id="tab-example"
            onClick={() => setActiveTab("example")}
            className={`flex-1 min-w-[75px] sm:min-w-[90px] py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "example"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
            <span>مثال محلول</span>
          </button>
          <button
            id="tab-quiz"
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 min-w-[75px] sm:min-w-[90px] py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "quiz"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>اختبر فهمك</span>
          </button>
          <button
            id="tab-notes"
            onClick={() => setActiveTab("notes")}
            className={`flex-1 min-w-[75px] sm:min-w-[90px] py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap relative ${
              activeTab === "notes"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>المفكرة والملاحظات</span>
            {notePhotos.length > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                📷 {notePhotos.length}
              </span>
            ) : hasExistingNote ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            ) : null}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-sm text-slate-700" id="lesson-tab-content">
          {/* AI Multi-Method Tab Content */}
          {activeTab === "ai_explain" && (
            <div className="space-y-4 animate-in fade-in" id="content-ai-explain">
              {/* Method Selector Chips */}
              <div className="p-2 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/80">
                <div className="flex items-center justify-between gap-2 mb-2 px-1">
                  <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    اختر أسلوب الشرح المناسب لطريقتك في الفهم:
                  </span>
                  <button
                    onClick={fetchAiExplanation}
                    disabled={isAiLoading}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition disabled:opacity-50"
                  >
                    <span>إعادة التوليد</span>
                    <Zap className="w-3 h-3 text-amber-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAiExplanationMethod("academic")}
                    className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      aiExplanationMethod === "academic"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-purple-100/50"
                    }`}
                  >
                    <span>🎓 أكاديمي تأصيلي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiExplanationMethod("simplifiedStory")}
                    className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      aiExplanationMethod === "simplifiedStory"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-purple-100/50"
                    }`}
                  >
                    <span>💡 قصة وتبسيط</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiExplanationMethod("mindmap")}
                    className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      aiExplanationMethod === "mindmap"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-purple-100/50"
                    }`}
                  >
                    <span>🗺️ خريطة ذهنية</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiExplanationMethod("stepByStep")}
                    className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      aiExplanationMethod === "stepByStep"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-purple-100/50"
                    }`}
                  >
                    <span>📝 حل خطوة بخطوة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiExplanationMethod("examTricks")}
                    className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 col-span-2 sm:col-span-1 ${
                      aiExplanationMethod === "examTricks"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-purple-100/50"
                    }`}
                  >
                    <span>⚡ تريكات بابل شيت</span>
                  </button>
                </div>
              </div>

              {/* Main AI Method Box */}
              {isAiLoading ? (
                <div className="py-14 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-bold text-slate-800 text-xs sm:text-sm">
                    الذكاء الاصطناعي يُصيغ شرح درس "{lesson.title}" بأسلوب "{
                      aiExplanationMethod === "academic"
                        ? "الأكاديمي التأصيلي"
                        : aiExplanationMethod === "simplifiedStory"
                        ? "التبسيط والقصص"
                        : aiExplanationMethod === "mindmap"
                        ? "الخريطة الذهنية"
                        : aiExplanationMethod === "stepByStep"
                        ? "الحل خطوة بخطوة"
                        : "أسرار وتريكات الامتحان"
                    }"...
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-purple-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3 relative">
                  {/* Top Bar for the Method */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {aiExplanationMethod === "academic" && "🎓 الشرح الأكاديمي والتأصيل العلمي"}
                        {aiExplanationMethod === "simplifiedStory" && "💡 التبسيط بالأمثلة الحياتية وقصص فاينمان"}
                        {aiExplanationMethod === "mindmap" && "🗺️ المخطط الشجري والخريطة المفاهيمية"}
                        {aiExplanationMethod === "stepByStep" && "📝 التطبيق العملي والحل خطوة بخطوة"}
                        {aiExplanationMethod === "examTricks" && "⚡ أسرار وتريكات امتحانات البابل شيت"}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const currentText =
                            aiLessonData?.[aiExplanationMethod] || "شرح الدرس بالذكاء الاصطناعي";
                          readAloud(currentText);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        title="استماع صوتي"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currentText =
                            aiLessonData?.[aiExplanationMethod] || "";
                          if (currentText) {
                            navigator.clipboard.writeText(currentText);
                            onShowToast("تم نسخ هذا الشرح للحافظة 📋");
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        title="نسخ الشرح"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currentText =
                            aiLessonData?.[aiExplanationMethod] || "";
                          if (currentText) {
                            handleAddQuickSnippet(currentText.substring(0, 160) + "...");
                            onShowToast("تم حفظ مقتطف الشرح في مفكرتك 📝");
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition flex items-center gap-1"
                        title="إضافة الشرح لمفكرتي"
                      >
                        <Save className="w-3 h-3" />
                        <span>حفظ بالمفكرة</span>
                      </button>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                    {aiLessonData?.[aiExplanationMethod] || (
                      <div className="py-8 text-center space-y-3">
                        <p className="text-slate-500 text-xs">
                          اضغط على زر التوليد لاستخراج شرح الدرس بهذه الطريقة عبر الذكاء الاصطناعي
                        </p>
                        <button
                          type="button"
                          onClick={fetchAiExplanation}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition"
                        >
                          توليد الشرح الآن 🚀
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Quick AI Chat CTA */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-purple-900 font-medium">
                  <Bot className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>هل تريد طرح سؤال مخصص على المدرس الذكي حول هذا الشرح؟</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAskAiAboutLesson(
                      `أريد فهم درس "${lesson.title}" بطريقة (${aiExplanationMethod})، هل يمكنك شرح نقطة محددة واختباري فيها؟`,
                      subject?.title || "المنهج"
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>اسأل AI فوراً</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-4 animate-in fade-in" id="content-summary">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-indigo-900 text-sm mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    الشرح المبسط للدرس
                  </h4>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    {lesson.simplifiedSummary}
                  </p>
                </div>
                <button
                  id="btn-read-summary-aloud"
                  onClick={() => readAloud(lesson.simplifiedSummary)}
                  className="p-2 rounded-xl bg-white text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition shrink-0"
                  title="استماع صوتي للشرح"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">🎯 نواتج التعلم المستهدفة:</h4>
                <ul className="space-y-1.5">
                  {lesson.objectives.map((obj, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  هل تحتاج إلى توضيح إضافي أو أمثلة مختلفة من المدرس الذكي؟
                </span>
                <button
                  id="btn-ask-ai-from-lesson"
                  onClick={() => {
                    onClose();
                    onAskAiAboutLesson(lesson.title, subject?.title || "المنهج");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>اسأل AI</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "laws" && (
            <div className="space-y-3 animate-in fade-in" id="content-laws">
              {lesson.keyLaws.map((law, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {law.title}
                  </span>
                  <div className="my-2 p-3 rounded-xl bg-white border border-slate-200 font-mono text-center text-sm sm:text-base font-bold text-slate-900 shadow-xs">
                    {law.formula}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{law.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "example" && (
            <div className="space-y-4 animate-in fade-in" id="content-example">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  💡 المسألة النموذجية:
                </span>
                <p className="font-bold text-slate-900 text-sm mt-2">
                  {lesson.workedExample.problem}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-3">خطوات الحل التفصيلية:</h4>
                <ol className="space-y-2 list-decimal list-inside text-xs sm:text-sm text-slate-700">
                  {lesson.workedExample.solutionSteps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="font-medium">{step}</span>
                    </li>
                  ))}
                </ol>
                {lesson.workedExample.note && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-indigo-700 font-medium">
                    📌 ملاحظة هامة: {lesson.workedExample.note}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="space-y-4 animate-in fade-in" id="content-quiz">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-indigo-600 mb-1 block">سؤال الفهم السريع:</span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {lesson.testQuestion.question}
                </h3>
              </div>

              <div className="grid gap-2.5">
                {lesson.testQuestion.options.map((opt, idx) => {
                  let btnStyle = "bg-white hover:bg-slate-50 border-slate-200 text-slate-800";
                  if (hasAnswered) {
                    if (idx === lesson.testQuestion.correctIndex) {
                      btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                    } else if (idx === selectedOption) {
                      btnStyle = "bg-rose-50 border-rose-500 text-rose-900";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasAnswered}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-right p-3 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && idx === lesson.testQuestion.correctIndex && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs animate-in fade-in">
                  <span className="font-bold text-indigo-900 block mb-0.5">💡 التفسير النموذجي:</span>
                  <p className="text-slate-700 leading-relaxed">
                    {lesson.testQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Notes & Photographed Notes Section */}
          {activeTab === "notes" && (
            <div className="space-y-5 animate-in fade-in" id="content-notes">
              {/* Standalone Notepad Card */}
              <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 p-4 sm:p-5 shadow-xs relative overflow-hidden">
                {/* Visual Notepad Accent Header Line */}
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-500" />

                {/* Notepad Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-amber-100/80">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm">
                          مفكرة الدرس النصية
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200">
                          {subject?.title || "المادة"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {lesson.title}
                      </p>
                    </div>
                  </div>

                  {/* Auto-save & Status Badge & Voice Dictation Toggle */}
                  <div className="flex items-center gap-2">
                    {/* Voice Dictation Main Button */}
                    <button
                      id="btn-voice-dictation-header"
                      type="button"
                      onClick={toggleVoiceDictation}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs ${
                        isListening
                          ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80"
                      }`}
                      title={isListening ? "إيقاف الإملاء الصوتي" : "تحدث لتحويل صوتك إلى ملاحظات مكتوبة"}
                    >
                      {isListening ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <MicOff className="w-3.5 h-3.5" />
                          <span>إيقاف الإملاء</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-emerald-600" />
                          <span>إملاء صوتي 🎙️</span>
                        </>
                      )}
                    </button>

                    {noteLastSaved ? (
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>محفوظ: {noteLastSaved}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-100/70 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        <span>مسودة محلية</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Interactive Formatting & Markdown Quick Insert Bar */}
                <div className="mb-2.5 pb-2.5 border-b border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 ml-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    تنسيق سريع:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat("\n• ", "")}
                    title="إدراج نقطة تعداد"
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
                  >
                    <ListPlus className="w-3 h-3 text-indigo-600" />
                    <span>نقطة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat("« ", " »")}
                    title="إدراج تنصيص مهم"
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
                  >
                    <Quote className="w-3 h-3 text-indigo-600" />
                    <span>تمييز</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat("[قانون: ", "]")}
                    title="صيغة أو قانون"
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
                  >
                    <Hash className="w-3 h-3 text-emerald-600" />
                    <span>قانون</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat("⚠️ تنبيه: ", "")}
                    title="تنبيه امتحانات"
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>تنبيه</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat("💡 فكرة: ", "")}
                    title="فكرة حل سريعة"
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    <span>فكرة حل</span>
                  </button>

                  <div className="h-4 w-px bg-slate-200 mx-0.5" />

                  {/* Voice Dictation Toolbar Pill */}
                  <button
                    id="btn-voice-dictation-toolbar"
                    type="button"
                    onClick={toggleVoiceDictation}
                    title={isListening ? "إيقاف الإملاء الصوتي" : "تحدث لإملاء ملاحظاتك صوتياً"}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3 h-3 text-white" />
                        <span>جاري التسجيل... اضغط للإيقاف</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 text-emerald-600" />
                        <span>إملاء صوتي 🎙️</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Voice Dictation Live Banner (when listening) */}
                {isListening && (
                  <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-rose-50 via-rose-100/70 to-red-50 border border-rose-200 text-rose-900 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white">
                          <Mic className="w-3.5 h-3.5 animate-bounce" />
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                        </div>
                        <span className="text-xs font-bold text-rose-800">
                          جاري الاستماع لصوتك باللغة العربية... تحدث الآن وسيتم تدوين كلامك فوراً
                        </span>
                      </div>

                      {/* Equalizer animation */}
                      <div className="flex items-center gap-1 px-2 py-1 bg-white/80 rounded-lg border border-rose-200">
                        <span className="w-1 h-3 bg-rose-500 rounded-full animate-pulse" />
                        <span className="w-1 h-5 bg-rose-600 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-2.5 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                        <span className="w-1 h-4 bg-rose-600 rounded-full animate-pulse" style={{ animationDelay: "450ms" }} />
                      </div>
                    </div>

                    {/* Live Interim Transcript Display */}
                    {interimTranscript && (
                      <div className="bg-white/90 rounded-lg p-2 border border-rose-200/80 text-xs text-rose-950 font-medium">
                        <span className="text-[10px] text-rose-500 font-bold block mb-0.5">الكلمات المنطوقة حالياً:</span>
                        <span className="italic font-sans">« {interimTranscript} »</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Text Area Canvas with Ruled Notebook Feel */}
                <div className="relative rounded-xl border border-amber-300/80 bg-amber-50/20 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100/80 transition-all shadow-inner">
                  <textarea
                    id="textarea-lesson-notes"
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    onBlur={() => handleSaveNote(userNote, notePhotos)}
                    placeholder="سجّل تلخيصك وملاحظاتك الشخصية هنا... استخدم شريط التنسيق بالأعلى أو الأفكار الجاهزة بالأسفل لتنظيم أفكارك."
                    className="w-full h-36 sm:h-44 p-4 bg-transparent text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 resize-none outline-none leading-relaxed font-sans"
                  />

                  {/* Canvas Footer Counter & Live Indicator */}
                  <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-amber-200/50 bg-amber-50/40 text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>
                        {userNote.trim() ? userNote.trim().split(/\s+/).length : 0} كلمة
                      </span>
                      <span>•</span>
                      <span>{userNote.length} حرف</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      يُحفظ تلقائياً عند مغادرة الحقل
                    </span>
                  </div>
                </div>

                {/* Ready Study Tags */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    إدراج أفكار وملاحظات نموذجية بضغطة واحدة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddQuickSnippet("سؤال متكرر في امتحانات الثانوية العامة بنظام البابل شيت")}
                      className="text-[11px] bg-white hover:bg-amber-100/80 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 transition font-medium shadow-2xs"
                    >
                      ⚡ متكرر في الامتحانات
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickSnippet("خطأ شائع: انتبه للتحويلات والوحدات قبل التعويض في القانون")}
                      className="text-[11px] bg-white hover:bg-rose-50 text-rose-800 px-2.5 py-1 rounded-lg border border-rose-200 transition font-medium shadow-2xs"
                    >
                      ⚠️ انتبه للتحويلات والوحدات
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickSnippet("استنتاج ذهني: يمكن حل هذه الفكرة باستبعاد الخيارات غير المنطقية")}
                      className="text-[11px] bg-white hover:bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 transition font-medium shadow-2xs"
                    >
                      💡 حل باستبعاد الخيارات
                    </button>
                  </div>
                </div>

                {/* Notepad Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3.5 mt-3.5 border-t border-amber-200/80">
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-save-note"
                      type="button"
                      onClick={() => handleSaveNote(userNote, notePhotos)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ المفكرة</span>
                    </button>

                    <button
                      id="btn-voice-dictation-bottom"
                      type="button"
                      onClick={toggleVoiceDictation}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs ${
                        isListening
                          ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                      title={isListening ? "إيقاف الإملاء الصوتي" : "بدء الإملاء الصوتي"}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>إيقاف الإملاء</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-emerald-600" />
                          <span>إملاء صوتي 🎙️</span>
                        </>
                      )}
                    </button>

                    {userNote.trim() && (
                      <button
                        id="btn-copy-note"
                        type="button"
                        onClick={handleCopyNote}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{isCopied ? "تم النسخ بنجاح" : "نسخ النص"}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {userNote.trim() && (
                      <>
                        <button
                          id="btn-ask-ai-with-note"
                          type="button"
                          onClick={() => {
                            onClose();
                            onAskAiAboutLesson(
                              `لدي الملاحظة التالية التي دونتها لدرس "${lesson.title}": (${userNote})، هل يمكنك مراجعتها والتأكد من صحتها علمياً وتوضيح أي تفاصيل قد تغيب عني في الامتحان؟`,
                              subject?.title || "المنهج"
                            );
                          }}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>تدقيق الملاحظة بالذكاء الاصطناعي</span>
                        </button>

                        <button
                          id="btn-clear-note"
                          type="button"
                          onClick={handleClearNote}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                          title="مسح الملاحظة بالكامل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Photographed Paper Notes & Camera Section */}
              <div
                className="rounded-2xl border border-indigo-200/90 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 p-4 sm:p-5 shadow-xs relative overflow-hidden"
                id="section-paper-camera-notes"
              >
                {/* Header Line */}
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                {/* Section Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3.5 border-b border-indigo-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          الملاحظات الورقية المصورة بالكاميرا
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          {notePhotos.length} {notePhotos.length === 1 ? "صورة" : "صور"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        التقط صور كشكول الحصة أو سبورة المستر واربطها مباشرة بهذا الدرس
                      </p>
                    </div>
                  </div>

                  {/* Actions: Open Camera & Upload File */}
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-open-camera-modal"
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>تصوير بالكاميرا</span>
                    </button>

                    <button
                      id="btn-upload-paper-note"
                      type="button"
                      onClick={() => notesFileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>رفع من المعرض</span>
                    </button>

                    {/* Hidden Native File Input */}
                    <input
                      ref={notesFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </div>
                </div>

                {/* Empty State / Dropzone */}
                {notePhotos.length === 0 ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(false);
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    onClick={() => setIsCameraModalOpen(true)}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isDraggingFile
                        ? "border-indigo-500 bg-indigo-50/80"
                        : "border-slate-300 hover:border-indigo-400 bg-white/70 hover:bg-indigo-50/30"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-inner">
                      <Camera className="w-7 h-7" />
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm mb-1">
                      لا توجد صور ملاحظات ورقية مرفقة بعد
                    </h5>
                    <p className="text-xs text-slate-500 max-w-sm mb-3.5 leading-relaxed">
                      انقر هنا لتشغيل الكاميرا وتصوير كشكولك الورقي، أو اسحب وأسقط صورة الملخص الورقي لربطها بالدرس.
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        التقاط بالكاميرا الآن
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Attached Photos Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5" id="note-photos-grid">
                    {notePhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col relative"
                        id={`photo-card-${photo.id}`}
                      >
                        {/* Image Thumbnail with Overlay */}
                        <div
                          onClick={() => setActiveLightboxPhoto(photo)}
                          className="relative h-36 bg-slate-900 cursor-pointer overflow-hidden flex items-center justify-center"
                        >
                          <img
                            src={photo.dataUrl}
                            alt={photo.caption || "ملاحظة ورقية"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-white/90 text-slate-900 text-xs font-bold flex items-center gap-1 shadow-sm">
                              <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                              عرض وتكبير
                            </span>
                          </div>
                        </div>

                        {/* Card Info & Actions */}
                        <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                          <div>
                            <h6 className="font-bold text-slate-800 text-xs truncate" title={photo.caption}>
                              {photo.caption || "ملاحظة ورقية مصورة"}
                            </h6>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{photo.capturedAt}</span>
                            </p>
                          </div>

                          {/* Quick Toolbar */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1">
                            <button
                              type="button"
                              onClick={() => handleAskAiWithPhoto(photo)}
                              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold flex items-center gap-1 transition"
                              title="مراجعة المحتوى وتلخيصه بالذكاء الاصطناعي"
                            >
                              <Bot className="w-3 h-3 text-purple-600" />
                              <span>شرح بالـ AI</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setActiveLightboxPhoto(photo)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                                title="عرض بالحجم الكامل"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                                title="حذف الصورة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Study Tip Footer Note */}
              <div className="px-3.5 py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600 shrink-0" />
                <p className="leading-relaxed">
                  <strong>نصيحة للمذاكرة الفعالة:</strong> كتابة التلخيص والملاحظات بصياغتك الشخصية وتصوير الكشكول يساعد عقلك على ربط المعلومات واسترجاعها بسرعة أثناء اختبارات الثانوية العامة.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3" id="lesson-modal-footer">
          <button
            id="btn-footer-close"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            إغلاق
          </button>

          <button
            id="btn-complete-lesson"
            onClick={handleFinish}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>تأكيد إنجاز الدرس (+50 XP)</span>
          </button>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        lessonTitle={lesson.title}
        subjectTitle={subject?.title}
        onPhotoCaptured={handlePhotoCaptured}
        onShowToast={onShowToast}
      />

      {/* Photo Lightbox & Zoom Modal */}
      <PhotoLightboxModal
        photo={activeLightboxPhoto}
        lessonTitle={lesson.title}
        subjectTitle={subject?.title}
        isOpen={!!activeLightboxPhoto}
        onClose={() => setActiveLightboxPhoto(null)}
        onDeletePhoto={handleDeletePhoto}
        onAskAiWithPhoto={handleAskAiWithPhoto}
        onShowToast={onShowToast}
      />
    </div>
  );
};

