import React from "react";
import { Badge, StudentProfile } from "../../types";
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  Star,
  CheckCircle2,
  Lock,
  Crown,
  Medal,
} from "lucide-react";

interface AchievementsViewProps {
  profile: StudentProfile;
  badges: Badge[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ profile, badges }) => {
  const currentLevel = profile.level;
  const currentXp = profile.xp;
  const nextLevelXp = (currentLevel + 1) * 300;
  const levelProgress = Math.min(100, Math.round(((currentXp % 300) / 300) * 100));

  const leaderboard = [
    { rank: 1, name: "عمر خالد", xp: 1420, level: 5, streak: 12, avatar: "👑" },
    { rank: 2, name: profile.name, xp: profile.xp, level: profile.level, streak: profile.streakDays, avatar: "⭐", isMe: true },
    { rank: 3, name: "سارة محمد", xp: 810, level: 3, streak: 8, avatar: "🥇" },
    { rank: 4, name: "يوسف إبراهيم", xp: 760, level: 3, streak: 5, avatar: "🥈" },
    { rank: 5, name: "مريم أحمد", xp: 620, level: 2, streak: 4, avatar: "🥉" },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          🏆 الأوسمة ولوحة شرف المتفوقين
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          نظام المكافآت التنافسي لتشجيع الاستمرارية وتحقيق نواتج التعلم
        </p>
      </div>

      {/* Level Progress Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500 via-orange-500 to-indigo-600 text-white shadow-xl shadow-orange-950/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner">
              ⭐
            </div>
            <div>
              <span className="text-xs font-bold text-amber-100 uppercase tracking-wide">
                المستوى الدراسي الحالي
              </span>
              <h3 className="text-2xl font-black">
                المستوى {profile.level}: طالب متميز
              </h3>
            </div>
          </div>

          <div className="text-right sm:text-left">
            <span className="text-xs text-amber-100">إجمالي النقاط:</span>
            <div className="text-2xl font-black font-mono">{profile.xp} XP</div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-100">
            <span>التقدم نحو المستوى {profile.level + 1}</span>
            <span className="font-mono">{levelProgress}%</span>
          </div>
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3">
          الأوسمة والإنجازات ({badges.filter((b) => b.unlocked).length} من {badges.length} مكتمل)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-5 rounded-3xl border transition flex items-start gap-4 ${
                badge.unlocked
                  ? "bg-white border-slate-200/90 shadow-xs hover:border-amber-300"
                  : "bg-slate-50 border-slate-200/60 opacity-60"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  badge.unlocked
                    ? "bg-amber-50 border border-amber-200 text-amber-600 shadow-xs"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {badge.unlocked ? badge.icon : <Lock className="w-6 h-6 text-slate-400" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">{badge.title}</h4>
                  {badge.unlocked && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{badge.description}</p>
                {(badge.unlockedDate || badge.unlockedAt) && (
                  <span className="text-[10px] text-indigo-600 font-semibold block pt-1">
                    تم الإنجاز: {badge.unlockedDate || badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              لوحة شرف الأسبوع (أوائل الثانوية)
            </h3>
            <p className="text-xs text-slate-500">تعتمد على نقاط التركيز ودقة حل الاختبارات</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            تحديث يومي
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {leaderboard.map((item) => (
            <div
              key={item.rank}
              className={`py-3.5 px-3 rounded-2xl flex items-center justify-between gap-3 transition ${
                item.isMe ? "bg-indigo-50/80 border border-indigo-200" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black font-mono ${
                    item.rank === 1
                      ? "bg-amber-400 text-white shadow-xs"
                      : item.rank === 2
                      ? "bg-slate-300 text-slate-800"
                      : item.rank === 3
                      ? "bg-amber-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.rank}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.avatar}</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-bold">
                          أنت
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      المستوى {item.level} • {item.streak} أيام متواصلة 🔥
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs sm:text-sm font-black text-indigo-700 font-mono">
                  {item.xp} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
