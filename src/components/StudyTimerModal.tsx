import React, { useState, useEffect } from "react";
import { X, Play, Pause, RotateCcw, Sparkles, CheckCircle2, Flame } from "lucide-react";
import confetti from "canvas-confetti";

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerActive: boolean;
  timerSeconds: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onAddMinutes: (mins: number) => void;
  onSessionFinished: (minutesEarned: number, xpEarned: number) => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  timerActive,
  timerSeconds,
  onToggleTimer,
  onResetTimer,
  onAddMinutes,
  onSessionFinished,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // 25 mins pomodoro
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    if (timerSeconds >= selectedDuration * 60 && timerActive) {
      // Completed session
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.error(e);
      }
      setSessionCompleted(true);
      onSessionFinished(selectedDuration, selectedDuration * 10);
    }
  }, [timerSeconds, selectedDuration, timerActive, onSessionFinished]);

  if (!isOpen) return null;

  const currentMinutes = Math.floor(timerSeconds / 60);
  const currentSecs = timerSeconds % 60;
  const progressPercent = Math.min(100, (timerSeconds / (selectedDuration * 60)) * 100);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            جلسة تركيز بومودورو
          </span>
          <h3 className="text-xl font-bold text-slate-800">مؤقت المذاكرة الفعالة</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ركّز على استيعاب فكرة واحدة دون أي مشتتات
          </p>
        </div>

        {/* Circular Progress Display */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative w-48 h-48 flex items-center justify-center rounded-full bg-slate-50 border-8 border-slate-100 shadow-inner">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth="7"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#4f46e5"
                strokeWidth="7"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            <div className="relative z-10 text-center">
              <div className="text-4xl font-black tracking-tight text-slate-800 font-mono">
                {currentMinutes.toString().padStart(2, "0")}:{currentSecs.toString().padStart(2, "0")}
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1">
                الهدف: {selectedDuration} دقيقة
              </div>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        {!timerActive && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[15, 25, 45].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setSelectedDuration(mins);
                  onResetTimer();
                  setSessionCompleted(false);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition border ${
                  selectedDuration === mins
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {mins} دقيقة
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onToggleTimer}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm shadow-md transition ${
              timerActive
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30"
            }`}
          >
            {timerActive ? (
              <>
                <Pause className="w-5 h-5" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>ابدأ التركيز</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onResetTimer();
              setSessionCompleted(false);
            }}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {sessionCompleted && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-in zoom-in-95">
            <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              أحسنت! أتممت جلسة التركيز بنجاح (+{selectedDuration * 10} XP)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
