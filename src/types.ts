export type ViewMode =
  | "home"
  | "subject_portal"
  | "monthly_exams"
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

export type QuizQuestionType = "multiple_choice" | "essay" | "fill_blank";

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

