import { StudentProfile, Subject } from "../types";
import { MonthlyExamEvaluation, SubjectEvaluationResult } from "./monthlyExamsData";

export interface MonthlyAchievementBadge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
}

export interface MonthlySubjectPerformance {
  subjectId: string;
  subjectTitle: string;
  icon: string;
  score: number;
  maxScore: number;
  percentage: number;
  gradeLabel: "ممتاز" | "جيد جداً" | "جيد" | "بحاجة لدعم";
  gradeBadgeClass: string;
  trend: "up" | "stable" | "down";
  trendDelta: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  targetLessonTitle?: string;
}

export interface KnowledgeGapItem {
  id: string;
  subjectId: string;
  subjectTitle: string;
  icon: string;
  concept: string;
  priority: "high" | "medium";
  impact: string;
  actionText: string;
  lessonId?: string;
}

export interface WeeklyScheduleSuggestion {
  week: string;
  focus: string;
  subjectNames: string[];
  suggestedHours: number;
  icon: string;
}

export interface SmartTargetItem {
  id: string;
  title: string;
  category: "math" | "science" | "languages" | "humanities" | "general";
  targetDate: string;
  isCompleted: boolean;
}

export interface MonthlyAchievementReport {
  monthId: string;
  monthName: string;
  academicYear: string;
  studentName: string;
  generatedDate: string;
  overallPercentage: number;
  totalScore: number;
  maxScore: number;
  overallGrade: string;
  gradeBadgeClass: string;
  studyHours: number;
  completedExamsCount: number;
  xpEarned: number;
  scienceTrackAvg: number;
  humanitiesTrackAvg: number;
  trackBalanceAnalysis: string;
  subjectPerformances: MonthlySubjectPerformance[];
  topHonors: MonthlyAchievementBadge[];
  knowledgeGaps: KnowledgeGapItem[];
  actionPlan: {
    aiExecutiveSummary: string;
    scienceMethodology: string;
    languagesMethodology: string;
    weeklySchedule: WeeklyScheduleSuggestion[];
    smartActionChecklist: SmartTargetItem[];
  };
}

// Available months for filtering
export const AVAILABLE_REPORT_MONTHS = [
  { id: "october", name: "شهر أكتوبر 2026", badge: "التقييم الشهري الأول" },
  { id: "november", name: "شهر نوفمبر 2026", badge: "التقييم الشهري الثاني" },
  { id: "cumulative", name: "التقرير التراكمي الفصلي (حتى الآن)", badge: "تجميع فصلي شامل" },
];

/**
 * Generate a comprehensive Monthly Achievement Report from evaluations and student subjects
 */
