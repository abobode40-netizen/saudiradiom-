import React, { useState, useEffect } from "react";
import {
  ViewMode,
  GradeLevel,
  StudentProfile,
  Subject,
  ChatMessage,
  Flashcard,
  AchievementBadge,
  OfficialSource,
  Lesson,
} from "./types";
import { INITIAL_SUBJECTS, getSubjectsForGrade } from "./data/curriculumData";
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_BADGES,
  INITIAL_FLASHCARDS,
  INITIAL_OFFICIAL_SOURCES,
  INITIAL_PRESET_QUIZ_QUESTIONS,
} from "./data/initialState";

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { HomeView } from "./components/views/HomeView";
import { CurriculumView } from "./components/views/CurriculumView";
import { AiTutorView } from "./components/views/AiTutorView";
import { QuizzesView } from "./components/views/QuizzesView";
import { ReviewView } from "./components/views/ReviewView";
import { ProgressView } from "./components/views/ProgressView";
import { ParentView } from "./components/views/ParentView";
import { SourcesView } from "./components/views/SourcesView";
import { AchievementsView } from "./components/views/AchievementsView";
import { SubjectPortalView } from "./components/views/SubjectPortalView";
import { MonthlyAllSubjectsPortalView } from "./components/views/MonthlyAllSubjectsPortalView";

