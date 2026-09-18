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
 * Curriculum-accurate subject specific question pools
 */
const SUBJECT_SPECIFIC_POOLS: Record<string, (unitId: string, unitTitle: string) => QuizQuestion[]> = {
  math: (unitId, unitTitle) => [
    {
      id: `math_${unitId}_1`,
      type: "multiple_choice",
      question: "إذا كان جذرا المعادلة التربيعية أ س² + ب س + جـ = 0 حقيقيين متساويين، فإن قيمة المميز ب² - 4أجـ تساوي:",
      options: ["صفر", "أكبر من صفر", "أقل من صفر", "عدد مركب تخيلي"],
      correctIndex: 0,
      exclusionReasoning: [
        "الخيار (أ) صحيح: Δ = 0 ينتج عنه جذر حقيقي مكرر وحيد (-ب / 2أ).",
        "الخيار (ب) مستبعد: إذا كان Δ > 0 يكون الجذران حقيقيين مختلفين.",
        "الخيار (ج) مستبعد: إذا كان Δ < 0 يكون الجذران مركبين غير حقيقيين ومترافقين.",
        "الخيار (د) مستبعد: المميز قيمة قياسية حقيقية ناتجة من المعاملات وليس عدداً تخيلياً بحتاً.",
      ],
      explanation: "عندما يكون المميز مساوياً للصفر (Δ = 0)، يكون للمعادلة جذر حقيقي واحد مكرر (جذران حقيقيان متساويان).",
      hint: "تذكر حالات المميز الثلاث لطبيعة جذور المعادلة التربيعية.",
      ministryStandard: "بابل شيت: فهم وتطبيق واستبعاد المشتتات",
      marks: 1,
      difficulty: "easy",
      subjectId: "math",
      unitId,
      unitTitle,
    },
    {
      id: `math_${unitId}_tf1`,
      type: "true_false",
      question: "ضع علامة (صح) أو (خطأ): حاصل ضرب جذري المعادلة التربيعية 2س² - 5س - 6 = 0 يساوي -3.",
      isTrue: true,
      correction: "العبارة صحيحة تماماً: قانون حاصل ضرب الجذرين = الحد المطلق (جـ) / معامل س² (أ) = -6 / 2 = -3.",
      explanation: "تطبيق مباشر لقانون حاصل ضرب الجذور (جـ / أ) مع مراعاة الإشارة السالبة للحد المطلق.",
      hint: "استخدم القانون: حاصل ضرب الجذرين = جـ / أ.",
      ministryStandard: "معيار الوزارة: دقة حسابية وتطبيق مباشر",
      marks: 1,
      difficulty: "easy",
      subjectId: "math",
      unitId,
      unitTitle,
    },
    {
      id: `math_${unitId}_tf2`,
      type: "true_false",
      question: "ضع علامة (صح) أو (خطأ): تكون الدالة د(س) = س² + 4 موجبة دائماً لجميع قيم س المنتمية إلى ح.",
      isTrue: true,
      correction: "العبارة صحيحة: لأن المميز Δ = 0² - 4(1)(4) = -16 < 0، وإشارة الدالة تتبع إشارة معامل س² (موجب) دائماً لجميع قيم س ∈ ح.",
      explanation: "المعادلة لا تقطع محور السينات (ليس لها جذور حقيقية) وإشارة د(س) تأخذ نفس إشارة معامل س² لجميع س الحقيقية.",
      hint: "احسب المميز ثم انظر لإشارة معامل س².",
      ministryStandard: "معيار الوزارة: بحث إشارة الدالة",
      marks: 1,
      difficulty: "medium",
      subjectId: "math",
      unitId,
      unitTitle,
    },
    {
      id: `math_${unitId}_2`,
      type: "fill_blank",
      question: "أكمل: قيمة العدد التخيلي ت^4ن+3 في أبسط صورة تساوي ______ (حيث ن عدد صحيح).",
      correctAnswer: "-ت",
      acceptedAnswers: ["-ت", "سالب ت", "- i"],
      explanation: "ت^4ن = 1، وبالتالي ت^(4ن+3) = ت^3 = -ت.",
      hint: "احسب ت أس 3 بعد التخلص من مضاعفات 4.",
      ministryStandard: "بابل شيت: اختصار الأعداد المركبة",
      marks: 1,
      difficulty: "medium",
      subjectId: "math",
      unitId,
      unitTitle,
    },
    {
      id: `math_${unitId}_3`,
      type: "essay",
      question: "سؤال مقالي وزاري مقنن: أوجد قيمة ك التي تجعل أحد جذري المعادلة س² - (ك - 2)س + 7 = 0 معكوساً جمعياً للآخر، موضحاً خطوات الحل الرياضي وسلسلة الاستنتاج.",
      modelAnswer: `الخطوات النموذجية وفق سلم التصحيح:\n1. الشرط: أحد الجذرين معكوس جمعي للآخر يعني أن مجموع الجذرين (ل + م) = صفر.\n2. القانون: مجموع الجذرين = -ب / أ = -(-(ك - 2)) / 1 = ك - 2.\n3. التعويض: ك - 2 = 0 ⬅ ك = 2.\n4. إذن قيمة ك المطلوبة = 2.`,
      rubric: [
        "ذكر شرط المعكوس الجمعي (مجموع الجذرين = 0) (0.5 درجة)",
        "تطبيق قانون مجموع الجذرين -ب/أ (1.0 درجة)",
        "إيجاد الناتج النهائي ك = 2 (0.5 درجة)"
      ],
      explanation: "هذا السؤال من الأسئلة المقالية النموذجية في جبر الصف الأول الثانوي وفق مواصفات الورقة الامتحانية.",
      hint: "اجعل معامل س مساوياً للصفر مباشرة.",
      ministryStandard: "سؤال مقالي مقنن: خطوات حل وبرهان (درجتان)",
      marks: 2,
      difficulty: "hard",
      subjectId: "math",
      unitId,
      unitTitle,
    },
    {
      id: `math_${unitId}_4`,
      type: "multiple_choice",
      question: "الزاوية التي قياسها -150° تقع في الربع:",
      options: ["الثالث", "الثاني", "الرابع", "الأول"],
      correctIndex: 0,
      exclusionReasoning: [
        "الخيار (أ) صحيح: -150° + 360° = 210°، والزاوية 210° تقع بين 180° و 270° أي في الربع الثالث.",
        "الخيار (ب) مستبعد: الربع الثاني يقع بين 90° و 180°.",
        "الخيار (ج) مستبعد: الربع الرابع يقع بين 270° و 360°.",
        "الخيار (د) مستبعد: الربع الأول يقع بين 0° و 90°.",
      ],
      explanation: "لإيجاد القياس الموجب المكافئ: -150° + 360° = 210°، والزاوية 210° تقع في الربع الثالث (بين 180° و 270°).",
      hint: "أضف دورة كاملة 360 درجة للحصول على القياس الموجب الأصغر.",
      ministryStandard: "بابل شيت: زوايا موجهة وأرباع إحداثية",
      marks: 1,
      difficulty: "medium",
      subjectId: "math",
      unitId,
      unitTitle,
    }
  ],

  integrated_science: (unitId, unitTitle) => [
    {
      id: `sci_${unitId}_1`,
      type: "multiple_choice",
      question: "ما الخاصية الفيزيائية الفريدة للماء المسؤولة عن بقاء الكائنات الحية في قيعان البحيرات المتجمدة؟",
      options: [
        "شذوذ كثافة الماء عند درجات الحرارة الأقل من 4°م",
        "ارتفاع التوتر السطحي لجزيئات الماء",
        "القدرة الفائقة على إذابة المركبات الأيونية",
        "انخفاض اللزوجة مع زيادة الضغط"
      ],
      correctIndex: 0,
      exclusionReasoning: [
        "الخيار (أ) صحيح: تمدد الماء بالبرودة دون 4°م يجعله أقل كثافة فيطفو الثلج للأعلى مشكلاً عازلاً حرارياً للمياه بالأسفل.",
        "الخيار (ب) مستبعد: التوتر السطحي يساعد حشرات الماء على المشي على السطح لكنه لا يمنع تجمد القاع.",
        "الخيار (ج) مستبعد: إذابة المركبات خاصية كيميائية قطبية لكنها لا تعزل الحرارة في الشتاء القارس.",
        "الخيار (د) مستبعد: اللزوجة عامل ميكانيكي لحركة السوائل ولا دور رئيسي لها في حفظ حرارة القيعان.",
      ],
      explanation: "عندما تنخفض حرارة الماء دون 4°م تقل كثافته ويتمدد ليطفو على السطح مكوناً طبقة جليد عازلة تحمي المياه العميقة من التجمد.",
      hint: "فكر في تغير كثافة الماء عند تجمده وطفوه على السطح.",
      ministryStandard: "بابل شيت مستويات عليا: تكامل فيزياء وأحياء",
      marks: 1,
      difficulty: "easy",
      subjectId: "integrated_science",
      unitId,
      unitTitle,
    },
    {
      id: `sci_${unitId}_tf1`,
      type: "true_false",
      question: "ضع علامة (صح) أو (خطأ): تؤدي زيادة نسبة غاز ثاني أكسيد الكربون المذاب في مياه المحيطات إلى زيادة الرقم الهيدروجيني (pH) وجعل الماء أكثر قاعدية.",
      isTrue: false,
      correction: "التصويب العلمي المعتمد: ذوبان ثاني أكسيد الكربون يشكل حمض الكربونيك (H2CO3) مما يزيد من تركيز أيونات الهيدروجين ويقلل الرقم الهيدروجيني (تحمض المحيطات).",
      explanation: "تحمض المحيطات ظاهرة بيئية ناتجة عن انخفاض الـ pH بسبب انحلال CO2 الجوي في الماء، مما يهدد الشعاب المرجانية والكائنات ذات الهياكل الكلسية.",
      hint: "تذكر تفاعل CO2 مع الماء لتكوين حمض الكربونيك، وتأثير الحمض على الـ pH.",
      ministryStandard: "معيار الوزارة: كيمياء بيئية وتفكير ناقد",
      marks: 1,
      difficulty: "medium",
      subjectId: "integrated_science",
      unitId,
      unitTitle,
    },
    {
      id: `sci_${unitId}_2`,
      type: "fill_blank",
      question: "أكمل: الرابطة المسؤولة عن ارتفاع درجة غليان الماء وحرارته النوعية مقارنة بالمركبات المشابهة هي الرابطة ______.",
      correctAnswer: "الهيدروجينية",
      acceptedAnswers: ["الهيدروجينية", "الرابطة الهيدروجينية", "هيدروجينية"],
      explanation: "الروابط الهيدروجينية بين جزيئات الماء القطبية تتطلب طاقة حرارية عالية لكسرها، مما يرفع درجتي الغليان والانصهار.",
      hint: "رابطة تنشأ بين ذرة هيدروجين قطبية وذرة أكسجين في جزيء ماء مجاور.",
      ministryStandard: "استدعاء وتطبيق المصطلحات العلمية",
      marks: 1,
      difficulty: "medium",
      subjectId: "integrated_science",
      unitId,
      unitTitle,
    },
    {
      id: `sci_${unitId}_3`,
      type: "essay",
      question: "سؤال مقالي تحليلي: فسر علمياً مع التعليل: أثر التلوث الحراري على التنوع البيولوجي في الأنظمة البيئية المائية.",
      modelAnswer: `الإجابة النموذجية:\n1. يؤدي ارتفاع درجة حرارة الماء إلى انخفاض ذائبية غاز الأكسجين (DO) المذاب في الماء.\n2. زيادة معدل الأيض والتنفس لدى الكائنات المائية مما يضاعف استهلاكها للأكسجين الشحيح.\n3. النتيجة: حدوث اختناق وموت جماعي للأسماك وتدهور التنوع الحيوي للسلسلة الغذائية المائية.`,
      rubric: [
        "ذكر علاقة حرارة الماء بانخفاض ذائبية الأكسجين (1.0 درجة)",
        "شرح تأثير ذلك على زيادة معدل تنفس الكائنات واستهلاك الأكسجين (0.5 درجة)",
        "الاستنتاج البيئي والتدهور الحيوي (0.5 درجة)"
      ],
      explanation: "يقيس هذا السؤال الفهم التكاملي لعلاقة الفيزياء والكيمياء بالأحياء المائية.",
      hint: "اربط بين درجة الحرارة وذائبية الغازات في السوائل.",
      ministryStandard: "سؤال مقالي مقنن: تعليل وتفسير علمي متكامل (درجتان)",
      marks: 2,
      difficulty: "hard",
      subjectId: "integrated_science",
      unitId,
      unitTitle,
    }
  ],

  arabic: (unitId, unitTitle) => [
    {
      id: `ar_${unitId}_1`,
      type: "multiple_choice",
      question: "في جملة: 'أخذ المعلمُ يشرحُ الدرس'، إعراب كلمة (المعلمُ):",
      options: ["اسم أخذ مرفوع", "فاعل مرفوع", "مبتدأ مؤخر", "مفعول به أول"],
      correctIndex: 0,
      exclusionReasoning: [
        "الخيار (أ) صحيح: الفعل (أخذ) من أفعال الشروع الناسخة الناقصة، لأن خبره جملة فعلية فعلها مضارع (يشرح).",
        "الخيار (ب) مستبعد: لا يُعرب فاعلاً إلا إذا كان الفعل تاماً، مثل: أخذ الطالب الكتاب.",
        "الخيار (ج) مستبعد: لا يوجد تقديم ولا تأخير هنا، والجملة بدأت بفعل ناسخ.",
        "الخيار (د) مستبعد: اسم كان وأخواتها وكاد وأخواتها يكون مرفوعاً دائماً وليس مفعولاً به.",
      ],
      explanation: "الفعل 'أخذ' من أفعال الشروع، وجاء في زمن الماضي وخبره جملة فعلية مضارعة (يشرح)، لذا فهو ناقص و(المعلم) اسمه مرفوع.",
      hint: "انتبه لنوع خبر الفعل (أخذ)؛ هل هو جملة فعلية مضارعة؟",
      ministryStandard: "بابل شيت: إعراب القواعد النحوية المقررة",
      marks: 1,
      difficulty: "easy",
      subjectId: "arabic",
      unitId,
      unitTitle,
    },
    {
      id: `ar_${unitId}_tf1`,
      type: "true_false",
      question: "ضع علامة (صح) أو (خطأ): يجوز أن يأتي خبر كاد وأخواتها اسماً مفرداً صريحاً أو شبه جملة في الفصحى القياسية المعاصرة.",
      isTrue: false,
      correction: "التصويب العلمي المعتمد: يشترط في خبر كاد وأخواتها أن يكون جملة فعلية فعلها مضارع دائماً، وإذا جاء مفرداً اعتُبر الفعل تاماً لا ناقصاً.",
      explanation: "قاعدة نحوية حاسمة في الثانوية العامة: التمييز بين كان وأخواتها وكاد وأخواتها ينحصر في شرط المضارع في خبر كاد وأخواتها.",
      hint: "تذكر الشرط الأساسي الذي يميز كاد وأخواتها عن كان وأخواتها.",
      ministryStandard: "معيار الوزارة: ضوابط النواسخ النحوية",
      marks: 1,
      difficulty: "medium",
      subjectId: "arabic",
      unitId,
      unitTitle,
    },
    {
      id: `ar_${unitId}_2`,
      type: "fill_blank",
      question: "أكمل: حكم اقتران خبر الفعل (عسى) بأن المصدرية هو ______.",
      correctAnswer: "يكثر",
      acceptedAnswers: ["يكثر", "الكثرة", "كثير"],
      explanation: "حكم اقتران خبر (عسى وأوشك) بأن هو الكثرة، بينما يقل مع (كاد وكرب)، ويجب مع (حري واخلولق)، ويمتنع مع أفعال الشروع.",
      hint: "أحد الأحكام الأربعة: يكثر، يقل، يجب، يمتنع.",
      ministryStandard: "بابل شيت: أحكام اقتران الخبر بأن",
      marks: 1,
      difficulty: "medium",
      subjectId: "arabic",
      unitId,
      unitTitle,
    },
    {
      id: `ar_${unitId}_3`,
      type: "essay",
      question: "سؤال مقالي: ميّز بين 'كان التامة' و 'كان الناقصة' في الجملتين الآتيتين مع إعراب ما تحته خط: (أ) 'كان الجوُّ جميلاً' - (ب) 'اجتهد الطالبُ فكان النجاحُ'.",
      modelAnswer: `الإجابة النموذجية:\n1. الجملة الأولى: 'كان الجو جميلاً' ⬅ (كان) ناقصة تحتاج اسماً وخبراً، وإعراب (الجو): اسم كان مرفوع وعلامة رفعه الضمة.\n2. الجملة الثانية: 'فكان النجاح' ⬅ (كان) تامة بمعنى تحقق أو وُجد، وتكتفي بمرفوعها، وإعراب (النجاح): فاعل مرفوع وعلامة رفعه الضمة الظاهرة.`,
      rubric: [
        "تحديد نوع كان في الجملة الأولى وإعراب اسمها (1.0 درجة)",
        "تحديد نوع كان في الجملة الثانية وإعراب فاعلها (1.0 درجة)"
      ],
      explanation: "سؤال وزاري أساسي للتفرقة بين كان التامة وكان الناقصة.",
      hint: "انظر هل الجملة بعد كان تامة المعنى بمبتدأ وخبر أم تكتفي بالفاعل.",
      ministryStandard: "سؤال مقالي مقنن: تمييز وإعراب تطبيقي (درجتان)",
      marks: 2,
      difficulty: "hard",
      subjectId: "arabic",
      unitId,
      unitTitle,
    }
  ],

  english: (unitId, unitTitle) => [
    {
      id: `eng_${unitId}_1`,
      type: "multiple_choice",
      question: "Choose the correct answer: While I __________ my homework, the electricity went out.",
      options: ["was doing", "did", "do", "have done"],
      correctIndex: 0,
      exclusionReasoning: [
        "Option (A) is correct: Past Continuous (was doing) represents the longer ongoing action interrupted by 'went out'.",
        "Option (B) is incorrect: Past simple indicates a completed single action, not the background progression.",
        "Option (C) is incorrect: Present simple cannot be sequenced with past tense 'went out'.",
        "Option (D) is incorrect: Present perfect relates past to present, not two past past occurrences.",
      ],
      explanation: "Past Continuous (was doing) is used for an action in progress in the past that was interrupted by a shorter action in the Past Simple (went out).",
      hint: "Look at the time conjunction 'While' followed by a long action.",
      ministryStandard: "Thanaweya Amma Exam Specs: Past Continuous vs Past Simple",
      marks: 1,
      difficulty: "easy",
      subjectId: "english",
      unitId,
      unitTitle,
    },
    {
      id: `eng_${unitId}_tf1`,
      type: "true_false",
      question: "True or False: Stative verbs (such as know, believe, understand, seem) are normally used in continuous tenses to show ongoing progress.",
      isTrue: false,
      correction: "Correction: Stative verbs describe states rather than dynamic actions and are generally NOT used in continuous (-ing) tenses; they take simple tenses instead.",
      explanation: "Ministry Exam Core Rule: Stative verbs (verbs of feeling, thinking, and possession) reject continuous aspect in formal academic English.",
      hint: "Remember the difference between action verbs (run, write) and state verbs (know, like).",
      ministryStandard: "Ministry Grammar Specs: Dynamic vs Stative Verbs",
      marks: 1,
      difficulty: "medium",
      subjectId: "english",
      unitId,
      unitTitle,
    },
    {
      id: `eng_${unitId}_2`,
      type: "fill_blank",
      question: "Complete: __________ the party, I met several of my old school friends.",
      correctAnswer: "During",
      acceptedAnswers: ["During", "during"],
      explanation: "'During' is followed by a noun or noun phrase ('During the party'), whereas 'While' requires a clause (subject + verb) or V-ing.",
      hint: "Preposition used with noun phrases meaning 'in the course of'.",
      ministryStandard: "Language Use: Time Prepositions",
      marks: 1,
      difficulty: "medium",
      subjectId: "english",
      unitId,
      unitTitle,
    },
    {
      id: `eng_${unitId}_3`,
      type: "essay",
      question: "Essay question: In 2 to 3 concise sentences, explain the difference between 'used to + inf' and 'be used to + v-ing' providing one clear illustrative example for each.",
      modelAnswer: `Model Answer:\n1. 'used to + infinitive' refers to a past habit or state that is no longer true in the present (e.g., 'I used to live in Alexandria').\n2. 'be used to + V-ing / noun' expresses being accustomed or familiar with something in the present (e.g., 'He is used to waking up early').`,
      rubric: [
        "Explaining 'used to + inf' with an accurate example (1.0 mark)",
        "Explaining 'be used to + v-ing' with an accurate example (1.0 mark)"
      ],
      explanation: "Tests the nuanced distinction between past habit structures and present familiarities.",
      hint: "Focus on whether the habit is finished or still ongoing/accustomed.",
      ministryStandard: "Ministry Written Expression & Grammar Nuance (2 marks)",
      marks: 2,
      difficulty: "hard",
      subjectId: "english",
      unitId,
      unitTitle,
    }
  ],

  philosophy: (unitId, unitTitle) => [
    {
      id: `phil_${unitId}_1`,
      type: "multiple_choice",
      question: "إرجاع ظاهرة الزلازل والبراكين إلى غضب الآلهة والأرواح الشريرة يمثل الأسلوب:",
      options: ["الخرافي", "العلمي", "الفلسفي", "الديني"],
      correctIndex: 0,
      exclusionReasoning: [
        "الخيار (أ) صحيح: الأسلوب الخرافي يعتمد على أسباب غيبية ساذجة غير واقعية ولا تستند لأي منطق سليم.",
        "الخيار (ب) مستبعد: الأسلوب العلمي يرجع الزلازل لتحركات الصفائح التكتونية والعلل المباشرة.",
        "الخيار (ج) مستبعد: الأسلوب الفلسفي يبحث عن العلل الأولى البعيدة والتأمل الكلي.",
        "الخيار (د) مستبعد: الأسلوب الديني الصحيح يربط الظاهرة بقدرة الخالق وعظمته وتدبيره للكون.",
      ],
      explanation: "الأسلوب الخرافي يعتمد على علل وأسباب ساذجة وغير منطقية لتفسير ظواهر الكون.",
      hint: "أسلوب غير علمي يستند إلى الخرافات والأوهام.",
      ministryStandard: "بابل شيت: التمييز بين أساليب التفكير الإنساني",
      marks: 1,
      difficulty: "easy",
      subjectId: "philosophy",
      unitId,
      unitTitle,
    },
    {
      id: `phil_${unitId}_tf1`,
      type: "true_false",
      question: "ضع علامة (صح) أو (خطأ): الأسلوب الفلسفي يبحث عن العلل القريبة المباشرة للظواهر الكونية كالأسلوب العلمي تماماً.",
      isTrue: false,
      correction: "التصويب العلمي المعتمد: الأسلوب العلمي هو الذي يبحث عن العلل القريبة المباشرة، بينما الأسلوب الفلسفي يتجاوز ذلك للبحث عن العلل البعيدة والمبادئ الأولى الشاملة.",
      explanation: "الفارق الجوهري بين العلم والفلسفة: العلم يبحث في العلل القريبة والتجريبية، والفلسفة تبحث في العلل البعيدة والعلل الأولى الوجودية.",
      hint: "تذكر الفرق بين العلل القريبة والعلل البعيدة.",
      ministryStandard: "معيار الوزارة: المقارنة الفلسفية ونقد المفاهيم",
      marks: 1,
      difficulty: "medium",
      subjectId: "philosophy",
      unitId,
      unitTitle,
    },
    {
      id: `phil_${unitId}_2`,
      type: "fill_blank",
      question: "أكمل: يُعرف الأسلوب الذي يبحث عن العلل البعيدة والمبادئ الأولى الشاملة للوجود بالأسلوب ______.",
      correctAnswer: "الفلسفي",
      acceptedAnswers: ["الفلسفي", "التأملي", "فلسفي"],
      explanation: "الأسلوب الفلسفي هو نزعة عقلية تأملية تسعى لكشف المبادئ والعلل الأولى غير المباشرة.",
      hint: "أسلوب التفكير التأملي الشامل.",
      ministryStandard: "استدعاء المفاهيم الفلسفية الأساسية",
      marks: 1,
      difficulty: "medium",
      subjectId: "philosophy",
      unitId,
      unitTitle,
    },
    {
      id: `phil_${unitId}_3`,
      type: "essay",
      question: "سؤال مقالي: دلل بمثال من عندك على أن قابلية الفرد للاستهواء تُعد من العوامل الذاتية المؤدية للوقوع في أخطاء التفكير، موضحاً أثرها على الفرد والمجتمع.",
      modelAnswer: `الإجابة النموذجية:\n1. المفهوم: القابلية للاستهواء هي سرعة تصديق ما يقوله الآخرون دون فحص أو نقد أو دليل علمي.\n2. المثال: تصديق شائعة على وسائل التواصل الاجتماعي حول تأجيل الامتحانات وترويجها بين الزملاء دون التحقق من المصدر الرسمي للوزارة.\n3. الأثر: نشر البلبلة الفكرية، تشتت الانتباه الدراسي، وإصدار أحكام وقرارات خاطئة.`,
      rubric: [
        "صياغة مفهوم القابلية للاستهواء بدقة (0.5 درجة)",
        "تقديم مثال واقعي سليم من سياق الطالب (1.0 درجة)",
        "توضيح أثر ذلك على السلوك والتفكير (0.5 درجة)"
      ],
      explanation: "يقيس السؤال مهارة التطبيق وضرب الأمثلة الواقعية على عوامل الخطأ في التفكير.",
      hint: "فكر في الشائعات وسرعة تصديقها دون دليل.",
      ministryStandard: "سؤال مقالي مقنن: تطبيق وتوليد أمثلة (درجتان)",
      marks: 2,
      difficulty: "hard",
      subjectId: "philosophy",
      unitId,
      unitTitle,
    }
  ],

  history: (unitId, unitTitle) => [
    {
      id: `his_${unitId}_1`,
      type: "multiple_choice",
      question: "استخدمت الطبقتان المتوسطة والفقيرة في مصر القديمة (الأوستراكا) كمادة للكتابة بسبب:",
      options: ["ارتفاع أسعار ورق البردي", "قدسية نصوص الأوستراكا", "صعوبة الكتابة على الأحجار", "ندرة الفخار"],
      correctIndex: 0,
      exclusionReasoning: [
        "الخيار (أ) صحيح: ورق البردي كان غالياً ويباع للأسر الغنية والوثائق الرسمية فقط، فلجأت الطبقات الشعبية للأوستراكا لرخصها وتوافرها.",
        "الخيار (ب) مستبعد: الأوستراكا استُخدمت في المعاملات اليومية والتدريب على الكتابة ولم تكن ذات طابع مقدس كنصوص الأهرام.",
        "الخيار (ج) مستبعد: الأحجار كانت متوفرة لكن النقش عليها يتطلب أدوات ونحاتين مهنيين ولا يناسب التدريب السريع.",
        "الخيار (د) مستبعد: الفخار كان شديد الوفرة والرخص في كل بيت مصري قديم.",
      ],
      explanation: "ورق البردي كان مكلفاً ومخصصاً للوثائق الملكية، بينما الأوستراكا (شقفات الفخار المكسور) كانت مجانية ومتوفرة لكافة فئات الشعب.",
      hint: "فكر في العامل الاقتصادي وسعر ورق البردي.",
      ministryStandard: "بابل شيت: تحليل العوامل الاقتصادية والاجتماعية في التاريخ",
      marks: 1,
      difficulty: "easy",
      subjectId: "history",
      unitId,
      unitTitle,
    },
    {
      id: `his_${unitId}_tf1`,
      type: "true_false",
      question: "ضع علامة (صح) أو (خطأ): تعد النقود والمسكوكات من المصادر الأولية المهمة لدراسة الحضارة الفرعونية القديمة خلال عصر الدولة القديمة والوسطى.",
      isTrue: false,
      correction: "التصويب التاريخي المعتمد: لم يعرف المصريون القدماء صك النقود في العصور الفرعونية القديمة والوسطى والحديثة، بل كانوا يعتمدون على نظام المقايضة، ودخلت النقود في العصر البطلمي.",
      explanation: "فخ امتحاني تاريخي شهير للثانوية العامة: صك النقود لم يكن معروفاً في مصر الفرعونية وكانت المعاملات بالمقايضة بالحبوب والسلع.",
      hint: "هل كان الفراعنة يصكون عملات معدنية أم يعتمدون على المقايضة؟",
      ministryStandard: "معيار الوزارة: نقد المصادر التاريخية وكشف المغالطات",
      marks: 1,
      difficulty: "medium",
      subjectId: "history",
      unitId,
      unitTitle,
    },
    {
      id: `his_${unitId}_2`,
      type: "fill_blank",
      question: "أكمل: وفقاً للمؤرخ (ول ديورانت)، فإن الحضارة تبدأ عندما ينتهي الاضطراب ويستقر ______.",
      correctAnswer: "الأمن",
      acceptedAnswers: ["الأمن", "الاستقرار", "السلام", "امان"],
      explanation: "يرى ديورانت أن زوال الخوف واستتباب الأمن هما الشرط الأساسي لانطلاق الإبداع والإنشاء الحضاري.",
      hint: "عنصر حاسم لزوال الخوف والقلق لدى الإنسان.",
      ministryStandard: "استدعاء النظريات التاريخية الكبرى",
      marks: 1,
      difficulty: "medium",
      subjectId: "history",
      unitId,
      unitTitle,
    },
    {
      id: `his_${unitId}_3`,
      type: "essay",
      question: "سؤال مقالي: ما العلاقة بين الموقع الجغرافي المتميز لمصر القديمة وازدهار حركة التجارة الخارجية والتواصل الحضاري؟",
      modelAnswer: `الإجابة النموذجية:\n1. توسط مصر لقارات العالم القديم (آسيا وإفريقيا وقربها من أوروبا) جعلها ملتقى للطرق التجارية البحرية والبرية.\n2. إطلالتها على البحرين الأحمر والمتوسط ونهر النيل سهل اتصالها بحضارات بلاد بونت وفي Modern فينيقيا وجزر كريت.\n3. أدى ذلك إلى تبادل المحاصيل والسلع ونقل العلوم والمعارف دون عزلة حضارية.`,
      rubric: [
        "بيان الموقع الجغرافي ومركزية مصر بين القارات (1.0 درجة)",
        "ذكر الممرات المائية (البحرين والنيل) ودورها في التجارة والتواصل (1.0 درجة)"
      ],
      explanation: "سؤال وزاري يقيس مهارة استنتاج العلاقات المكانية والتاريخية وأثر الجغرافيا في صناعة التاريخ.",
      hint: "اربط بين توسط القارات والبحرين الأحمر والمتوسط.",
      ministryStandard: "سؤال مقالي مقنن: علاقات وأثر متبادل (درجتان)",
      marks: 2,
      difficulty: "hard",
      subjectId: "history",
      unitId,
      unitTitle,
    }
  ],

  physics: (unitId, unitTitle) => [
    {
      id: `phy_${unitId}_1`,
      type: "multiple_choice",
      question: "سلك مستقيم يمر به تيار كهربي شدته I وُضع عمودياً في مجال مغناطيسي منتظم كثافة فيضه B، إذا زاد طول السلك للضعف وقُلت شدة التيار للنصف، فإن القوة المغناطيسية المؤثرة عليه:",
      options: ["تظل ثابتة دون تغيير", "تزداد للضعف", "تقل إلى النصف", "تزداد لأربعة أمثال"],
      correctIndex: 0,
      exclusionReasoning: [
        "الخيار (أ) صحيح: القوة المغناطيسية F = B × I × L. عند مضاعفة الطول (×2) وتقليل التيار للنصف (×0.5)، يصبح الناتج F = B × (0.5 I) × (2 L) = B I L ثابتة.",
        "الخيار (ب) مستبعد: إهمال أثر انخفاض شدة التيار يؤدي لخطأ مضاعفة القوة.",
        "الخيار (ج) مستبعد: إهمال زيادة طول السلك يؤدي لاعتبار القوة تنصف.",
        "الخيار (د) مستبعد: لا توجد علاقة تربيعية في قانون القوة المغناطيسية لسلك مستقيم.",
      ],
      explanation: "العلاقة طردية مع كل من شدة التيار وطول السلك؛ تغير أحدهما بالضعف والآخر بالنصف يعوض كلاهما الآخر فتبقى القوة ثابتة.",
      hint: "طبق القانون F = B I L sin θ وقارن النواتج.",
      ministryStandard: "بابل شيت: علاقات وتناسبات فيزيائية دقيقة",
      marks: 1,
      difficulty: "medium",
      subjectId: "physics",
      unitId,
      unitTitle,
    },
    {
      id: `phy_${unitId}_tf1`,
      type: "true_false",
      question: "ضع علامة (صح) أو (خطأ): تزداد المقاومة النوعية لسلك نحاسي عند زيادة طوله ونقصان مساحة مقطعه عند ثبوت درجة الحرارة.",
      isTrue: false,
      correction: "التصويب الفيزيائي المعتمد: المقاومة النوعية (ρe) خاصية فيزيائية مميزة لنوع المادة ولا تتغير بتغير الطول أو المساحة، وإنما تتوقف فقط على نوع المادة ودرجة الحرارة.",
      explanation: "خطأ شائع لدى طلاب الثانوية العامة: الخلط بين المقاومة الكهربية R (التي تعتمد على الطول والمساحة) والمقاومة النوعية ρe (التي تعتمد على نوع المادة والحرارة فقط).",
      hint: "تذكر العوامل التي تتوقف عليها المقاومة النوعية كخاصية مميزة.",
      ministryStandard: "معيار الوزارة: كشف الخلط بين الخواص النوعية والأبعاد الهندسية",
      marks: 1,
      difficulty: "medium",
      subjectId: "physics",
      unitId,
      unitTitle,
    },
    {
      id: `phy_${unitId}_2`,
      type: "fill_blank",
      question: "أكمل: يُعبر قانون كيرشوف الأول عن مبدأ بقاء ______ الكهربية عند أي نقطة تفرع في دائرة مغلقة.",
      correctAnswer: "الشحنة",
      acceptedAnswers: ["الشحنة", "شحنة", "الشحنات"],
      explanation: "قانون كيرشوف الأول (مجموع التيارات الداخلة = الخارجة) يستند فيزيائياً إلى قانون بقاء الشحنة الكهربية.",
      hint: "مبدأ فيزيائي بقائي يتعلق بحركة الإلكترونات.",
      ministryStandard: "استدعاء المبادئ الفيزيائية التأسيسية",
      marks: 1,
      difficulty: "easy",
      subjectId: "physics",
      unitId,
      unitTitle,
    },
    {
      id: `phy_${unitId}_3`,
      type: "essay",
      question: "سؤال مقالي: علل فيزيائياً: يُفضل نقل الطاقة الكهربية من محطات التوليد إلى مناطق الاستهلاك تحت جهود كهربية عالية جداً باستخدام محولات رافعة للجهد.",
      modelAnswer: `الإجابة النموذجية:\n1. عند رفع الجهد الكهربي في المحول الخافض لشدة التيار (حيث القدرة P = V × I ثابتة تقريباً)، تنخفض شدة التيار المار في خطوط النقل بدرجة كبيرة.\n2. القدرة المستهلكة أو المفقودة في أسلاك النقل على شكل حرارة تتناسب مع مربع شدة التيار (P_loss = I² × R).\n3. يؤدي تقليل التيار إلى تقليل الفقد في الطاقة عبر الأسلاك إلى أدنى حد ممكن، مع إمكانية استخدام أسلاك أقل سمكاً وأقل تكلفة.`,
      rubric: [
        "ذكر العلاقة بين رفع الجهد وخفض شدة التيار I (1.0 درجة)",
        "تطبيق قانون القدرة المفقودة حرارياً P = I²R وتأكيد تقليل الفقد (1.0 درجة)"
      ],
      explanation: "سؤال وزاري نمطي في امتحانات الثانوية العامة يربط بين قوانين القدرة والمحولات الكهربية وتطبيقاتها الحياتية.",
      hint: "اربط بين P = V I وقانون القدرة المفقودة حرارياً P_loss = I² R.",
      ministryStandard: "سؤال مقالي مقنن: تعليل وتطبيق قوانين القدرة (درجتان)",
      marks: 2,
      difficulty: "hard",
      subjectId: "physics",
      unitId,
      unitTitle,
    }
  ],

  chemistry: (unitId, unitTitle) => [
    {
      id: `chem_${unitId}_1`,
      type: "multiple_choice",
      question: "عند إضافة قطرات من محلول هيدروكسيد الصوديوم إلى محلول كلوريد الحديد (III)، يتكون راسب لونه:",
      options: ["بني محمر جيلاتيني", "أبيض مخضر", "أزرق", "أسود"],
      correctIndex: 0,
      exclusionReasoning: [
        "الخيار (أ) صحيح: يتكون هيدروكسيد الحديد (III) Fe(OH)3 وهو راسب بني محمر جيلاتيني يذوب في الأحماض.",
        "الخيار (ب) مستبعد: الراسب الأبيض المخضر هو هيدروكسيد الحديد (II) Fe(OH)2.",
        "الخيار (ج) مستبعد: الراسب الأزرق يميز كاتيون النحاس (II).",
        "الخيار (د) مستبعد: كبريتيد الحديد (II) أو أكسيد النحاس هما من الرواسب السوداء الشهيرة.",
      ],
      explanation: "FeCl3 + 3NaOH ➔ Fe(OH)3 (راسب بني محمر) + 3NaCl.",
      hint: "يميز كاتيون الحديد ثلاثي التكافؤ.",
      ministryStandard: "بابل شيت: الكشف عن الكاتيونات في التحليل الكيميائي",
      marks: 1,
      difficulty: "easy",
      subjectId: "chemistry",
      unitId,
      unitTitle,
    },
    {
      id: `chem_${unitId}_tf1`,
      type: "true_false",
      question: "ضع علامة (صح) أو (خطأ): يعمل العامل الحفاز على زيادة كمية النواتج عند الاتزان في التفاعلات الانعكاسية.",
      isTrue: false,
      correction: "التصويب الكيميائي المعتمد: العامل الحفاز لا يؤثر على موضع الاتزان ولا يزيد كمية النواتج، بل يقلل طاقة التنشيط ويزيد سرعة التفاعلين الطردي والعكسي بنفس المقدار للوصول للاتزان في زمن أقل.",
      explanation: "قاعدة أساسية في الباب الثالث: العامل الحفاز يسرع الوصول للاتزان ولا يغير ثوابت الاتزان أو كميات المواد الناتجة.",
      hint: "تأثير العامل الحفاز على طاقة التنشيط وموضع الاتزان.",
      ministryStandard: "معيار الوزارة: الاتزان الكيميائي والعوامل الحفازة",
      marks: 1,
      difficulty: "medium",
      subjectId: "chemistry",
      unitId,
      unitTitle,
    },
    {
      id: `chem_${unitId}_2`,
      type: "fill_blank",
      question: "أكمل: ينص مبدأ ______ على أنه: 'إذا حدث تغير في أحد العوامل المؤثرة على نظام في حالة اتزان، فإن النظام ينشط في الاتجاه الذي يقلل أو يلغي هذا التأثير'.",
      correctAnswer: "لو شاتيليه",
      acceptedAnswers: ["لو شاتيليه", "لوشاتيليه", "لوشاتيلييه", "لوشاتيلية"],
      explanation: "مبدأ لو شاتيليه هو الركيزة الأساسية لفهم سلوك الأنظمة الكيميائية عند تغير التركيز أو الضغط أو درجة الحرارة.",
      hint: "العالم الفرنسي صاحب المبدأ الشهير في الاتزان.",
      ministryStandard: "استدعاء المبادئ والقوانين الكيميائية الحاكمة",
      marks: 1,
      difficulty: "medium",
      subjectId: "chemistry",
      unitId,
      unitTitle,
    },
    {
      id: `chem_${unitId}_3`,
      type: "essay",
      question: "سؤال مقالي: وضح بالمعادلات الكيميائية المتزنة أثر إضافة حمض الكبريتيك المركز الساخن إلى برادة الحديد مع تفسير تكون خليط من كبريتات الحديد (II) وكبريتات الحديد (III).",
      modelAnswer: `الإجابة النموذجية:\n1. المعادلة المتزنة:\n3Fe + 8H2SO4 (conc, Δ) ➔ FeSO4 + Fe2(SO4)3 + 4SO2↑ + 8H2O\n2. التفسير العلمي:\nحمض الكبريتيك المركز عامل مؤكسد قوي يؤكسد الحديد أولاً إلى كبريتات الحديد (II) ثم يتأكسد جزء منه إلى كبريتات الحديد (III)، وتتصاعد غازات ثاني أكسيد الكبريت SO2 ذات الرائحة النفاذة التي تخضر ورقة مبللة بكرومات البوتاسيوم.`,
      rubric: [
        "كتابة المعادلة الكيميائية موزونة وبشروط التفاعل (1.0 درجة)",
        "تفسير السلوك التأكسدي للحديد والحمض وتكون الملحين (1.0 درجة)"
      ],
      explanation: "سؤال تحليلي يجمع بين كتابة المعادلات وتفسير أكسدة العناصر الانتقالية وتكافؤاتها المتعددة.",
      hint: "تذكر أثر حمض الكبريتيك المركز كعامل مؤكسد على الحديد.",
      ministryStandard: "سؤال مقالي مقنن: معادلات تفاعل وتفسير الأكسدة والاختزال (درجتان)",
      marks: 2,
      difficulty: "hard",
      subjectId: "chemistry",
      unitId,
      unitTitle,
    }
  ],

  biology: (unitId, unitTitle) => [
    {
      id: `bio_${unitId}_1`,
      type: "multiple_choice",
      question: "أي من المواد التالية تلعب دوراً مشتركاً في كل من الدعامة التركيبية والدعامة الفسيولوجية في النبات؟",
      options: ["الكيوتين", "السليلوز", "اللجنين", "السوبرين"],
      correctIndex: 0,
      exclusionReasoning: [
        "الخيار (أ) صحيح: الكيوتين مادة غير منفذة للماء تترسب على جدر خلايا البشرة (دعامة تركيبية) وتمنع فقد الماء فترعى استمرار انتفاخ الخلايا (دعامة فسيولوجية).",
        "الخيار (ب) مستبعد: السليلوز مادة محبة ومنفذة للماء في جدر الخلايا.",
        "الخيار (ج) مستبعد: اللجنين يترسب في الأوعية والخلايا الحجرية الميتة عديمة الدعامة الفسيولوجية.",
        "الخيار (د) مستبعد: السوبرين يترسب في الخلايا الفلينية الميتة.",
      ],
      explanation: "الكيوتين يجمع بين كونه ترسيباً كيميائياً صلباً (تركيبياً) وحاجزاً مانعاً لفقدان الماء بالنتح مما يحافظ على الدعامة الفسيولوجية.",
      hint: "مادة شمعية غير منفذة للماء توجد على طبقة البشرة.",
      ministryStandard: "بابل شيت: استنتاج الربط الوظيفي بين أنواع الدعامات",
      marks: 1,
      difficulty: "medium",
      subjectId: "biology",
      unitId,
      unitTitle,
    },
    {
      id: `bio_${unitId}_tf1`,
      type: "true_false",
      question: "ضع علامة (صح) أو (خطأ): الخلايا التائية البائية البالغة تنضج وتكتسب قدرتها المناعية داخل الغدة الثيموسية.",
      isTrue: false,
      correction: "التصويب البيولوجي المعتمد: الخلايا التائية (T) هي التي تنضج وتتمايز داخل الغدة الثيموسية تحت تأثير هرمون الثيموسين، بينما الخلايا البائية (B) تنضج وتكتسب كفاءتها المناعية داخل نخاع العظام الأحمر.",
      explanation: "مقارنة محورية في مناعة الثانوية العامة: نخاع العظام ينضج فيه الخلايا البائية والقاتلة الطبيعية، والغدة الثيموسية تختص بنضج الخلايا التائية.",
      hint: "فرق بين منشأ ونضج الخلايا T والخلايا B.",
      ministryStandard: "معيار الوزارة: كشف الخلط بين الأعضاء الليمفاوية ومراكز نضج الخلايا",
      marks: 1,
      difficulty: "medium",
      subjectId: "biology",
      unitId,
      unitTitle,
    },
    {
      id: `bio_${unitId}_2`,
      type: "fill_blank",
      question: "أكمل: الرابطة التي تربط بين الأحماض الأمينية في سلسلة عديد الببتيد لتكوين البروتين تسمى الرابطة ______.",
      correctAnswer: "الببتيدية",
      acceptedAnswers: ["الببتيدية", "ببتيدية", "البيبتيدية"],
      explanation: "تتكون الروابط الببتيدية بين مجموعة الكربوكسيل لحمض أميني ومجموعة الأمين لحمض أميني مجاور مع نزع جزيء ماء.",
      hint: "رابطة تساهمية خاصة بالبروتينات.",
      ministryStandard: "المفاهيم الجزيئية الأساسية في DNA وتخليق البروتين",
      marks: 1,
      difficulty: "easy",
      subjectId: "biology",
      unitId,
      unitTitle,
    },
    {
      id: `bio_${unitId}_3`,
      type: "essay",
      question: "سؤال مقالي: فسر بيولوجياً: حدوث الشد العضلي المؤلم والمفاجئ عند بذل مجهود بدني عنيف دون إحماء، مبيناً الخطر الصحي المترتب على عدم التدخل السريع.",
      modelAnswer: `الإجابة النموذجية:\n1. التفسير البيولوجي: عند بذل مجهود عنيف تعجز كميات الأكسجين الواصلة للعضلة عن تلبية التنفس الهوائي، فتلجأ العضلة للتنفس اللاهوائي مما يسبب تراكم حمض اللاكتيك ونفاد جزيئات ATP.\n2. غياب ATP يمنع انفصال الروابط المستعرضة للميوسين عن خيوط الأكتين، فتبقى العضلة في حالة انقباض مستمر مؤلم.\n3. الخطر المترتب: قد يؤدي استمرار الشد العضلي مع محاولة الحركة الجبرية إلى حدوث تمزق عضلي ونزيف دموي حاد.`,
      rubric: [
        "تفسير آلية الشد بسبب نفاد ATP وعدم انفصال الروابط المستعرضة (1.0 درجة)",
        "بيان الخطر الصحي كحدوث تمزق عضلي ونزيف (1.0 درجة)"
      ],
      explanation: "سؤال مقالي وزاري يقيس فهم نظرية الخيوط المنزلقة لهكسلي والفسيولوجيا العضلية.",
      hint: "دور جزيئات ATP في فصل الروابط المستعرضة أثناء الانبساط.",
      ministryStandard: "سؤال مقالي مقنن: تفسير اختلالات الحركة والانقباض العضلي (درجتان)",
      marks: 2,
      difficulty: "hard",
      subjectId: "biology",
      unitId,
      unitTitle,
    }
  ],

  geography: (unitId, unitTitle) => [
    {
      id: `geo_${unitId}_1`,
      type: "multiple_choice",
      question: "من المقومات الطبيعية التي تمنح الدولة عمقاً استراتيجياً وتتيح لها خطة الدفاع بالعمق وقت الحروب:",
      options: ["المساحة الكبيرة", "الشكل المندمج", "الموقع البحري", "المناخ المعتدل"],
      correctIndex: 0,
      exclusionReasoning: [
        "الخيار (أ) صحيح: المساحة الكبيرة تتيح للدولة نقل مصانعها وقواتها وسكانها للداخل وتطبيق نظرية الدفاع بالعمق كما فعلت روسيا ضد نابليون وهتلر.",
        "الخيار (ب) مستبعد: الشكل المندمج يسهل السيطرة وحسن الإدارة لكنه لا يوفر بالضرورة عمقاً استراتيجياً إذا كانت المساحة صغيرة.",
        "الخيار (ج) مستبعد: الموقع البحري يوفر اتصالا بالعالم الخارجي ولكنه يعرض السواحل للتهديدات البحرية المباشرة.",
        "الخيار (د) مستبعد: المناخ يؤثر على النشاط البشري وليس على مسرح العمليات العسكرية للعمق.",
      ],
      explanation: "المساحة الكبيرة للدولة توفر لها عمقاً جغرافياً استراتيجياً لتطبيق استراتيجيات الانسحاب التكتيكي والدفاع بالعمق.",
      hint: "عنصر يرتبط بمدى اتساع أراضي الدولة وإمكانية المناورة المكانية.",
      ministryStandard: "بابل شيت: تحليل أثر المقومات الجغرافية في قوة الدولة العسكرية",
      marks: 1,
      difficulty: "medium",
      subjectId: "geography",
      unitId,
      unitTitle,
    },
    {
      id: `geo_${unitId}_tf1`,
      type: "true_false",
      question: "ضع علامة (صح) أو (خطأ): تعد الحدود الجبلية أكثر أنواع الحدود السياسية منعة وصعوبة في الاختراق وأقلها وضوحاً في الطبيعة.",
      isTrue: false,
      correction: "التصويب الجغرافي المعتمد: الحدود الجبلية هي بالفعل أكثر الحدود منعة وأسهلها دفاعاً، ولكنها تتميز بأنها شديدة الوضوح في الطبيعة ومرئية بالعين المجردة وليست قليلة الوضوح.",
      explanation: "دقة الصياغة الجغرافية الوزارية: الجبال ظاهرات طبيعية بالغة الوضوح والارتفاع وتشكل حواجز طبيعية ممتازة واستراتيجية.",
      hint: "هل الجبال واضحة ومرئية في الطبيعة كخطوط حدودية أم غامضة؟",
      ministryStandard: "معيار الوزارة: نقد وتدقيق خصائص الحدود الطبيعية",
      marks: 1,
      difficulty: "medium",
      subjectId: "geography",
      unitId,
      unitTitle,
    },
    {
      id: `geo_${unitId}_2`,
      type: "fill_blank",
      question: "أكمل: يُعتبر العالم الألماني ______ هو المؤسس الحقيقي للجغرافيا السياسية ووضع أول مؤلف علمي يحمل اسمها عام 1897م.",
      correctAnswer: "فريدريك راتزل",
      acceptedAnswers: ["راتزل", "فريدريك راتزل", "راتزيل"],
      explanation: "راتزل شبه الدولة بالكائن الحي الذي يخضع لقوانين الميلاد والنمو والوفاة.",
      hint: "العالم الألماني الشهير صاحب تشبيه الدولة بالكائن الحي.",
      ministryStandard: "استدعاء رواد الفكر الجغرافي السياسي",
      marks: 1,
      difficulty: "easy",
      subjectId: "geography",
      unitId,
      unitTitle,
    },
    {
      id: `geo_${unitId}_3`,
      type: "essay",
      question: "سؤال مقالي: ما العلاقة بين التطور التكنولوجي في وسائل الاستشعار عن بعد وسقوط نظرية 'الحدود الطبيعية الآمنة' في الجغرافيا السياسية المعاصرة؟",
      modelAnswer: `الإجابة النموذجية:\n1. أدى التطور الهائل في التقنيات الحديثة وتكنولوجيا الصواريخ العابرة للقارات والطائرات المسيرة والأقمار الصناعية إلى تقليل فاعلية العوائق الطبيعية كالجبال والبحار والصحاري.\n2. سقطت نظرية الحد الآمن لأن السلاح الحديث بات قادراً على اختراق أعتى التحصينات الطبيعية وتخطي الحدود والموانع الجغرافية بسرعة ودقة استهداف فائقة.\n3. أصبحت الحماية تعتمد على الدفاع الجوي والتفوق التكنولوجي السيبراني أكثر من مجرد الاستناد لحاجز جبلي أو نهري.`,
      rubric: [
        "توضيح أثر الصواريخ والطائرات في تخطي الحواجز الطبيعية (1.0 درجة)",
        "استنتاج سقوط نظرية الحد الآمن لصالح التفوق التكنولوجي (1.0 درجة)"
      ],
      explanation: "سؤال وزاري يقيس القدرة على استنتاج أثر التكنولوجيا العسكرية في إبطال المفاهيم الجيوسياسية التقليدية.",
      hint: "كيف أثرت الصواريخ الدقيقة وتكنولوجيا الأقمار الصناعية على حماية الجبال؟",
      ministryStandard: "سؤال مقالي مقنن: علاقة التقنيات الحديثة بالأمن الجغرافي (درجتان)",
      marks: 2,
      difficulty: "hard",
      subjectId: "geography",
      unitId,
      unitTitle,
    }
  ]
};

