import React, { useState } from "react";
import { OfficialSource } from "../../types";
import {
  Search,
  BookOpen,
  FileText,
  ExternalLink,
  ShieldCheck,
  Download,
  Plus,
} from "lucide-react";

interface SourcesViewProps {
  sources: OfficialSource[];
  onAddSource: (src: OfficialSource) => void;
  onShowToast: (msg: string) => void;
  onNavigateToExternalBooks?: () => void;
}

export const SourcesView: React.FC<SourcesViewProps> = ({
  sources,
  onAddSource,
  onShowToast,
  onNavigateToExternalBooks,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newPublisher, setNewPublisher] = useState("");
  const [newCategory, setNewCategory] = useState<OfficialSource["category"]>("كتاب_الوزارة");
  const [newDescription, setNewDescription] = useState("");

  const filteredSources = sources.filter((s) => {
    if (filterCategory === "all") return true;
    return s.category === filterCategory;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    onAddSource({
      id: `src_custom_${Date.now()}`,
      title: newTitle,
      publisher: newPublisher || "مصدر دراسي إضافي",
      grade: "الصف الأول الثانوي",
      category: newCategory,
      description: newDescription,
      isOfficial: false,
    });

    setShowAddModal(false);
    setNewTitle("");
    setNewPublisher("");
    setNewDescription("");
    onShowToast("تمت إضافة المرجع الدراسي إلى قائمتك بنجاح! 📚");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              🔎 المصادر والمراجع التعليمية المعتمدة
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              موثقة رسمياً
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            الكتب الدراسية الصادرة عن وزارة التربية والتعليم، بنك المعرفة المصري، والمنصات التعليمية الرسمية لعام 2026/2027
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مصدر خاص</span>
        </button>
      </div>

      {/* Official Guarantee Banner */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-slate-900 to-indigo-950 text-white flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 text-2xl shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white">
            جميع المناهج مطابقة للمحتوى الرقمي المعتمد 2026 / 2027
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            يتم تحديث خرائط الدروس ونماذج الأسئلة التفاعلية فور اعتماد أي تعديلات في الكتب المدرسية أو نواتج التعلم الصادرة من مركز الامتحانات.
          </p>
        </div>
      </div>

      {/* External Books Quick Link Banner */}
      {onNavigateToExternalBooks && (
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-purple-900/90 to-indigo-950 text-white border border-purple-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 text-xl">
              📚
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>بوابة الكتب الخارجية والمذكرات (PDF)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-400/30 font-bold">
                  سلاسل معتمدة
                </span>
              </h4>
              <p className="text-xs text-purple-200/80 mt-0.5">
                تصفح كتب المعاصر والامتحان والأضواء، مع شروحات تفصيلية للوحدات واختبارات امتحانية مكثفة، أو ارفع كتب ومذكرات PDF خاصة بك.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToExternalBooks}
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
          >
            <span>فتح قسم الكتب الخارجية</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "جميع المصادر" },
          { id: "كتاب_الوزارة", label: "الكتب المدرسية" },
          { id: "بنك_المعرفة", label: "بنك المعرفة (EKB)" },
          { id: "نماذج_استرشادية", label: "النماذج الاسترشادية" },
          { id: "منصة_البث", label: "قنوات مدرستنا" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border shrink-0 ${
              filterCategory === cat.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  {source.category === "كتاب_الوزارة"
                    ? "📗 كتاب مدرسي معتمد"
                    : source.category === "بنك_المعرفة"
                    ? "🌐 بنك المعرفة"
                    : source.category === "نماذج_استرشادية"
                    ? "📝 نماذج امتحانية"
                    : "📺 بث تعليمي"}
                </span>

                {source.isOfficial && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    رسمي
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm sm:text-base text-slate-800 mb-1">
                {source.title}
              </h4>
              <p className="text-xs text-slate-400 font-medium mb-2">
                {source.publisher} • {source.grade}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {source.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {source.fileSize ? (
                <span className="text-xs text-slate-400 font-mono">
                  الحجم: {source.fileSize}
                </span>
              ) : (
                <span className="text-xs text-indigo-600 font-semibold">بوابة تفاعلية</span>
              )}

              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>زيارة المنصة الرسمية</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={() => onShowToast(`تم تحديد المصدر: ${source.title}`)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>تصفح المصدر</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1">إضافة مصدر أو مذكرة دراسية خاصة</h3>
            <p className="text-xs text-slate-500 mb-4">
              يمكنك ربط ملازمك أو ملخصاتك الخارجية للمتابعة
            </p>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">عنوان المرجع:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: مذكرة مراجعة ليلة الامتحان في الرياضيات"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">المعد أو المعلم:</label>
                <input
                  type="text"
                  value={newPublisher}
                  onChange={(e) => setNewPublisher(e.target.value)}
                  placeholder="مثال: أ/ أحمد شاكر"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">التصنيف:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="كتاب_الوزارة">كتاب مدرسي</option>
                  <option value="نماذج_استرشادية">نماذج امتحانات وملخصات</option>
                  <option value="بنك_المعرفة">محتوى إلكتروني</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">وصف مختصر:</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="ملاحظات حول المرجع والوحدات المغطاة..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
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
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
