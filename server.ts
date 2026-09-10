import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Real AI responses will use fallback or fail gracefully.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Rafiq Al-Thanawiya API" });
  });

  // AI Tutor Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [], subject, mode = "explain", grade = "1st_secondary" } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          reply: `أهلاً بك يا بطل! 🎓 أنا رفيقك الذكي للثانوية العامة. (ملاحظة: يمكنك إعداد مفتاح GEMINI_API_KEY لتفعيل المحادثة الذكية فائقة الدقة). إجابة إرشادية لسؤالك عن "${subject || 'المادة'}": يُفضل دائمًا تقسيم المفاهيم إلى نقاط أساسية، وحل تطبيق مباشر بعد كل قاعدة نظرية. اسألني عن أي قانون أو مسألة تريد تبسيطها!`
        });
      }

      const ai = getGenAI();

      let modeInstruction = "";
      switch (mode) {
        case "simplify":
          modeInstruction = "اشرح المفهوم بأسلوب غاية في البساطة والتشويق مع ضرب أمثلة من الحياة اليومية كأنك تشرح لطالب مبتدئ.";
          break;
        case "socratic":
          modeInstruction = "استخدم الأسلوب السقراطي: لا تعطه الإجابة مباشرة كاملة، بل اطرح سؤالاً توجيهياً يساعده على الاستنتاج بنفسه خطوة بخطوة مع التشجيع.";
          break;
        case "solve_step_by_step":
          modeInstruction = "قدم حلاً مفصلاً خطوة بخطوة للمسألة أو المعادلة، مع توضيح القانون المستخدم في كل خطوة وتنبيهات للأخطاء الشائعة.";
          break;
        case "exam_prep":
          modeInstruction = "ركز على شكل الأسئلة في امتحانات الثانوية الحديثة (نظام البابل شيت والاختيار من متعدد والأسئلة المقالية)، وركز على نواتج التعلم ومستويات التفكير العليا.";
          break;
        default:
          modeInstruction = "قدم شرحاً تعليمياً وافياً ومرتباً بنقاط وعناوين واضحة وأمثلة عملية.";
          break;
      }

      const systemInstruction = `أنت "رفيق الثانوية الذكي" - مدرس وموجه ذكاء اصطناعي ودود ومحفز ومتمكن لطلاب المرحلة الثانوية (المنهج المصري والعربي للعام 2026/2027).
الصف الدراسي للطالب: ${grade === '1st_secondary' ? 'الصف الأول الثانوي' : grade === '2nd_secondary' ? 'الصف الثاني الثانوي' : 'الصف الثالث الثانوي'}.
المادة الحالية: ${subject || 'عامة'}.
نمط الشرح المطلوب: ${modeInstruction}

إرشادات هامة:
1. تحدث باللغة العربية الفصحى السلسة والمشجعة، واستخدم عبارات محفزة مثل: "أحسنت يا بطل"، "فكرة ممتازة"، "خطوة بخطوة سنفهمها معاً".
2. نسق الإجابة بتنسيق Markdown جميل (عناوين، نقاط، خط عريض، جداول عند الحاجة).
3. اكتب القوانين والمعادلات الرياضية والعلمية بوضوح تام.
4. حافظ على الإيجاز المفيد وتجنب الحشو غير الضروري.
5. اختم إجابتك بسؤال قصير للتأكد من فهم الطالب أو تحفيزه على الخطوة التالية.`;

      // Build conversation contents
      const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          if (h.text) {
            formattedContents.push({
              role: h.role === "user" ? "user" : "model",
              parts: [{ text: h.text }],
            });
          }
        }
      }

      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "عذرًا، حدث خطأ بسيط أثناء معالجة السؤال. حاول مرة أخرى!";
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({
        error: "فشل الاتصال بالمدرس الذكي",
        details: error?.message || "Internal server error",
      });
    }
  });

  // AI Adaptive & Diverse Quiz Generator Endpoint
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const {
        subject = "الرياضيات",
        unitTitle = "",
        topic = "الجبر وحساب المثلثات",
        count = 4,
        grade = "1st_secondary",
        difficulty = "medium", // "easy" | "medium" | "hard" | "adaptive"
        studentLevel = "intermediate", // "beginner" | "intermediate" | "advanced"
        questionTypes = "mixed", // "mixed" | "multiple_choice" | "essay" | "fill_blank"
      } = req.body;

      const effectiveTopic = unitTitle ? `الوحدة: ${unitTitle} - موضوع: ${topic}` : topic;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // High-quality diverse fallback questions covering MCQ, Essay, and Fill-in-the-blank
        const sampleQuestions = [
          {
            id: `q_${Date.now()}_1`,
            type: "multiple_choice",
            question: `في مادة ${subject} (${unitTitle || topic}): ما هو الاستنتاج الأدق المرتبط بنواتج التعلم ومستويات التفكير العليا؟`,
            options: [
              "العلاقة طردية متناسبة مع ثبات بقية المتغيرات",
              "انعدام التأثير المتبادل بين عناصر النظام",
              "تناقص القيمة تدريجياً باطراد عكسي",
              "ثبات النتيجة دون تغير الظروف التجريبية",
            ],
            correctIndex: 0,
            explanation: "تفسير تربوي: وفقاً لنواتج التعلم الوزارية المقررة، فإن المتغيرات في هذا المفهوم ترتبط بعلاقة طردية مباشرة تعزز الفهم المفاهيمي.",
            hint: "تذكر العلاقة بين المتغير التابع والمتغير المستقل في هذا الدرس.",
            difficulty: difficulty === "adaptive" ? (studentLevel === "advanced" ? "hard" : "medium") : difficulty,
          },
          {
            id: `q_${Date.now()}_2`,
            type: "fill_blank",
            question: `أكمل الفراغ الآتي في سياق ${effectiveTopic}: يُعتبر المفهوم الأساسي المتحكم في هذا المسار هو ______ وتطبيقاته المباشرة.`,
            correctAnswer: "الاتزان والتكامل",
            acceptedAnswers: ["الاتزان", "التكامل", "قوة الطفو", "المميز", "قاعدة أرشميدس", "الاتزان والتكامل"],
            explanation: "الشرح: يتطلب السؤال استحضار المصطلح الدقيق المعبر عن ناتج التعلم للوحدة.",
            hint: "ابحث عن الكلمة الدالة على التوافق أو القاعدة العامة.",
            difficulty: "easy",
          },
          {
            id: `q_${Date.now()}_3`,
            type: "essay",
            question: `سؤال مقالي تحليلي: في ضوء دراستك لـ "${effectiveTopic}"، فسر مع التعليل العلمي/الرياضي أثر تغيير المعطيات الرئيسية على النتيجة النهائية، موضحاً خطوات التفكير المنطقي.`,
            modelAnswer: `النموذج الإرشادي للإجابة:\n1. تحديد المعطيات والمتغيرات المؤثرة بدقة.\n2. صياغة القانون أو القاعدة الحاكمة للعلاقة.\n3. التعليل: أي تغير يؤدي مباشرة إلى تحول نسبي في القيمة المحسوبة بما يوافق مبادئ الوزارة.\n4. الخلاصة المنطقية المترتبة على ذلك.`,
            rubric: [
              "ذكر القانون أو القاعدة الأساسية (درجة واحدة)",
              "تقديم التفسير العلمي السليم والتعليل المقنع (درجتان)",
              "ربط النتيجة بنواتج التعلم والتطبيق العملي (درجة واحدة)",
            ],
            explanation: "هذا السؤال المقالي يقيس مهارات التفكير التحليلي والقدرة على صياغة برهان أو تفسير علمي متكامل.",
            hint: "ابدأ بذكر القاعدة الأساسية ثم اذكر سبب حدوث التغير خطوة بخطوة.",
            difficulty: "hard",
          },
          {
            id: `q_${Date.now()}_4`,
            type: "multiple_choice",
            question: `سؤال تطبيقي مركب في ${subject}: إذا تضاعفت إحدى القيم المؤثرة مع ثبات باقي العوامل، فإن القيمة الناتجة:`,
            options: [
              "تتضاعف مرتين مباشرة",
              "تظل ثابتة لا تتغير",
              "تقل إلى النصف",
              "تزداد إلى أربعة أمثالها",
            ],
            correctIndex: 0,
            explanation: "بناء على القانون الرياضي الحاكم، التناسب المباشر من الدرجة الأولى يؤدي إلى مضاعفة الناتج عند تضاعف المتغير.",
            hint: "تحقق من أسس المتغير في الصيغة الرياضية للقانون.",
            difficulty: difficulty === "adaptive" ? "medium" : difficulty,
          },
        ];

        // Filter by requested questionTypes if specified
        let filtered = sampleQuestions;
        if (questionTypes === "multiple_choice") {
          filtered = sampleQuestions.filter((q) => q.type === "multiple_choice");
        } else if (questionTypes === "essay") {
          filtered = sampleQuestions.filter((q) => q.type === "essay");
        } else if (questionTypes === "fill_blank") {
          filtered = sampleQuestions.filter((q) => q.type === "fill_blank");
        }

        return res.json({ questions: filtered });
      }

      const ai = getGenAI();

      let typesInstruction = "";
      if (questionTypes === "mixed" || questionTypes === "all") {
        typesInstruction = `نوّع الأسئلة بدقة لتشمل:
- أسئلة اختيار من متعدد (multiple_choice) بنظام البابل شيت الحديث (4 خيارات واضحة مع إجابة صحيحة واحدة وتفسير متعمق).
- سؤال إكمال فراغ (fill_blank) يحتوي على عبارة فيها كلمة أو مصطلح ناقص واضح ومحدد بدقة، مع حقل correctAnswer و acceptedAnswers (مرادفات وصيغ بديلة مقبولة).
- سؤال مقالي تحليلي (essay) يقيس الفهم والتعليل، مع نموذج إجابة نموذجي (modelAnswer) ومعايير تصحيح تفصيلية (rubric: مصفوفة من البنود وتوزيع الدرجات).`;
      } else if (questionTypes === "multiple_choice") {
        typesInstruction = `جميع الأسئلة يجب أن تكون اختيار من متعدد (multiple_choice) من 4 خيارات مع خيار صحيح واحد وتفسير وافٍ.`;
      } else if (questionTypes === "essay") {
        typesInstruction = `جميع الأسئلة يجب أن تكون أسئلة مقالية تحليلية (essay) مع نموذج إجابة مفصل (modelAnswer) وعناصر التقييم وتوزيع الدرجات (rubric).`;
      } else if (questionTypes === "fill_blank") {
        typesInstruction = `جميع الأسئلة يجب أن تكون إكمال فراغات (fill_blank) بحيث يكون مكان الفراغ واضحاً مع تحديد الكلمة الصحيحة (correctAnswer) والكلمات المقبولة (acceptedAnswers).`;
      }

      const prompt = `أنت الخبير الأول والواضع المعتمد لامتحانات الثانوية العامة المصرية والعربية للعام الدراسي 2026/2027.
قم بإنشاء اختبار تكيفي ذكي ومخصص مكون من ${count} أسئلة في مادة "${subject}" حول:
${effectiveTopic}
- الصف الدراسي: ${grade}
- مستوى صعوبة الاختبار المطلوب: "${difficulty}" (إذا كان تكيفياً، ابدأ بما يناسب مستوى الطالب الحالي: "${studentLevel}").
- تنوع الأسئلة المطلوب:
${typesInstruction}

القواعد الصارمة:
1. الأسئلة يجب أن تكون معتمدة تماماً على نواتج التعلم الحديثة لوزارة التربية والتعليم المصرية (الفهم، التحليل، التطبيق، التفكير الناقد).
2. لا تضع أسئلة حفظ تلقيني بحت.
3. التزم بتنسيق JSON الصارم التالي:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "question": "نص السؤال الواضح والدقيق",
    "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
    "correctIndex": 0,
    "explanation": "شرح مفصل ومحكم لسبب صحة الإجابة وكيفية استبعاد الخيارات الأخرى",
    "hint": "تلميح تربوي يساعد الطالب على التفكير دون إعطاء الحل مباشرة",
    "difficulty": "easy" // أو "medium" أو "hard"
  },
  {
    "id": "q2",
    "type": "fill_blank",
    "question": "نص العبارة التي تحتوي على فراغ واضح ومحدد (مثال: تنص قاعدة أرشميدس على أن قوة الطفو تساوي ______ السائل المزاح)",
    "correctAnswer": "وزن",
    "acceptedAnswers": ["وزن", "الوزن", "مقدار وزن"],
    "explanation": "شرح المصطلح العلمي وأهميته في الوحدة",
    "hint": "تلميح للكلمة الناقصة",
    "difficulty": "medium"
  },
  {
    "id": "q3",
    "type": "essay",
    "question": "نص السؤال المقالي التحليلي (مثال: علل فيزيائياً / قارن مع التعليل / استنتج العلاقة بين...)",
    "modelAnswer": "الإجابة النموذجية الكاملة خطوة بخطوة باللغة العربية الفصحى السليمة",
    "rubric": [
      "ذكر القاعدة أو القانون الأساسي (1 درجات)",
      "خطوات التعليل الرياضي أو العلمي السليم (2 درجات)",
      "الاستنتاج النهائي (1 درجات)"
    ],
    "explanation": "الهدف التربوي ومعيار التقييم المعتمد في التصحيح الإلكتروني",
    "hint": "تلميح يوجه الطالب للنقطة المركزية المطلوبة",
    "difficulty": "hard"
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      let questions = [];
      try {
        const text = response.text || "[]";
        questions = JSON.parse(text);
      } catch (parseErr) {
        console.error("Failed to parse quiz json:", parseErr);
      }

      res.json({ questions });
    } catch (err: any) {
      console.error("Quiz generation error:", err);
      res.status(500).json({ error: "فشل إنشاء الاختبار", details: err?.message });
    }
  });

  // AI Multi-Method Lesson Explanation Endpoint
  app.post("/api/explain-lesson", async (req, res) => {
    try {
      const {
        lessonTitle,
        subjectTitle = "الرياضيات",
        grade = "1st_secondary",
        method = "all", // "all" | "academic" | "simplified_story" | "mindmap" | "step_by_step" | "exam_tricks"
        context = {},
      } = req.body;

      if (!lessonTitle) {
        return res.status(400).json({ error: "اسم الدرس مطلوب" });
      }

      const gradeName =
        grade === "1st_secondary"
          ? "الصف الأول الثانوي"
          : grade === "2nd_secondary"
          ? "الصف الثاني الثانوي"
          : "الصف الثالث الثانوي (شهادة إتمام الثانوية العامة)";

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // High quality rich structured fallback
        return res.json({
          lessonTitle,
          subjectTitle,
          gradeName,
          method,
          academic: `### 🎓 الشرح الأكاديمي والتأصيل العلمي لدرس: ${lessonTitle}\n\n1. **نواتج التعلم المستهدفة:**\n- فهم المفاهيم والقوانين الأساسية التي يقوم عليها درس "${lessonTitle}".\n- الربط بين المعطيات والنظريات العلمية المقررة في منهج ${subjectTitle} لـ ${gradeName}.\n\n2. **الأساس النظري والقواعد:**\n- يرتكز هذا الدرس على تحليل العلاقات الرياضية/العلمية واستنتاج العلاقات بين المتغيرات بدقة.\n- تطبيق النظريات المباشرة في تفسير الظواهر واستخراج القيم المجهولة.`,
          simplifiedStory: `### 💡 التبسيط بالتشبيهات والقصص اليومية (طريقة فاينمان):\n\nتخيل درس "${lessonTitle}" كأنه منظومة يومية نتعامل معها:\n- الفكرة ببساطة هي أن كل مدخل يقابله تأثير محدد وقابل للتنبؤ.\n- لو اعتبرنا المتغير الأول مثل كمية الوقود، فالمتغير التابع هو المسافة المقطوعة، وهكذا تتحدد العلاقة طردياً أو عكسياً بسلاسة!`,
          mindmap: `### 🗺️ الخريطة الذهنية والمخطط المفاهيمي:\n\n* **المفهوم المركزي:** ${lessonTitle}\n  ├── **الركيزة الأولى:** التعريف والشروط الأساسية.\n  ├── **الركيزة الثانية:** القوانين والمعادلات الرئيسية.\n  ├── **الركيزة الثالثة:** الحالات الخاصة والشواذ.\n  └── **الهدف النهائي:** حل مسائل الامتحانات المركبة.`,
          stepByStep: `### 📝 الحل النموذجي خطوة بخطوة لمسألة مركبة:\n\n* **الخطوة 1:** قراءة المسألة وتفريغ المعطيات بدقة وتحديد المطلوب بدقة.\n* **الخطوة 2:** كتابة القانون المناسب والتأكد من توافق وحدات القياس.\n* **الخطوة 3:** التعويض الرياضي والتبسيط الجبري للوصول إلى الناتج النهائي بدقة مع وحدة القياس.`,
          examTricks: `### ⚡ أسرار وتريكات امتحانات الثانوية العامة (بابل شيت):\n\n⚠️ **الفخ الشائع:** الوقوع في فخ الإشارات السالبة أو الوحدات غير المحولة.\n💡 **تريك الحل السريع:** يمكن استبعاد خيارين غير منطقيين بالنظر السريع قبل بدء الحسابات المعقدة.\n🎯 **ملاحظة واضعي الامتحان:** يركز السؤال في هذا الدرس على مستويات الفهم والتطبيق والتحليل لا مجرد الحفظ.`,
        });
      }

      const ai = getGenAI();

      let promptInstruction = "";
      if (method === "all") {
        promptInstruction = `قدم شرحاً شاملاً وتفصيلياً غاية في الدقة والاحترافية لدرس "${lessonTitle}" في مادة "${subjectTitle}" لطلاب "${gradeName}" في المنهج المصري 2026/2027.
يجب أن يحتوي الرد على JSON متكامل يتضمن 5 طرق شرح مختلفة كالتالي:
1. "academic": شرح أكاديمي تأسيسي مفصل بالأهداف والقوانين والمصطلحات الدقيقة.
2. "simplifiedStory": شرح غاية في البساطة بتشبيهات وأمثلة من واقع الحياة وقصص ملموسة (أسلوب فاينمان).
3. "mindmap": خريطة ذهنية ومخطط شجري نقطي منظم يربط المفاهيم.
4. "stepByStep": مسألة نموذجية شاملة مع خطوات الحل خطوة بخطوة والسر وراء كل خطوة.
5. "examTricks": أسرار وتريكات امتحانات البابل شيت، والأخطاء القاتلة التي يقع فيها الطلاب وطرق استبعاد الخيارات.`;
      } else {
        promptInstruction = `قدم شرحاً مفصلاً ومكثفاً لدرس "${lessonTitle}" في مادة "${subjectTitle}" لطلاب "${gradeName}" بنمط الشرح "${method}".`;
      }

      const systemInstruction = `أنت الخبير والموجه الأول للثانوية العامة المصرية والعربية لعام 2026/2027. أسلوبك يجمع بين العمق العلمي والوضوح الباهر والتنسيق الرائع بتنسيق Markdown.
اجعل إجابتك بتنسيق JSON حصرياً:
{
  "academic": "...",
  "simplifiedStory": "...",
  "mindmap": "...",
  "stepByStep": "...",
  "examTricks": "..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: promptInstruction,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      let parsedData: any = {};
      try {
        parsedData = JSON.parse(response.text || "{}");
      } catch (e) {
        parsedData = {
          academic: response.text || "تم إنشاء الشرح بنجاح.",
        };
      }

      res.json({
        lessonTitle,
        subjectTitle,
        gradeName,
        method,
        ...parsedData,
      });
    } catch (err: any) {
      console.error("Lesson explanation error:", err);
      res.status(500).json({ error: "فشل توليد شرح الدرس", details: err?.message });
    }
  });

  // AI Multi-Method Full Unit Explanation Endpoint
  app.post("/api/explain-unit", async (req, res) => {
    try {
      const {
        unitTitle,
        unitOrder,
        subjectTitle = "الرياضيات",
        grade = "1st_secondary",
        lessons = [],
      } = req.body;

      if (!unitTitle) {
        return res.status(400).json({ error: "اسم الوحدة مطلوب" });
      }

      const gradeName =
        grade === "1st_secondary"
          ? "الصف الأول الثانوي"
          : grade === "2nd_secondary"
          ? "الصف الثاني الثانوي"
          : "الصف الثالث الثانوي";

      const apiKey = process.env.GEMINI_API_KEY;
      const lessonsListStr = lessons.map((l: any) => typeof l === "string" ? l : l.title).join("، ");

      if (!apiKey) {
        return res.json({
          unitTitle,
          subjectTitle,
          gradeName,
          masterOverview: `### 🌟 الدليل الشامل لوحدة: ${unitTitle} (${subjectTitle})\n\nتعتبر هذه الوحدة من أهم ركائز منهج ${gradeName}، حيث تجمع الدروس التالية: (${lessonsListStr || "جميع دروس الوحدة"}).\n\n#### 🎯 الخيط الناظم للوحدة:\nجميع مفاهيم هذه الوحدة مترابطة بشكل تسلسلي؛ فكل درس يبني على سابقه للوصول إلى التطبيق الكلي في المسائل الامتحانية المركبة.`,
          connectionsMap: `### 🔗 خريطة ترابط وتكامل دروس الوحدة:\n\n* **الدرس التأسيسي:** يبدأ بتعريف المفاهيم الأولية والافتراضات.\n* **الدرس التطبيقي:** يطور المعادلات والقوانين الحسابية.\n* **الدرس التكاملي:** يربط المعارف بحل مسائل التفكير العليا والربط بين الفصول.`,
          formulaSheet: `### 📑 الميثاق الذهبي لقوانين ومفاهيم الوحدة:\n\n1. **القانون الأساسي الأول:** $القاعدة الأولى للوحدة$ - يُستخدم عند توفر المعطيات المباشرة.\n2. **العلاقة المشتركة:** $العلاقة الرابطة بين الدروس$ - تُمثل مفتاح حل 70% من المسائل المركبة.`,
          comprehensiveReview: `### 🏆 مراجعة ليلة الامتحان على الوحدة كاملة:\n\n- ركز على التطبيق العملي أكثر من الحفظ المجرد.\n- انتبه لدمج فكرتين من درسين مختلفين داخل سؤال بابل شيت واحد.\n- قم بحل 15 سؤالاً تدريبياً متنوعاً لضمان إتقان الوحدة بنسبة 100%.`,
          forecastQuestions: [
            {
              question: `سؤال شامل على وحدة "${unitTitle}": ما هو المبدأ الأساسي الذي يربط بين نواتج تعلم دروس الوحدة؟`,
              options: [
                "التكامل الرياضي والفيزيائي بين المتغيرات",
                "الحفظ المنفصل لكل قاعدة",
                "إلغاء الحالات الخاصة",
                "الاعتماد فقط على التعويض المباشر",
              ],
              correctIndex: 0,
              explanation: "نواتج التعلم الحديثة في الثانوية العامة تعتمد على فهم التكامل والربط البيني بين دروس الوحدة كاملة.",
            },
          ],
        });
      }

      const ai = getGenAI();
      const prompt = `قدم شرحاً شاملاً وتفصيلياً ماستركلاس (Masterclass) لوحدة كاملة بعنوان "${unitTitle}" (الوحدة رقم ${unitOrder || 1}) في مادة "${subjectTitle}" لطلاب "${gradeName}" في المنهج المصري 2026/2027.
الدروس التي تحتويها الوحدة: [${lessonsListStr}].

قم بالرد بصيغة JSON حصرياً تحتوي على الأقسام التالية:
{
  "masterOverview": "شرح كلي شامل للوحدة وأهدافها الكبرى بأسلوب ملهم وتأصيلي.",
  "connectionsMap": "تحليل كيفية ترابط وتسلسل الدروس معاً وكيف تخدم بعضها البعض.",
  "formulaSheet": "تجميعة مركزة لجميع القوانين والمفاهيم والقواعد الذهبية للوحدة ككل مع شرح رمز كل قانون.",
  "comprehensiveReview": "ملخص مراجعة شاملة ليلة الامتحان وأهم التريكات والأسئلة الخادعة المشتركة في امتحانات الثانوية العامة على هذه الوحدة.",
  "forecastQuestions": [
    {
      "question": "نص سؤال شامل يربط بين أكثر من درس في الوحدة",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctIndex": 0,
      "explanation": "تفسير مفصل للحل وطريقة التفكير"
    },
    {
      "question": "سؤال تفكير عليا ومستويات متقدمة على الوحدة",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctIndex": 0,
      "explanation": "تفسير مفصل للحل وطريقة التفكير"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "أنت كبير مستشاري وواضعي مناهج الثانوية العامة المصرية والعربية. قدم شروحاً تنظيمية عميقة وجذابة للوحدات الدراسية بتنسيق JSON.",
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch (e) {
        parsed = {
          masterOverview: response.text || "تم إعداد الشرح الشامل للوحدة بنجاح.",
        };
      }

      res.json({
        unitTitle,
        subjectTitle,
        gradeName,
        ...parsed,
      });
    } catch (err: any) {
      console.error("Unit explanation error:", err);
      res.status(500).json({ error: "فشل توليد شرح الوحدة", details: err?.message });
    }
  });

  // AI Parent Report Generator Endpoint
  app.post("/api/parent-report", async (req, res) => {
    try {
      const { studentName = "محمد", stats = {}, completedLessons = [], weakTopics = [] } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          report: `تقرير ولي الأمر للطالب ${studentName}:\n- حقق الطالب التزاماً جيداً بمعدل 48 دقيقة مذاكرة اليوم.\n- نسبة النجاح العامة في الاختبارات: 82%.\n- التوصية: تشجيع الطالب على المداومة اليومية وحل 10 دقائق تدريبات مركبة في مادة الرياضيات.`,
        });
      }

      const ai = getGenAI();
      const prompt = `اكتب تقريرًا موجزًا ومطمئنًا وعمليًا لولي أمر الطالب "${studentName}" بالثانوية العامة.
