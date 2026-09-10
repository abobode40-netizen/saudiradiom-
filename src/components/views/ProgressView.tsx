import React from "react";
import { StudentProfile, Subject } from "../../types";
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface ProgressViewProps {
  profile: StudentProfile;
  subjects: Subject[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({ profile, subjects }) => {
  // Weekly study minutes chart data
  const weeklyData = [
    { day: "السبت", minutes: 45 },
    { day: "الأحد", minutes: 60 },
    { day: "الإثنين", minutes: 50 },
    { day: "الثلاثاء", minutes: 40 },
    { day: "الأربعاء", minutes: 55 },
    { day: "الخميس", minutes: 70 },
    { day: "اليوم", minutes: profile.todayMinutes },
  ];

  // Core cognitive skills
  const skillsData = [
    { skill: "فهم المفاهيم", score: 90, fullMark: 100 },
    { skill: "التطبيق والتحليل", score: 82, fullMark: 100 },
    { skill: "حل المشكلات المركبة", score: 74, fullMark: 100 },
    { skill: "الدقة والسرعة", score: 79, fullMark: 100 },
    { skill: "الاستمرارية والانضباط", score: 88, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          📊 تحليلي الدراسي ومؤشرات الأداء
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          رصد دقيق لمستوى استيعابك، سرعة الحل، ومقارنة الأداء عبر المواد الدراسية المختلفة
        </p>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold">المذاكرة الأسبوعية</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono">
            {profile.weeklyMinutes} دقيقة
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            ↑ 15% زيادة عن الأسبوع الماضي
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold">دقة الاختبارات</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono">
            {profile.averageQuizScore}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            من إجمالي {profile.totalQuizzesTaken} اختبار
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold">سلسلة الانضباط</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            {profile.streakDays} أيام
          </div>
          <div className="text-[11px] text-orange-600 font-medium mt-0.5">
            هدفك القادم: 7 أيام
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold">مستوى الطالب</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            المستوى {profile.level}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5 font-mono">
            {profile.xp} XP مجموع
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Study Time Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-sm sm:text-base text-slate-800 mb-1">
            دقائق المذاكرة خلال الأسبوع
          </h3>
          <p className="text-xs text-slate-500 mb-4">توزيع وقت التركيز الفعلي يوماً بيوم</p>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value} دقيقة`, "الوقت"]}
                />
                <Bar dataKey="minutes" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cognitive Radar Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-sm sm:text-base text-slate-800 mb-1">
            رادار المهارات التفكيرية ونواتج التعلم
          </h3>
          <p className="text-xs text-slate-500 mb-4">تقييم شامل وفق تصنيف بلوم التربوي</p>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillsData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" stroke="#64748b" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={9} />
                <Radar
                  name="مستوى الطالب"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Table & Strengths vs Improvements */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-base text-slate-800 mb-4">
          تفصيل مؤشرات المهارات الأساسية
        </h3>
        <div className="divide-y divide-slate-100">
          {skillsData.map((item, idx) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="w-48 text-xs font-bold text-slate-700">{item.skill}</div>
              <div className="flex-1 flex items-center gap-3">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-600 rounded-full"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-indigo-600 font-mono w-10 text-left">
                  {item.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strength and Weakness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200">
          <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            💪 نقطة قوة بارزة
          </h3>
          <p className="text-xs text-emerald-900 leading-relaxed">
            استيعابك للمفاهيم الأساسية والقوانين سريع جداً (90%)، وأظهرت تميزاً ملحوظاً في دروس العلوم المتكاملة (الأنظمة البيئية وخصائص الماء) وبلاغة اللغة العربية.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200">
          <h3 className="font-bold text-sm text-amber-950 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            🔧 تحتاج تدريباً إضافياً
          </h3>
          <p className="text-xs text-amber-900 leading-relaxed">
            المسائل متعددة الخطوات في الرياضيات (مثل ضرب المرافق ومسائل المميز المعقدة). نوصي بتخصيص 15 دقيقة يومياً للتدريب عبر المدرس الذكي.
          </p>
        </div>
      </div>
    </div>
  );
};
