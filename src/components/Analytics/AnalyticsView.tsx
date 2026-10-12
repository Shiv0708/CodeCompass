import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SimpleBarChart, SimpleLineChart, ActivityHeatmap } from '../common/Charts';
import { TIME_BENCHMARKS } from '../../utils/scoring';
import {
  Clock,
  TrendingUp,
  BarChart2,
  Calendar,
  Flame,
  Zap,
  CheckCircle,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { problems, currentStreakDays } = useApp();

  const solved = useMemo(() => problems.filter((p) => p.status === 'Solved'), [problems]);

  // 1. Average solving time by difficulty
  const timeByDiff = useMemo(() => {
    const easySolves = solved.filter((p) => p.difficulty === 'Easy' && p.timeSpentMinutes > 0);
    const medSolves = solved.filter((p) => p.difficulty === 'Medium' && p.timeSpentMinutes > 0);
    const hardSolves = solved.filter((p) => p.difficulty === 'Hard' && p.timeSpentMinutes > 0);

    const easyAvg = easySolves.length > 0 ? Math.round(easySolves.reduce((s, p) => s + p.timeSpentMinutes, 0) / easySolves.length) : 0;
    const medAvg = medSolves.length > 0 ? Math.round(medSolves.reduce((s, p) => s + p.timeSpentMinutes, 0) / medSolves.length) : 0;
    const hardAvg = hardSolves.length > 0 ? Math.round(hardSolves.reduce((s, p) => s + p.timeSpentMinutes, 0) / hardSolves.length) : 0;

    return [
      {
        label: 'Easy Problems',
        value: easyAvg,
        benchmark: TIME_BENCHMARKS.Easy,
        colorClass: 'bg-emerald-500',
        formattedVal: `${easyAvg} mins (${easySolves.length} solved)`,
      },
      {
        label: 'Medium Problems',
        value: medAvg,
        benchmark: TIME_BENCHMARKS.Medium,
        colorClass: 'bg-amber-500',
        formattedVal: `${medAvg} mins (${medSolves.length} solved)`,
      },
      {
        label: 'Hard Problems',
        value: hardAvg,
        benchmark: TIME_BENCHMARKS.Hard,
        colorClass: 'bg-rose-500',
        formattedVal: `${hardAvg} mins (${hardSolves.length} solved)`,
      },
    ];
  }, [solved]);

  // 2. Weekly solving count over last 6 weeks
  const weeklySolves = useMemo(() => {
    const weeks: { label: string; count: number; totalMins: number }[] = [];
    const now = new Date();

    for (let w = 5; w >= 0; w--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (w + 1) * 7);
      const end = new Date(now);
      end.setDate(now.getDate() - w * 7);

      const inWeek = solved.filter((p) => {
        const d = new Date(p.dateSolved || p.createdAt);
        return d >= start && d < end;
      });

      const totalM = inWeek.reduce((s, p) => s + (p.timeSpentMinutes || 0), 0);
      weeks.push({
        label: w === 0 ? 'This Week' : `Wk -${w}`,
        count: inWeek.length,
        totalMins: totalM,
      });
    }

    return weeks;
  }, [solved]);

  // 3. Solving time trend over weeks (avg minutes per solve week by week)
  const timeTrend = useMemo(() => {
    return weeklySolves.map((w) => ({
      label: w.label,
      value: w.count > 0 ? Math.round(w.totalMins / w.count) : 25,
      subtext: `${w.count} problems`,
    }));
  }, [weeklySolves]);

  const weeklyBars = useMemo(() => {
    return weeklySolves.map((w) => ({
      label: w.label,
      value: w.count,
      formattedVal: `${w.count} solved`,
      colorClass: 'bg-indigo-600',
    }));
  }, [weeklySolves]);

  const totalMinutesSpent = useMemo(() => {
    return solved.reduce((acc, p) => acc + (p.timeSpentMinutes || 0), 0);
  }, [solved]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Time Tracking & Performance Analytics (OBJ-02)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Measure problem-solving efficiency, time trends against interview benchmarks, and weekly consistency.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Total Practice Time</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {Math.round(totalMinutesSpent / 60)} hrs {totalMinutesSpent % 60}m
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {solved.length} solved problems
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Avg Medium Speed</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {timeByDiff[1].value}m
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Target benchmark: 32m
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Active Streak</span>
          </div>
          <div className="text-2xl font-extrabold text-orange-500 font-mono">
            {currentStreakDays} days
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Consecutive daily solves
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>This Week Volume</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-500 font-mono">
            {weeklySolves[weeklySolves.length - 1].count} solves
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {weeklySolves[weeklySolves.length - 1].totalMins} minutes logged
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Solving Time by Difficulty Benchmark */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Average Solving Time by Difficulty
                </h3>
                <p className="text-[11px] text-slate-400">
                  Red vertical line denotes interview benchmark threshold
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <SimpleBarChart bars={timeByDiff} showBenchmark={true} maxVal={60} />
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Placement Benchmark Reference:
            </div>
            <div>• <strong>Easy:</strong> Target ≤ 18 mins (Warm-up & Screening)</div>
            <div>• <strong>Medium:</strong> Target ≤ 32 mins (Core Interview Coding Round)</div>
            <div>• <strong>Hard:</strong> Target ≤ 48 mins (Design / Advanced Onsite Round)</div>
          </div>
        </div>

        {/* Right: Average Time Trend Over Weeks */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Solving Time Trend (Past 6 Weeks)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Downward trend indicates increasing pattern fluency & speed
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <SimpleLineChart data={timeTrend} unit="mins avg" lineColor="#6366f1" height={200} />
          </div>
        </div>
      </div>

      {/* Weekly Solves Bar Chart & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Problems Solved Per Week (Past 6 Weeks)
            </h3>
          </div>
          <SimpleBarChart bars={weeklyBars} maxVal={16} />
        </div>

        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Practice Intensity
            </h3>
          </div>
          <ActivityHeatmap problems={problems} />
        </div>
      </div>
    </div>
  );
};