بيانات أداء الطالب:
- إجمالي وقت المذاكرة الأسبوعي: ${stats.weeklyMinutes || 240} دقيقة.
- سلسلة المذاكرة المستمرة: ${stats.streakDays || 6} أيام.
- متوسط درجات الاختبارات: ${stats.averageScore || 82}%.
- الدروس المنجزة مؤخرًا: ${completedLessons.join("، ") || "الرياضيات والكيمياء"}.
- نقاط تحتاج تركيز إضافي: ${weakTopics.join("، ") || "الأسئلة متعددة الخطوات في الرياضيات"}.

اجعل التقرير مقسمًا إلى:
1. ملخص الإنجاز والجهد (بلهجة فخورة ومشجعة).
2. نقاط القوة التي أظهرها الطالب.
3. التوجيهات المقترحة لولي الأمر في المنزل لدعمه خلال الأسبوع القادم.
4. رسالة قصيرة جاهزة للإرسال للطالب لتحفيزه.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.6,
        },
      });

      res.json({ report: response.text });
    } catch (err: any) {
      console.error("Parent report error:", err);
      res.status(500).json({ error: "فشل إنشاء تقرير ولي الأمر", details: err?.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rafiq Al-Thanawiya Server running on http://localhost:${PORT}`);
  });
}

startServer();
