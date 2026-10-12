import React from 'react';
import { useApp } from '../../context/AppContext';
import { ReadinessGauge, ActivityHeatmap } from '../common/Charts';
import { DifficultyBadge, PlatformBadge } from '../common/Badges';
import {
  Flame,
  Target,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Timer,
  Plus,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export const DashboardView: React.FC<{
  setCurrentTab: (tab: string) => void;
  openAddModal: () => void;
}> = ({ setCurrentTab, openAddModal }) => {
  const {
    user,
    problems,
    readinessScore,
    currentStreakDays,
    todaySolvesCount,
    weakestTopics,
    recommendations,
    revisions,
    advanceRevision,
    startTimer,
    addProblem,
  } = useApp();

  const dueRevisions = revisions.filter(
    (r) => r.status === 'due' || r.status === 'overdue'
  );

  const totalSolved = problems.filter((p) => p.status === 'Solved').length;
  const easyCount = problems.filter((p) => p.difficulty === 'Easy' && p.status === 'Solved').length;
  const medCount = problems.filter((p) => p.difficulty === 'Medium' && p.status === 'Solved').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard' && p.status === 'Solved').length;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {user?.college || 'Computer Science Student'}
            </span>
            <span className="text-xs text-indigo-300 font-medium">
              Target: {user?.targetRole || 'SDE-1'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Candidate'}! 👋
          </h1>
          <p className="text-sm text-indigo-200/80 max-w-xl">
            You are currently on a <strong className="text-white font-semibold">{currentStreakDays}-day streak</strong>. Target date: {user?.targetDate ? new Date(user.targetDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Dec 2026'}.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-slate-100 font-bold text-xs shadow-lg transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Log Problem</span>
          </button>
          <button
            onClick={() => setCurrentTab('timer')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-700/80 text-white font-semibold text-xs border border-indigo-400/30 transition-all"
          >
            <Timer className="w-4 h-4" />
            <span>Open Timer</span>
          </button>
        </div>
      </div>

      {/* Top Grid: Interview Readiness Gauge + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interview Readiness Card (OBJ-06) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Interview Readiness Score (OBJ-06)
                </h2>
                <div
                  className="group relative cursor-pointer text-slate-400 hover:text-slate-600"
                  title="Computed via 5 weighted pillars: Topic Coverage, Difficulty Mix, Consistency Streak, Solving Speed, and Revision Discipline."
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Placement benchmark evaluation for top tech company rounds
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('weakness')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Weakness Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <ReadinessGauge
              score={readinessScore.totalScore}
              tier={readinessScore.tier}
              tierColor={readinessScore.tierColor}
              size={170}
            />

            <div className="flex-1 w-full space-y-2.5 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600 dark:text-slate-300">Topic Coverage (0-25)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {readinessScore.components.topicCoverage.score}/25
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${readinessScore.components.topicCoverage.percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600 dark:text-slate-300">Difficulty Mix (0-25)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {readinessScore.components.difficultyMix.score}/25
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                    style={{ width: `${readinessScore.components.difficultyMix.percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600 dark:text-slate-300">Consistency & Streak (0-15)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {readinessScore.components.consistencyStreak.score}/15
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${readinessScore.components.consistencyStreak.percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600 dark:text-slate-300">Solving Speed (0-20)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {readinessScore.components.solvingSpeed.score}/20
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${readinessScore.components.solvingSpeed.percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600 dark:text-slate-300">Revision Discipline (0-15)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {readinessScore.components.revisionDiscipline.score}/15
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${readinessScore.components.revisionDiscipline.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3 Concrete Action Suggestions */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>3 Concrete Steps to Reach 85+ Readiness:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {readinessScore.suggestions.map((sug, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Quick Overview KPIs */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Total Solved Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                Total Solved
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalSolved}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-slate-500">
                <span className="text-emerald-500 font-bold">{easyCount}E</span> •
                <span className="text-amber-500 font-bold">{medCount}M</span> •
                <span className="text-rose-500 font-bold">{hardCount}H</span>
              </div>
            </div>

            {/* Daily Habit & Streak */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Active Streak</span>
              </div>
              <div className="text-3xl font-extrabold text-amber-500">
                {currentStreakDays} <span className="text-sm font-semibold text-slate-400">days</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Today: <strong className="text-slate-900 dark:text-white">{todaySolvesCount}</strong> / {user?.dailyGoal || 4} goal
              </div>
            </div>
          </div>

          {/* Weakest 3 Topics Spotlight Card (OBJ-03) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Weakest 3 Topics Spotlight (OBJ-03)</span>
                </div>
                <button
                  onClick={() => setCurrentTab('weakness')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Formula & Details
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Identified based on solve deficit, high average time, low accuracy, and inactivity.
              </p>

              <div className="space-y-2">
                {weakestTopics.map((topic) => (
                  <div
                    key={topic.topic}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {topic.topic}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {topic.solvedCount} solved • Avg {topic.avgTimeMinutes}m • {topic.successRate}% acc
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {topic.weaknessScore}/100 Weakness
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('recommendations')}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Practice Recommended Problems for Weak Topics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: Due Today Revisions + Top Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revision Queue (OBJ-05) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Spaced Repetition Queue (OBJ-05)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {dueRevisions.length} item{dueRevisions.length === 1 ? '' : 's'} due for active recall
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('revision')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Calendar
            </button>
          </div>

          {dueRevisions.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                All Revisions Cleared! 🎉
              </div>
              <p className="text-xs text-slate-500">
                You’re on track with the 1, 3, 7, 14, 30 day spaced repetition schedule.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dueRevisions.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    item.status === 'overdue'
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white hover:text-indigo-500 flex items-center gap-1.5">
                        <a href={item.link} target="_blank" rel="noreferrer" className="hover:underline">
                          {item.problemName}
                        </a>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{item.topic}</span>
                        <span>•</span>
                        <DifficultyBadge difficulty={item.difficulty} size="sm" />
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'overdue'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {item.status === 'overdue' ? 'Overdue' : 'Due Today'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <button
                      onClick={() => advanceRevision(item.id, 'mastered')}
                      className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors"
                    >
                      Mastered (+Stage)
                    </button>
                    <button
                      onClick={() => advanceRevision(item.id, 'struggled')}
                      className="py-1 px-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
                    >
                      Struggled
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Next 5 Recommendations Preview (OBJ-04) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Top Problem Recommendations (OBJ-04)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Targeted by algorithmic weakness, mastery progression, and tag affinity
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('recommendations')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Recommendations
            </button>
          </div>

          <div className="space-y-2.5">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.problem.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white hover:text-indigo-500">
                      <a href={rec.problem.link} target="_blank" rel="noreferrer" className="hover:underline">
                        {rec.problem.name}
                      </a>
                    </span>
                    <DifficultyBadge difficulty={rec.problem.difficulty} size="sm" />
                    <PlatformBadge platform={rec.problem.platform} />
                  </div>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    💡 Why this: {rec.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      startTimer({
                        name: rec.problem.name,
                        difficulty: rec.problem.difficulty,
                        topic: rec.problem.topic,
                      })
                    }
                    className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
                    title="Start stopwatch timer on this problem"
                  >
                    <Timer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      addProblem({
                        name: rec.problem.name,
                        platform: rec.problem.platform,
                        difficulty: rec.problem.difficulty,
                        topic: rec.problem.topic,
                        tags: rec.problem.tags,
                        link: rec.problem.link,
                        notes: `Solved via recommendation engine.`,
                        status: 'Solved',
                        dateSolved: new Date().toISOString().split('T')[0],
                        timeSpentMinutes: rec.problem.defaultTimeEstimate,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                  >
                    Mark Solved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Activity Heatmap */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <ActivityHeatmap problems={problems} />
      </div>

      {/* Humanized Student Footer Note */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-900/60 border border-indigo-100/60 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="font-semibold text-slate-700 dark:text-slate-300">
          CodeCompass • Designed & Developed by Shivanshi Bhatt (Class of '26)
        </div>
        <p className="text-[11px] text-slate-400">
          Built for campus placement prep • LocalStorage offline data persistence • Spaced repetition intervals 1-3-7-14-30d
        </p>
      </div>
    </div>
  );
};
