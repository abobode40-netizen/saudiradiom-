import React, { useState, useEffect } from "react";
import { Flashcard, NotePhoto } from "../../types";
import {
  Brain,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  ArrowLeft,
  ChevronLeft,
  FileText,
  Camera,
  Image as ImageIcon,
  BookOpen,
  Calendar,
  Layers,
  ZoomIn,
  Search,
} from "lucide-react";
import { PhotoLightboxModal } from "../PhotoLightboxModal";

interface ReviewViewProps {
  flashcards: Flashcard[];
  onUpdateFlashcard: (id: string, rating: "hard" | "medium" | "easy") => void;
  onAddFlashcard: (card: Flashcard) => void;
  onOpenLesson: (subjectId: string, lessonId: string) => void;
  onShowToast: (msg: string) => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  flashcards,
  onUpdateFlashcard,
  onAddFlashcard,
  onOpenLesson,
  onShowToast,
}) => {
  const [mainViewMode, setMainViewMode] = useState<"flashcards" | "notes_binder">("flashcards");
  const [activeTab, setActiveTab] = useState<"all" | "urgent" | "soon" | "mastered">("all");
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Binder & Saved Notes State
  const [savedNotesList, setSavedNotesList] = useState<
    Array<{
      lessonId: string;
      lessonTitle: string;
      subjectTitle: string;
      text?: string;
      photos?: NotePhoto[];
      updatedAt?: string;
    }>
  >([]);
  const [notesSearch, setNotesSearch] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<NotePhoto | null>(null);
  const [activeLightboxLesson, setActiveLightboxLesson] = useState<{ title: string; subject: string }>({
    title: "",
    subject: "",
  });

  // Load notes from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rafiq_lesson_notes");
      if (raw) {
        const parsed = JSON.parse(raw);
        const list = Object.keys(parsed).map((lessonId) => ({
          lessonId,
          ...parsed[lessonId],
        }));
        setSavedNotesList(list);
      }
    } catch (e) {
      console.error(e);
    }
  }, [mainViewMode]);

  // New card form
  const [newConcept, setNewConcept] = useState("");
  const [newSubject, setNewSubject] = useState("الرياضيات");
  const [newPrompt, setNewPrompt] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const filteredCards = flashcards.filter((card) => {
    if (activeTab === "all") return true;
    return card.status === activeTab;
  });

  const urgentCards = flashcards.filter((c) => c.status === "urgent");
  const soonCards = flashcards.filter((c) => c.status === "soon");
  const masteredCards = flashcards.filter((c) => c.status === "mastered");

  const totalPhotosCount = savedNotesList.reduce((acc, item) => acc + (item.photos?.length || 0), 0);

  const filteredNotesList = savedNotesList.filter((item) => {
    const matchesSearch =
      notesSearch.trim() === "" ||
      item.lessonTitle.toLowerCase().includes(notesSearch.toLowerCase()) ||
      (item.text && item.text.toLowerCase().includes(notesSearch.toLowerCase())) ||
      (item.photos && item.photos.some((p) => p.caption?.toLowerCase().includes(notesSearch.toLowerCase())));

    const matchesSubject =
      selectedSubjectFilter === "all" || item.subjectTitle === selectedSubjectFilter;

    return matchesSearch && matchesSubject;
  });

  const startReviewSession = (index = 0) => {
    setActiveCardIndex(index);
    setIsFlipped(false);
  };

  const handleRate = (rating: "hard" | "medium" | "easy") => {
    if (activeCardIndex === null) return;
    const card = filteredCards[activeCardIndex];
    if (card) {
      onUpdateFlashcard(card.id, rating);
      onShowToast(
        rating === "easy"
          ? "أحسنت! تم تأجيل المراجعة القادمة إلى أسبوع 🟢"
          : rating === "medium"
          ? "جيد، ستتم المراجعة بعد 3 أيام 🟡"
          : "سنكرر المراجعة غداً للتثبيت الدائم 🔴"
      );
    }

    if (activeCardIndex + 1 < filteredCards.length) {
      setActiveCardIndex((prev) => (prev !== null ? prev + 1 : 0));
      setIsFlipped(false);
    } else {
      setActiveCardIndex(null);
      setIsFlipped(false);
      onShowToast("اكتملت جلسة المراجعة الذكية بنجاح! 🎉 +40 XP");
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept || !newPrompt || !newAnswer) return;

    const newCard: Flashcard = {
      id: `fc_custom_${Date.now()}`,
      subject: newSubject,
      concept: newConcept,
      prompt: newPrompt,
      answer: newAnswer,
      status: "urgent",
      nextReviewDays: 1,
      retentionPercent: 50,
    };

    onAddFlashcard(newCard);
    setShowAddModal(false);
    setNewConcept("");
    setNewPrompt("");
    setNewAnswer("");
    onShowToast("تمت إضافة بطاقة المراجعة بنجاح! 📌");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              🧠 المراجعة الذكية وكشكول الملاحظات
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
              تثبيت الذاكرة والتوثيق
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            بطاقات التكرار المتباعد لتثبيت المفاهيم + أرشيف كشكول الملاحظات والصور المصورة بالكاميرا
          </p>
        </div>

        {mainViewMode === "flashcards" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة بطاقة مراجعة</span>
          </button>
        )}
      </div>

      {/* Main View Mode Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 max-w-md">
        <button
          type="button"
          onClick={() => setMainViewMode("flashcards")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            mainViewMode === "flashcards"
              ? "bg-white text-indigo-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Brain className="w-4 h-4 text-indigo-600" />
          <span>بطاقات التثبيت الذكي ({flashcards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainViewMode("notes_binder")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            mainViewMode === "notes_binder"
              ? "bg-white text-purple-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Camera className="w-4 h-4 text-purple-600" />
          <span>كشكول وملاحظات الكاميرا ({totalPhotosCount})</span>
        </button>
      </div>

      {/* Mode 1: Flashcards Section */}
      {mainViewMode === "flashcards" && (
        <>

      {/* Interactive Review Session Player */}
      {activeCardIndex !== null && filteredCards[activeCardIndex] && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-w-xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                {filteredCards[activeCardIndex].subject}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                بطاقة {activeCardIndex + 1} من {filteredCards.length}
              </span>
            </div>
            <button
              onClick={() => setActiveCardIndex(null)}
              className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
            >
              إنهاء الجلسة
            </button>
          </div>

          {/* Flashcard Area */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[220px] p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
              isFlipped
                ? "bg-indigo-50/80 border-indigo-200 text-indigo-950"
                : "bg-slate-50 border-slate-200 text-slate-900 shadow-inner"
            }`}
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {isFlipped ? "💡 الإجابة والتوضيح:" : "❓ السؤال / المفهوم:"}
              </span>
              <h3 className="text-base sm:text-lg font-bold leading-relaxed">
                {isFlipped
                  ? filteredCards[activeCardIndex].answer
                  : filteredCards[activeCardIndex].prompt}
              </h3>
            </div>

            <div className="text-center pt-4">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                <RotateCw className="w-3.5 h-3.5" />
                انقر على البطاقة لقلبها
              </span>
            </div>
          </div>

          {/* Self-Rating Controls */}
          {isFlipped && (
            <div className="space-y-3 animate-in fade-in">
              <span className="text-xs font-bold text-slate-600 text-center block">
                كيف كان تذكرك لهذه المعلومة؟
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRate("hard")}
                  className="py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition"
                >
                  🔴 صعب (إعادة غداً)
                </button>
                <button
                  onClick={() => handleRate("medium")}
                  className="py-2.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold transition"
                >
                  🟡 متوسط (بعد 3 أيام)
                </button>
                <button
                  onClick={() => handleRate("easy")}
                  className="py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition"
                >
                  🟢 سهل جداً (متقن)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Review Dashboard */}
      {activeCardIndex === null && (
        <>
          {/* Summary Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div
              onClick={() => setActiveTab("urgent")}
              className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer ${
                activeTab === "urgent"
                  ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400/20"
                  : "bg-white border-slate-200/80 hover:border-rose-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🔴</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {urgentCards.length} بطاقات
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-800">يحتاج تثبيت عاجل</h3>
              <p className="text-xs text-slate-500 mt-0.5">مفاهيم تحتاج تكراراً مكثفاً اليوم</p>
            </div>

            <div
              onClick={() => setActiveTab("soon")}
              className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer ${
                activeTab === "soon"
                  ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20"
                  : "bg-white border-slate-200/80 hover:border-amber-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🟡</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {soonCards.length} بطاقات
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-800">مراجعة قريبة</h3>
              <p className="text-xs text-slate-500 mt-0.5">موعدها خلال 48 إلى 72 ساعة</p>
            </div>

            <div
              onClick={() => setActiveTab("mastered")}
              className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer ${
                activeTab === "mastered"
                  ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20"
                  : "bg-white border-slate-200/80 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🟢</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {masteredCards.length} بطاقات
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-800">مفاهيم متقنة</h3>
              <p className="text-xs text-slate-500 mt-0.5">مستقرة في الذاكرة بنسبة تفوق 90%</p>
            </div>
          </div>

          {/* Quick Action to start all */}
          <div className="p-5 rounded-3xl bg-linear-to-r from-indigo-600 to-purple-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-indigo-900/10">
            <div>
              <h3 className="font-bold text-base">بدء جولة مراجعة تفاعلية سريعة</h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                تصفح {filteredCards.length} بطاقة مراجعة مع التقييم الذاتي
              </p>
            </div>
            <button
              onClick={() => startReviewSession(0)}
              disabled={filteredCards.length === 0}
              className="px-6 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 font-bold text-xs sm:text-sm shadow-md transition self-start sm:self-auto"
            >
              ابدأ الجلسة الآن
            </button>
          </div>

          {/* Flashcards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCards.map((card, idx) => (
              <div
                key={card.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {card.subject}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        card.status === "urgent"
                          ? "bg-rose-50 text-rose-700"
                          : card.status === "soon"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {card.status === "urgent"
                        ? "🔴 تثبيت عاجل"
                        : card.status === "soon"
                        ? "🟡 خلال يومين"
                        : "🟢 متقن"}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-800 mb-1">{card.concept}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{card.prompt}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    نسبة التذكر: {card.retentionPercent}%
                  </span>
                  <button
                    onClick={() => startReviewSession(idx)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    مراجعة البطاقة ◀
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
        </>
      )}

      {/* Add Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1">إضافة بطاقة مراجعة جديدة</h3>
            <p className="text-xs text-slate-500 mb-4">
              أضف أي قانون أو ملحوظة امتحانية تريد تثبيتها
            </p>

            <form onSubmit={handleCreateCard} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">المادة:</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="الرياضيات">الرياضيات</option>
                  <option value="العلوم المتكاملة">العلوم المتكاملة</option>
                  <option value="اللغة العربية">اللغة العربية</option>
                  <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                  <option value="الفلسفة">الفلسفة والتفكير العلمي</option>
                  <option value="التاريخ">التاريخ</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">عنوان المفهوم:</label>
                <input
                  type="text"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  placeholder="مثال: صيغة أبعاد الشغل"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">وجه البطاقة (السؤال):</label>
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="اكتب السؤال أو القانون المطلوب تذكره..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ظهر البطاقة (الإجابة):</label>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="اكتب الإجابة النموذجية والشرح..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
                >
                  حفظ البطاقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mode 2: Photographed Notes & Paper Binder */}
      {mainViewMode === "notes_binder" && (
        <div className="space-y-5 animate-in fade-in" id="binder-notes-view">
          {/* Binder Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                placeholder="ابحث في عناوين الدروس، نصوص الملاحظات، أو الصور المصورة..."
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">كل المواد الدراسية</option>
                <option value="الرياضيات">الرياضيات</option>
                <option value="العلوم المتكاملة">العلوم المتكاملة</option>
                <option value="اللغة العربية">اللغة العربية</option>
                <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                <option value="الفلسفة">الفلسفة والتفكير العلمي</option>
                <option value="التاريخ">التاريخ</option>
              </select>
            </div>
          </div>

          {/* Binder Content */}
          {filteredNotesList.length === 0 ? (
            <div className="text-center py-14 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base mb-1">
                لا توجد ملاحظات أو صور ورقية مطابقة
              </h4>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                افتح أي درس من شجرة المنهج، ثم ادخل إلى تبويب «المفكرة والملاحظات» لتصوير كشكولك الورقي بالكاميرا أو كتابة تلخيصك الخاص.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="binder-lessons-grid">
              {filteredNotesList.map((item) => (
                <div
                  key={item.lessonId}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all p-5 flex flex-col justify-between space-y-3"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                        {item.subjectTitle}
                      </span>
                      {item.updatedAt && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.updatedAt}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-2">{item.lessonTitle}</h4>

                    {/* Text Note Snippet */}
                    {item.text && (
                      <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-slate-700 font-sans leading-relaxed mb-3 whitespace-pre-line line-clamp-3">
                        {item.text}
                      </div>
                    )}

                    {/* Attached Photos Gallery Thumbnails */}
                    {item.photos && item.photos.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                          <Camera className="w-3 h-3 text-indigo-600" />
                          <span>الصور المرفقة بالكاميرا ({item.photos.length}):</span>
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {item.photos.map((photo) => (
                            <div
                              key={photo.id}
                              onClick={() => {
                                setActiveLightboxLesson({
                                  title: item.lessonTitle,
                                  subject: item.subjectTitle,
                                });
                                setActiveLightboxPhoto(photo);
                              }}
                              className="relative h-20 rounded-xl overflow-hidden cursor-pointer border border-slate-200 hover:border-indigo-400 transition group shadow-2xs"
                            >
                              <img
                                src={photo.dataUrl}
                                alt={photo.caption || "ملاحظة ورقية"}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                <ZoomIn className="w-4 h-4" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Open Lesson Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {(item.photos?.length || 0) > 0
                        ? `${item.photos?.length} صور كشكول`
                        : "ملاحظة نصية"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenLesson(item.subjectTitle, item.lessonId)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>فتح الدرس الكامل ◀</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox for Binder */}
      <PhotoLightboxModal
        photo={activeLightboxPhoto}
        lessonTitle={activeLightboxLesson.title}
        subjectTitle={activeLightboxLesson.subject}
        isOpen={!!activeLightboxPhoto}
        onClose={() => setActiveLightboxPhoto(null)}
        onDeletePhoto={(photoId) => {
          try {
            const raw = localStorage.getItem("rafiq_lesson_notes");
            if (raw) {
              const parsed = JSON.parse(raw);
              Object.keys(parsed).forEach((k) => {
                if (parsed[k].photos) {
                  parsed[k].photos = parsed[k].photos.filter((p: NotePhoto) => p.id !== photoId);
                }
              });
              localStorage.setItem("rafiq_lesson_notes", JSON.stringify(parsed));
              const updatedList = Object.keys(parsed).map((k) => ({
                lessonId: k,
                ...parsed[k],
              }));
              setSavedNotesList(updatedList);
            }
          } catch (e) {
            console.error(e);
          }
        }}
        onAskAiWithPhoto={() => {
          onShowToast("افتح الدرس للاستفسار التفاعلي مع المدرس الذكي حول هذا الملخص");
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
