import { QuizQuestion } from "../types";

export interface MonthlySubjectSection {
  subjectId: string;
  subjectTitle: string;
  icon: string;
  color: string;
  badgeBg: string;
  totalMarks: number;
  questions: QuizQuestion[];
  focusTopics: string[];
}

export interface MonthlyExam {
  id: string;
  monthId: "october" | "november" | "midterm" | "march" | "april" | "final_mock";
  monthName: string;
  title: string;
  term: 1 | 2;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  badge: string;
  status: "available" | "upcoming";
  subjects: MonthlySubjectSection[];
}

export interface SubjectEvaluationResult {
  subjectId: string;
  subjectTitle: string;
  icon: string;
  score: number;
  maxScore: number;
  percentage: number;
  gradeLabel: "ممتاز" | "جيد جداً" | "جيد" | "بحاجة لدعم";
  gradeBadgeClass: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  recommendedLessonId?: string;
}

export interface MonthlyExamEvaluation {
  id: string;
  examId: string;
  examTitle: string;
  date: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  overallGrade: string;
  timeSpentSeconds: number;
  subjectResults: SubjectEvaluationResult[];
  generalFeedback: string;
  xpEarned: number;
}

export const MONTHLY_EXAMS: MonthlyExam[] = [
  {
    id: "exam_october",
    monthId: "october",
    monthName: "أكتوبر",
    title: "اختبار شهر أكتوبر الشامل لجميع المواد 🍂",
    term: 1,
    description: "الامتحان الشهري الرسمي الأول المقرّر من وزارة التربية والتعليم، يغطي مقررات شهر أكتوبر في كافة المواد الدراسية بنظام البابل شيت والمقالي التحليلي.",
    durationMinutes: 45,
    totalMarks: 60,
    badge: "مقرر شهر أكتوبر المعتمد",
    status: "available",
    subjects: [
      {
        subjectId: "math",
        subjectTitle: "الرياضيات",
        icon: "📐",
        color: "text-indigo-600",
        badgeBg: "bg-indigo-50 border-indigo-200 text-indigo-700",
        totalMarks: 10,
        focusTopics: ["الأعداد المركبة (ت)", "تحديد نوع جذري المعادلة التربيعية", "المميز ب² - 4أ جـ"],
        questions: [
          {
            id: "oct_m_1",
            type: "multiple_choice",
            question: "ما هي قيمة المقدار (1 + ت)¹⁰ في أبسط صورة؟",
            options: ["32ت", "-32ت", "32", "-32"],
            correctIndex: 0,
            explanation: "(1 + ت)¹⁰ = [ (1 + ت)² ]⁵ = [ 1 + 2ت + ت² ]⁵ = [ 2ت ]⁵ = 32ت⁵ = 32ت.",
            hint: "فكك القوس إلى أس 2 الكل أس 5.",
            difficulty: "medium",
            subjectId: "math",
            unitTitle: "الجبر والعلاقات",
          },
          {
            id: "oct_m_2",
            type: "multiple_choice",
            question: "إذا كان جذرا المعادلة س² - 6س + ك = 0 حقيقيين متساويين، فإن ك تساوي:",
            options: ["6", "9", "-9", "36"],
            correctIndex: 1,
            explanation: "يكون الجذران حقيقيين متساويين عندما يكون المميز = 0. ب² - 4أ جـ = (-6)² - 4(1)(ك) = 36 - 4ك = 0 ⬅️ ك = 9.",
            hint: "المميز ب² - 4أ جـ يساوي صفراً.",
            difficulty: "easy",
            subjectId: "math",
            unitTitle: "الجبر والعلاقات",
          },
          {
            id: "oct_m_3",
            type: "essay",
            question: "سؤال مقالي: أوجد في ح مجموعة حل المعادلة س² + 4 = 0 ومجموعة حلها في مجموعة الأعداد المركبة ك، موضحاً خطوات الحل والفرق بين المجموعتين.",
            modelAnswer: "الحل النموذجي:\n1) في مجموعة الأعداد الحقيقية (ح): س² = -4، لا يوجد جذر تربيعي لعدد سالب في ح، إذن م.ح في ح = ∅.\n2) في مجموعة الأعداد المركبة (ك): س² = 4ت² ⬅️ س = ± 2ت، إذن م.ح في ك = { 2ت ، -2ت }.\n3) الفرق: الأعداد المركبة توسع نظام الأعداد لتشمل حلول الجذور السالبة.",
            rubric: ["تحديد مجموعة الحل في ح = ∅ (1 درجة)", "إيجاد الجذرين التخيليين ±2ت في ك (1.5 درجة)", "صياغة المفهوم الرياضي والتعليل (0.5 درجة)"],
            explanation: "العدد التخيلي ت² = -1 يمكننا من إيجاد حلول للمعادلات التي ليس لها حل في الأعداد الحقيقية.",
            hint: "س² = 4ت² لأن ت² = -1.",
            difficulty: "medium",
            subjectId: "math",
            unitTitle: "الجبر والعلاقات",
          },
        ],
      },
      {
        subjectId: "integrated_science",
        subjectTitle: "العلوم المتكاملة",
        icon: "🔬",
        color: "text-teal-600",
        badgeBg: "bg-teal-50 border-teal-200 text-teal-700",
        totalMarks: 10,
        focusTopics: ["الروابط الهيدروجينية", "شذوذ كثافة الماء عند 4°C", "الحرارة النوعية"],
        questions: [
          {
            id: "oct_s_1",
            type: "multiple_choice",
            question: "شذوذ كثافة الماء عند انخفاض درجة حرارته عن 4 درجات مئوية يؤدي إلى:",
            options: [
              "زيادة الكثافة وهبوط الجليد إلى القاع",
              "نقصان الكثافة وتمدد الماء ليطفو الجليد على السطح حامياً الكائنات المائية",
              "انعدام الروابط الهيدروجينية تماماً",
              "تبخر الماء فوراً عند الصفر المئوي"
            ],
            correctIndex: 1,
            explanation: "عند انخفاض الحرارة دون 4°C، تتجمع جزيئات الماء بالروابط الهيدروجينية مكونة بلورات سداسية الشكل كبيرة الحجم بينها فراغات، فيزداد الحجم وتقل الكثافة ويطفو الجليد.",
            hint: "تذكر السبب الذي يجعل الأسماك تعيش في قاع البحيرات المتجمدة.",
            difficulty: "easy",
            subjectId: "integrated_science",
            unitTitle: "النظام البيئي المائي",
          },
          {
            id: "oct_s_2",
            type: "fill_blank",
            question: "أكمل: يُعرَّف التغير غير المعتاد في حجم الماء وكثافته عند درجات الحرارة بين 0°C و 4°C بظاهرة ______.",
            correctAnswer: "شذوذ كثافة الماء",
            acceptedAnswers: ["شذوذ الماء", "شذوذ كثافة الماء", "شذوذ الكثافة"],
            explanation: "شذوذ كثافة الماء هي الخاصية الحيوية التي تحمي النظام البيئي المائي من التجمد الكامل.",
            hint: "خاصية فريدة للماء تخص كثافته.",
            difficulty: "easy",
            subjectId: "integrated_science",
            unitTitle: "النظام البيئي المائي",
          },
          {
            id: "oct_s_3",
            type: "essay",
            question: "علل علمياً: يتميز الماء بارتفاع حرارته النوعية مقارنة بمعظم السوائل، وما أثر ذلك على كوكب الأرض والإنسان؟",
            modelAnswer: "التعليل النموذجي:\n1) بسبب قوة وعدد الروابط الهيدروجينية بين جزيئات الماء التي تتطلب طاقة حرارية كبيرة لكسرها.\n2) أثره على الأرض: تعمل المحيطات كخزان حراري ضخم ينظم درجات حرارة المناخ ليلاً ونهاراً.\n3) أثره على الكائنات الحية: يحافظ على ثبات درجة حرارة أجسام الكائنات الحية (نحو 37°C في الإنسان) دون تقلب مفاجئ.",
            rubric: ["ذكر دور الروابط الهيدروجينية (1 درجة)", "بيان الأثر المناخي للأرض (1 درجة)", "توضيح الأثر الحيوي في الكائنات (1 درجة)"],
            explanation: "الحرارة النوعية للماء تبلغ 4.18 جول/جم.°م وهي من أعلى القيم بين المواد المعروفة.",
            hint: "اربط بين الروابط الهيدروجينية وتثبيت حرارة جسم الإنسان والمحيطات.",
            difficulty: "hard",
            subjectId: "integrated_science",
            unitTitle: "النظام البيئي المائي",
          },
        ],
      },
      {
        subjectId: "arabic",
        subjectTitle: "اللغة العربية",
        icon: "📖",
        color: "text-amber-600",
        badgeBg: "bg-amber-50 border-amber-200 text-amber-700",
        totalMarks: 10,
        focusTopics: ["كان وأخواتها التامة والناقصة", "أفعال المقاربة والرجاء والشروع"],
        questions: [
          {
            id: "oct_ar_1",
            type: "multiple_choice",
            question: "في قول الشاعر: «إذا كان الشتاءُ فأدفئوني .. فإن الشيخَ يَهْدِمُهُ الشتاءُ»، نوع (كان) وإعراب (الشتاءُ) الأول:",
            options: [
              "ناقصة، واسم كان مرفوع",
              "تامة، وفاعـل مرفوع وعلامة رفعه الضمة الظاهرة",
              "زائدة لا عمل لها",
              "حرف ناسخ يفيد التوكيد"
            ],
            correctIndex: 1,
            explanation: "(كان) هنا تامة بمعنى (أقبل أو حدث الشتاء)، واكتفت بمرفوعها فقط، فيعرب (الشتاءُ) فاعلاً مرفوعاً.",
            hint: "احذف (كان)، هل يتبقى مبتدأ وخبر ذو معنى مفيد؟",
            difficulty: "medium",
            subjectId: "arabic",
            unitTitle: "النحو (كان وأخواتها)",
          },
          {
            id: "oct_ar_2",
            type: "fill_blank",
            question: "أكمل: إذا جاءت أفعال الشروع مثل (بدأ، شرع، أخذ) وجاء خبرها مفرداً أو اسماً صريحاً دون فعل مضارع، فإنها تصبح أفعالاً ______ وترفع فاعلاً.",
            correctAnswer: "تامة",
            acceptedAnswers: ["تامة", "أفعال تامة"],
            explanation: "شرط عمل أفعال الشروع كناقصة أن يكون خبرها جملة فعلية فعلها مضارع ممتنع الاقتران بأن، وإلا كانت تامة.",
            hint: "عكس ناقصة.",
            difficulty: "easy",
            subjectId: "arabic",
            unitTitle: "النحو (كاد وأخواتها)",
          },
        ],
      },
      {
        subjectId: "english",
        subjectTitle: "اللغة الإنجليزية",
        icon: "🌐",
        color: "text-blue-600",
        badgeBg: "bg-blue-50 border-blue-200 text-blue-700",
        totalMarks: 10,
        focusTopics: ["Past Continuous vs Past Simple", "While, As, When, During", "Ecotourism Vocabulary"],
        questions: [
          {
            id: "oct_en_1",
            type: "multiple_choice",
            question: "Choose the correct answer: While the lesson ________, the electricity suddenly went out.",
            options: [
              "was explaining",
              "was being explained",
              "explained",
              "has explained"
            ],
            correctIndex: 1,
            explanation: "The lesson is passive (was being explained) in the past continuous because it was in progress when interrupted.",
            hint: "Pay attention: the lesson does not explain itself! It is passive.",
            difficulty: "hard",
            subjectId: "english",
            unitTitle: "Unit 1: Grammar",
          },
          {
            id: "oct_en_2",
            type: "fill_blank",
            question: "Fill in the blank: The holiday designed to protect the natural environment and help local people is called ______.",
            correctAnswer: "ecotourism",
            acceptedAnswers: ["ecotourism", "eco-tourism"],
            explanation: "Ecotourism is responsible travel to natural areas that conserves the environment.",
            hint: "Eco + tourism.",
            difficulty: "easy",
            subjectId: "english",
            unitTitle: "Unit 1: Vocabulary",
          },
        ],
      },
      {
        subjectId: "philosophy",
        subjectTitle: "الفلسفة والتفكير",
        icon: "💡",
        color: "text-purple-600",
        badgeBg: "bg-purple-50 border-purple-200 text-purple-700",
        totalMarks: 10,
        focusTopics: ["أخطاء التفكير الذاتية", "القابلية للاستهواء", "تغليب العاطفة على العقل"],
        questions: [
          {
            id: "oct_ph_1",
            type: "multiple_choice",
            question: "سارع شخص إلى تصديق شائعة حول تأجيل الدراسة دون فحص الدليل أو مراجعة المصدر الرسمي. يمثل هذا السلوك عامل:",
            options: [
              "تغليب العاطفة على العقل",
              "القابلية للاستهواء",
              "التعصب والتطرف",
              "غموض اللغة وصعوبة المشكلة"
            ],
            correctIndex: 1,
            explanation: "القابلية للاستهواء تعني سرعة تصديق ما ينقله الآخرون دون فحص أو تمحيص نقدي، وهي سبب انتشار الشائعات.",
            hint: "سرعة التصديق دون دليل.",
            difficulty: "easy",
            subjectId: "philosophy",
            unitTitle: "مبادئ التفكير الإنساني",
          },
        ],
      },
      {
        subjectId: "history",
        subjectTitle: "التاريخ",
        icon: "🏛️",
        color: "text-amber-700",
        badgeBg: "bg-amber-100 border-amber-300 text-amber-800",
        totalMarks: 10,
        focusTopics: ["المصادر الأولية والثانوية", "النقود والمسكوكات", "الأوستراكا"],
        questions: [
          {
            id: "oct_hi_1",
            type: "multiple_choice",
            question: "اعتمدت الطبقات المتوسطة والفقيرة في مصر الفرعونية على (الأوستراكا) بدلاً من البردي لأسباب:",
            options: [
              "دينية وعقائدية",
              "اقتصادية ترتبط بارتفاع تكلفة ورق البردي وسهولة الحصول على الفخار المكسور",
              "سياسية تمنع الشعب من استخدام البردي",
              "جغرافية لعدم وجود نبات البردي في مصر"
            ],
            correctIndex: 1,
            explanation: "الأوستراكا هي شقافات الفخار والأحجار المكسورة، وتوفرت مجاناً للطبقات المتوسطة والفقيرة للتدريب على الكتابة والإيصالات نظراً لغلاء سعر البردي.",
            hint: "اربط بين تكلفة البردي وتوفر الفخار المكسور.",
            difficulty: "easy",
            subjectId: "history",
            unitTitle: "مصادر دراسة الحضارات",
          },
        ],
      },
    ],
  },
  {
    id: "exam_november",
    monthId: "november",
    monthName: "نوفمبر",
    title: "اختبار شهر نوفمبر الشامل لجميع المواد ❄️",
    term: 1,
    description: "الامتحان الشهري الثاني لتقييم المكتسبات المعرفية لشهر نوفمبر في الجبر والفيزياء والكيمياء والأدب وقواعد اللغات والتفكير العلمي.",
    durationMinutes: 45,
    totalMarks: 60,
    badge: "مقرر شهر نوفمبر المعتمد",
    status: "available",
    subjects: [
      {
        subjectId: "math",
        subjectTitle: "الرياضيات",
        icon: "📐",
        color: "text-indigo-600",
        badgeBg: "bg-indigo-50 border-indigo-200 text-indigo-700",
        totalMarks: 10,
        focusTopics: ["إشارة الدالة", "المتباينات التربيعية", "الزاوية الموجهة"],
        questions: [
          {
            id: "nov_m_1",
            type: "multiple_choice",
            question: "إشارة الدالة د(س) = س² - 4 تكون سالبة عندما س تنتمي إلى الفترة:",
            options: ["[-2 ، 2]", "(-2 ، 2)", "ح - [-2 ، 2]", "ح - (-2 ، 2)"],
            correctIndex: 1,
            explanation: "جذرا المعادلة هما -2 و 2. الإشارة بين الجذرين تكون عكس إشارة معامل س² (أي سالبة)، إذن الفترة المفتوحة (-2 ، 2).",
            hint: "بين الجذرين عكس إشارة معامل س².",
            difficulty: "medium",
            subjectId: "math",
            unitTitle: "الجبر والعلاقات",
          },
        ],
      },
      {
        subjectId: "integrated_science",
        subjectTitle: "العلوم المتكاملة",
        icon: "🔬",
        color: "text-teal-600",
        badgeBg: "bg-teal-50 border-teal-200 text-teal-700",
        totalMarks: 10,
        focusTopics: ["الاتزان الإشعاعي للأرض", "تكنولوجيا النانو", "الاحتباس الحراري"],
        questions: [
          {
            id: "nov_s_1",
            type: "multiple_choice",
            question: "أي من الغازات الآتية يعد غازاً دفيئاً يمتص الإشعاع تحت الأحمر المعاد انبعاثه من الأرض؟",
            options: ["غاز الأكسجين O2", "ثاني أكسيد الكربون CO2 والميثان CH4", "النيتروجين N2", "غاز الأرجون Ar"],
            correctIndex: 1,
            explanation: "الغازات الدفيئة تمتلك روابط قادرة على امتصاص الأشعة تحت الحمراء طويلة الموجة وحبس الحرارة.",
            hint: "الغازات المسببة للاحتباس الحراري.",
            difficulty: "easy",
            subjectId: "integrated_science",
            unitTitle: "الغلاف الجوي والطاقة",
          },
        ],
      },
      {
        subjectId: "arabic",
        subjectTitle: "اللغة العربية",
        icon: "📖",
        color: "text-amber-600",
        badgeBg: "bg-amber-50 border-amber-200 text-amber-700",
        totalMarks: 10,
        focusTopics: ["أفعال المقاربة والرجاء والشروع", "أقسام البلاغة والتشبيه"],
        questions: [
          {
            id: "nov_ar_1",
            type: "multiple_choice",
            question: "حكم اقتران خبر الفعل (عسى) و (أوشك) بـ (أن):",
            options: ["يمتنع", "يقل", "يكثر", "يجب"],
            correctIndex: 2,
            explanation: "أوشك وعسى يكثر اقتران خبرهما بأن. بينما كاد وكرب يقل، وحرى واخلولق يجب، وأفعال الشروع يمتنع.",
            hint: "عسى وأوشك يكثر.",
            difficulty: "medium",
            subjectId: "arabic",
            unitTitle: "النحو العربي",
          },
        ],
      },
      {
        subjectId: "english",
        subjectTitle: "اللغة الإنجليزية",
        icon: "🌐",
        color: "text-blue-600",
        badgeBg: "bg-blue-50 border-blue-200 text-blue-700",
        totalMarks: 10,
        focusTopics: ["Present Perfect Simple", "Since vs For", "Supporting Conservation"],
        questions: [
          {
            id: "nov_en_1",
            type: "multiple_choice",
            question: "I haven't seen Omar ________ he traveled to London.",
            options: ["for", "since", "ago", "when"],
            correctIndex: 1,
            explanation: "Since is followed by a past simple clause (he traveled) and preceded by present perfect.",
            hint: "Followed by a specific starting point/past action.",
            difficulty: "easy",
            subjectId: "english",
            unitTitle: "Unit 2: Grammar",
          },
        ],
      },
      {
        subjectId: "philosophy",
        subjectTitle: "الفلسفة والتفكير",
        icon: "💡",
        color: "text-purple-600",
        badgeBg: "bg-purple-50 border-purple-200 text-purple-700",
        totalMarks: 10,
        focusTopics: ["العوامل الموضوعية لأخطاء التفكير", "غموض اللغة وصعوبة المشكلة"],
        questions: [
          {
            id: "nov_ph_1",
            type: "multiple_choice",
            question: "استخدام كلمات تحتمل أكثر من معنى (مثل: جُبن - عين) دون تحديد السياق الدقيق يوقع في خطأ:",
            options: ["غموض اللغة وعدم الدقة في استخدام ألفاظها", "تغليب العاطفة", "التعصب والتطرف", "نقص المعلومات"],
            correctIndex: 0,
            explanation: "عدم الدقة في استخدام اللغة والكلمات المشتركة لغوياً هي أحد أبرز العوامل الموضوعية لأخطاء التفكير.",
            hint: "عامل مرتبط باللغة والألفاظ.",
            difficulty: "easy",
            subjectId: "philosophy",
            unitTitle: "أخطاء التفكير",
          },
        ],
      },
      {
        subjectId: "history",
        subjectTitle: "التاريخ",
        icon: "🏛️",
        color: "text-amber-700",
        badgeBg: "bg-amber-100 border-amber-300 text-amber-800",
        totalMarks: 10,
        focusTopics: ["عوامل قيام الحضارة المصرية", "نهر النيل والموقع الجغرافي"],
        questions: [
          {
            id: "nov_hi_1",
            type: "multiple_choice",
            question: "مثل نهر النيل المعلم الأول للمصريين القدماء في التضامن والتماسك لمواجهة الفيضان وإقامة الجسور، وهذا يعكس القيمة:",
            options: ["الاقتصادية البحتة", "الاجتماعية والقومية في الوحدة والتكافل", "العسكرية الدفاعية", "البيئية السلبية"],
            correctIndex: 1,
            explanation: "علم نهر النيل المصريين التكافل والتعاون لحماية الأرض وإقامة السدود وتقسيم المياه بالعدل.",
            hint: "قيمة التضامن والتعاون المشترك.",
            difficulty: "easy",
            subjectId: "history",
            unitTitle: "عوامل قيام الحضارات",
          },
        ],
      },
    ],
  },
  {
    id: "exam_midterm",
    monthId: "midterm",
    monthName: "نصف العام",
    title: "امتحان نصف العام التجريبي الشامل لكافة المواد 🏆",
    term: 1,
    description: "المحاكاة الوزارية الكبرى لامتحانات الفصل الدراسي الأول لجميع المواد الست في جلسة واحدة مدمجة مع تقرير تقييم تشخيصي كامل.",
    durationMinutes: 60,
    totalMarks: 80,
    badge: "محاكاة منتصف العام الرسمية",
    status: "available",
    subjects: [
      {
        subjectId: "math",
        subjectTitle: "الرياضيات",
        icon: "📐",
        color: "text-indigo-600",
        badgeBg: "bg-indigo-50 border-indigo-200 text-indigo-700",
        totalMarks: 15,
        focusTopics: ["الجبر الشامل", "حساب المثلثات والزوايا المنتسبة", "الهندسة والتشابه"],
        questions: [
          {
            id: "mid_m_1",
            type: "multiple_choice",
            question: "إذا كان (س + 2ت) = (5 + ص ت)، فإن قيمة (س + ص) تساوي:",
            options: ["7", "3", "10", "-3"],
            correctIndex: 0,
            explanation: "بتساوي الجزأين الحقيقيين: س = 5، وبتساوي الجزأين التخيليين: ص = 2. إذن س + ص = 5 + 2 = 7.",
            hint: "الحقيقي يساوي الحقيقي، والتخيلي يساوي التخيلي.",
            difficulty: "easy",
            subjectId: "math",
            unitTitle: "الأعداد المركبة",
          },
        ],
      },
      {
        subjectId: "integrated_science",
        subjectTitle: "العلوم المتكاملة",
        icon: "🔬",
        color: "text-teal-600",
        badgeBg: "bg-teal-50 border-teal-200 text-teal-700",
        totalMarks: 15,
        focusTopics: ["خصائص الماء والبيئة المائية", "الاتزان الطاقي والنانو"],
        questions: [
          {
            id: "mid_s_1",
            type: "multiple_choice",
            question: "تتميز المواد النانوية بنشاط كيميائي فائق مقارنة بنفس المواد في الحجم العادي بسبب:",
            options: [
              "زيادة الكتلة الكلية للمادة",
              "الزيادة الهائلة في النسبة بين مساحة السطح إلى الحجم",
              "انخفاض درجة انصهارها للصفر",
              "فقدانها لجميع إلكترونات التكافؤ"
            ],
            correctIndex: 1,
            explanation: "كلما صغر الحجم إلى مقياس النانو زادت مساحة السطح المعرض للتفاعل بشكل كبير بالنسبة للحجم.",
            hint: "النسبة بين مساحة السطح والحجم.",
            difficulty: "medium",
            subjectId: "integrated_science",
            unitTitle: "تكنولوجيا النانو والبيئة",
          },
        ],
      },
      {
        subjectId: "arabic",
        subjectTitle: "اللغة العربية",
        icon: "📖",
        color: "text-amber-600",
        badgeBg: "bg-amber-50 border-amber-200 text-amber-700",
        totalMarks: 15,
        focusTopics: ["النحو والبلاغة والأدب الجاهلي"],
        questions: [
          {
            id: "mid_ar_1",
            type: "multiple_choice",
            question: "«العلمُ نورٌ يَهدي الحائرين» نوع التشبيه في الجملة السابقة:",
            options: ["تشبيه بليغ", "تشبيه تمثيلي", "تشبيه مجمل", "استعارة تصريحية"],
            correctIndex: 0,
            explanation: "العلم نور: مشبه + مشبه به فقط دون أداة تشبيه ولا وجه شبه مخصص لهما، فهو تشبيه بليغ.",
            hint: "مشبه ومشبه به فقط.",
            difficulty: "easy",
            subjectId: "arabic",
            unitTitle: "البلاغة (التشبيه)",
          },
        ],
      },
      {
        subjectId: "english",
        subjectTitle: "اللغة الإنجليزية",
        icon: "🌐",
        color: "text-blue-600",
        badgeBg: "bg-blue-50 border-blue-200 text-blue-700",
        totalMarks: 15,
        focusTopics: ["Grammar Synthesis & Reading Analysis"],
        questions: [
          {
            id: "mid_en_1",
            type: "multiple_choice",
            question: "By the time we arrived at the station, the train ________. So we missed it.",
            options: ["had left", "has left", "leaves", "was leaving"],
            correctIndex: 0,
            explanation: "Past perfect (had left) represents the earlier completed action before our arrival.",
            hint: "The earlier action in the past.",
            difficulty: "medium",
            subjectId: "english",
            unitTitle: "General Grammar",
          },
        ],
      },
      {
        subjectId: "philosophy",
        subjectTitle: "الفلسفة والتفكير",
        icon: "💡",
        color: "text-purple-600",
        badgeBg: "bg-purple-50 border-purple-200 text-purple-700",
        totalMarks: 10,
        focusTopics: ["الفلسفة والتفكير الناقد"],
        questions: [
          {
            id: "mid_ph_1",
            type: "multiple_choice",
            question: "الانحياز الشديد لفكرة واحدة دون قبول أي مناقشة أو رأي مخالف يعبر عن:",
            options: ["التعصب والتطرف", "القابلية للاستهواء", "صعوبة المشكلة", "غموض اللغة"],
            correctIndex: 0,
            explanation: "التعصب هو الانحياز الأعمى لفكرة ما، والتطرف هو الغلو والتشدد في تأييدها أو معارضة غيرها.",
            hint: "الانحياز والتشدد.",
            difficulty: "easy",
            subjectId: "philosophy",
            unitTitle: "أخطاء التفكير",
          },
        ],
      },
      {
        subjectId: "history",
        subjectTitle: "التاريخ",
        icon: "🏛️",
        color: "text-amber-700",
        badgeBg: "bg-amber-100 border-amber-300 text-amber-800",
        totalMarks: 10,
        focusTopics: ["الحضارة والتاريخ ومصادر التعلم"],
        questions: [
          {
            id: "mid_hi_1",
            type: "multiple_choice",
            question: "تعد النقود والمسكوكات مصدراً أولياً هاماً لدراسة الحضارات القديمة لأنها تحدد:",
            options: [
              "الحالة الاقتصادية وصور الملوك والتواريخ المعاصرة",
              "أسماء جميع أفراد الشعب العاديين",
              "نسب هطول الأمطار السنوية بدقة",
              "أنواع المحاصيل الزراعية الصيفية فقط"
            ],
            correctIndex: 0,
            explanation: "المسكوكات توضح صور الحكام، تاريخ العهد، ونقاء المعدن يعكس قوة الاقتصاد الوطني.",
            hint: "صور الملوك ونقاء الذهب والفضة.",
            difficulty: "easy",
            subjectId: "history",
            unitTitle: "مصادر دراسة الحضارات",
          },
        ],
      },
    ],
  },
];
