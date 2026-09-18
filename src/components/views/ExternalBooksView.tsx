import React, { useState, useEffect, useRef } from "react";
import {
  ExternalBook,
  ExternalBookUnitExplanation,
  ExternalBookUnitQuiz,
  ExternalBookQuizQuestion,
  GradeLevel,
  Subject,
  Unit,
  StudentProfile,
} from "../../types";
import {
  extractPdfContent,
  saveUploadedPdfBook,
  loadSavedPdfBooks,
  deleteSavedPdfBook,
} from "../../utils/pdfExtractor";
import {
  getExternalBooks,
  getOrGenerateBookExplanation,
  getOrGenerateBookUnitQuiz,
} from "../../utils/externalBooksHelper";
import { ExternalBookAiStudio } from "./ExternalBookAiStudio";
import {
  BookOpen,
  FileText,
  Upload,
  Sparkles,
  Award,
  Brain,
  Bot,
  Headphones,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Layers,
  Search,
  Filter,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  FileCode,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  Flame,
  Check,
  Zap,
} from "lucide-react";

interface ExternalBooksViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  onShowToast: (msg: string) => void;
  onRewardXp?: (xp: number) => void;
  initialSubjectId?: string;
  initialUnitId?: string;
}

export const ExternalBooksView: React.FC<ExternalBooksViewProps> = ({
  profile,
  subjects,
  onShowToast,
  onRewardXp,
  initialSubjectId,
  initialUnitId,
}) => {
  // State for custom uploaded books from IndexedDB
  const [customBooks, setCustomBooks] = useState<ExternalBook[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>(initialSubjectId || "all");
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Upload modal & state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload form states
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadSeries, setUploadSeries] = useState<any>("المعاصر");
  const [uploadSubjectId, setUploadSubjectId] = useState<string>(subjects[0]?.id || "math");
  const [uploadGrade, setUploadGrade] = useState<GradeLevel>(profile.gradeLevel);
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewMeta, setFilePreviewMeta] = useState<any>(null);

  // Active book view state
  const [activeBook, setActiveBook] = useState<ExternalBook | null>(null);
  const [activeTab, setActiveTab] = useState<"ai_studio" | "explanation" | "quiz" | "pdf_view">("ai_studio");
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId || "");

  // Explanation state
  const [explanationData, setExplanationData] = useState<ExternalBookUnitExplanation | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  // Quiz state
  const [quizData, setQuizData] = useState<ExternalBookUnitQuiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<number, boolean>>({});
  const [showModelSolutions, setShowModelSolutions] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showAllModelAnswersBank, setShowAllModelAnswersBank] = useState(false);

  // Load custom books on mount
  useEffect(() => {
    loadSavedPdfBooks().then((saved) => {
      if (Array.isArray(saved) && saved.length > 0) {
        setCustomBooks(saved);
      }
    });
  }, []);

  // Filter books
  const allBooks = getExternalBooks(profile.gradeLevel, undefined, customBooks);
  const filteredBooks = allBooks.filter((book) => {
    const matchSubject = selectedSubjectFilter === "all" || book.subjectId === selectedSubjectFilter;
    const matchSeries = selectedSeriesFilter === "all" || book.seriesName === selectedSeriesFilter;
    const matchSearch =
      searchTerm.trim() === "" ||
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSubject && matchSeries && matchSearch;
  });

  // Automatically select initial book if navigated from subject
  useEffect(() => {
    if (initialSubjectId && !activeBook) {
      const match = allBooks.find((b) => b.subjectId === initialSubjectId);
      if (match) {
        handleOpenBook(match, initialUnitId);
      }
    }
  }, [initialSubjectId, initialUnitId]);

  // Handle opening a book
  const handleOpenBook = async (book: ExternalBook, unitIdToOpen?: string) => {
    setActiveBook(book);
    const sub = subjects.find((s) => s.id === book.subjectId) || subjects[0];
    const uId = unitIdToOpen || book.unitsBreakdown[0]?.unitId || sub?.units[0]?.id || "";
    setSelectedUnitId(uId);
    setActiveTab("ai_studio");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fetch explanation in background for immediate readiness if switched
    loadBookExplanation(book, uId, sub);
  };

  const loadBookExplanation = async (book: ExternalBook, uId: string, sub?: Subject) => {
    const targetSub = sub || subjects.find((s) => s.id === book.subjectId) || subjects[0];
    const targetUnit = targetSub?.units.find((u) => u.id === uId) || targetSub?.units[0];
    if (!targetUnit) return;

    setIsLoadingExplanation(true);
    setExplanationData(null);
    try {
      const result = await getOrGenerateBookExplanation(book, targetUnit, targetSub, profile.gradeLevel);
      setExplanationData(result);
    } catch (e) {
      console.error(e);
      onShowToast("حدث خطأ أثناء تحميل الشرح التفصيلي للكتاب");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const loadBookQuiz = async (book: ExternalBook, uId: string, sub?: Subject) => {
    const targetSub = sub || subjects.find((s) => s.id === book.subjectId) || subjects[0];
    const targetUnit = targetSub?.units.find((u) => u.id === uId) || targetSub?.units[0];
    if (!targetUnit) return;

    setIsLoadingQuiz(true);
    setQuizData(null);
    setIsInteractiveMode(false);
    setQuizFinished(false);
    setUserAnswers({});
    setIsAnswerSubmitted({});
    setShowModelSolutions({});

    try {
      const result = await getOrGenerateBookUnitQuiz(book, targetUnit, targetSub, profile.gradeLevel);
      setQuizData(result);
    } catch (e) {
      console.error(e);
      onShowToast("حدث خطأ أثناء تحميل اختبار الوحدة من الكتاب");
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Unit switch in active book
  const handleSwitchUnit = (uId: string) => {
    setSelectedUnitId(uId);
    if (!activeBook) return;
    const sub = subjects.find((s) => s.id === activeBook.subjectId) || subjects[0];
    if (activeTab === "explanation") {
      loadBookExplanation(activeBook, uId, sub);
    } else if (activeTab === "quiz") {
      loadBookQuiz(activeBook, uId, sub);
    }
  };

  // Tab switch
  const handleTabChange = (tab: "ai_studio" | "explanation" | "quiz" | "pdf_view") => {
    setActiveTab(tab);
    if (!activeBook) return;
    const sub = subjects.find((s) => s.id === activeBook.subjectId) || subjects[0];
    if (tab === "explanation" && !explanationData) {
      loadBookExplanation(activeBook, selectedUnitId, sub);
    } else if (tab === "quiz" && !quizData) {
      loadBookQuiz(activeBook, selectedUnitId, sub);
    }
  };

  // File Upload Handlers
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        processSelectedPdf(file);
      } else {
        onShowToast("يرجى اختيار ملف بصيغة PDF فقط 📄");
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processSelectedPdf(file);
    }
  };

  const processSelectedPdf = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress("جاري قراءة ملف الـ PDF واستخراج الفصول ونصوص الكتاب...");
    try {
      const extracted = await extractPdfContent(file);
      setFilePreviewMeta(extracted);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(".pdf", ""));
      }
      setUploadProgress("");
      onShowToast(`تمت معالجة ملف الـ PDF بنجاح (${extracted.pageCount} صفحة) ✨`);
    } catch (err) {
      console.error(err);
      onShowToast("حدث خطأ أثناء معالجة ملف الـ PDF");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveUploadedBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !selectedFile) {
      onShowToast("يرجى إدخال عنوان الكتاب واختيار ملف PDF");
      return;
    }

    const sub = subjects.find((s) => s.id === uploadSubjectId) || subjects[0];
    const newBook: ExternalBook = {
      id: `custom_book_${Date.now()}`,
      title: uploadTitle,
      seriesName: uploadSeries,
      subjectId: sub.id,
      subjectTitle: sub.title,
      grade: uploadGrade,
      term: 1,
      publisher: `مرفوع بواسطة الطالب (${profile.name})`,
      badge: "كتاب / مذكرة مخصصة PDF",
      coverColor: "from-indigo-600 to-purple-800",
      description: uploadDescription || `كتاب خارجي PDF مرفوع لدراسة ومراجعة مادة ${sub.title}.`,
      fileName: selectedFile.name,
      fileSize: filePreviewMeta?.fileSizeFormatted || `${(selectedFile.size / 1024 / 1024).toFixed(1)} ميجابايت`,
      pageCount: filePreviewMeta?.pageCount || 1,
      isCustomUploaded: true,
      uploadedAt: new Date().toLocaleDateString("ar-EG"),
      pdfUrl: filePreviewMeta?.objectUrl || URL.createObjectURL(selectedFile),
      extractedTextSample: filePreviewMeta?.extractedText || "",
      unitsBreakdown: sub.units.map((u, i) => ({
        unitId: u.id,
        unitTitle: u.title,
        keyChapters: u.lessons.map((l) => l.title),
        coreTricks: ["أسرار الكتاب في البابل شيت", "حل المسائل التراكمية"],
        pageRange: `ص ${i * 25 + 1} - ${(i + 1) * 25}`,
      })),
    };

    await saveUploadedPdfBook(newBook, selectedFile);
    setCustomBooks((prev) => [newBook, ...prev]);
    setShowUploadModal(false);
    setSelectedFile(null);
    setFilePreviewMeta(null);
    setUploadTitle("");
    setUploadDescription("");
    onShowToast("تم إدراج الكتاب الخارجي في مكتبتك بنجاح! 📚");
    handleOpenBook(newBook);
  };

  const handleDeleteCustomBook = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا الكتاب المرفوع من مكتبتك؟")) {
      await deleteSavedPdfBook(bookId);
      setCustomBooks((prev) => prev.filter((b) => b.id !== bookId));
      if (activeBook?.id === bookId) {
        setActiveBook(null);
      }
      onShowToast("تم حذف الكتاب بنجاح");
    }
  };

  // Interactive Quiz Submission
  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (isAnswerSubmitted[qIdx]) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuestionAnswer = (qIdx: number, q: ExternalBookQuizQuestion) => {
    setIsAnswerSubmitted((prev) => ({ ...prev, [qIdx]: true }));
    setShowModelSolutions((prev) => ({ ...prev, [qIdx]: true }));

    const isCorrect = userAnswers[qIdx] === q.correctIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      onShowToast("إجابة نموذجية صحيحة! أحسنت ⭐");
      if (onRewardXp) onRewardXp(15);
    } else {
      onShowToast("راجع نموذج الحل وتفسير استبعاد الخيارات الخاطئة 💡");
    }
  };

  const handleFinishInteractiveQuiz = () => {
    setQuizFinished(true);
    const total = quizData?.questions.length || 1;
    const percentage = Math.round((quizScore / total) * 100);
    onShowToast(`أنهيت الاختبار بنسبة ${percentage}%! حصلت على +50 XP 🎉`);
    if (onRewardXp) onRewardXp(50);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200" dir="rtl">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <BookOpen className="w-3.5 h-3.5" />
                المكتبة الخارجية المعتمدة 2026/2027
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                دعم رفع ملفات PDF 📄
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>📚 الكتب الخارجية والمذكرات (PDF)</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              شرح تفصيلي ومؤسس علمياً مباشرة من أشهر الكتب الخارجية (المعاصر، الامتحان، الأضواء، سلاح التلميذ، نيوتن...)، مع بنك اختبارات حصرية على كل وحدة مع حلولها النموذجية الكاملة وسلالم التصحيح.
            </p>
          </div>

          {/* Action button: Upload Custom Book */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-3 rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 border border-indigo-400/30"
            >
              <Upload className="w-4 h-4" />
              <span>إدراج كتاب أو مذكرة (PDF)</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* If a book is currently active: show the detailed book experience */}
      {activeBook ? (
        <div className="space-y-6">
          {/* Active Book Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setActiveBook(null)}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="الرجوع لقائمة الكتب"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-600 to-purple-700 text-white font-black flex items-center justify-center text-xl shadow-md shrink-0">
                📖
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                    سلسلة {activeBook.seriesName}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {activeBook.fileSize || "PDF"} • {activeBook.pageCount || 200} صفحة
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-800 mt-0.5">
                  {activeBook.title}
                </h2>
              </div>
            </div>

            {/* Units Selector for active book */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-500 shrink-0">اختر الوحدة:</label>
              <select
                value={selectedUnitId}
                onChange={(e) => handleSwitchUnit(e.target.value)}
                className="text-xs font-bold p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden w-full md:w-64"
              >
                {activeBook.unitsBreakdown.map((u) => (
                  <option key={u.unitId} value={u.unitId}>
                    {u.unitTitle} ({u.pageRange || "شامل"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Book Experience Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
            <button
              id="tab-btn-ai-studio"
              onClick={() => handleTabChange("ai_studio")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === "ai_studio"
                  ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Brain className="w-4 h-4 text-amber-300" />
              <span>استوديو المذاكرة والذكاء الاصطناعي (NotebookLM)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                تلخيص + شات + بودكاست
              </span>
            </button>

            <button
              id="tab-btn-explanation"
              onClick={() => handleTabChange("explanation")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === "explanation"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>شرح تفصيلي من أسلوب الكتاب</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                تأصيل + قوانين
              </span>
            </button>

            <button
              id="tab-btn-quiz"
              onClick={() => handleTabChange("quiz")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === "quiz"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>اختبارات الوحدة ونماذج الإجابة</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                بابل شيت + حل مفصل
              </span>
            </button>

            {activeBook.pdfUrl && (
              <button
                id="tab-btn-pdf"
                onClick={() => handleTabChange("pdf_view")}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  activeTab === "pdf_view"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>ملف الـ PDF المستند إليه</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                  تصفح الصفحات
                </span>
              </button>
            )}
          </div>

          {/* ================= TAB 0: NotebookLM AI Studio ================= */}
          {activeTab === "ai_studio" && (
            <ExternalBookAiStudio
              book={activeBook}
              activeUnitTitle={
                activeBook.unitsBreakdown.find((u) => u.unitId === selectedUnitId)?.unitTitle ||
                (subjects.find((s) => s.id === activeBook.subjectId) || subjects[0])?.units.find((u) => u.id === selectedUnitId)?.title ||
                "الوحدة الدراسية"
              }
              subject={subjects.find((s) => s.id === activeBook.subjectId) || subjects[0]}
              onShowToast={onShowToast}
              onRewardXp={onRewardXp}
            />
          )}

          {/* ================= TAB 1: Detailed Grounded Explanation ================= */}
          {activeTab === "explanation" && (
            <div className="space-y-6">
              {isLoadingExplanation ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">
                    جاري استحضار الشرح التفصيلي والتأصيلي من {activeBook.title}...
                  </h3>
                  <p className="text-xs text-slate-500">
                    يتم استخراج القوانين الذهبية، خطوات حل المسائل النموذجية، وتريكات البابل شيت الخاصة بالكتاب.
                  </p>
                </div>
              ) : explanationData ? (
                <div className="space-y-6 animate-in fade-in">
                  {/* Pedagogical Methodology Banner */}
                  <div className="p-5 rounded-3xl bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-indigo-950">
                        {explanationData.pedagogicalMethod}
                      </h3>
                      <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                        تمت مطابقة هذا الشرح بدقة مع طبعة 2026/2027 للثانوية العامة المصرية.
                      </p>
                    </div>
                  </div>

                  {/* Deep Theoretical Foundation */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="text-xl">🏛️</span>
                      <h3 className="text-base font-extrabold text-slate-800">
                        التأصيل النظري والمفاهيمي للوحدة (أسلوب {activeBook.seriesName})
                      </h3>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 leading-loose whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-100 font-normal">
                      {explanationData.deepTheoreticalFoundation}
                    </div>
                  </div>

                  {/* Core Laws & Golden Formulas */}
                  {explanationData.coreLawsAndFormulas.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📐</span>
                          <h3 className="text-base font-extrabold text-slate-800">
                            القوانين الذهبية والعلاقات الحاكمة في الكتاب
                          </h3>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          {explanationData.coreLawsAndFormulas.length} قوانين رئيسية
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {explanationData.coreLawsAndFormulas.map((law, idx) => (
                          <div
                            key={idx}
                            className="p-5 rounded-2xl bg-linear-to-br from-slate-900 to-indigo-950 text-white space-y-3 shadow-md border border-slate-800"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-300">
                                #{idx + 1} {law.title}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                                {law.unit}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white/10 text-center font-mono text-sm sm:text-base font-black text-amber-300 tracking-wide dir-ltr">
                              {law.formula}
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {law.explanation}
                            </p>

                            <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-emerald-300 font-semibold">
                              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{law.bookSpecialRule}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Worked Examples */}
                  {explanationData.stepByStepWorkedExamples.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="text-xl">💡</span>
                        <h3 className="text-base font-extrabold text-slate-800">
                          أمثلة ومسائل نموذجية محلولة خطوة بخطوة من الكتاب
                        </h3>
                      </div>

                      <div className="space-y-6">
                        {explanationData.stepByStepWorkedExamples.map((ex) => (
                          <div
                            key={ex.problemNumber}
                            className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-600 text-white">
                                مسألة رقم {ex.problemNumber}: {ex.problemTitle}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                نموذج حل الكتاب المعتمد
                              </span>
                            </div>

                            <div className="p-4 rounded-xl bg-white border border-slate-200/80 font-bold text-xs sm:text-sm text-slate-900 leading-relaxed">
                              {ex.question}
                            </div>

                            {/* Given & Formula */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200">
                                <span className="font-bold text-slate-700 block mb-1">المعطيات:</span>
                                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                                  {ex.givenData.map((g, gi) => (
                                    <li key={gi}>{g}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                                <span className="font-bold text-indigo-900 block mb-1">القانون المستخدم:</span>
                                <div className="font-mono text-indigo-700 font-bold dir-ltr text-center py-1">
                                  {ex.appliedFormula}
                                </div>
                              </div>
                            </div>

                            {/* Solution Steps */}
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-slate-700 block">خطوات الحل التفصيلية:</span>
                              <div className="space-y-1.5">
                                {ex.solutionSteps.map((step, si) => (
                                  <div
                                    key={si}
                                    className="text-xs text-slate-800 p-2 rounded-lg bg-white border border-slate-200/70 flex items-start gap-2"
                                  >
                                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                      {si + 1}
                                    </span>
                                    <span className="leading-relaxed">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Final Answer & Tip */}
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <span className="font-bold text-emerald-900">
                                الناتج النهائي: {ex.finalAnswer}
                              </span>
                              <span className="text-[11px] text-emerald-700 font-medium">
                                ⭐ {ex.bookTip}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Golden Tricks & Common Pitfalls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Golden Tricks */}
                    <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                        <Flame className="w-5 h-5 text-amber-500" />
                        <h4 className="font-extrabold text-sm text-amber-950">
                          تريكات وملاحظات {activeBook.seriesName} في البابل شيت
                        </h4>
                      </div>
                      <div className="space-y-2.5">
                        {explanationData.bookGoldenTricks.map((trick, ti) => (
                          <div
                            key={ti}
                            className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 text-xs text-amber-900 leading-relaxed flex items-start gap-2"
                          >
                            <span className="text-amber-600 font-bold shrink-0">⚡</span>
                            <span>{trick}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Common Pitfalls */}
                    <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                        <h4 className="font-extrabold text-sm text-rose-950">
                          أخطاء شائعة ومصايد يحذر منها الكتاب
                        </h4>
                      </div>
                      <div className="space-y-2.5">
                        {explanationData.commonPitfalls.map((pitfall, pi) => (
                          <div
                            key={pi}
                            className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-xs text-rose-900 leading-relaxed flex items-start gap-2"
                          >
                            <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                            <span>{pitfall}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feynman Summary */}
                  <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 to-indigo-950 text-white space-y-2 shadow-lg">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <Lightbulb className="w-4 h-4" />
                      <span>خلاصة فاينمان الذكية لفصل الكتاب:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {explanationData.feynmanSummary}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200">
                  اختر وحدة لعرض شرحها من الكتاب.
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: Unit Quizzes with Full Model Solutions ================= */}
          {activeTab === "quiz" && (
            <div className="space-y-6">
              {isLoadingQuiz ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
                  <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">
                    جاري تجهيز بنك اختبارات الوحدة ونماذج الإجابة من {activeBook.title}...
                  </h3>
                  <p className="text-xs text-slate-500">
                    يتم إعداد أسئلة البابل شيت، المسائل المقالية، وسلالم تصحيح الدرجات المعتمدة.
                  </p>
                </div>
              ) : quizData ? (
                <div className="space-y-6 animate-in fade-in">
                  {/* Quiz Control Bar */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                          {quizData.totalQuestions} أسئلة امتحانية شاملة
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          درجة الاجتياز: {quizData.passScore}%
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-800 mt-1">
                        اختبار {quizData.unitTitle} - {quizData.bookTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsInteractiveMode(!isInteractiveMode);
                          setCurrentQuestionIndex(0);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isInteractiveMode
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isInteractiveMode ? "وضع الامتحان التفاعلي نشط" : "بدء اختبار تفاعلي"}</span>
                      </button>

                      <button
                        onClick={() => setShowAllModelAnswersBank(!showAllModelAnswersBank)}
                        className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{showAllModelAnswersBank ? "إخفاء الحلول النموذجية" : "إظهار كافة الحلول النموذجية"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode A: Interactive Quiz Runner */}
                  {isInteractiveMode ? (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
                      {/* Question Navigation Tracker */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">
                          السؤال {currentQuestionIndex + 1} من {quizData.questions.length}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {quizData.questions.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentQuestionIndex(idx)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                                currentQuestionIndex === idx
                                  ? "bg-indigo-600 text-white"
                                  : isAnswerSubmitted[idx]
                                  ? userAnswers[idx] === quizData.questions[idx].correctIndex
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : "bg-rose-100 text-rose-800 border border-rose-300"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Current Question */}
                      {(() => {
                        const q = quizData.questions[currentQuestionIndex];
                        if (!q) return null;
                        const isSubmitted = isAnswerSubmitted[currentQuestionIndex];
                        const showSolution = showModelSolutions[currentQuestionIndex];

                        return (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                                {q.sourceReference}
                              </span>
                              <span className="text-xs font-mono text-slate-400">
                                الصعوبة: {q.difficulty === "easy" ? "مباشر" : q.difficulty === "medium" ? "متوسط" : "مستويات عليا"}
                              </span>
                            </div>

                            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                              {q.question}
                            </h4>

                            {/* Multiple Choice Options */}
                            {q.type === "multiple_choice" && q.options && (
                              <div className="grid grid-cols-1 gap-2.5">
                                {q.options.map((opt, optIdx) => {
                                  const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                                  const isCorrect = q.correctIndex === optIdx;

                                  let optionStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100";
                                  if (isSubmitted) {
                                    if (isCorrect) {
                                      optionStyle = "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold";
                                    } else if (isSelected) {
                                      optionStyle = "bg-rose-50 border-rose-300 text-rose-900";
                                    }
                                  } else if (isSelected) {
                                    optionStyle = "bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-2 ring-indigo-500/20";
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleSelectQuizOption(currentQuestionIndex, optIdx)}
                                      disabled={isSubmitted}
                                      className={`p-3.5 rounded-2xl border text-right text-xs sm:text-sm transition flex items-center justify-between ${optionStyle}`}
                                    >
                                      <span>{opt}</span>
                                      {isSubmitted && isCorrect && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      )}
                                      {isSubmitted && isSelected && !isCorrect && (
                                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Question Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                              <button
                                onClick={() =>
                                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                                }
                                disabled={currentQuestionIndex === 0}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40 transition"
                              >
                                السابق
                              </button>

                              {!isSubmitted ? (
                                <button
                                  onClick={() => handleSubmitQuestionAnswer(currentQuestionIndex, q)}
                                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                                >
                                  تأكيد الإجابة
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    setShowModelSolutions((prev) => ({
                                      ...prev,
                                      [currentQuestionIndex]: !prev[currentQuestionIndex],
                                    }))
                                  }
                                  className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition"
                                >
                                  {showSolution ? "إخفاء الحل النموذجي" : "عرض نموذج الإجابة وسلم الدرجات"}
                                </button>
                              )}

                              {currentQuestionIndex < quizData.questions.length - 1 ? (
                                <button
                                  onClick={() =>
                                    setCurrentQuestionIndex((prev) =>
                                      Math.min(quizData.questions.length - 1, prev + 1)
                                    )
                                  }
                                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
                                >
                                  التالي
                                </button>
                              ) : (
                                <button
                                  onClick={handleFinishInteractiveQuiz}
                                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                                >
                                  إنهاء الاختبار
                                </button>
                              )}
                            </div>

                            {/* Detailed Model Solution Box */}
                            {showSolution && (
                              <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-3 animate-in fade-in">
                                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                                  <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>الحل النموذجي المعتمد من {activeBook.title}</span>
                                  </span>
                                  <span className="text-[11px] font-bold text-emerald-800">
                                    {q.modelSolution.marksAllocation}
                                  </span>
                                </div>

                                <div className="text-xs text-emerald-900 font-bold">
                                  الإجابة الصحيحة: {q.modelSolution.correctAnswerText}
                                </div>

                                <div className="text-xs text-slate-700 leading-relaxed">
                                  <span className="font-bold text-emerald-900 block mb-0.5">منهجية التفكير:</span>
                                  {q.modelSolution.thinkingMethodology}
                                </div>

                                {q.modelSolution.stepByStepDerivation && (
                                  <div className="space-y-1">
                                    <span className="font-bold text-xs text-emerald-900 block">خطوات الحل والتعويض:</span>
                                    {q.modelSolution.stepByStepDerivation.map((s, si) => (
                                      <div key={si} className="text-xs text-slate-800 font-mono bg-white/80 p-1.5 rounded-md border border-emerald-100">
                                        {s}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {q.modelSolution.whyOthersWrong && (
                                  <div className="text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60">
                                    <span className="font-bold text-emerald-800">استبعاد الخيارات الأخرى: </span>
                                    {q.modelSolution.whyOthersWrong}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Mode B: Full Question Bank View with Explanations */
                    <div className="space-y-4">
                      {quizData.questions.map((q) => {
                        const isExpanded = showAllModelAnswersBank || showModelSolutions[q.questionNumber];

                        return (
                          <div
                            key={q.id}
                            className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                                سؤال #{q.questionNumber} • {q.sourceReference}
                              </span>
                              <button
                                onClick={() =>
                                  setShowModelSolutions((prev) => ({
                                    ...prev,
                                    [q.questionNumber]: !prev[q.questionNumber],
                                  }))
                                }
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >
                                <span>{isExpanded ? "إخفاء الحل" : "عرض الحل النموذجي"}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-relaxed">
                              {q.question}
                            </h4>

                            {/* Options if MCQ */}
                            {q.type === "multiple_choice" && q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {q.options.map((opt, oi) => (
                                  <div
                                    key={oi}
                                    className={`p-2.5 rounded-xl border text-slate-800 ${
                                      isExpanded && oi === q.correctIndex
                                        ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900"
                                        : "bg-slate-50 border-slate-200"
                                    }`}
                                  >
                                    <span className="font-mono ml-2 font-bold">{["أ", "ب", "جـ", "د"][oi] || oi + 1})</span>
                                    <span>{opt}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Model Solution */}
                            {isExpanded && (
                              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5 text-xs animate-in fade-in">
                                <div className="flex items-center justify-between font-bold text-emerald-950">
                                  <span>الإجابة النموذجية: {q.modelSolution.correctAnswerText}</span>
                                  <span className="text-[11px] text-emerald-700">{q.modelSolution.marksAllocation}</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed">
                                  <span className="font-bold text-emerald-900">منهجية التفكير: </span>
                                  {q.modelSolution.thinkingMethodology}
                                </p>
                                {q.modelSolution.stepByStepDerivation && (
                                  <div className="space-y-1">
                                    <span className="font-bold text-emerald-900">خطوات الحل:</span>
                                    {q.modelSolution.stepByStepDerivation.map((s, si) => (
                                      <div key={si} className="p-1.5 rounded bg-white font-mono text-[11px] text-slate-800 border border-emerald-100">
                                        {s}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200">
                  اختر وحدة لتحميل اختباراتها.
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: Embedded PDF Viewer ================= */}
          {activeTab === "pdf_view" && activeBook.pdfUrl && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="font-extrabold text-sm text-slate-800">
                    عارض ملف الـ PDF: {activeBook.fileName || activeBook.title}
                  </h3>
                </div>
                <a
                  href={activeBook.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>فتح في تبويب مستقل</span>
                </a>
              </div>

              <div className="w-full h-[650px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <iframe
                  src={activeBook.pdfUrl}
                  title="PDF Reader"
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= Browse & Filter External Books Library ================= */
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن كتاب، سلسلة (المعاصر، الامتحان...)، أو وحدة..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-hidden transition"
                />
              </div>

              {/* Series Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {["all", "المعاصر", "الامتحان", "الأضواء", "سلاح_التلميذ", "نيوتن", "كتاب_خاص_PDF"].map((series) => (
                  <button
                    key={series}
                    onClick={() => setSelectedSeriesFilter(series)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedSeriesFilter === series
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {series === "all" ? "جميع السلاسل" : series === "كتاب_خاص_PDF" ? "مذكراتي المرفوعة" : series}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3 scrollbar-none">
              <button
                onClick={() => setSelectedSubjectFilter("all")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedSubjectFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                جميع المواد
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectFilter(sub.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    selectedSubjectFilter === sub.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleOpenBook(book)}
                className="group p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Badge & Series */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {book.seriesName}
                    </span>

                    {book.isCustomUploaded ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold">
                          PDF خاص
                        </span>
                        <button
                          onClick={(e) => handleDeleteCustomBook(book.id, e)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 transition"
                          title="حذف هذا الكتاب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {book.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                    {book.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {book.publisher} • {book.subjectTitle}
                  </p>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {book.description}
                  </p>

                  {/* Units Count */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{book.unitsBreakdown.length} وحدات مفصلة</span>
                    <span className="font-mono text-[11px]">{book.fileSize || "PDF"}</span>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2">
                  <div className="w-full py-2.5 rounded-xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-700 text-xs font-bold transition text-center flex items-center justify-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>تصفح الشرح والاختبارات</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <span className="text-3xl">🔍</span>
              <h3 className="text-base font-bold text-slate-800">لا توجد كتب تطابق بحثك حالياً</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                يمكنك رفع ملف PDF لكتابك أو مذكرتك الدراسية مباشرة بنقرة واحدة عبر زر "إدراج كتاب أو مذكرة (PDF)".
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition inline-flex items-center gap-1.5 mt-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع كتاب PDF الآن</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: Upload Custom PDF Book ================= */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">إدراج كتاب خارجي أو مذكرة (PDF)</h3>
                  <p className="text-[11px] text-slate-400">حفظ محلي دائم مع استخراج الشروحات والاختبارات</p>
                </div>
              </div>

              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUploadedBook} className="space-y-4 pt-4">
              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-3xl bg-indigo-50/40 text-center cursor-pointer transition space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <FileText className="w-6 h-6" />
                </div>

                {selectedFile ? (
                  <div>
                    <span className="text-xs font-bold text-indigo-900 block">
                      الملف المختار: {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-indigo-700">
                      {filePreviewMeta?.fileSizeFormatted || `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`} • {filePreviewMeta?.pageCount || 1} صفحة
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      اضغط لاختيار ملف الـ PDF أو اسحبه إلى هنا
                    </span>
                    <span className="text-[11px] text-slate-400">
                      يدعم كافة مذكرات وكتب الثانوية العامة بصيغة PDF
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className="text-xs text-indigo-600 font-bold animate-pulse pt-2">
                    {uploadProgress}
                  </div>
                )}
              </div>

              {/* Book Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">عنوان الكتاب / المذكرة:</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="مثال: مذكرة ليلة الامتحان في الفيزياء"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">سلسلة الكتاب:</label>
                  <select
                    value={uploadSeries}
                    onChange={(e) => setUploadSeries(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="المعاصر">المعاصر</option>
                    <option value="الامتحان">الامتحان</option>
                    <option value="الأضواء">الأضواء</option>
                    <option value="سلاح_التلميذ">سلاح التلميذ</option>
                    <option value="نيوتن">نيوتن</option>
                    <option value="الشامل">الشامل</option>
                    <option value="الوافي">الوافي</option>
                    <option value="اللواء">اللواء</option>
                    <option value="كتاب_خاص_PDF">مذكرة معلم / كتاب خاص</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">المادة الدراسية:</label>
                  <select
                    value={uploadSubjectId}
                    onChange={(e) => setUploadSubjectId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">الصف الدراسي:</label>
                  <select
                    value={uploadGrade}
                    onChange={(e) => setUploadGrade(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="1st_secondary">الصف الأول الثانوي</option>
                    <option value="2nd_secondary">الصف الثاني الثانوي</option>
                    <option value="3rd_secondary">الصف الثالث الثانوي (الثانوية العامة)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات إضافية أو وصف:</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="مثال: يغطي جميع مسائل وتريكات الباب الأول والثاني مع مراجعة نهائية..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  إدراج وحفظ الكتاب 📚
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
