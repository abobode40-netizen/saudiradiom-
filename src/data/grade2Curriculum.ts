import { Subject } from "../types";

export const GRADE_2ND_SUBJECTS: Subject[] = [
  {
    id: "sec2_physics",
    title: "الفيزياء (الحركة الموجية وخواص الضوء والموائع)",
    icon: "⚡",
    color: "from-blue-600 to-cyan-600",
    accentBg: "bg-blue-50 border-blue-200 text-blue-700",
    textColor: "text-blue-600",
    grade: "2nd_secondary",
    term: 1,
    totalLessons: 8,
    completedLessons: 3,
    units: [
      {
        id: "sec2_phy_u1",
        subjectId: "sec2_physics",
        title: "الوحدة الأولى: الحركة الموجية وخواص الضوء",
        description: "الموجات الطولية والمستعرضة، الانعكاس والانكسار وقانون سنل، التداخل والحيود، والانعكاس الكلي والزاوية الحرجة والمنشور.",
        order: 1,
        lessons: [
          {
            id: "sec2_phy_l1",
            unitId: "sec2_phy_u1",
            subjectId: "sec2_physics",
            title: "انكسار الضوء وقانون سنل والزاوية الحرجة",
            durationMinutes: 25,
            progressPercent: 100,
            isCompleted: true,
            description: "معامل الانكسار المطلق والنسبي، قانون سنل n1 sin θ1 = n2 sin θ2، وظاهرة الانعكاس الكلي الداخلي وتطبيقات الألياف الضوئية.",
            objectives: [
              "استخدام قانون سنل لحساب زوايا السقوط والانكسار.",
              "تحديد الزاوية الحرجة (sin φc = n2 / n1) عندما ينتقل الضوء من وسط أكبر كثافة إلى أقل كثافة ضوئية.",
              "شرح عمل الألياف الضوئية ومناظير الطب الحديث ومنشور الانعكاس الكلي."
            ],
            simplifiedSummary: "عندما ينتقل الضوء بين وسطين مختلفين في الكثافة الضوئية تتغير سرعته فينكسر مقترباً أو مبتعداً عن العمود المقام. وإذا سقط من وسط أكبر كثافة بزاوية أكبر من الزاوية الحرجة (φc)، ينعكس كلياً داخل الوسط دون نفاذ، وهي الفكرة التي تبنى عليها شبكات الإنترنت بالألياف الضوئية والمناظير الطبية.",
            keyLaws: [
              {
                title: "قانون سنل",
                formula: "n1 × sin(θ1) = n2 × sin(θ2)",
                explanation: "n1 و n2 معاملا الانكسار المطلق للوسطين، θ1 زاوية السقوط، θ2 زاوية الانكسار."
              },
              {
                title: "الزاوية الحرجة",
                formula: "sin(φc) = n2 / n1 (حيث n1 > n2)",
                explanation: "إذا كان الوسط الثاني هواء (n2=1)، فإن sin(φc) = 1 / n1."
              }
            ],
            workedExample: {
              problem: "احسب الزاوية الحرجة للزجاج مع الهواء إذا كان معامل انكسار الزجاج n = 1.5.",
              solutionSteps: [
                "القانون: sin(φc) = 1 / n = 1 / 1.5 ≈ 0.6667.",
                "φc = sin⁻¹(0.6667) ≈ 41.8°."
              ],
              note: "أي شعاع يسقط داخل الزجاج بزاوية أكبر من 41.8° سينعكس انعكاساً كلياً داخل الزجاج."
            },
            testQuestion: {
              question: "لكي يحدث انعكاس كلي لشعاع ضوئي، يجب أن ينتقل من:",
              options: [
                "وسط أكبر كثافة ضوئية لوسط أقل كثافة بزاوية سقوط أكبر من الزاوية الحرجة",
                "وسط أقل كثافة ضوئية لوسط أكبر كثافة",
                "الهواء إلى الماء فقط وبأي زاوية",
                "وسطين متساويين في معامل الانكسار"
              ],
              correctIndex: 0,
              explanation: "الانعكاس الكلي يتطلب الانتقال من وسط أعلى كثافة ضوئية لوسط أقل وبزاوية سقوط تتعدى الزاوية الحرجة."
            }
          }
        ]
      },
      {
        id: "sec2_phy_u2",
        subjectId: "sec2_physics",
        title: "الوحدة الثانية: خواص الموائع الساكنة والمتحركة",
        description: "الكثافة النسبية، الضغط في باطن سائل، قاعدة باسكال والمكبس الهيدروليكي، واللزوجة والسريان المستقر.",
        order: 2,
        lessons: [
          {
            id: "sec2_phy_l2",
            unitId: "sec2_phy_u2",
            subjectId: "sec2_physics",
            title: "قاعدة باسكال والمكبس الهيدروليكي والفائدة الآلية",
            durationMinutes: 25,
            progressPercent: 70,
            isCompleted: false,
            description: "مبدأ نقل الضغط بتمامه في السوائل المحبوسة، معادلة المكبس F/A = f/a، ومضاعفة القوة في روافع السيارات والفرامل.",
            objectives: [
              "فهم نص قاعدة باسكال وعدم انطباقها على الغازات بسبب قابليتها للانضغاط.",
              "حساب الفائدة الآلية للمكبس الهيدروليكي (η = A/a = F/f).",
              "حل مسائل روافع السيارات ومكابح المركبات الهيدروليكية."
            ],
            simplifiedSummary: "قاعدة باسكال تنص على أن أي ضغط إضافي يؤثر على سائل محبوس ينتقل بتمامه إلى جميع أجزاء السائل وجدران الإناء. لذلك بقوة صغيرة على مكبس صغير نستطيع رفع سيارة ثقيلة على مكبس كبير، لأن الضغط متساوٍ (F/A = f/a).",
            keyLaws: [
              {
                title: "معادلة المكبس الهيدروليكي",
                formula: "F / A = f / a",
                explanation: "f: القوة المؤثرة على المكبس الصغير (مساحته a)، F: القوة الناتجة على المكبس الكبير (مساحته A)."
              },
              {
                title: "الفائدة الآلية (η)",
                formula: "η = A / a = F / f = y1 / y2",
                explanation: "y1 مسافة حركة المكبس الصغير، y2 مسافة حركة المكبس الكبير."
              }
            ],
            workedExample: {
              problem: "مكبس هيدروليكي مساحة مقطع مكبسه الصغير 10 سم² والكبير 500 سم². ما القوة اللازمة على الصغير لرفع سيارة وزنها 20000 نيوتن؟",
              solutionSteps: [
                "القانون: F / A = f / a.",
                "20000 / 500 = f / 10.",
                "f = (20000 × 10) / 500 = 400 نيوتن فقط!"
              ]
            },
            testQuestion: {
              question: "لا تنطبق قاعدة باسكال على الغازات لأن:",
              options: [
                "الغازات قابلة للانضغاط لوجود مسافات بينية كبيرة بين جزيئاتها",
                "الغازات لا تمتلك كتلة",
                "كثافة الغازات أعلى من السوائل",
                "ضغط الغاز ينعدم داخل الأواني المغلقة"
              ],
              correctIndex: 0,
              explanation: "الضغط المؤثر على الغاز يستهلك جزءاً كبيراً منه في تقليص المسافات البينية وضغط الغاز، فلا ينتقل بتمامه."
            }
          }
        ]
      }
    ]
  },
  {
    id: "sec2_chemistry",
    title: "الكيمياء (بنية الذرة والجدول الدوري)",
    icon: "🧪",
    color: "from-emerald-600 to-teal-600",
    accentBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    textColor: "text-emerald-600",
    grade: "2nd_secondary",
    term: 1,
    totalLessons: 7,
    completedLessons: 4,
    units: [
      {
        id: "sec2_ch_u1",
        subjectId: "sec2_chemistry",
        title: "الوحدة الأولى: بنية الذرة وتطور النماذج الذرية",
        description: "طومسون، تجربة رذرفورد، طيف الانبعاث وبور، النظرية الذرية الحديثة، وأعداد الكم الأربعة وقواعد التوزيع الإلكتروني.",
        order: 1,
        lessons: [
          {
            id: "sec2_ch_l1",
            unitId: "sec2_ch_u1",
            subjectId: "sec2_chemistry",
            title: "أعداد الكم الأربعة وقواعد التوزيع الإلكتروني (هوند وبولى)",
            durationMinutes: 25,
            progressPercent: 90,
            isCompleted: true,
            description: "أعداد الكم: الرئيسي (n)، الثانوي (l)، المغناطيسي (ml)، والمغزلي (ms)، ومبدأ البناء التصاعدي وقاعدة هوند.",
            objectives: [
              "استنتاج قيم أعداد الكم الأربعة لأي إلكترون في الذرة.",
              "تطبيق قاعدة هوند في شغل أوربيتالات المستوى الفرعي فرادى أولاً قبل أن تزدوج.",
              "فهم مبدأ الاستبعاد لباولي (لا يتفق إلكترونان في ذرة واحدة في أعداد الكم الأربعة)."
            ],
            simplifiedSummary: "لكل إلكترون عنوان دقيق يحدده 4 أعداد: n يحدد رقم المستوى الرئيسي، l يحدد شكل المستوى الفرعي (s,p,d,f)، ml يحدد الأوربيتال الفراغي، و ms يحدد اتجاه دوران الإلكترون حول نفسه (+1/2 أو -1/2). وقاعدة هوند تنص على أن الإلكترونات تفضل أن تشغل الأوربيتالات فرادى باتجاه غزل واحد لتقليل قوى التنافر الكهروستاتيكي.",
            keyLaws: [
              {
                title: "مستويات أعداد الكم الثانوي",
                formula: "s (l=0) ، p (l=1) ، d (l=2) ، f (l=3)",
                explanation: "عدد الأوربيتالات في أي مستوى فرعي = 2l + 1."
              },
              {
                title: "سعة الأوربيتال",
                formula: "كل أوربيتال يتسع لإلكترونين كحد أقصى بحركة غزلية متضادة (↑↓)",
                explanation: "الغزل المتضاد يولد مجالين مغناطيسيين متعاكسين يقللان التنافر الكهربي."
              }
            ],
            workedExample: {
              problem: "اكتب أعداد الكم الأربعة للإلكترون الأخير في ذرة النيتروجين 7N.",
              solutionSteps: [
                "التوزيع الإلكتروني: 1s² 2s² 2px¹ 2py¹ 2pz¹.",
                "الإلكترون الأخير يقع في 2pz.",
                "n = 2 ، l = 1 (لأنه في p) ، ml = +1 (الأوربيتال الثالث) ، ms = +1/2 (مفرد للأعلى)."
              ]
            },
            testQuestion: {
              question: "حسب قاعدة هوند، عند توزيع 4 إلكترونات في المستوى الفرعي 2p فإن عدد الأوربيتالات نصف الممتلئة يساوي:",
              options: ["2", "1", "3", "صفر"],
              correctIndex: 0,
              explanation: "المستوى p به 3 أوربيتالات: الأول يزدوج (2)، والثاني به إلكترون مفرد، والثالث به إلكترون مفرد، إذن هناك أوربيتالان نصف ممتلئين."
            }
          }
        ]
      }
    ]
  },
  {
    id: "sec2_biology",
    title: "الأحياء (التغذية والنقل والتنفس الخلوي)",
    icon: "🧬",
    color: "from-green-600 to-emerald-700",
    accentBg: "bg-green-50 border-green-200 text-green-700",
    textColor: "text-green-600",
    grade: "2nd_secondary",
    term: 1,
    totalLessons: 7,
    completedLessons: 3,
    units: [
      {
        id: "sec2_bio_u1",
        subjectId: "sec2_biology",
        title: "الوحدة الأولى: التغذية والهضم في الكائنات الحية",
        description: "التغذية الذاتية وآلية البناء الضوئي والتفاعلات الضوئية واللاضوئية (حلقة كالفن)، والتغذية غير الذاتية والهضم في الإنسان.",
        order: 1,
        lessons: [
          {
            id: "sec2_bio_l1",
            unitId: "sec2_bio_u1",
            subjectId: "sec2_biology",
            title: "آلية البناء الضوئي وتفاعلات الجرانة والستروما",
            durationMinutes: 25,
            progressPercent: 85,
            isCompleted: true,
            description: "امتصاص الكلوروفيل للضوء، شطر جزيء الماء، اختزال NADP+ لـ NADPH، وتثبيت CO2 في الستروما لإنتاج PGAL.",
            objectives: [
              "التمييز بين التفاعلات الضوئية في الجرانة والتفاعلات اللاضوئية (الإنزيمية) في الستروما.",
              "إثبات أن مصدر الأكسجين المنطلق هو الماء H2O وليس CO2 (تجربة كالفن وفان نيل).",
              "فهم دور فوسفوجليسرالدهيد (PGAL) كأول مركب كيميائي ثابت ناتج عن البناء الضوئي."
            ],
            simplifiedSummary: "في البلاستيدة الخضراء: تمتص أقراص الجرانة ضوء الشمس، وتنشطر جزيئات الماء محررة غاز الأكسجين كناتج ثانوي، بينما يتحد الهيدروجين مع مركب NADPH ويخزن الطاقة في ATP. ثم ينتقلان إلى الستروما لتثبيت ثاني أكسيد الكربون وإنتاج مركب PGAL ثلاثي الكربون الذي يبني الجلوكوز والنشا.",
            keyLaws: [
              {
                title: "معادلة البناء الضوئي الشاملة",
                formula: "6CO2 + 12H2O ⬅ (ضوء + كلوروفيل) ⬅ C6H12O6 + 6H2O + 6O2",
                explanation: "مصدر O2 المنطلق في الهواء هو انشطار الماء في التفاعلات الضوئية."
              }
            ],
            workedExample: {
              problem: "ما هو أول مركب عضوي ثابت كيميائياً ينتج عن عملية البناء الضوئي بحسب تجربة ملفن كالفن؟",
              solutionSteps: [
                "استخدم كالفن طحلب الكلوريلا وكربوناً مشعاً C14 مع تعريضه للضوء لثانيتين فقط.",
                "المركب الناتج هو فوسفوجليسرالدهيد (PGAL) المكون من 3 ذرات كربون."
              ]
            },
            testQuestion: {
              question: "تحدث التفاعلات اللاضوئية لتثبيت غاز ثاني أكسيد الكربون في البلاستيدة داخل:",
              options: ["الستروما (أرضية البلاستيدة)", "أقراص الجرانة", "الغشاء الخارجي المزدوج", "جزيئات الكلوروفيل فقط"],
              correctIndex: 0,
              explanation: "الستروما تحتوي على الإنزيمات اللازمة ومركبات ATP و NADPH لتثبيت CO2 وإنتاج السكريات."
            }
          }
        ]
      }
    ]
  },
  {
    id: "sec2_math",
    title: "الرياضيات الموحدة (الجبر والتفاضل وحساب المثلثات)",
    icon: "📐",
    color: "from-violet-600 to-purple-600",
    accentBg: "bg-violet-50 border-violet-200 text-violet-700",
    textColor: "text-violet-600",
    grade: "2nd_secondary",
    term: 1,
    totalLessons: 8,
    completedLessons: 4,
    units: [
      {
        id: "sec2_mat_u1",
        subjectId: "sec2_math",
        title: "الوحدة الأولى: التفاضل ونهايات الدوال",
        description: "مفهوم النهاية عددياً وبيانياً، النظرية 4 (القانون)، ونهاية الدالة عند اللانهاية.",
        order: 1,
        lessons: [
          {
            id: "sec2_mat_l1",
            unitId: "sec2_mat_u1",
            subjectId: "sec2_math",
            title: "إيجاد نهاية الدالة جبرياً ونظرية القانون (س^ن - أ^ن)",
            durationMinutes: 25,
            progressPercent: 90,
            isCompleted: true,
            description: "التعويض المباشر والكميات غير المعينة (0/0)، التحليل، الضرب في المرافق، وصيغة القانون ن/م × أ^(ن-م).",
            objectives: [
              "معالجة حالة عدم التعيين (0/0) بالتحليل والقسمة التركيبية.",
              "تطبيق صيغة نظرية 4 مباشرة لحساب النهايات المعقدة."
            ],
            simplifiedSummary: "عند حساب النهاية نبدأ دائماً بالتعويض المباشر. إذا نتج 0/0 فهي كمية غير معينة نزيل العامل الصفري بالتحليل أو الضرب في المرافق أو تطبيق قانون النظرية: نها [س^ن - أ^ن] / [س^م - أ^م] = (ن / م) × أ^(ن - م).",
            keyLaws: [
              {
                title: "نظرية 4 (صيغة القانون)",
                formula: "نها (س ⬅ أ) [س^ن - أ^ن] / [س^م - أ^م] = (ن / م) × أ^(ن - م)",
                explanation: "أشهر صيغة لحساب نهايات الدوال الأسية دون الحاجة للتحليل الطويل."
              }
            ],
            workedExample: {
              problem: "احسب: نها (س ⬅ 2) [س⁵ - 32] / [س² - 4].",
              solutionSteps: [
                "نكتب الأعداد في صورة أسس متطابقة للعدد 2: 32 = 2⁵ ، 4 = 2².",
                "المسألة: نها [س⁵ - 2⁵] / [س² - 2²].",
                "نطبق القانون: (5 / 2) × 2^(5 - 2) = 2.5 × 2³ = 2.5 × 8 = 20."
              ]
            },
            testQuestion: {
              question: "قيمة نها (س ⬅ 3) [س² - 9] / [س - 3] تساوي:",
              options: ["6", "0", "9", "غير معرفة"],
              correctIndex: 0,
              explanation: "بالتحليل: (س - 3)(س + 3) / (س - 3) = س + 3. بالتعويض عن س = 3 ينتج 3 + 3 = 6."
            }
          }
        ]
      }
    ]
  },
  {
    id: "sec2_arabic",
    title: "اللغة العربية (النحو والبلاغة والأدب)",
    icon: "📖",
    color: "from-amber-600 to-orange-600",
    accentBg: "bg-amber-50 border-amber-200 text-amber-700",
    textColor: "text-amber-600",
    grade: "2nd_secondary",
    term: 1,
    totalLessons: 6,
    completedLessons: 3,
    units: [
      {
        id: "sec2_ar_u1",
        subjectId: "sec2_arabic",
        title: "الوحدة الأولى: إعراب الفعل المضارع وبناؤه",
        description: "نصب المضارع (أن، لن، كي، حتى، لام التعليل، فاء السببية، لام الجحود)، وجزم المضارع وجواب الطلب وأدوات الشرط الجازمة.",
        order: 1,
        lessons: [
          {
            id: "sec2_ar_l1",
            unitId: "sec2_ar_u1",
            subjectId: "sec2_arabic",
            title: "نصب المضارع بأن والمضمرات وفاء السببية ولام الجحود",
            durationMinutes: 20,
            progressPercent: 80,
            isCompleted: true,
            description: "شروط إعمال فاء السببية (مسبوقة بنفي أو طلب) ولام الجحود (مسبوقة بكون منفي ما كان أو لم يكن).",
            objectives: [
              "التمييز بين أدوات النصب وحروف العطف.",
              "تحديد لام الجحود وشرط الكون المنفي لتوكيد النفي.",
              "إعراب الفعل المضارع بالفتحة الظاهرة والمقدرة وحذف النون."
            ],
            simplifiedSummary: "ينصب الفعل المضارع إذا سُبق بأداة نصب. ومن أهم الأدوات الوزارية: فاء السببية (يجب أن تسبق بنفي أو طلب كالأمر والنهي: اجتهدوا فتنجحوا)، ولام الجحود (تسبق بكون منفي: وما كان الله ليعذبهم وأنت فيهم).",
            keyLaws: [
              {
                title: "شرط لام الجحود",
                formula: "ما كان / لم يكن + اسم كان + لـ (فعل مضارع منصوب)",
                explanation: "اللام تفيد شدة الإنكار وتكون واقعة في خبر كان المنفية."
              }
            ],
            workedExample: {
              problem: "أعرب الفعل في الآية: «وما كان المؤمنون لينفروا كافة».",
              solutionSteps: [
                "الفعل مسبوق بلام الجحود لأنها مسبوقة بكون منفي (ما كان).",
                "لينفروا: فعل مضارع منصوب بلام الجحود وعلامة نصبه حذف النون لأنه من الأفعال الخمسة."
              ]
            },
            testQuestion: {
              question: "في جملة «لا تتكاسل فتندم»، الفاء هي فاء السببية لأنها:",
              options: [
                "سُبقت بطلب (نهي: لا تتكاسل)",
                "سُبقت باسم فاعل",
                "جاءت في بداية الجملة",
                "تفيد الترتيب والتعقيب المحض"
              ],
              correctIndex: 0,
              explanation: "فاء السببية يشترط لنصب المضارع بعدها أن تسبق بنفي أو طلب كالأمر أو النهي أو الاستفهام."
            }
          }
        ]
      }
    ]
  },
  {
    id: "sec2_english",
    title: "اللغة الإنجليزية (Advanced Secondary English)",
    icon: "🌐",
    color: "from-indigo-600 to-blue-600",
    accentBg: "bg-indigo-50 border-indigo-200 text-indigo-700",
    textColor: "text-indigo-600",
    grade: "2nd_secondary",
    term: 1,
    totalLessons: 6,
    completedLessons: 3,
    units: [
      {
        id: "sec2_eng_u1",
        subjectId: "sec2_english",
        title: "Unit 1: Staying Healthy & Emergency Care",
        description: "Must vs Have to vs Need to, modal verbs of obligation, and CPR instructions.",
        order: 1,
        lessons: [
          {
            id: "sec2_eng_l1",
            unitId: "sec2_eng_u1",
            subjectId: "sec2_english",
            title: "Modals of Obligation: Must vs Have to",
            durationMinutes: 20,
            progressPercent: 90,
            isCompleted: true,
            description: "Internal obligation (Must) vs external laws (Have to), and prohibition (Mustn't).",
            objectives: [
              "Differentiate between personal determination (Must) and external legal regulations (Have to).",
              "Use mustn't for strict prohibition and ban."
            ],
            simplifiedSummary: "نستخدم Must للالتزام الداخلي الصادر من رغبة الشخص نفسه أو الدعوة الحارة أو النصيحة القوية. أما Have to فللقوانين واللوائح الخارجية المفروضة عليك. و Mustn't للتحريم والمنع التام (It is forbidden).",
            keyLaws: [
              {
                title: "Obligation Rule",
                formula: "Must = Internal choice / Warm invite | Have to = Outside rule / Law",
                explanation: "You must come to my wedding! (دعوة حارة). You have to wear a seatbelt (قانون)."
              }
            ],
            workedExample: {
              problem: "Choose: You ________ smoke in hospitals. It is strictly against the law.",
              solutionSteps: [
                "هناك تحريم قانوني صريح وضد القانون.",
                "الإجابة الصحيحة: mustn't."
              ]
            },
            testQuestion: {
              question: "In Egypt, drivers ________ stop when the traffic light is red.",
              options: ["have to", "might", "don't have to", "ought"],
              correctIndex: 0,
              explanation: "قانون مروري إلزامي عام مفروض من جهة خارجية نستخدم له have to."
            }
          }
        ]
      }
    ]
  }
];
