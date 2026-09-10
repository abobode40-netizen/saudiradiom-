import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  RotateCcw,
  Check,
  SwitchCamera,
  Sparkles,
  AlertCircle,
  Upload,
  FileImage,
} from "lucide-react";
import { NotePhoto } from "../types";

interface CameraCaptureModalProps {
  isOpen: boolean;
  lessonTitle: string;
  subjectTitle?: string;
  onClose: () => void;
  onPhotoCaptured: (photo: NotePhoto) => void;
  onShowToast: (msg: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  lessonTitle,
  subjectTitle,
  onClose,
  onPhotoCaptured,
  onShowToast,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Review step state
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Start Camera Stream
  const startCamera = async (mode: "environment" | "user") => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("الكاميرا غير مدعومة في هذا المتصفح");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("تم رفض إذن الوصول للكاميرا من المتصفح. يمكنك رفع صورة الملاحظات الورقية من الملفات أدناه.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("لم يتم العثور على كاميرا متصلة. يرجى استخدام خيار رفع الصور.");
      } else {
        setCameraError("تعذر تشغيل الكاميرا حالياً. يمكنك استخدام خيار رفع الصورة من جهازك.");
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedDataUrl) {
      startCamera(facingMode);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Clean close
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedDataUrl(null);
    setCaption("");
    setCameraError(null);
    onClose();
  };

  // Flip Camera between rear and front
  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Take Snapshot
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, width, height);

    // Compress to efficient JPEG data URL
    const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
    setCapturedDataUrl(dataUrl);

    // Stop video preview while reviewing
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    onShowToast("تم التقاط الملاحظة الورقية! يمكنك مراجعتها وحفظها 📸");
  };

  // Handle fallback file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Compress image using canvas
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
            setCapturedDataUrl(compressed);
          } else {
            setCapturedDataUrl(result);
          }
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedDataUrl(null);
    setCaption("");
    startCamera(facingMode);
  };

  // Confirm and Save
  const handleConfirmSave = () => {
    if (!capturedDataUrl) return;
    setIsSaving(true);

    const now = new Date().toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newPhoto: NotePhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dataUrl: capturedDataUrl,
      capturedAt: now,
      caption: caption.trim() || `ملاحظة ورقية مصورة - ${lessonTitle}`,
    };

    onPhotoCaptured(newPhoto);
    setIsSaving(false);
    handleClose();
    onShowToast("تم ربط الملاحظة المصورة بالدرس بنجاح 📎");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-60 p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      id="camera-capture-modal"
    >
      <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-800 relative my-auto flex flex-col text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                <span>تصوير الملاحظات الورقية</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                  كاميرا ذكية
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {lessonTitle} {subjectTitle ? `• ${subjectTitle}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Viewfinder / Review Area */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-slate-800 shadow-inner">
          {capturedDataUrl ? (
            /* Snapped Image Review Mode */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedDataUrl}
                alt="الملاحظة الورقية المصورة"
                className="max-h-full max-w-full object-contain rounded-xl"
              />
              <div className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                <Check className="w-3.5 h-3.5" />
                <span>تم التقاط الصورة</span>
              </div>
            </div>
          ) : cameraError ? (
            /* Camera Error / Permission Blocked Fallback */
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
                >
                  <Upload className="w-4 h-4" />
                  <span>اختيار صورة من الجهاز أو المعرض</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            /* Live Camera Stream Mode */
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Framing Guidelines */}
              <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-white/50 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <span className="w-4 h-4 border-t-2 border-r-2 border-indigo-400 inline-block" />
                  <span className="text-[10px] bg-slate-950/70 text-slate-200 px-2 py-0.5 rounded-md backdrop-blur-xs font-medium">
                    ضع صفحة الكشكول أو الملخص داخل الإطار
                  </span>
                  <span className="w-4 h-4 border-t-2 border-l-2 border-indigo-400 inline-block" />
                </div>
                <div className="flex justify-between items-end">
                  <span className="w-4 h-4 border-b-2 border-r-2 border-indigo-400 inline-block" />
                  <span className="w-4 h-4 border-b-2 border-l-2 border-indigo-400 inline-block" />
                </div>
              </div>

              {/* Camera Switcher Button */}
              <button
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-3 left-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/60 backdrop-blur-xs text-xs font-bold flex items-center gap-1.5 transition shadow-md"
                title="تبديل الكاميرا (الأمامية / الخلفية)"
              >
                <SwitchCamera className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">تبديل الكاميرا</span>
              </button>

              {isInitializing && (
                <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-300">جاري تشغيل الكاميرا...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls & Inputs */}
        <div className="mt-3.5 space-y-3">
          {capturedDataUrl ? (
            /* Review Caption Input */
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">
                عنوان أو وصف الملاحظة الورقية (اختياري):
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="مثال: تلخيص القوانين من كشكول الحصة، مسألة هامة..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          ) : (
            /* Tip banner */
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>💡 تأكد من إضاءة الصفحة جيداً لوضوح الخط الرياضي والقوانين.</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium flex items-center gap-1 shrink-0"
              >
                <Upload className="w-3 h-3" />
                <span>رفع من الملفات</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Action Buttons Toolbar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            {capturedDataUrl ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة الالتقاط</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وإرفاق بالدرس</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold transition"
                >
                  إلغاء
                </button>

                {!cameraError && (
                  <button
                    type="button"
                    onClick={handleSnap}
                    disabled={isInitializing}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>التقاط الصورة الآن 📸</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
