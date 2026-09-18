import React, { useState } from "react";
import { MindMapTreeData, MindMapBranch } from "../utils/curriculumAiExplainer";
import {
  GitBranch,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Volume2,
  Save,
  ListOrdered,
  Maximize2,
  Minimize2,
  Zap,
} from "lucide-react";

interface InteractiveMindMapProps {
  treeData: MindMapTreeData;
  outlineText?: string;
  onReadAloud?: (text: string) => void;
  onSaveToNote?: (text: string) => void;
  onShowToast: (msg: string) => void;
}

export const InteractiveMindMap: React.FC<InteractiveMindMapProps> = ({
  treeData,
  outlineText,
  onReadAloud,
  onSaveToNote,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<"visual_tree" | "text_outline">("visual_tree");
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({
    b1: true,
    b2: true,
    b3: true,
    b4: true,
  });
  const [copiedBranchId, setCopiedBranchId] = useState<string | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);

  const toggleBranch = (branchId: string) => {
    setExpandedBranches((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  const expandAll = () => {
    const nextState: Record<string, boolean> = {};
    treeData.branches.forEach((b) => {
      nextState[b.id] = true;
    });
    setExpandedBranches(nextState);
  };

  const collapseAll = () => {
    setExpandedBranches({});
  };

  const handleCopyBranch = (branch: MindMapBranch) => {
    const text = `* ${branch.title} (${branch.badge}):\n${branch.items.map((i) => `  - ${i}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedBranchId(branch.id);
    setTimeout(() => setCopiedBranchId(null), 2000);
    onShowToast(`تم نسخ فرع "${branch.title}" 📋`);
  };

  const handleCopyAll = () => {
    const fullText =
      outlineText ||
      `# ${treeData.title}\nالمفهوم المركزي: ${treeData.centralConcept}\n\n` +
        treeData.branches
          .map((b) => `## ${b.title} [${b.badge}]\n${b.items.map((i) => `- ${i}`).join("\n")}`)
          .join("\n\n");

    navigator.clipboard.writeText(fullText);
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
    onShowToast("تم نسخ الخريطة الذهنية بالكامل للحافظة 📋");
  };

  const getBranchColorStyles = (color: MindMapBranch["color"]) => {
    switch (color) {
      case "purple":
        return {
          cardBg: "bg-purple-50/70 hover:bg-purple-50 border-purple-200/90",
          headerBg: "bg-purple-100/80 text-purple-900 border-purple-200",
          badgeBg: "bg-purple-600 text-white",
          dotBg: "bg-purple-600",
          itemBorder: "border-purple-200/60 bg-white/90 text-purple-950",
        };
      case "emerald":
        return {
          cardBg: "bg-emerald-50/70 hover:bg-emerald-50 border-emerald-200/90",
          headerBg: "bg-emerald-100/80 text-emerald-900 border-emerald-200",
          badgeBg: "bg-emerald-600 text-white",
          dotBg: "bg-emerald-600",
          itemBorder: "border-emerald-200/60 bg-white/90 text-emerald-950",
        };
      case "rose":
        return {
          cardBg: "bg-rose-50/70 hover:bg-rose-50 border-rose-200/90",
          headerBg: "bg-rose-100/80 text-rose-900 border-rose-200",
          badgeBg: "bg-rose-600 text-white",
          dotBg: "bg-rose-600",
          itemBorder: "border-rose-200/60 bg-white/90 text-rose-950",
        };
      case "blue":
        return {
          cardBg: "bg-blue-50/70 hover:bg-blue-50 border-blue-200/90",
          headerBg: "bg-blue-100/80 text-blue-900 border-blue-200",
          badgeBg: "bg-blue-600 text-white",
          dotBg: "bg-blue-600",
          itemBorder: "border-blue-200/60 bg-white/90 text-blue-950",
        };
      case "amber":
        return {
          cardBg: "bg-amber-50/70 hover:bg-amber-50 border-amber-200/90",
          headerBg: "bg-amber-100/80 text-amber-900 border-amber-200",
          badgeBg: "bg-amber-600 text-white",
          dotBg: "bg-amber-600",
          itemBorder: "border-amber-200/60 bg-white/90 text-amber-950",
        };
      default:
        return {
          cardBg: "bg-indigo-50/70 hover:bg-indigo-50 border-indigo-200/90",
          headerBg: "bg-indigo-100/80 text-indigo-900 border-indigo-200",
          badgeBg: "bg-indigo-600 text-white",
          dotBg: "bg-indigo-600",
          itemBorder: "border-indigo-200/60 bg-white/90 text-indigo-950",
        };
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-100/80 border border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode("visual_tree")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "visual_tree"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200/60"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>المخطط البصري التفاعلي 🌳</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("text_outline")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "text_outline"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200/60"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>الهيكل النصي 📋</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {viewMode === "visual_tree" && (
            <>
              <button
                type="button"
                onClick={expandAll}
                className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold transition"
                title="توسيع كافة الفروع"
              >
                توسيع الكل
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold transition"
                title="طي كافة الفروع"
              >
                طي الكل
              </button>
            </>
          )}

          {onReadAloud && (
            <button
              type="button"
              onClick={() => {
                const speech =
                  `الخريطة الذهنية لدرس ${treeData.centralConcept}. تتفرع إلى: ` +
                  treeData.branches.map((b) => `${b.title}: ${b.items.join("، ")}`).join(". ");
                onReadAloud(speech);
              }}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition"
              title="استماع صوتي للخريطة الذهنية"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-600" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyAll}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition"
            title="نسخ الخريطة الذهنية كاملة"
          >
            {isCopiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onSaveToNote && (
            <button
              type="button"
              onClick={() => {
                const noteSnippet =
                  `خريطة ذهنية لدرس: ${treeData.centralConcept}\n` +
                  treeData.branches
                    .map((b) => `• ${b.title}:\n  ${b.items.map((i) => `- ${i}`).join("\n  ")}`)
                    .join("\n");
                onSaveToNote(noteSnippet);
                onShowToast("تم حفظ هيكل الخريطة في مفكرتك 📝");
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition flex items-center gap-1"
              title="حفظ الخريطة في المفكرة"
            >
              <Save className="w-3 h-3 text-amber-600" />
              <span>حفظ بالمفكرة</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === "visual_tree" ? (
        <div className="space-y-4">
          {/* Central Root Concept Node */}
          <div className="relative p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-700 to-indigo-900 text-white shadow-md text-center overflow-hidden border-2 border-purple-300/40">
            <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>المفهوم المركزي للدرس والوحدة</span>
                <span className="opacity-60">•</span>
                <span>{treeData.subjectTitle}</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white tracking-wide">
                {treeData.centralConcept}
              </h3>
              <p className="text-xs text-purple-100 max-w-md mx-auto">
                خريطة ذهنية تكاملية تربط نواتج التعلم الوزارية بالقوانين وتريكات البابل شيت
              </p>
            </div>
          </div>

          {/* Connected Branches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {treeData.branches.map((branch, idx) => {
              const styles = getBranchColorStyles(branch.color);
              const isExpanded = !!expandedBranches[branch.id];

              return (
                <div
                  key={branch.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${styles.cardBg}`}
                >
                  {/* Branch Header */}
                  <div
                    onClick={() => toggleBranch(branch.id)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer border-b transition select-none ${styles.headerBg}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${styles.dotBg}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm">{branch.title}</h4>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${styles.badgeBg}`}
                          >
                            {branch.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyBranch(branch);
                        }}
                        className="p-1 rounded-md bg-white/70 hover:bg-white text-slate-700 transition"
                        title="نسخ هذا الفرع"
                      >
                        {copiedBranchId === branch.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      <span className="text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  {/* Branch Child Items */}
                  {isExpanded && (
                    <div className="p-3 space-y-2 animate-in fade-in slide-in-from-top-1">
                      {branch.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className={`p-2.5 rounded-xl border text-xs sm:text-xs leading-relaxed flex items-start gap-2 shadow-2xs transition hover:translate-x-0.5 ${styles.itemBorder}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${styles.dotBg}`} />
                          <span className="font-medium text-slate-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Text Outline Mode */
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
          {outlineText ||
            `* 🎯 ${treeData.centralConcept} [${treeData.subjectTitle}]\n` +
              treeData.branches
                .map(
                  (b) =>
                    `  ├── 📌 ${b.title} (${b.badge})\n` +
                    b.items.map((it) => `  │     └── ${it}`).join("\n")
                )
                .join("\n")}
        </div>
      )}
    </div>
  );
};
