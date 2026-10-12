import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Flame,
  Moon,
  Sun,
  Timer as TimerIcon,
  RotateCcw,
  Sparkles,
  User,
  Play,
  Pause,
  GraduationCap,
} from 'lucide-react';
import { VivaNotesModal } from './common/VivaNotesModal';

export const Navbar: React.FC<{
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
}> = ({ setCurrentTab, openAuthModal }) => {
  const {
    user,
    currentStreakDays,
    todaySolvesCount,
    theme,
    toggleTheme,
    timer,
    pauseTimer,
    resumeTimer,
    revisions,
    loadDemoData,
    resetUserData,
  } = useApp();

  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);

  const dueRevisionsCount = revisions.filter(
    (r) => r.status === 'due' || r.status === 'overdue'
  ).length;

  const formatTimerSecs = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
                CodeCompass
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Shivanshi's Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Personal DSA Study Tracker • Placement Batch '26
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Timer Pill if running */}
          {timer.secondsElapsed > 0 && (
            <div
              onClick={() => setCurrentTab('timer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium cursor-pointer transition-all shadow-xs ${
                timer.isRunning
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}
            >
              <TimerIcon className="w-4 h-4" />
              <span>{formatTimerSecs(timer.secondsElapsed)}</span>
              {timer.isRunning ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    pauseTimer();
                  }}
                  className="p-0.5 hover:opacity-80"
                  title="Pause Timer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resumeTimer();
                  }}
                  className="p-0.5 hover:opacity-80"
                  title="Resume Timer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
            </div>
          )}

          {/* Daily Streak Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold"
            title={`${currentStreakDays} days active problem-solving streak!`}
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
            <span>{currentStreakDays}d streak</span>
          </div>

          {/* Viva Notes Button */}
          <button
            onClick={() => setIsVivaModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition-all shadow-xs"
            title="Read how I built CodeCompass and the scoring formulas for Viva defense"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
            <span>Viva Notes</span>
          </button>

          {/* Quick Demo Controls */}
          <button
            onClick={loadDemoData}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
            title="Reload realistic 47 problems demo dataset"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Seed Demo</span>
          </button>

          {/* FIXED & ENHANCED LIGHT / DARK MODE TOGGLE */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle light dark theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-semibold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-[11px] font-semibold">Dark</span>
              </>
            )}
          </button>

          {/* Profile / Auth Button */}
          {user ? (
            <button
              onClick={() => setCurrentTab('profile')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 bg-slate-50 dark:bg-slate-800/60 transition-colors"
              title="View profile and placement goals"
            >
              <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Viva Explanation Modal */}
      <VivaNotesModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
      />
    </header>
  );
};
