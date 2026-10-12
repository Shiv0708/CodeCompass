import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DifficultyBadge } from '../common/Badges';
import { SRS_INTERVALS } from '../../utils/scoring';
import {
  RotateCcw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Clock,
  Check,
  X,
  HelpCircle,
} from 'lucide-react';

export const RevisionPlannerView: React.FC = () => {
  const { revisions, advanceRevision, deleteRevision, addToast } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'due' | 'overdue' | 'upcoming'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const dueTodayList = revisions.filter((r) => r.status === 'due');
  const overdueList = revisions.filter((r) => r.status === 'overdue');
  const upcomingList = revisions.filter((r) => r.status === 'upcoming');

  const filteredList =
    activeFilter === 'due'
      ? dueTodayList
      : activeFilter === 'overdue'
      ? overdueList
      : activeFilter === 'upcoming'
      ? upcomingList
      : revisions;

  // Generate 7-day week strip starting from today
  const weekStripDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' });
    const formattedDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const itemsOnDay = revisions.filter((r) => r.dueDate === dateStr);

    return {
      dateStr,
      dayName,
      formattedDate,
      count: itemsOnDay.length,
      isToday: i === 0,
      items: itemsOnDay,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Spaced Repetition Revision Planner (OBJ-05)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Curved retention system: automated review intervals at 1, 3, 7, 14, and 30 days to counter algorithmic forgetting.
        </p>
      </div>

      {/* Spaced Repetition Formula Legend */}
      <div className="p-4 rounded-3xl bg-indigo-950/70 border border-indigo-500/30 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              5-Stage Spaced Repetition Intervals
            </h3>
          </div>
          <span className="text-[11px] text-indigo-300 font-mono">
            {revisions.length} total active problem cards
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {SRS_INTERVALS.map((interval, stage) => (
            <div
              key={stage}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center"
            >
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Stage {stage + 1}
              </div>
              <div className="text-base font-extrabold text-cyan-200 font-mono">
                +{interval} {interval === 1 ? 'day' : 'days'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Week Strip Calendar View */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              7-Day Upcoming Revision Horizon
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {weekStripDays.map((day) => (
            <div
              key={day.dateStr}
              className={`p-3 rounded-2xl border text-center transition-all ${
                day.isToday
                  ? 'border-indigo-500/50 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500">{day.dayName}</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {day.formattedDate}
              </div>
              <div className="mt-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                    day.count > 0
                      ? day.isToday
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {day.count} due
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgent Overdue Alert Banner if present */}
      {overdueList.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>
              <strong>{overdueList.length} revision{overdueList.length === 1 ? '' : 's'} overdue!</strong> Reviewing promptly protects your Interview Readiness Score from retention decay penalty.
            </span>
          </div>
          <button
            onClick={() => setActiveFilter('overdue')}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0"
          >
            Review Overdue
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          All Items ({revisions.length})
        </button>

        <button
          onClick={() => setActiveFilter('due')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeFilter === 'due'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Due Today ({dueTodayList.length})
        </button>

        <button
          onClick={() => setActiveFilter('overdue')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeFilter === 'overdue'
              ? 'bg-rose-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Overdue ({overdueList.length})
        </button>

        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeFilter === 'upcoming'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Upcoming ({upcomingList.length})
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              No items in this filter view
            </h3>
            <p className="text-xs text-slate-500">
              Problems solved in the repository or DSA sheets automatically schedule here.
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.status === 'overdue'
                  ? 'border-rose-500/40 bg-rose-50/30 dark:bg-rose-950/20'
                  : item.status === 'due'
                  ? 'border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5"
                  >
                    <span>{item.problemName}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                  <DifficultyBadge difficulty={item.difficulty} size="sm" />
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Topic: <strong className="text-slate-700 dark:text-slate-300">{item.topic}</strong></span>
                  <span>•</span>
                  <span>Stage: <strong>{item.stage + 1}/5 ({item.intervalDays}d)</strong></span>
                  <span>•</span>
                  <span>Due: <strong className={item.status === 'overdue' ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}>{item.dueDate}</strong></span>
                </div>
              </div>

              {/* Action Buttons: Mastered vs Struggled */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => advanceRevision(item.id, 'mastered')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-transform hover:scale-105"
                  title="Promote to next spaced interval"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mastered (+Interval)</span>
                </button>

                <button
                  onClick={() => advanceRevision(item.id, 'struggled')}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                  title="Reset to Day 1 interval for quick reinforcement"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Struggled (Reset)</span>
                </button>

                <button
                  onClick={() => deleteRevision(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Remove from planner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
