import React, { useState, useEffect } from "react";
import { Subject, StudentProfile } from "../../types";
import {
  MONTHLY_EXAMS,
  MonthlyExam,
  MonthlySubjectSection,
  MonthlyExamEvaluation,
  SubjectEvaluationResult,
} from "../../data/monthlyExamsData";
import {
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Printer,
  Share2,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Target,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MonthlyAchievementReportSection } from "../MonthlyAchievementReportSection";

interface MonthlyAllSubjectsPortalViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  onOpenSubjectDoor: (subjectId: string) => void;
  onOpenLesson: (subjectId: string, lessonId: string) => void;
  onShowToast: (msg: string) => void;
  onRewardXp: (xp: number) => void;
}

export const MonthlyAllSubjectsPortalView: React.FC<MonthlyAllSubjectsPortalViewProps> = ({
  profile,
  subjects,
  onOpenSubjectDoor,
  onOpenLesson,
  onShowToast,
  onRewardXp,
}) => {
  const [activeTab, setActiveTab] = useState<
    "exams_list" | "active_exam" | "achievement_report" | "evaluation_report" | "history_evaluations"
  >("exams_list");
  const [activeExam, setActiveExam] = useState<MonthlyExam | null>(null);
  const [activeSubjectIndex, setActiveSubjectIndex] = useState<number>(0);

  // User answers state: examId -> questionId -> answer
  const [userAnswers, setUserAnswers] = useState<Record<string, { option?: number; text?: string }>>({});
  const [examRemainingSeconds, setExamRemainingSeconds] = useState<number>(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Latest evaluation result
  const [latestEvaluation, setLatestEvaluation] = useState<MonthlyExamEvaluation | null>(null);

  // Saved evaluation history
  const [savedEvaluations, setSavedEvaluations] = useState<MonthlyExamEvaluation[]>(() => {
    try {
      const stored = localStorage.getItem("rafiq_monthly_evaluations");
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    // Default mock initial evaluation for October
    return [
      {
        id: "eval_october_demo",
        examId: "exam_october",
        examTitle: "اختبار شهر أكتوبر الشامل",
        date: "2026-10-28",
        totalScore: 52,
        maxScore: 60,
        percentage: 87,
        overallGrade: "ممتاز 🌟",
        timeSpentSeconds: 2100,
        xpEarned: 250,
        generalFeedback: "أداء استثنائي متوازن في كافة المواد! إتقان عميق لأسس الرياضيات والعلوم المتكاملة واللغة العربية مع الحاجة لتدريب سريع على المفردات البيئية باللغة الإنجليزية.",
        subjectResults: [
          {
            subjectId: "math",
            subjectTitle: "الرياضيات",
            icon: "📐",
            score: 9,
            maxScore: 10,
            percentage: 90,
            gradeLabel: "ممتاز",
            gradeBadgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
            strengths: ["التعامل السليم مع قوى ت", "حساب المميز بدقة"],
            weaknesses: ["تدريب إضافي على كتابة الخطوات المقالية"],
            recommendation: "أداء رياضي رائع! تدرب أكثر على صياغة الحلول المقالية كاملة.",
          },
          {
            subjectId: "integrated_science",
            subjectTitle: "العلوم المتكاملة",
            icon: "🔬",
            score: 10,
            maxScore: 10,
            percentage: 100,
            gradeLabel: "ممتاز",
            gradeBadgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
            strengths: ["استيعاب شذوذ كثافة الماء", "الروابط الهيدروجينية والحرارة النوعية"],
            weaknesses: [],
            recommendation: "درجة نهائية كاملة، حافظ على هذا الإتقان العلمي المتميز.",
          },
          {
            subjectId: "arabic",
            subjectTitle: "اللغة العربية",
            icon: "📖",
            score: 8,
            maxScore: 10,
            percentage: 80,
            gradeLabel: "جيد جداً",
            gradeBadgeClass: "bg-blue-50 text-blue-800 border-blue-200",
            strengths: ["التفريق بين كان التامة والناقصة"],
            weaknesses: ["حالات اقتران خبر كاد وأخواتها بأن"],
            recommendation: "راجع قاعدة اقتران خبر أفعال الشروع والمقاربة بأن في باب اللغة العربية.",
          },
          {
            subjectId: "english",
            subjectTitle: "اللغة الإنجليزية",
            icon: "🌐",
            score: 8,
            maxScore: 10,
            percentage: 80,
            gradeLabel: "جيد جداً",
            gradeBadgeClass: "bg-blue-50 text-blue-800 border-blue-200",
            strengths: ["قاعدة Past Continuous vs Past Simple"],
            weaknesses: ["مصطلحات السياحة البيئية (Ecotourism)"],
            recommendation: "كرر مراجعة بطاقات مصطلحات الوحدة الأولى في باب اللغة الإنجليزية.",
          },
          {
            subjectId: "philosophy",
            subjectTitle: "الفلسفة والتفكير",
            icon: "💡",
            score: 9,
            maxScore: 10,
            percentage: 90,
            gradeLabel: "ممتاز",
            gradeBadgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
            strengths: ["الوعي بالقابلية للاستهواء"],
            weaknesses: [],
            recommendation: "تحليل منطقي سليم وممتاز.",
          },
          {
            subjectId: "history",
            subjectTitle: "التاريخ",
            icon: "🏛️",
            score: 8,
            maxScore: 10,
            percentage: 80,
            gradeLabel: "جيد جداً",
            gradeBadgeClass: "bg-blue-50 text-blue-800 border-blue-200",
            strengths: ["المصادر الأولية ودور الأوستراكا"],
            weaknesses: ["أهمية النقود كمرآة اقتصادية"],
            recommendation: "استحضر دائماً دور نقاء معدن العملة في قياس ثراء العصر.",
          },
        ],
      },
    ];
  });

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && examRemainingSeconds > 0) {
      timer = setInterval(() => {
        setExamRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            onShowToast("انتهى وقت الامتحان الشهري، جاري حساب التقييم الشامل...");
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, examRemainingSeconds]);

  // Start a monthly exam
  const handleStartExam = (exam: MonthlyExam) => {
    setActiveExam(exam);
    setActiveSubjectIndex(0);
    setUserAnswers({});
    setExamRemainingSeconds(exam.durationMinutes * 60);
    setIsTimerRunning(true);
    setActiveTab("active_exam");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentSubjectSection: MonthlySubjectSection | undefined =
    activeExam?.subjects[activeSubjectIndex];

  // Record an answer
  const handleSelectOption = (questionId: string, optIdx: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], option: optIdx },
    }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], text },
    }));
  };

  // Submit and Calculate Comprehensive Multi-Subject Evaluation
  const handleFinishExam = () => {
    if (!activeExam) return;

    setIsTimerRunning(false);

    let totalScore = 0;
    let maxTotalScore = 0;
    const subjectResults: SubjectEvaluationResult[] = [];

    activeExam.subjects.forEach((subjectSec) => {
      let subScore = 0;
      const subMax = subjectSec.totalMarks;
      maxTotalScore += subMax;

      const marksPerQ = subMax / subjectSec.questions.length;
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      subjectSec.questions.forEach((q) => {
        const ans = userAnswers[q.id];
        let correct = false;

        if (q.type === "multiple_choice") {
          if (ans && ans.option === q.correctIndex) {
            correct = true;
          }
        } else if (q.type === "fill_blank") {
          if (ans && ans.text && q.acceptedAnswers) {
            const clean = ans.text.trim().toLowerCase();
            if (q.acceptedAnswers.some((a) => a.toLowerCase().includes(clean) || clean.includes(a.toLowerCase()))) {
              correct = true;
            }
          }
        } else if (q.type === "essay") {
          if (ans && ans.text && ans.text.trim().length > 10) {
            correct = true; // awarded for constructive attempt
          }
        }

        if (correct) {
          subScore += marksPerQ;
          strengths.push(q.unitTitle || subjectSec.subjectTitle);
        } else {
          weaknesses.push(q.unitTitle || subjectSec.subjectTitle);
        }
      });

      const roundedScore = Math.min(Math.round(subScore), subMax);
      totalScore += roundedScore;
      const pct = Math.round((roundedScore / subMax) * 100);

      let gradeLabel: "ممتاز" | "جيد جداً" | "جيد" | "بحاجة لدعم" = "بحاجة لدعم";
      let gradeBadgeClass = "bg-rose-50 text-rose-800 border-rose-200";

      if (pct >= 85) {
        gradeLabel = "ممتاز";
        gradeBadgeClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
      } else if (pct >= 75) {
        gradeLabel = "جيد جداً";
        gradeBadgeClass = "bg-blue-50 text-blue-800 border-blue-200";
      } else if (pct >= 60) {
        gradeLabel = "جيد";
        gradeBadgeClass = "bg-amber-50 text-amber-800 border-amber-200";
      }

      const uniqueStrengths = Array.from(new Set(strengths)).slice(0, 2);
      const uniqueWeaknesses = Array.from(new Set(weaknesses)).slice(0, 2);

      let recommendation = `استمر في المذاكرة المنتظمة في باب ${subjectSec.subjectTitle}.`;
      if (pct < 75 && uniqueWeaknesses.length > 0) {
        recommendation = `يُوصى بمراجعة شروحات واختبارات "${uniqueWeaknesses[0]}" في باب ${subjectSec.subjectTitle}.`;
      } else if (pct >= 85) {
        recommendation = `إتقان متميز! أنت جاهز تماماً لامتحان نصف العام في هذه المادة.`;
      }

      subjectResults.push({
        subjectId: subjectSec.subjectId,
        subjectTitle: subjectSec.subjectTitle,
        icon: subjectSec.icon,
        score: roundedScore,
        maxScore: subMax,
        percentage: pct,
        gradeLabel,
        gradeBadgeClass,
        strengths: uniqueStrengths.length > 0 ? uniqueStrengths : ["المفاهيم العامة للوحدة"],
        weaknesses: uniqueWeaknesses,
        recommendation,
      });
    });

    const overallPct = Math.round((totalScore / maxTotalScore) * 100);
    let overallGrade = "بحاجة لمزيد من التركيز والمذاكرة 📈";
    if (overallPct >= 85) overallGrade = "ممتاز (مرتبة الشرف الأكاديمية) 🌟";
    else if (overallPct >= 75) overallGrade = "جيد جداً (مستوى متقدم) 👏";
    else if (overallPct >= 65) overallGrade = "جيد (مستوى مستقر) 👍";

    const timeSpent = (activeExam.durationMinutes * 60) - examRemainingSeconds;
    const xpWon = Math.round(totalScore * 5 + 150);

    const newEvaluation: MonthlyExamEvaluation = {
      id: `eval_${activeExam.id}_${Date.now()}`,
      examId: activeExam.id,
      examTitle: activeExam.title,
      date: new Date().toISOString().split("T")[0],
      totalScore,
      maxScore: maxTotalScore,
      percentage: overallPct,
      overallGrade,
      timeSpentSeconds: timeSpent,
      xpEarned: xpWon,
      subjectResults,
      generalFeedback:
        overallPct >= 85
          ? `تقييم شهري ممتاز للغاية! توزيع درجاتك عبر المواد يعكس نضجاً دراسياً واستيعاباً لمنظومة البابل شيت والمقالي.`
          : `أداء طيب في الاختبار الشهري. يرجى التركيز على الملاحظات التشخيصية المرفقة لكل مادة وتكرار مراجعة الأبواب المخصصة.`,
    };

    setLatestEvaluation(newEvaluation);
    const updatedHistory = [newEvaluation, ...savedEvaluations];
    setSavedEvaluations(updatedHistory);
    try {
      localStorage.setItem("rafiq_monthly_evaluations", JSON.stringify(updatedHistory));
    } catch {
      // ignore
    }

    onRewardXp(xpWon);
    setActiveTab("evaluation_report");

    if (overallPct >= 70) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Monthly Portal Big Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-700 via-purple-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-amber-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-300/30">
              <Award className="w-3.5 h-3.5" />
              الباب الأخير: الاختبارات والتقييمات الشهرية العامة لجميع المواد
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>🏆 باب الامتحانات والتقييمات الشهرية الشاملة</span>
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal">
              هذا الباب مخصص للامتحانات المجمعة الرسمية المقررة في نهاية كل شهر دراسي (أكتوبر، نوفمبر، نصف العام، مارس، إبريل، والامتحان التجريبي الشامل) التي تجمع كل المواد في جلسة تقييم واحدة مع تشخيص فوري لنقاط القوة والضعف.
            </p>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab("exams_list")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "exams_list"
                    ? "bg-white text-indigo-950 shadow-md"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                }`}
              >
                جدول الامتحانات الشهرية
              </button>

              <button
                onClick={() => setActiveTab("achievement_report")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "achievement_report"
                    ? "bg-amber-400 text-slate-950 shadow-md font-black"
                    : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>تقرير شهر إنجاز (تجميع أداء المواد) ⭐</span>
              </button>

              <button
                onClick={() => {
                  if (latestEvaluation || savedEvaluations[0]) {
                    setLatestEvaluation(latestEvaluation || savedEvaluations[0]);
                    setActiveTab("evaluation_report");
                  } else {
                    onShowToast("لم تقم بأداء أي امتحان شهري بعد");
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "evaluation_report"
                    ? "bg-white text-indigo-950 shadow-md"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                }`}
              >
                شهادة فحص الامتحان
              </button>

              <button
                onClick={() => setActiveTab("history_evaluations")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "history_evaluations"
                    ? "bg-white text-indigo-950 shadow-md"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                }`}
              >
                سجل التقييمات وتطور المستوى ({savedEvaluations.length})
              </button>
            </div>
          </div>

          {/* Quick Stat Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[190px] self-stretch md:self-auto flex flex-col items-center justify-center">
            <div className="text-4xl font-black text-amber-300 font-mono">
              {savedEvaluations[0]?.percentage ? `${savedEvaluations[0].percentage}%` : "87%"}
            </div>
            <div className="text-xs text-white font-bold mt-1">آخر تقييم شهري</div>
            <div className="text-[11px] text-amber-200 mt-0.5">
              {savedEvaluations[0]?.overallGrade || "تقدير ممتاز 🌟"}
            </div>
            <div className="text-[10px] text-slate-300 mt-2">
              الترم الأول • العام 2026/2027
            </div>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ================= VIEW 1: EXAMS LIST ================= */}
      {activeTab === "exams_list" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                الامتحانات الشهرية الرسمية لجميع المواد 📋
              </h2>
              <p className="text-xs text-slate-500">
                اختر الشهر لبدء الامتحان المجمع لجميع المواد واستخراج تقرير تقييمك الوزاري
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MONTHLY_EXAMS.map((exam) => (
              <div
                key={exam.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {exam.badge}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.durationMinutes} دقيقة • {exam.totalMarks} درجة
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {exam.description}
                  </p>

                  {/* Included Subjects Icons Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 mb-2">
                      المواد المشمولة في هذا الامتحان ({exam.subjects.length} مواد):
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {exam.subjects.map((s) => (
                        <span
                          key={s.subjectId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                        >
                          <span>{s.icon}</span>
                          <span>{s.subjectTitle}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={() => handleStartExam(exam)}
                  className="w-full py-3 rounded-2xl bg-linear-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current text-amber-200" />
                  <span>بدء الامتحان الشهري الشامل الآن</span>
                </button>
              </div>
            ))}
          </div>

          {/* Direct Banner to Monthly Achievement Report */}
          <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-indigo-50 to-amber-50 border border-amber-300 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-xs">
                ⭐
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  تقرير شهر إنجاز العام (تجميع أداء جميع المواد واقتراحات التحسين)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  رصد شامل لنقاط قوتك وثغرات كل مادة مع مؤشر التوازن وخطط التحسين الأسبوعية
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab("achievement_report");
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>عرض تقرير شهر إنجاز الآن</span>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW: MONTHLY ACHIEVEMENT REPORT ================= */}
      {activeTab === "achievement_report" && (
        <MonthlyAchievementReportSection
          profile={profile}
          subjects={subjects}
          evaluations={savedEvaluations}
          onOpenSubjectDoor={onOpenSubjectDoor}
          onShowToast={onShowToast}
        />
      )}

      {/* ================= VIEW 2: ACTIVE MULTI-SUBJECT EXAM PLAYER ================= */}
      {activeTab === "active_exam" && activeExam && currentSubjectSection && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Active Exam Sticky Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                  {activeExam.badge}
                </span>
                <span className="text-xs text-slate-300">
                  المادة {activeSubjectIndex + 1} من {activeExam.subjects.length}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                {activeExam.title}
              </h2>
            </div>

            {/* Timer & Finish Button */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-amber-300 font-mono font-bold text-sm border border-white/10">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{formatTimer(examRemainingSeconds)}</span>
              </div>

              <button
                onClick={handleFinishExam}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تسليم الامتحان وإنهاء التقييم</span>
              </button>
            </div>
          </div>

          {/* Subject Navigation Tabs inside the Multi-Subject Exam */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
            {activeExam.subjects.map((sec, idx) => {
              const isCurrent = idx === activeSubjectIndex;
              // Check how many answered
              const answeredCount = sec.questions.filter((q) => {
                const a = userAnswers[q.id];
                return a && (a.option !== undefined || (a.text && a.text.trim().length > 0));
              }).length;
              const isAllAnswered = answeredCount === sec.questions.length;

              return (
                <button
                  key={sec.subjectId}
                  onClick={() => setActiveSubjectIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap border shrink-0 ${
                    isCurrent
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm">{sec.icon}</span>
                  <span>{sec.subjectTitle}</span>
                  {isAllAnswered ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isCurrent ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {answeredCount}/{sec.questions.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Subject Questions Section */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            {/* Subject Section Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-indigo-50 border border-indigo-100">
                  {currentSubjectSection.icon}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    قسم {currentSubjectSection.subjectTitle} ({currentSubjectSection.totalMarks} درجة)
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {currentSubjectSection.focusTopics.map((t, i) => (
                      <span key={i} className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Questions in this subject */}
            <div className="space-y-6">
              {currentSubjectSection.questions.map((q, qIndex) => {
                const currentAnswer = userAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                          {qIndex + 1}
                        </span>
                        <span className="text-xs font-bold text-indigo-700">
                          {q.type === "multiple_choice"
                            ? "بابل شيت (اختيار من متعدد)"
                            : q.type === "fill_blank"
                            ? "إكمال مصطلح"
                            : "سؤال مقالي تحليلي"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">
                        {q.unitTitle}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                      {q.question}
                    </p>

                    {/* MCQ Options */}
                    {q.type === "multiple_choice" && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = currentAnswer?.option === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`text-right p-3 rounded-xl border text-xs sm:text-sm transition flex items-center gap-3 ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isSelected
                                    ? "bg-white text-indigo-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Fill Blank */}
                    {q.type === "fill_blank" && (
                      <div className="pt-1">
                        <input
                          type="text"
                          value={currentAnswer?.text || ""}
                          onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                          placeholder="اكتب الإجابة أو المصطلح المناسب هنا..."
                          className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                    )}

                    {/* Essay */}
                    {q.type === "essay" && (
                      <div className="pt-1 space-y-2">
                        <textarea
                          rows={3}
                          value={currentAnswer?.text || ""}
                          onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                          placeholder="اكتب خطوات الحل أو التعليل والتحليل العلمي هنا..."
                          className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Navigation between subjects */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={activeSubjectIndex === 0}
                onClick={() => {
                  if (activeSubjectIndex > 0) {
                    setActiveSubjectIndex(activeSubjectIndex - 1);
                    window.scrollTo({ top: 180, behavior: "smooth" });
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>المادة السابقة</span>
              </button>

              {activeSubjectIndex < activeExam.subjects.length - 1 ? (
                <button
                  onClick={() => {
                    setActiveSubjectIndex(activeSubjectIndex + 1);
                    window.scrollTo({ top: 180, behavior: "smooth" });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>المادة التالية: {activeExam.subjects[activeSubjectIndex + 1]?.subjectTitle}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinishExam}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تسليم ورقة الامتحان واستخراج التقييم</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 3: COMPREHENSIVE EVALUATION REPORT ================= */}
      {activeTab === "evaluation_report" && latestEvaluation && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Certificate / Master Evaluation Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/15">
              <div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  شهادة التقييم الأكاديمي الشهري المعتمدة • 2026/2027
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                  تقرير تقييم {latestEvaluation.examTitle}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  الطالب: {profile.name} • الصف: الأول الثانوي • التاريخ: {latestEvaluation.date}
                </p>
              </div>

              {/* Overall Score */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[170px] self-start sm:self-auto">
                <div className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
                  {latestEvaluation.percentage}%
                </div>
                <div className="text-xs text-white font-bold mt-0.5">
                  {latestEvaluation.totalScore} من {latestEvaluation.maxScore} درجة
                </div>
                <div className="text-xs text-emerald-300 font-semibold mt-1">
                  {latestEvaluation.overallGrade}
                </div>
              </div>
            </div>

            {/* General Feedback Quote */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">التحليل التربوي العام: </span>
                {latestEvaluation.generalFeedback}
              </div>
            </div>

            {/* Print / Retake Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة تقرير التقييم الشهري</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("achievement_report");
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                <span>عرض تقرير شهر إنجاز الشامل واقتراحات التحسين ⭐</span>
              </button>
              <button
                onClick={() => setActiveTab("exams_list")}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>العودة لجدول الامتحانات الشهرية</span>
              </button>
            </div>
          </div>

          {/* Subject by Subject Evaluation Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  التقييم التفصيلي لكل مادة على حدة 📊
                </h3>
                <p className="text-xs text-slate-500">
                  انقر على زر "مراجعة الدرس في باب المادة" لعلاج أي نقطة ضعف فوراً
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestEvaluation.subjectResults.map((res) => (
                <div
                  key={res.subjectId}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition space-y-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 rounded-2xl bg-slate-50 border border-slate-100">
                          {res.icon}
                        </span>
                        <div>
                          <h4 className="font-bold text-base text-slate-900">
                            باب {res.subjectTitle}
                          </h4>
                          <span className="text-xs text-slate-500 font-semibold">
                            {res.score} من {res.maxScore} درجة ({res.percentage}%)
                          </span>
                        </div>
                      </div>

                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${res.gradeBadgeClass}`}>
                        {res.gradeLabel}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          res.percentage >= 85
                            ? "bg-emerald-500"
                            : res.percentage >= 70
                            ? "bg-indigo-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${res.percentage}%` }}
                      />
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="space-y-2 mt-4 text-xs">
                      {res.strengths.length > 0 && (
                        <div className="flex items-start gap-1.5 text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">نقاط القوة المتقنة: </span>
                            {res.strengths.join(" • ")}
                          </div>
                        </div>
                      )}

                      {res.weaknesses.length > 0 && (
                        <div className="flex items-start gap-1.5 text-rose-800 bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">مفاهيم تحتاج لتركيز: </span>
                            {res.weaknesses.join(" • ")}
                          </div>
                        </div>
                      )}

                      {/* AI Recommendation */}
                      <div className="flex items-start gap-1.5 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900">توجيه الذكاء الاصطناعي: </span>
                          {res.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Link to Subject Door */}
                  <button
                    onClick={() => onOpenSubjectDoor(res.subjectId)}
                    className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>فتح باب {res.subjectTitle} ومراجعة الوحدة</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 4: EVALUATIONS HISTORY ================= */}
      {activeTab === "history_evaluations" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                سجل التقييمات الشهرية ومقارنة الأداء 📈
              </h2>
              <p className="text-xs text-slate-500">
                متابعة تطور مستواك الدراسي شهراً بشهر عبر كافة المواد المعتمدة
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {savedEvaluations.map((evalItem, i) => (
              <div
                key={evalItem.id || i}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl font-black text-indigo-700">
                    {evalItem.percentage}%
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-800">{evalItem.examTitle}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>التاريخ: {evalItem.date}</span>
                      <span>•</span>
                      <span>الدرجة: {evalItem.totalScore}/{evalItem.maxScore}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-600">{evalItem.overallGrade}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setLatestEvaluation(evalItem);
                    setActiveTab("evaluation_report");
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 self-end sm:self-center"
                >
                  <span>عرض التقرير الكامل</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
