export type ViewMode =
  | "home"
  | "subject_portal"
  | "monthly_exams"
  | "external_books"
  | "curriculum"
  | "ai"
  | "quizzes"
  | "review"
  | "progress"
  | "parent"
  | "sources"
  | "achievements";

export type GradeLevel = "1st_secondary" | "2nd_secondary" | "3rd_secondary";
export type StudentBranch = "general" | "scientific" | "literary";

export interface Lesson {
  id: string;
  unitId: string;
  subjectId: string;
  title: string;
  durationMinutes: number;
  progressPercent: number;
  isCompleted: boolean;
  isBookmarked?: boolean;
  description: string;
  objectives: string[];
  simplifiedSummary: string;
  keyLaws: { title: string; formula: string; explanation: string }[];
  workedExample: { problem: string; solutionSteps: string[]; note?: string };
  testQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface Unit {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Subject {
  id: string;
  title: string;
  icon: string;
  color: string;
  accentBg: string;
  textColor: string;
  grade: GradeLevel;
  term: 1 | 2;
  totalLessons: number;
  completedLessons: number;
  units: Unit[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: string;
  subject?: string;
  mode?: "explain" | "simplify" | "socratic" | "solve_step_by_step" | "exam_prep";
}

export type QuizQuestionType = "multiple_choice" | "essay" | "true_false" | "fill_blank";

export interface QuizQuestion {
  id: string;
  question: string;
  type?: QuizQuestionType; // defaults to "multiple_choice" if not specified
  options?: string[]; // for multiple_choice
  correctIndex?: number; // for multiple_choice
  explanation: string;
  hint?: string;
  difficulty: "easy" | "medium" | "hard";
  subjectId?: string;
  unitId?: string;
  unitTitle?: string;
  // Ministry Exam Standards
  ministryStandard?: string; // e.g. "مستويات تفكير عليا - تطبيق وتحليل", "بابل شيت - فهم واستيعاب"
  marks?: number; // e.g. 1 or 2 marks per Egyptian Ministry specification
  // For true_false
  isTrue?: boolean;
  correction?: string; // تصويب الخطأ مع التعليل العلمي المعتمد
  // For multiple_choice exclusions
  exclusionReasoning?: string[]; // أسباب استبعاد البدائل الخاطئة
  // For fill_blank
  correctAnswer?: string;
  acceptedAnswers?: string[];
  // For essay
  modelAnswer?: string;
  rubric?: string[];
}

export interface QuizResult {
  id: string;
  quizTitle: string;
  subjectId: string;
  scorePercent: number;
  totalQuestions: number;
  correctAnswers: number;
  date: string;
  xpEarned: number;
}

export interface Flashcard {
  id: string;
  subject: string;
  concept: string;
  prompt: string;
  answer: string;
  status: "urgent" | "soon" | "mastered";
  lastReviewedDate?: string;
  nextReviewDays: number;
  retentionPercent: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "streak" | "study_time" | "quizzes" | "mastery";
  unlocked: boolean;
  unlockedDate?: string;
  unlockedAt?: string;
  xpReward: number;
  progress: number;
  maxProgress: number;
}

export type Badge = AchievementBadge;

export interface StudentProfile {
  name: string;
  gradeLevel: GradeLevel;
  branch: StudentBranch;
  streakDays: number;
  todayMinutes: number;
  weeklyMinutes: number;
  xp: number;
  level: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  dailyGoalMinutes: number;
}

export interface OfficialSource {
  id: string;
  title: string;
  publisher: string;
  grade: string;
  category: "كتاب_الوزارة" | "بنك_المعرفة" | "منصة_البث" | "دليل_المعلم" | "نماذج_استرشادية";
  url?: string;
  description: string;
  isOfficial: boolean;
  fileSize?: string;
}

export interface NotePhoto {
  id: string;
  dataUrl: string;
  capturedAt: string;
  caption?: string;
}

export interface LessonUserNote {
  text: string;
  lessonTitle: string;
  subjectTitle: string;
  updatedAt: string;
  photos?: NotePhoto[];
}

export type ExternalBookSeries =
  | "المعاصر"
  | "الامتحان"
  | "الأضواء"
  | "سلاح_التلميذ"
  | "الشامل"
  | "الوافي"
  | "نيوتن"
  | "اللواء"
  | "كتاب_خاص_PDF";

export interface ExternalBookChapterExcerpt {
  unitId: string;
  unitTitle: string;
  keyChapters: string[];
  coreTricks: string[];
  pageRange?: string;
}

export interface ExternalBook {
  id: string;
  title: string;
  seriesName: ExternalBookSeries;
  subjectId: string;
  subjectTitle: string;
  grade: GradeLevel;
  term: 1 | 2;
  publisher: string;
  badge: string;
  coverColor: string;
  description: string;
  pdfUrl?: string;
  fileName?: string;
  fileSize?: string;
  pageCount?: number;
  isCustomUploaded?: boolean;
  uploadedAt?: string;
  extractedTextSample?: string;
  unitsBreakdown: ExternalBookChapterExcerpt[];
}

export interface ExternalBookUnitExplanation {
  unitTitle: string;
  bookTitle: string;
  seriesName: string;
  subjectTitle: string;
  gradeName: string;
  pedagogicalMethod: string;
  deepTheoreticalFoundation: string;
  coreLawsAndFormulas: {
    title: string;
    formula: string;
    unit: string;
    bookSpecialRule: string;
    explanation: string;
  }[];
  stepByStepWorkedExamples: {
    problemNumber: number;
    problemTitle: string;
    question: string;
    givenData: string[];
    appliedFormula: string;
    solutionSteps: string[];
    finalAnswer: string;
    bookTip: string;
  }[];
  bookGoldenTricks: string[];
  commonPitfalls: string[];
  feynmanSummary: string;
}

export interface ExternalBookQuizQuestion {
  id: string;
  questionNumber: number;
  type: "multiple_choice" | "essay" | "fill_blank";
  question: string;
  options?: string[];
  correctIndex?: number;
  difficulty: "easy" | "medium" | "hard";
  sourceReference: string;
  hint?: string;
  modelSolution: {
    correctAnswerText: string;
    thinkingMethodology: string;
    stepByStepDerivation?: string[];
    whyOthersWrong?: string;
    marksAllocation: string;
  };
}

export interface ExternalBookUnitQuiz {
  unitId: string;
  unitTitle: string;
  bookTitle: string;
  seriesName: string;
  subjectTitle: string;
  gradeName: string;
  totalQuestions: number;
  passScore: number;
  questions: ExternalBookQuizQuestion[];
}

export interface ExternalBookStudyGuide {
  executiveSummary: string;
  bulletSummary: string[];
  keyDefinitions: { term: string; definition: string }[];
  goldenFormulasAndRules: { name: string; rule: string; context: string }[];
  examTricksAndTraps: string[];
  audioOverviewScript: { host1: string; host2: string }[];
  mindMapConceptNodes: { id: string; label: string; branch: string; details: string }[];
}

export interface ExternalBookChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sourcesCited?: string[];
}