export function buildMonthlyAchievementReport(
  profile: StudentProfile,
  subjects: Subject[],
  evaluations: MonthlyExamEvaluation[],
  targetMonthId: string = "october"
): MonthlyAchievementReport {
  // Find specific evaluation or fall back to latest
  let targetEval = evaluations.find(
    (e) => e.examId.includes(targetMonthId) || e.id.includes(targetMonthId)
  );

  if (!targetEval && evaluations.length > 0) {
    targetEval = evaluations[0];
  }

  // If no evaluation exists, construct a baseline derived from subject completion
  const monthName =
    AVAILABLE_REPORT_MONTHS.find((m) => m.id === targetMonthId)?.name || "شهر أكتوبر 2026";

  const defaultSubjectResults: SubjectEvaluationResult[] = subjects.map((sub) => {
    const lessonRatio = sub.totalLessons > 0 ? sub.completedLessons / sub.totalLessons : 0.8;
    const score = Math.max(7, Math.min(10, Math.round(lessonRatio * 10) || 8));
    const pct = score * 10;
    let gradeLabel: "ممتاز" | "جيد جداً" | "جيد" | "بحاجة لدعم" = "جيد جداً";
    let gradeBadgeClass = "bg-blue-50 text-blue-800 border-blue-200";
    if (pct >= 90) {
      gradeLabel = "ممتاز";
      gradeBadgeClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
    } else if (pct < 70) {
      gradeLabel = "بحاجة لدعم";
      gradeBadgeClass = "bg-rose-50 text-rose-800 border-rose-200";
    }

    return {
      subjectId: sub.id,
      subjectTitle: sub.title,
      icon: sub.icon,
      score,
      maxScore: 10,
      percentage: pct,
      gradeLabel,
      gradeBadgeClass,
      strengths: [sub.units[0]?.title || "المفاهيم التأسيسية للمنهج"],
      weaknesses:
        pct < 85 ? [sub.units[1]?.title || "المسائل التطريبية المتقدمة"] : [],
      recommendation: `واصل المذاكرة المستمرة والتطبيق العملي في باب ${sub.title}.`,
    };
  });

  const subjectResultsToUse = targetEval?.subjectResults || defaultSubjectResults;

  // Process subject performances with trends
  const subjectPerformances: MonthlySubjectPerformance[] = subjectResultsToUse.map((res, index) => {
    const prevScore = evaluations[1]?.subjectResults?.find((s) => s.subjectId === res.subjectId)?.percentage;
    let trend: "up" | "stable" | "down" = "stable";
    let trendDelta = 0;

    if (prevScore !== undefined) {
      trendDelta = res.percentage - prevScore;
      if (trendDelta > 2) trend = "up";
      else if (trendDelta < -2) trend = "down";
    } else {
      // simulated realistic baseline trend
      const simTrends: ("up" | "stable")[] = ["up", "stable", "up", "stable", "up", "stable"];
      trend = simTrends[index % simTrends.length];
      trendDelta = trend === "up" ? 5 + (index % 4) : 0;
    }

    return {
      subjectId: res.subjectId,
      subjectTitle: res.subjectTitle,
      icon: res.icon,
      score: res.score,
      maxScore: res.maxScore,
      percentage: res.percentage,
      gradeLabel: res.gradeLabel,
      gradeBadgeClass: res.gradeBadgeClass,
      trend,
      trendDelta,
      strengths: res.strengths.length > 0 ? res.strengths : ["استيعاب نواتج التعلم الأولية"],
      weaknesses: res.weaknesses,
      recommendation: res.recommendation,
      targetLessonTitle: res.weaknesses[0] || undefined,
    };
  });

  // Calculate aggregated totals
  const totalScore = subjectPerformances.reduce((acc, s) => acc + s.score, 0);
  const maxScore = subjectPerformances.reduce((acc, s) => acc + s.maxScore, 0);
  const overallPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 85;

  let overallGrade = "ممتاز (مرتبة الشرف الأكاديمية) 🌟";
  let gradeBadgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (overallPercentage < 65) {
    overallGrade = "بحاجة لمزيد من التركيز والمتابعة 📈";
    gradeBadgeClass = "bg-rose-500/20 text-rose-300 border-rose-500/40";
  } else if (overallPercentage < 75) {
    overallGrade = "جيد (مستوى مستقر وقابل للارتقاء) 👍";
    gradeBadgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/40";
  } else if (overallPercentage < 85) {
    overallGrade = "جيد جداً (مستوى متقدم ومبشر) 👏";
    gradeBadgeClass = "bg-blue-500/20 text-blue-300 border-blue-500/40";
  }

  // Science vs Humanities track average calculation
  const scienceSubs = subjectPerformances.filter(
    (s) => s.subjectId === "math" || s.subjectId === "integrated_science"
  );
  const humanitiesSubs = subjectPerformances.filter(
    (s) =>
      s.subjectId === "arabic" ||
      s.subjectId === "english" ||
      s.subjectId === "philosophy" ||
      s.subjectId === "history"
  );

  const scienceTrackAvg =
    scienceSubs.length > 0
      ? Math.round(
          scienceSubs.reduce((acc, s) => acc + s.percentage, 0) / scienceSubs.length
        )
      : 88;

  const humanitiesTrackAvg =
    humanitiesSubs.length > 0
      ? Math.round(
          humanitiesSubs.reduce((acc, s) => acc + s.percentage, 0) / humanitiesSubs.length
        )
      : 84;

  let trackBalanceAnalysis = "توازن ممتاز ومتناغم بين المسار العلمي التجريدي والمسار اللغوي الإنساني.";
  if (scienceTrackAvg - humanitiesTrackAvg > 8) {
    trackBalanceAnalysis = "تفوق لافت في المواد العلمية والرياضية مع فرصة ذهبية لتعزيز مهارات التعبير وحفظ المصطلحات اللغوية.";
  } else if (humanitiesTrackAvg - scienceTrackAvg > 8) {
    trackBalanceAnalysis = "براعة لغوية وفلسفية عالية، يُوصى بتخصيص وقت إضافي لحل المسائل الرياضية والكيميائية خطوة بخطوة.";
  }

  // Build Top Honors
  const topHonors: MonthlyAchievementBadge[] = [];
  const topSubject = [...subjectPerformances].sort((a, b) => b.percentage - a.percentage)[0];
  if (topSubject && topSubject.percentage >= 85) {
    topHonors.push({
      id: "honor_top_subject",
      title: `وسام التميز في ${topSubject.subjectTitle}`,
      desc: `تحقيق نسبة ${topSubject.percentage}% بجدارة في تقييم الباب المجمع.`,
      icon: topSubject.icon,
      badgeBg: "bg-emerald-50",
      textColor: "text-emerald-800",
      borderColor: "border-emerald-200",
    });
  }

  topHonors.push({
    id: "honor_comprehensive_commitment",
    title: "وسام الشمولية الأكاديمية",
    desc: `إكمال كافة أقسام الامتحانات الشهرية لجميع المواد الست بدون غياب.`,
    icon: "🎯",
    badgeBg: "bg-indigo-50",
    textColor: "text-indigo-800",
    borderColor: "border-indigo-200",
  });

  if (overallPercentage >= 80) {
    topHonors.push({
      id: "honor_honor_roll",
      title: "لوحة شرف متفوقي الشهر",
      desc: `الوصول إلى معدل عام يتجاوز 80% في أولى اختبارات العام الدراسي.`,
      icon: "🏆",
      badgeBg: "bg-amber-50",
      textColor: "text-amber-800",
      borderColor: "border-amber-200",
    });
  }

  // Extract Knowledge Gaps across all subjects
  const knowledgeGaps: KnowledgeGapItem[] = [];
  subjectPerformances.forEach((sub) => {
    if (sub.weaknesses && sub.weaknesses.length > 0) {
      sub.weaknesses.forEach((w, idx) => {
        knowledgeGaps.push({
          id: `gap_${sub.subjectId}_${idx}`,
          subjectId: sub.subjectId,
          subjectTitle: sub.subjectTitle,
          icon: sub.icon,
          concept: w,
          priority: sub.percentage < 75 ? "high" : "medium",
          impact:
            sub.percentage < 75
              ? "مفهوم محوري يتكرر بنسبة عالية في ورقة الامتحان"
              : "نقطة تفوق ترتقي بدرجتك إلى الامتياز الكامل",
          actionText: `مراجعة وحدة "${w}" بباب ${sub.subjectTitle}`,
        });
      });
    }
  });

  // If few gaps, add constructive polish items
  if (knowledgeGaps.length === 0) {
    knowledgeGaps.push({
      id: "gap_general_polish",
      subjectId: "math",
      subjectTitle: "الرياضيات",
      icon: "📐",
      concept: "التمارين المقالية للكسور الجبرية والمحددات",
      priority: "medium",
      impact: "تدريب وقائي لضمان الدرجة النهائية الكاملة",
      actionText: "حل نماذج امتحانية إضافية في باب الرياضيات",
    });
  }

  // Weekly Schedule Suggestion
  const weeklySchedule: WeeklyScheduleSuggestion[] = [
    {
      week: "الأسبوع الأول",
      focus: "سد الثغرات المكتشفة في الرياضيات واللغة العربية",
      subjectNames: ["الرياضيات", "اللغة العربية"],
      suggestedHours: 8,
      icon: "⚡",
    },
    {
      week: "الأسبوع الثاني",
      focus: "تثبيت مصطلحات العلوم المتكاملة واللغة الإنجليزية",
      subjectNames: ["العلوم المتكاملة", "اللغة الإنجليزية"],
      suggestedHours: 7,
      icon: "🔬",
    },
    {
      week: "الأسبوع الثالث",
      focus: "التحليل النقدي للفلسفة وتاريخ الحضارات",
      subjectNames: ["الفلسفة والتفكير", "التاريخ"],
      suggestedHours: 6,
      icon: "🏛️",
    },
    {
      week: "الأسبوع الرابع",
      focus: "محاكاة شاملة للامتحان الشهري القادم (بابل شيت ومقالي)",
      subjectNames: ["جميع المواد الست"],
      suggestedHours: 9,
      icon: "🏆",
    },
  ];

  // Smart Targets
  const smartActionChecklist: SmartTargetItem[] = [
    {
      id: "target_1",
      title: "مراجعة وحل 20 تمرين بابل شيت في نقاط الضعف المرصودة",
      category: "general",
      targetDate: "خلال 7 أيام",
      isCompleted: false,
    },
    {
      id: "target_2",
      title: "تطبيق قاعدة Past Continuous vs Past Simple في 5 جمل حرة",
      category: "languages",
      targetDate: "خلال 10 أيام",
      isCompleted: false,
    },
    {
      id: "target_3",
      title: "إعادة تجربة سؤال كثافة الماء وحساب الحرارة النوعية بالورقة والقلم",
      category: "science",
      targetDate: "خلال أسبوعين",
      isCompleted: true,
    },
    {
      id: "target_4",
      title: "إتقان حالات اقتران خبر كاد وأخواتها بأن (يجب، يكثر، يقل، يمتنع)",
      category: "humanities",
      targetDate: "قبل نهاية الشهر",
      isCompleted: false,
    },
  ];

  const aiExecutiveSummary =
    overallPercentage >= 85
      ? `طالبنا المتميز ${profile.name}، يعكس تقرير شهر إنجاز هذا تفوقاً أكاديمياً راسخاً. أظهرت نتائجك استيعاباً فائقاً للمفاهيم الأساسية، لا سيما في ${scienceSubs[0]?.subjectTitle || "المسار العلمي"}. التوصية المركزية للشهر المقبل هي الحفاظ على استمرارية التدريب على الأسئلة المقالية وإتقان صياغة خطوات الحل كاملة دون اختصار.`
      : overallPercentage >= 75
      ? `أداء متقدم ومشجع جداً يا ${profile.name}! لديك قاعدة علمية متينة، وتركيز بسيط على المفاهيم المحددة في جدول الثغرات أدناه سيرفع ترتيبك فوراً إلى فئة الامتياز المطلق. التزم بالجدول الزمني المقترح لضمان أعلى حصيلة درجات في التقييم القادم.`
      : `بداية تتطلب ضبط إيقاع المذاكرة وتنظيم الأولويات يا ${profile.name}. تقرير الإنجاز وضع بين يديك خريطة علاجية دقيقة للمفاهيم التي يجب البدء بها فوراً، مع أزرار مباشرة تنقلك لكل درس في بابه المخصص. ابدأ خطة الأسبوع الأول بثقة!`;

  return {
    monthId: targetMonthId,
    monthName,
    academicYear: "2026/2027",
    studentName: profile.name,
    generatedDate: new Date().toISOString().split("T")[0],
    overallPercentage,
    totalScore,
    maxScore,
    overallGrade,
    gradeBadgeClass,
    studyHours: Math.max(12, Math.round(((profile.weeklyMinutes || 240) * 4) / 60) || 16),
    completedExamsCount: evaluations.length || 1,
    xpEarned: targetEval?.xpEarned || 250,
    scienceTrackAvg,
    humanitiesTrackAvg,
    trackBalanceAnalysis,
    subjectPerformances,
    topHonors,
    knowledgeGaps,
    actionPlan: {
      aiExecutiveSummary,
      scienceMethodology:
        "المسار العلمي (رياضيات وعمليات العلوم): لا تعتمد على القراءة البصرية فقط؛ اكتب القوانين بيدك وحل المسألة حتى الناتج النهائي للتعود على دقة الحسابات تحت ضغط الوقت.",
      languagesMethodology:
        "المسار اللغوي والإنساني: احفظ التراكيب والمفردات داخل جمل تطبيقية، وتدرب على استنتاج الفكرة العامة والعلاقات المنطقية بين الجمل (تعليل، نتيجة، تفصيل بعد إجمال).",
      weeklySchedule,
      smartActionChecklist,
    },
  };
}
