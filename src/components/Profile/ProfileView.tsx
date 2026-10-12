import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_USER } from '../../data/seedData';
import {
  User,
  GraduationCap,
  Target,
  Calendar,
  Sparkles,
  RotateCcw,
  LogOut,
  Trash2,
  Check,
  Building,
  Flame,
  Award,
} from 'lucide-react';

export const ProfileView: React.FC<{
  openAuthModal: () => void;
}> = ({ openAuthModal }) => {
  const {
    user,
    updateProfile,
    logout,
    loadDemoStudent,
    resetUserData,
    loadDemoData,
    readinessScore,
    currentStreakDays,
    problems,
  } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [targetCompany, setTargetCompany] = useState(user?.targetCompany || '');
  const [targetDate, setTargetDate] = useState(user?.targetDate || '');
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 4);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      college,
      targetRole,
      targetCompany,
      targetDate,
      dailyGoal: Number(dailyGoal) || 3,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Student Profile & Placement Goals
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage target companies, placement timeline, and personalized daily goals.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
            <User className="w-6 h-6" />
          </div>

          <div className="text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {user?.name || 'Student Candidate'}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 self-start sm:self-auto">
                {user?.targetRole || 'SDE-1'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.college || 'Computer Science Engineering'} • {user?.email}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                <span>Readiness: <strong>{readinessScore.totalScore}/100</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Streak: <strong>{currentStreakDays} days</strong></span>
              </span>
              <span>
                Problems: <strong>{problems.filter((p) => p.status === 'Solved').length} solved</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0">
          <button
            onClick={openAuthModal}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            Switch Profile
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <span>Edit Student & Placement Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">College / Department</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold block mb-1">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Target Companies</label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Target Placement Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-1">Daily Problem Target (Goal)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="w-32 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>

      {/* Humanized Project Story Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-pink-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-slate-800 space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
            About the Project • Shivanshi's Story
          </h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          I created CodeCompass during my final year at college to solve my own biggest placement preparation hurdle: having 100+ solved problems scattered across LeetCode, GeeksforGeeks, and Striver sheets without knowing which algorithm families I was actually failing on in timed conditions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">1. Weakness Model</strong>
            Multi-factor weighted penalties for deficit, failure rate, speed overruns, and Ebbinghaus forgetting decay.
          </div>
          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <strong className="text-emerald-600 dark:text-emerald-400 block mb-0.5">2. Spaced Repetition</strong>
            1, 3, 7, 14, and 30-day review intervals so algorithmic patterns stay active in long-term memory.
          </div>
          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <strong className="text-cyan-600 dark:text-cyan-400 block mb-0.5">3. 100% Client-Side</strong>
            Safe, private localStorage with no external API rate limits or scrapers that break during interviews.
          </div>
        </div>
      </div>

      {/* Constraints Buttons: Load Demo Data & Reset Data */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Demo & Data Controls
          </h3>
          <p className="text-xs text-slate-400">
            Reset data to evaluate zero-state behavior or reload complete seeded demo portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadDemoData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-bold text-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Load Demo Data (47 Solved Problems)</span>
          </button>

          <button
            onClick={resetUserData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Data (Clear Repository)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
