import React, { useState, useMemo } from "react";
import { StudentProfile } from "../types";
import {
  Crown,
  Trophy,
  Flame,
  Sparkles,
  ChevronUp,
  Award,
  Zap,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";

export interface LeaderboardStudent {
  id: string;
  name: string;
  governorate: string;
  grade: string;
  branch: string;
  xp: number;
  level: number;
  streakDays: number;
  avatar: string;
  isCurrentUser?: boolean;
}

interface MiniLeaderboardProps {
  profile: StudentProfile;
  onShowToast?: (message: string) => void;
  className?: string;
  compact?: boolean;
}

// Sample peer high-school students representing Egyptian high schools
const PEER_STUDENTS: Omit<LeaderboardStudent, "isCurrentUser">[] = [
  {
    id: "s1",
    name: "عمر خالد المنشاوي",
    governorate: "القاهرة (مدرسة المتفوقين)",
    grade: "الصف الأول الثانوي",
    branch: "عام",
    xp: 1450,
    level: 5,
    streakDays: 14,
    avatar: "👑",
  },
  {
    id: "s2",
    name: "سلمى طارق الشافعي",
    governorate: "الإسكندرية",
    grade: "الصف الأول الثانوي",
    branch: "عام",
    xp: 1220,
    level: 5,
    streakDays: 11,
    avatar: "🥈",
  },
  {
    id: "s3",
    name: "أحمد حسام الشناوي",
    governorate: "الدقهلية (المنصورة)",
    grade: "الصف الأول الثانوي",
    branch: "عام",
    xp: 980,
    level: 4,
    streakDays: 9,
    avatar: "🥉",
  },
  {
    id: "s4",
    name: "نورهان إبراهيم الجندي",
    governorate: "الجيزة",
    grade: "الصف الأول الثانوي",
    branch: "عام",
    xp: 870,
    level: 4,
    streakDays: 7,
    avatar: "⭐",
  },
  {
    id: "s5",
    name: "زياد محمود الصاوي",
    governorate: "أسيوط",
    grade: "الصف الأول الثانوي",
    branch: "عام",
    xp: 740,
    level: 3,
    streakDays: 6,
    avatar: "🎯",
  },
  {
    id: "s6",
    name: "مريم مصطفى فكري",
    governorate: "الغربية (طنطا)",
    grade: "الصف الأول الثانوي",
    branch: "عام",
    xp: 660,
    level: 3,
    streakDays: 5,
    avatar: "📚",
  },
  {
    id: "s7",
    name: "كريم عبد الله زايد",
    governorate: "الإسماعيلية",
    grade: "الصف الأول الثانوي",
    branch: "عام",
    xp: 520,
    level: 2,
    streakDays: 4,
    avatar: "💡",
  },
];

export const MiniLeaderboard: React.FC<MiniLeaderboardProps> = ({
  profile,
  onShowToast,
  className = "",
  compact = false,
}) => {
  const [filter, setFilter] = useState<"weekly" | "grade" | "all">("weekly");
  const [showXpGuide, setShowXpGuide] = useState(false);

  // Compute all students including the current user with dynamic multipliers based on filter
  const allStudentsRanked = useMemo(() => {
    const currentUser: LeaderboardStudent = {
      id: "current_user",
      name: profile.name || "أنت",
      governorate: "مدرستي الثانوية",
      grade:
        profile.gradeLevel === "1st_secondary"
          ? "الصف الأول الثانوي"
          : profile.gradeLevel === "2nd_secondary"
          ? "الصف الثاني الثانوي"
          : "الصف الثالث الثانوي",
      branch: profile.branch === "scientific" ? "علمي" : profile.branch === "literary" ? "أدبي" : "عام",
      xp: profile.xp,
      level: profile.level,
      streakDays: profile.streakDays,
      avatar: "⭐",
      isCurrentUser: true,
    };

    // Apply slight weighting based on filter mode
    const multiplier = filter === "weekly" ? 0.65 : filter === "grade" ? 0.9 : 1.0;

    const list: LeaderboardStudent[] = [
      ...PEER_STUDENTS.map((s) => ({
        ...s,
        xp: Math.round(s.xp * multiplier),
      })),
      currentUser,
    ];

    // Sort strictly by XP descending
    list.sort((a, b) => b.xp - a.xp);

    return list;
  }, [profile, filter]);

  // Extract exactly the Top 5 students
  const top5Students = useMemo(() => {
    return allStudentsRanked.slice(0, 5);
  }, [allStudentsRanked]);

  // Determine current user's exact rank
  const currentUserIndex = allStudentsRanked.findIndex((s) => s.isCurrentUser);
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;
  const isUserInTop5 = currentUserRank !== null && currentUserRank <= 5;
  const fifthPlaceXp = top5Students.length >= 5 ? top5Students[4].xp : 0;
  const xpDifferenceToTop5 = !isUserInTop5 && currentUserRank ? fifthPlaceXp - profile.xp + 10 : 0;
  const highestXp = top5Students.length > 0 ? top5Students[0].xp : 1;

  const handleCheerStudent = (studentName: string) => {
    if (onShowToast) {
      onShowToast(`أرسلت تحية وتشجيعاً لزميلك ${studentName} 👏`);
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-linear-to-r from-amber-50/70 via-slate-50 to-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center text-xl shrink-0 shadow-xs">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                <span>لوحة الصدارة المصغرة</span>
                <span className="text-amber-500">🏆</span>
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                أعلى 5 طلاب بالـ XP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ترتيب الطلاب المتصدرين بناءً على نقاط الخبرة وحل الاختبارات
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setFilter("weekly")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "weekly"
                ? "bg-white text-indigo-700 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            هذا الأسبوع
          </button>
          <button
            onClick={() => setFilter("grade")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "grade"
                ? "bg-white text-indigo-700 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            دفعة ثانوي
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "all"
                ? "bg-white text-indigo-700 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            التراكمي
          </button>
        </div>
      </div>

      {/* Top 3 Podium Highlights (if not ultra-compact) */}
      {!compact && top5Students.length >= 3 && (
        <div className="px-4 pt-5 pb-3 border-b border-slate-100 bg-slate-50/50">
          <div className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              منصة تتويج الأوائل الثلاثة
            </span>
            <span className="text-[11px] text-indigo-600 font-medium">محدث فورياً</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end max-w-lg mx-auto pt-2 pb-1">
            {/* Rank 2 (Silver) */}
            <div className="flex flex-col items-center text-center order-1">
              <div className="relative mb-1">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-2xl shadow-xs">
                  {top5Students[1]?.avatar || "🥈"}
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-400 text-white font-black text-[11px] flex items-center justify-center border border-white">
                  2
                </span>
              </div>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[90px] sm:max-w-[110px] mt-1">
                {top5Students[1]?.name}
              </span>
              {top5Students[1]?.isCurrentUser && (
                <span className="text-[9px] font-black px-1.5 rounded bg-indigo-600 text-white">
                  أنت
                </span>
              )}
              <span className="text-[11px] font-black text-slate-600 font-mono mt-0.5">
                {top5Students[1]?.xp} XP
              </span>
              <div className="w-full bg-slate-200/80 rounded-t-xl h-12 mt-2 flex items-center justify-center text-slate-500 font-bold text-xs border-t border-x border-slate-300">
                الوصيف
              </div>
            </div>

            {/* Rank 1 (Gold / Champion) */}
            <div className="flex flex-col items-center text-center order-2">
              <div className="relative mb-1">
                <Crown className="w-5 h-5 text-amber-500 mx-auto -mb-1 animate-bounce" />
                <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-sm ring-4 ring-amber-400/20">
                  {top5Students[0]?.avatar || "👑"}
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                  1
                </span>
              </div>
              <span className="text-xs font-extrabold text-amber-950 truncate max-w-[100px] sm:max-w-[125px] mt-1">
                {top5Students[0]?.name}
              </span>
              {top5Students[0]?.isCurrentUser && (
                <span className="text-[9px] font-black px-1.5 rounded bg-amber-600 text-white">
                  أنت المتصدر!
                </span>
              )}
              <span className="text-xs font-black text-amber-700 font-mono mt-0.5">
                {top5Students[0]?.xp} XP
              </span>
              <div className="w-full bg-linear-to-b from-amber-300 to-amber-400 rounded-t-xl h-20 mt-2 flex flex-col items-center justify-center text-amber-950 font-black text-xs shadow-xs border-t border-x border-amber-400">
                <span>المتصدر</span>
                <span className="text-[10px] font-normal opacity-80">المركز 1 🥇</span>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="flex flex-col items-center text-center order-3">
              <div className="relative mb-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border-2 border-amber-700/40 flex items-center justify-center text-2xl shadow-xs">
                  {top5Students[2]?.avatar || "🥉"}
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[11px] flex items-center justify-center border border-white">
                  3
                </span>
              </div>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[90px] sm:max-w-[110px] mt-1">
                {top5Students[2]?.name}
              </span>
              {top5Students[2]?.isCurrentUser && (
                <span className="text-[9px] font-black px-1.5 rounded bg-indigo-600 text-white">
                  أنت
                </span>
              )}
              <span className="text-[11px] font-black text-amber-800 font-mono mt-0.5">
                {top5Students[2]?.xp} XP
              </span>
              <div className="w-full bg-amber-200/60 rounded-t-xl h-8 mt-2 flex items-center justify-center text-amber-900 font-bold text-xs border-t border-x border-amber-700/20">
                المركز 3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Detailed Student List */}
      <div className="p-3 sm:p-4 divide-y divide-slate-100">
        <div className="text-xs font-bold text-slate-500 pb-2 px-2 flex items-center justify-between">
          <span>قائمة أعلى 5 طلاب حسب نقاط الـ XP المكتسبة:</span>
          <span className="text-[11px] text-slate-400">الترتيب من 1 إلى 5</span>
        </div>

        {top5Students.map((student, idx) => {
          const rank = idx + 1;
          const isCurrentUser = !!student.isCurrentUser;
          const xpPercentOfLeader = Math.min(100, Math.round((student.xp / highestXp) * 100));

          return (
            <div
              key={student.id}
              className={`py-3 px-3 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 ${
                isCurrentUser
                  ? "bg-indigo-50/90 border border-indigo-200/90 shadow-xs scale-[1.01]"
                  : "hover:bg-slate-50"
              }`}
            >
              {/* Left Side: Rank, Avatar & Information */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Badge */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-black font-mono shrink-0 shadow-xs ${
                    rank === 1
                      ? "bg-amber-400 text-white ring-2 ring-amber-300"
                      : rank === 2
                      ? "bg-slate-300 text-slate-800"
                      : rank === 3
                      ? "bg-amber-700 text-white"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                </div>

                {/* Avatar Icon */}
                <div className="text-xl sm:text-2xl shrink-0">{student.avatar}</div>

                {/* Student Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                      {student.name}
                    </h4>
                    {isCurrentUser && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-indigo-600 text-white shrink-0">
                        أنت
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    <span>{student.governorate}</span>
                    <span>•</span>
                    <span className="text-orange-500 font-bold flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-orange-500" />
                      {student.streakDays} أيام
                    </span>
                    <span>•</span>
                    <span className="hidden sm:inline text-slate-500 font-semibold">
                      المستوى {student.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: XP & Visual Gauge */}
              <div className="text-left shrink-0 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-black text-indigo-700 font-mono">
                    {student.xp}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">XP</span>
                </div>

                {/* Relative XP bar */}
                <div className="w-16 sm:w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rank === 1
                        ? "bg-amber-400"
                        : rank === 2
                        ? "bg-slate-400"
                        : rank === 3
                        ? "bg-amber-600"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${xpPercentOfLeader}%` }}
                  />
                </div>

                {!isCurrentUser && (
                  <button
                    onClick={() => handleCheerStudent(student.name)}
                    className="text-[10px] text-slate-400 hover:text-indigo-600 transition flex items-center gap-0.5 mt-0.5"
                    title="إرسال تحية تشجيعية"
                  >
                    <span>تشجيع</span>
                    <span>👏</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Standing Footer Banner */}
      <div className="p-3 sm:p-4 bg-slate-50/80 border-t border-slate-100">
        {isUserInTop5 ? (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  تهانينا يا {profile.name}! أنت متواجد حالياً في قائمة الـ 5 الأوائل (المركز #{currentUserRank})
                </p>
                <p className="text-[11px] text-emerald-700">
                  لديك {profile.xp} XP • حافظ على استمراريتك لحصد صدارة الأسبوع!
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-600 text-white shrink-0 font-mono">
              #{currentUserRank}
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                #{currentUserRank || 6}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  مركزك الحالي: المركز #{currentUserRank || 6} ({profile.xp} XP)
                </p>
                <p className="text-[11px] text-slate-500">
                  يفصلك فقط <span className="font-bold text-indigo-700">{xpDifferenceToTop5} XP</span> عن دخول لوحة الصدارة لأعلى 5 طلاب! 🚀
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowXpGuide(!showXpGuide)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>كيف تكسب XP؟</span>
            </button>
          </div>
        )}

        {/* Collapsible XP Earning Guide */}
        {showXpGuide && (
          <div className="mt-3 p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              أفضل الطرق السريعة لحصد نقاط الـ XP والتقدم في لوحة الصدارة:
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
              <li className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                <span className="font-bold text-indigo-600 font-mono">+100 XP</span>
                <span>إنهاء درس دراسي كامل وتأكيد الاستيعاب</span>
              </li>
              <li className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                <span className="font-bold text-emerald-600 font-mono">+50 XP</span>
                <span>اجتياز اختبار قصير بدرجة 80% فأكثر</span>
              </li>
              <li className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                <span className="font-bold text-amber-600 font-mono">+150 XP</span>
                <span>خوض الامتحان الشهري المشترك للمواد</span>
              </li>
              <li className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                <span className="font-bold text-orange-600 font-mono">+25 XP</span>
                <span>المراجعة الذكية للبطاقات كل صباح</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