import { StudyTimerModal } from "./components/StudyTimerModal";
import { LessonModal } from "./components/LessonModal";
import { UnitAiModal } from "./components/UnitAiModal";
import { Toast } from "./components/Toast";
import { Unit } from "./types";

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>("home");
  const [activeSubjectPortalId, setActiveSubjectPortalId] = useState<string>("math");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleOpenSubjectDoor = (subjectId: string) => {
    setActiveSubjectPortalId(subjectId);
    setCurrentView("subject_portal");
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Student Profile State
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("rafiq_student_profile");
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROFILE;
  });

  // Curriculum Subjects State (Updated to 2026/2027 Egyptian Ministry curriculum)
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("rafiq_curriculum_subjects_v2027");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const savedProfile = localStorage.getItem("rafiq_student_profile");
    const initialGrade = savedProfile
      ? (JSON.parse(savedProfile).gradeLevel as GradeLevel)
      : INITIAL_STUDENT_PROFILE.gradeLevel;
    return getSubjectsForGrade(initialGrade);
  });

  // Badges & Flashcards & Sources
  const [badges, setBadges] = useState<AchievementBadge[]>(() => {
    const saved = localStorage.getItem("rafiq_badges");
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("rafiq_flashcards");
    return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
  });

  const [sources, setSources] = useState<OfficialSource[]>(() => {
    const saved = localStorage.getItem("rafiq_sources");
    return saved ? JSON.parse(saved) : INITIAL_OFFICIAL_SOURCES;
  });

  // AI Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("rafiq_chat_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Active Lesson Modal
  const [activeLesson, setActiveLesson] = useState<{
    subject: Subject;
    lesson: Lesson;
  } | null>(null);

  // Active Unit AI Masterclass Modal
  const [activeUnitAi, setActiveUnitAi] = useState<{
    unit: Unit;
    subject: Subject;
  } | null>(null);

  // Study Timer State
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("rafiq_student_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("rafiq_curriculum_subjects_v2027", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("rafiq_badges", JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem("rafiq_flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem("rafiq_sources", JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem("rafiq_chat_history", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Handle Grade Change
  const handleGradeChange = (grade: GradeLevel) => {
    setProfile((prev) => ({ ...prev, gradeLevel: grade }));
    const newGradeSubjects = getSubjectsForGrade(grade);
    setSubjects(newGradeSubjects);
    if (newGradeSubjects.length > 0) {
      setActiveSubjectPortalId(newGradeSubjects[0].id);
    }
    showToast(
      grade === "1st_secondary"
        ? "تم تفعيل مناهج 2026/2027: الصف الأول الثانوي (العلوم المتكاملة والمواد المطورة) 🎒"
        : grade === "2nd_secondary"
        ? "تم تفعيل مناهج 2026/2027: الصف الثاني الثانوي (الفيزياء والكيمياء والأحياء) 📚"
        : "تم تفعيل مناهج 2026/2027: الصف الثالث الثانوي (شهادة الثانوية العامة) 🎓"
    );
  };

  // Open Lesson Modal
  const handleOpenLesson = (subjectId: string, lessonId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    for (const unit of subject.units) {
      const lesson = unit.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        setActiveLesson({ subject, lesson });
        return;
      }
    }
  };

  // Complete a Lesson
  const handleCompleteLesson = (lessonId: string) => {
    setSubjects((prevSubjects) =>
      prevSubjects.map((sub) => {
        let updatedUnits = sub.units.map((unit) => ({
          ...unit,
          lessons: unit.lessons.map((les) =>
            les.id === lessonId ? { ...les, isCompleted: true } : les
          ),
        }));

        const total = updatedUnits.reduce((acc, u) => acc + u.lessons.length, 0);
        const comp = updatedUnits.reduce(
          (acc, u) => acc + u.lessons.filter((l) => l.isCompleted).length,
          0
        );

        return {
          ...sub,
          units: updatedUnits,
          totalLessons: total,
          completedLessons: comp,
        };
      })
    );

    // Reward XP
    setProfile((prev) => ({
      ...prev,
      xp: prev.xp + 50,
      todayMinutes: prev.todayMinutes + 15,
      weeklyMinutes: prev.weeklyMinutes + 15,
    }));
  };

  // Timer Session Finished
  const handleSessionFinished = (minutesEarned: number, xpEarned: number) => {
    setProfile((prev) => ({
      ...prev,
      todayMinutes: prev.todayMinutes + minutesEarned,
      weeklyMinutes: prev.weeklyMinutes + minutesEarned,
      xp: prev.xp + xpEarned,
      streakDays: prev.streakDays < 7 ? prev.streakDays + 1 : prev.streakDays,
    }));
    setTimerActive(false);
    showToast(`أحسنت! أضفت ${minutesEarned} دقيقة مذاكرة تركيز لحسابك! 🎉`);
  };

  // AI Chat Handler
  const handleSendMessage = async (
    text: string,
    mode: ChatMessage["mode"] = "explain",
    subject = "الرياضيات"
  ) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      mode,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          grade: profile.gradeLevel,
          subject,
          mode,
        }),
      });

      const data = await response.json();
      const aiReply =
        data.reply ||
        "أهلاً بك! أنا مستعد دائماً لشرح أي درس أو معادلة في منهج الثانوية العامة بنظام 2026/2027.";

      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: "model",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        mode,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setProfile((prev) => ({ ...prev, xp: prev.xp + 10 }));
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: "model",
        text: "عذراً، حدث خطأ أثناء الاتصال بالخادم الذكي. يمكنك المحاولة مرة أخرى أو مراجعة ملخص الدرس.",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Ask AI about a specific lesson from lesson modal
  const handleAskAiAboutLesson = (lessonTitle: string, subjectTitle: string) => {
    setCurrentView("ai");
    handleSendMessage(
      `مرحباً، أدرس حالياً درس "${lessonTitle}" في مادة ${subjectTitle}. هل يمكنك أن تقدم لي ملخصاً ذكياً بأهم الأفكار التي تتكرر في امتحانات الثانوية العامة مع مثال تطبيقي؟`,
      "explain",
      subjectTitle
    );
  };

  // Quiz Finished Handler
  const handleFinishQuiz = (
    scorePercent: number,
    correctCount: number,
    totalCount: number,
    xpEarned: number
  ) => {
    setProfile((prev) => {
      const newTotal = prev.totalQuizzesTaken + 1;
      const newAvg = Math.round(
        (prev.averageQuizScore * prev.totalQuizzesTaken + scorePercent) / newTotal
      );
      return {
        ...prev,
        xp: prev.xp + xpEarned,
        totalQuizzesTaken: newTotal,
        averageQuizScore: newAvg,
      };
    });
  };

  // Flashcard Update Handler
  const handleUpdateFlashcard = (id: string, rating: "hard" | "medium" | "easy") => {
    setFlashcards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (rating === "easy") {
          return { ...c, status: "mastered", nextReviewDays: 7, retentionPercent: 95 };
        } else if (rating === "medium") {
          return { ...c, status: "soon", nextReviewDays: 3, retentionPercent: 75 };
        } else {
          return { ...c, status: "urgent", nextReviewDays: 1, retentionPercent: 40 };
        }
      })
    );
    setProfile((prev) => ({ ...prev, xp: prev.xp + 15 }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex antialiased selection:bg-indigo-500 selection:text-white" dir="rtl">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        activeSubjectPortalId={activeSubjectPortalId}
        subjects={subjects}
        onSelectSubjectDoor={handleOpenSubjectDoor}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsMobileSidebarOpen(false);
        }}
        profile={profile}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 lg:mr-64 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <Header
          profile={profile}
          currentView={currentView}
          activeSubjectPortalTitle={subjects.find((s) => s.id === activeSubjectPortalId)?.title}
          subjects={subjects}
          onSelectSubject={handleOpenSubjectDoor}
          onOpenGeneralExam={(subId) => {
            handleOpenSubjectDoor(subId);
          }}
          onOpenUnitNotes={(subId) => {
            handleOpenSubjectDoor(subId);
          }}
          onOpenUnitYoutube={(subId) => {
            handleOpenSubjectDoor(subId);
          }}
          onOpenUnitQuiz={(subId) => {
            handleOpenSubjectDoor(subId);
          }}
          onNavigateToMonthlyExams={() => {
            setCurrentView("monthly_exams");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onGradeChange={handleGradeChange}
          onOpenTimer={() => setIsTimerModalOpen(true)}
          timerActive={timerActive}
          timerSeconds={timerSeconds}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            setSoundEnabled(!soundEnabled);
            showToast(!soundEnabled ? "تم تفعيل الصوت 🔊" : "تم كتم الصوت 🔇");
          }}
          onShowToast={showToast}
        />

        {/* View Router Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === "home" && (
            <HomeView
              profile={profile}
              subjects={subjects}
              onNavigate={setCurrentView}
              onOpenSubjectDoor={handleOpenSubjectDoor}
              onOpenLessonModal={handleOpenLesson}
              onStartTimer={() => setIsTimerModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentView === "subject_portal" && (
            <SubjectPortalView
              subject={subjects.find((s) => s.id === activeSubjectPortalId) || subjects[0]}
              allSubjects={subjects}
              onSelectSubject={handleOpenSubjectDoor}
              onNavigateToMonthlyExams={() => {
                setCurrentView("monthly_exams");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenLesson={handleOpenLesson}
              onAskAi={(lessonTitle, subjectTitle) => {
                handleAskAiAboutLesson(lessonTitle, subjectTitle);
              }}
              onOpenUnitAi={(unit, subject) => {
                setActiveUnitAi({ unit, subject });
              }}
              onShowToast={showToast}
              onCompleteQuiz={(score, total, xp) => {
                const pct = total > 0 ? Math.round((score / total) * 100) : 0;
                handleFinishQuiz(pct, score, total, xp);
              }}
            />
          )}

          {currentView === "monthly_exams" && (
            <MonthlyAllSubjectsPortalView
              profile={profile}
              subjects={subjects}
              onOpenSubjectDoor={handleOpenSubjectDoor}
              onOpenLesson={handleOpenLesson}
              onShowToast={showToast}
              onRewardXp={(xp) => {
                setProfile((prev) => ({ ...prev, xp: prev.xp + xp }));
                showToast(`تمت إضافة +${xp} XP إلى رصيدك الأكاديمي! ⭐`);
              }}
            />
          )}

          {currentView === "curriculum" && (
            <CurriculumView
              subjects={subjects}
              onOpenLesson={handleOpenLesson}
              onAskAi={(lessonTitle, subjectTitle) => {
                handleAskAiAboutLesson(lessonTitle, subjectTitle);
              }}
              onOpenUnitAi={(unit, subject) => {
                setActiveUnitAi({ unit, subject });
              }}
            />
          )}

          {currentView === "ai" && (
            <AiTutorView
              gradeLevel={profile.gradeLevel}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onClearChat={() => {
                setChatMessages([]);
                showToast("تم بدء محادثة جديدة مع المدرس الذكي ✨");
              }}
              isLoading={isChatLoading}
              onShowToast={showToast}
            />
          )}

          {currentView === "quizzes" && (
            <QuizzesView
              profile={profile}
              subjects={subjects}
              presetQuestions={INITIAL_PRESET_QUIZ_QUESTIONS}
              onFinishQuiz={handleFinishQuiz}
              onShowToast={showToast}
            />
          )}

          {currentView === "review" && (
            <ReviewView
              flashcards={flashcards}
              onUpdateFlashcard={handleUpdateFlashcard}
              onAddFlashcard={(newCard) => setFlashcards((prev) => [newCard, ...prev])}
              onOpenLesson={handleOpenLesson}
              onShowToast={showToast}
            />
          )}

          {currentView === "progress" && (
            <ProgressView profile={profile} subjects={subjects} />
          )}

          {currentView === "parent" && (
            <ParentView
              profile={profile}
              subjects={subjects}
              onShowToast={showToast}
            />
          )}

          {currentView === "sources" && (
            <SourcesView
              sources={sources}
              onAddSource={(src) => setSources((prev) => [src, ...prev])}
              onShowToast={showToast}
            />
          )}

          {currentView === "achievements" && (
            <AchievementsView
              profile={profile}
              badges={badges}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <StudyTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        timerActive={timerActive}
        timerSeconds={timerSeconds}
        onToggleTimer={() => setTimerActive(!timerActive)}
        onResetTimer={() => {
          setTimerSeconds(0);
          setTimerActive(false);
        }}
        onAddMinutes={(mins) => setTimerSeconds((prev) => Math.max(0, prev + mins * 60))}
        onSessionFinished={handleSessionFinished}
      />

      <LessonModal
        lesson={activeLesson?.lesson || null}
        subject={activeLesson?.subject}
        isOpen={activeLesson !== null}
        onClose={() => setActiveLesson(null)}
        onCompleteLesson={handleCompleteLesson}
        onAskAiAboutLesson={handleAskAiAboutLesson}
        onShowToast={showToast}
      />

      <UnitAiModal
        unit={activeUnitAi?.unit || null}
        subject={activeUnitAi?.subject || null}
        gradeLevel={profile.gradeLevel}
        profile={profile}
        isOpen={activeUnitAi !== null}
        onClose={() => setActiveUnitAi(null)}
        onOpenLesson={handleOpenLesson}
        onAskAi={(question, context) => {
          handleAskAiAboutLesson(question, context);
        }}
        onFinishQuiz={handleFinishQuiz}
        onShowToast={showToast}
      />

      {/* Global Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
