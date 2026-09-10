import { QuizQuestion, Unit, Subject, StudentProfile, QuizQuestionType } from "../types";

export const normalizeArabic = (str: string): string => {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // Remove harakat / tashkeel
    .replace(/[أإآ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .replace(/\s+/g, " ");
};

export const checkFillBlankAnswer = (
  userAnswer: string,
  correctAnswer?: string,
  acceptedAnswers?: string[]
): boolean => {
  if (!userAnswer || !userAnswer.trim()) return false;
  const normUser = normalizeArabic(userAnswer);

  if (correctAnswer && normalizeArabic(correctAnswer) === normUser) return true;

  if (acceptedAnswers && acceptedAnswers.length > 0) {
    if (acceptedAnswers.some((ans) => normalizeArabic(ans) === normUser)) return true;
    // Forgiving match if core keyword is included
    if (
      acceptedAnswers.some((ans) => {
        const normAns = normalizeArabic(ans);
        return normAns.length >= 3 && (normUser.includes(normAns) || normAns.includes(normUser));
      })
    ) {
      return true;
    }
  }

  return false;
};

export interface UnitMasteryInfo {
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  level: "beginner" | "intermediate" | "advanced";
  levelLabel: string;
  recommendedDifficulty: "easy" | "medium" | "hard";
  badgeClass: string;
}

export const getUnitMasteryInfo = (unit: Unit | null): UnitMasteryInfo => {
  if (!unit || !unit.lessons || unit.lessons.length === 0) {
    return {
      totalLessons: 0,
      completedLessons: 0,
      progressPercent: 0,
      level: "beginner",
      levelLabel: "تأسيسي / مبتدئ 🌱",
      recommendedDifficulty: "easy",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }

  const totalLessons = unit.lessons.length;
  const completedLessons = unit.lessons.filter((l) => l.isCompleted).length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  if (progressPercent >= 75) {
    return {
      totalLessons,
      completedLessons,
      progressPercent,
      level: "advanced",
      levelLabel: "متقدم / مستويات عليا 🏆",
      recommendedDifficulty: "hard",
      badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    };
  } else if (progressPercent >= 35) {
    return {
      totalLessons,
      completedLessons,
      progressPercent,
      level: "intermediate",
      levelLabel: "متوسط / متمكن ⚡",
      recommendedDifficulty: "medium",
      badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
    };
  } else {
    return {
      totalLessons,
      completedLessons,
      progressPercent,
      level: "beginner",
      levelLabel: "تأسيسي / بداية الوحدة 🌱",
      recommendedDifficulty: "easy",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  }
};

export const getNextAdaptiveDifficulty = (
  currentDifficulty: "easy" | "medium" | "hard",
  consecutiveCorrect: number,
  consecutiveWrong: number
): { nextDifficulty: "easy" | "medium" | "hard"; message: string } => {
  if (consecutiveCorrect >= 2) {
    if (currentDifficulty === "easy") {
      return {
        nextDifficulty: "medium",
        message: "أداء ممتاز! تم رفع مستوى الصعوبة إلى (متوسط) لقياس مهارات التحليل 🚀",
      };
    } else if (currentDifficulty === "medium") {
      return {
        nextDifficulty: "hard",
        message: "إتقان رائع! ارتقيت إلى أسئلة (مستويات التفكير العليا) 🏆",
      };
    }
  }

  if (consecutiveWrong >= 2) {
    if (currentDifficulty === "hard") {
      return {
        nextDifficulty: "medium",
        message: "تم ضبط الصعوبة إلى (متوسط) لترسيخ المفاهيم وخطوات الحل 💡",
      };
    } else if (currentDifficulty === "medium") {
      return {
        nextDifficulty: "easy",
        message: "تم الانتقال لسؤال تأسيسي لضمان استيعاب القواعد المركزية أولاً 🌱",
      };
    }
  }

  return {
    nextDifficulty: currentDifficulty,
    message: "",
  };
};

/**
 * High-quality preset diverse questions for units when offline or generating immediately
 */
export const getUnitDiverseQuestions = (
  subject: Subject | null,
  unit: Unit | null,
  requestedType: QuizQuestionType | "mixed" = "mixed",
  difficulty: "easy" | "medium" | "hard" | "adaptive" = "medium"
): QuizQuestion[] => {
  const subjectId = subject?.id || "math";
  const unitId = unit?.id || "math_u1";
  const unitTitle = unit?.title || "الوحدة الأولى";
  const subjectTitle = subject?.title || "الرياضيات";

  const pool: QuizQuestion[] = [
    // 1. Multiple choice
    {
      id: `mcq_${unitId}_1`,
      type: "multiple_choice",
      question: `في دراستك لوحدة "${unitTitle}" (${subjectTitle}): ما هي النتيجة المباشرة المترتبة على تطبيق القاعدة الأساسية لنواتج التعلم؟`,
      options: [
        "الحصول على قيمة حقيقية متوافقة مع شروط المسألة",
        "انعدام الحل وتغير خصائص المتغيرات كلياً",
        "تغير الإشارة دون سبب رياضي أو فيزيائي",
        "ثبات النواتج مهما تغيرت الشروط الابتدائية",
      ],
      correctIndex: 0,
      explanation: `في منهج ${subjectTitle} المعتمد، يركز واضعو الامتحانات على أن تطبيق القاعدة في وحدة "${unitTitle}" يضمن الوصول إلى حل متطابق مع نواتج التعلم المستهدفة للترم الأول 2026/2027.`,
      hint: "تأكد من شرط انطباق القانون وعلاقة المتغيرات ببعضها.",
      difficulty: "easy",
      subjectId,
      unitId,
      unitTitle,
    },
    // 2. Fill in the blank
    {
      id: `fill_${unitId}_2`,
      type: "fill_blank",
      question: `أكمل العبارة الآتية: في سياق مفاهيم وحدة "${unitTitle}"، تعتمد العلاقة بين المعطيات ونواتج التفكير على مبدأ ______ والتكامل العلمي.`,
      correctAnswer: "التوازن والترابط",
      acceptedAnswers: ["التوازن", "الترابط", "التكامل", "الاتزان", "السببية", "التناسب"],
      explanation: "الشرح: يتطلب السؤال استحضار المصطلح المفاهيمي الحاكم للوحدة والذي يربط بين مختلف فروع الدرس.",
      hint: "كلمة تدل على التناسق أو التوافق بين أجزاء المنهج.",
      difficulty: "medium",
      subjectId,
      unitId,
      unitTitle,
    },
    // 3. Essay analytical question
    {
      id: `essay_${unitId}_3`,
      type: "essay",
      question: `سؤال مقالي تحليلي: في ضوء دراستك لوحدة "${unitTitle}"، ناقش مع التعليل العلمي المنظم كيف يؤثر تغير المتغيرات الأساسية على استقرار النتيجة، موضحاً خطوات التفكير المنطقي.`,
      modelAnswer: `النموذج الوزاري الإرشادي للإجابة:\n1. استعراض القاعدة أو القانون الرياضي/العلمي الحاكم لوحدة "${unitTitle}".\n2. تحديد المتغير التابع والمتغير المستقل وتأثير التغير النسبي.\n3. التعليل المنطقي: تغير المعطى يؤدي مباشرة إلى تحول مكافئ في القيمة المحسوبة نظراً للتناسب المباشر.\n4. الخلاصة والتطبيق العملي في امتحانات الثانوية العامة الحديثة.`,
      rubric: [
        "صياغة القانون أو المفهوم الأساسي للوحدة بدقة (1 درجات)",
        "تقديم خطوات التعليل والتحليل المنطقي السليم (2 درجات)",
        "الاستنتاج والربط بنواتج التعلم الوزارية (1 درجات)",
      ],
      explanation: "يقيس هذا السؤال المقالي القدرة على التحليل والتعبير العلمي المنظم وتوزيع الدرجات وفق معايير التصحيح الإلكتروني.",
      hint: "ابدأ بكتابة القانون أو المبدأ الأساسي ثم اذكر أثر التغير خطوة بخطوة.",
      difficulty: "hard",
      subjectId,
      unitId,
      unitTitle,
    },
    // 4. Advanced Multiple choice
    {
      id: `mcq_${unitId}_4`,
      type: "multiple_choice",
      question: `سؤال مستويات تفكير عليا (بابل شيت): إذا طرأ تغير مضاعف على أحد عناصر المعادلة في وحدة "${unitTitle}" مع ثبات الشروط الأخرى، فإن القيمة الناتجة:`,
      options: [
        "تتضاعف بنفس النسبة طردياً",
        "تظل ثابتة تماماً دون أي تأثر",
        "تنخفض فوراً إلى الصفر",
        "تتحول إلى قيمة سالبة غير معرفة",
      ],
      correctIndex: 0,
      explanation: "وفقاً لصياغة القوانين في هذه الوحدة، فإن العلاقة الطردية الخطية تقتضي تضاعف النتيجة بنفس النسبة عند ثبات باقي العوامل.",
      hint: "انظر إلى موضع المتغير في بسط العلاقة الرياضية.",
      difficulty: "hard",
      subjectId,
      unitId,
      unitTitle,
    },
    // 5. Another Fill in the blank
    {
      id: `fill_${unitId}_5`,
      type: "fill_blank",
      question: `أكمل الفراغ: يُعتبر معيار النجاح في حل مسائل وحدة "${unitTitle}" هو تحديد ______ بدقة قبل الشروع في كتابة خطوات الحل.`,
      correctAnswer: "المعطيات والمطلوب",
      acceptedAnswers: ["المعطيات", "المطلوب", "القانون", "المعطيات والمطلوب", "نوع المسألة"],
      explanation: "تحديد المعطيات والمطلوب بدقة هو الخطوة الذهبية الأولى لحل أي مسألة بابل شيت أو مقالية في امتحانات الثانوية العامة.",
      hint: "أول خطوة يقوم بها الطالب عند قراءة نص المسألة.",
      difficulty: "easy",
      subjectId,
      unitId,
      unitTitle,
    },
  ];

  if (requestedType !== "mixed") {
    const filtered = pool.filter((q) => q.type === requestedType);
    return filtered.length > 0 ? filtered : pool;
  }

  return pool;
};
