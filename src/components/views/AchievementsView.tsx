import React, { useState } from "react";
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
  Target,
  Zap,
} from "lucide-react";
import { MiniLeaderboard } from "../MiniLeaderboard";

interface AchievementsViewProps {
  profile: StudentProfile;
  badges: Badge[];
  onShowToast?: (message: string) => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  profile,
  badges,
  onShowToast,
}) => {
  const currentLevel = profile.level;
  const currentXp = profile.xp;
  const nextLevelXp = (currentLevel + 1) * 300;
  const levelProgress = Math.min(100, Math.round(((currentXp % 300) / 300) * 100));

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>🏆 قائمة الإنجازات ولوحة الصدارة</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              موسم 2026/2027
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تابع ترتيبك الأكاديمي بين متفوقي الثانوية، واجمع أوسمة الإتقان والاستمرارية
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-700">
              {unlockedCount} / {badges.length} وسام
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-indigo-700 font-mono">
              {profile.xp} XP
            </span>
          </div>
        </div>
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
                المستوى الدراسي التراكمي
              </span>
              <h3 className="text-2xl font-black">
                المستوى {profile.level}: طالب متميز
              </h3>
            </div>
          </div>

          <div className="text-right sm:text-left">
            <span className="text-xs text-amber-100">إجمالي نقاط الـ XP المكتسبة:</span>
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

      {/* CORE FEATURE: Mini Leaderboard (أعلى 5 طلاب في قائمة الإنجازات) */}
      <MiniLeaderboard
        profile={profile}
        onShowToast={onShowToast}
      />

      {/* Badges Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>الأوسمة والميداليات المستحقة</span>
            <span className="text-xs font-normal text-slate-400">
              ({unlockedCount} من {badges.length} مكتمل)
            </span>
          </h3>
          <span className="text-xs text-slate-400">تفتح تلقائياً عند إنجاز الأهداف</span>
        </div>

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
                {badge.unlocked && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    +{badge.xpReward} XP مكافأة
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
