import React, { useState } from "react";
import {
  X,
  RotateCw,
  Trash2,
  Download,
  Bot,
  Calendar,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { NotePhoto } from "../types";

interface PhotoLightboxModalProps {
  photo: NotePhoto | null;
  lessonTitle: string;
  subjectTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onDeletePhoto: (photoId: string) => void;
  onAskAiWithPhoto: (photo: NotePhoto) => void;
  onShowToast: (msg: string) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  photo,
  lessonTitle,
  subjectTitle,
  isOpen,
  onClose,
  onDeletePhoto,
  onAskAiWithPhoto,
  onShowToast,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!isOpen || !photo) return null;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = photo.dataUrl;
    link.download = `ملاحظة_${lessonTitle}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("تم تحميل صورة الملاحظة إلى جهازك 💾");
  };

  const handleDelete = () => {
    onDeletePhoto(photo.id);
    onClose();
    onShowToast("تم حذف صورة الملاحظة بنجاح 🗑️");
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-70 p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      id="photo-lightbox-modal"
    >
      <div className="bg-slate-900 rounded-3xl max-w-3xl w-full p-4 sm:p-5 shadow-2xl border border-slate-800 relative my-auto flex flex-col text-white max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <div className="truncate">
              <h4 className="font-bold text-sm sm:text-base text-slate-100 truncate">
                {photo.caption || "ملاحظة ورقية مصورة"}
              </h4>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>التقطت في: {photo.capturedAt}</span>
                <span>•</span>
                <span>{lessonTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleRotate}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="تدوير الصورة 90 درجة"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="تحميل الصورة للجهاز"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
              title="حذف هذه الملاحظة"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Zoomable Image Canvas */}
        <div className="relative flex-1 min-h-[300px] max-h-[60vh] bg-black/80 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-slate-800/80">
          <img
            src={photo.dataUrl}
            alt={photo.caption || "ملاحظة ورقية"}
            style={{
              transform: `rotate(${rotation}deg) scale(${zoomLevel})`,
              transition: "transform 0.2s ease-out",
            }}
            className="max-h-full max-w-full object-contain select-none"
          />
        </div>

        {/* Footer & AI Assistant Action */}
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>يمكنك الاستفسار من المدرس الذكي حول محتوى هذه الملاحظة الورقية</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onAskAiWithPhoto(photo);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/30 transition"
            >
              <Bot className="w-4 h-4" />
              <span>مراجعة واستخراج القوانين بالذكاء الاصطناعي</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