/**
 * High-quality preset diverse questions for units when offline or generating immediately
 */
export const getUnitDiverseQuestions = (
  subject: Subject | null,
  unit: Unit | null,
  requestedType: QuizQuestionType | "mixed" = "mixed",
  difficulty: "easy" | "medium" | "hard" | "adaptive" = "medium",
  questionCount: number = 6
): QuizQuestion[] => {
  const subjectId = subject?.id || "math";
  const unitId = unit?.id || "math_u1";
  const unitTitle = unit?.title || "الوحدة الأولى";
  const subjectTitle = subject?.title || "المادة الدراسية";

  const generator = SUBJECT_SPECIFIC_POOLS[subjectId];
  let pool: QuizQuestion[] = [];

  if (generator) {
    pool = generator(unitId, unitTitle);
  } else {
    pool = SUBJECT_SPECIFIC_POOLS.math(unitId, unitTitle);
  }

  // If the unit has specific lesson test questions, append them to the pool
  if (unit && unit.lessons) {
    unit.lessons.forEach((les, idx) => {
      if (les.testQuestion && !pool.some((p) => p.question.includes(les.title))) {
        pool.push({
          id: `les_q_${les.id}_${idx}`,
          type: "multiple_choice",
          question: `[${les.title}] ${les.testQuestion.question}`,
          options: les.testQuestion.options,
          correctIndex: les.testQuestion.correctIndex,
          exclusionReasoning: [
            `الخيار الصحيح يطابق مباشرة القاعدة العلمية المقررة لدرس (${les.title}).`,
            "البدائل الأخرى تمثل مشتتات مفاهيمية شائعة استبعدها النموذج الوزاري."
          ],
          explanation: les.testQuestion.explanation,
          ministryStandard: "بابل شيت تطبيقي وفق مخرجات التعلم",
          marks: 1,
          difficulty: "medium",
          subjectId,
          unitId,
          unitTitle,
        });
      }

      // Add lesson-derived True/False question
      if (les.objectives && les.objectives.length > 0 && idx % 2 === 0) {
        const obj = les.objectives[0];
        pool.push({
          id: `tf_dyn_${les.id}_${idx}`,
          type: "true_false",
          question: `صواب أم خطأ في درس (${les.title}): الهدف التعليمي الأساسي يقتضي بأن "${obj}".`,
          isTrue: true,
          correction: `تأكيد علمي تربوي: العبارة صحيحة تماماً وتوافق مخرجات تعلم درس (${les.title}) بكتاب الوزارة.`,
          explanation: `يعد هذا المفهوم من الركائز الأساسية التي تنص عليها خطة تدريس وزارة التربية والتعليم لوحدة ${unitTitle}.`,
          ministryStandard: "معايير الوزارة: صواب وخطأ مفاهيمي",
          marks: 1,
          difficulty: "easy",
          subjectId,
          unitId,
          unitTitle,
        });
      }

      // Add lesson-derived Essay question from worked example or key laws
      if (les.workedExample && idx === 0) {
        pool.push({
          id: `essay_dyn_${les.id}_${idx}`,
          type: "essay",
          question: `سؤال مقالي تطبيقي في درس (${les.title}): ${les.workedExample.problem} اذكر خطوات التفكير العلمي والحل المنطقي للوصول للنتيجة.`,
          modelAnswer: `خطوات الحل والنموذج الإرشادي:\n${les.workedExample.solutionSteps.join("\n")}\n\nملحوظة توجيهية: ${les.workedExample.note}`,
          rubric: [
            "تطبيق القانون وتحديد المعطيات الفيزيائية/الرياضية بدقة (1.0 درجة)",
            "الحساب الرياضي الصحيح وكتابة وحدة القياس أو التعليل (1.0 درجة)"
          ],
          explanation: `سؤال مقالي يطابق معايير بنك الأسئلة الوزاري في القياس والتطبيق المباشر لمحتوى درس (${les.title}).`,
          hint: "تأمل المسألة واستحضر القانون المعياري المناسب للدرس.",
          ministryStandard: "سؤال مقالي مقنن: حل مشكلات وتطبيق خطوات (درجتان)",
          marks: 2,
          difficulty: "hard",
          subjectId,
          unitId,
          unitTitle,
        });
      }
    });
  }

  // Filter by requested type if specified
  let filtered = pool;
  if (requestedType !== "mixed") {
    filtered = pool.filter((q) => q.type === requestedType);
    if (filtered.length === 0) filtered = pool;
  }

  // Limit or slice to questionCount
  if (filtered.length > questionCount) {
    return filtered.slice(0, questionCount);
  }

  return filtered;
};
