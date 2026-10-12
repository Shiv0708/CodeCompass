import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WeaknessRadarChart } from '../common/Charts';
import { TopicStat, WeaknessBreakdown } from '../../types';
import {
  Crosshair,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  Clock,
  Calendar,
  Layers,
} from 'lucide-react';

export const WeaknessView: React.FC<{
  setCurrentTab: (tab: string) => void;
}> = ({ setCurrentTab }) => {
  const { topicStats, weaknessBreakdowns, weakestTopics, strongestTopics } = useApp();
  const [selectedTopicName, setSelectedTopicName] = useState<string>(weakestTopics[0]?.topic || 'Dynamic Programming');
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(true);

  // Selected topic stats and breakdown
  const currentStat = topicStats.find((s) => s.topic === selectedTopicName) || topicStats[0];
  const currentBreakdown = weaknessBreakdowns.find((b) => b.topic === selectedTopicName) || weaknessBreakdowns[0];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Weakness Detection & Algorithmic Radar (OBJ-03)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Transparent multi-factor model detecting topic blind spots before interview rounds.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors"
        >
          <Info className="w-4 h-4 text-indigo-500" />
          <span>{showFormulaDetails ? 'Hide Viva Formula' : 'Explain Scoring Formula (Viva Ready)'}</span>
        </button>
      </div>

      {/* Formula Explanation Callout Card (Critical for Viva & transparency) */}
      {showFormulaDetails && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-500/30 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                Transparent Viva Scoring Model: Topic Weakness Formula
              </h2>
            </div>
            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-700">
              Range: 0 (Mastered) → 100 (Critical Weakness)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 font-mono text-xs sm:text-sm text-cyan-100 overflow-x-auto">
            <code>
              WeaknessScore(Topic) = 35% × (1 - Solves/Target) + 30% × (1 - SuccessRate) + 20% × (TimeSpent/Benchmark) + 15% × (InactivityDecay)
            </code>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="font-bold text-white mb-1">1. Volume Breadth (35%)</div>
              <p className="text-[11px] text-slate-400">
                Penalizes topics with &lt;8 problems solved. Ensures student doesn’t skip core foundations.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="font-bold text-white mb-1">2. Failure Rate (30%)</div>
              <p className="text-[11px] text-slate-400">
                Weights problems marked as 'Attempted' or 'Need Revision' vs fully 'Solved'.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="font-bold text-white mb-1">3. Speed Ratio (20%)</div>
              <p className="text-[11px] text-slate-400">
                Compares average minutes against standard 18m/32m/48m interview benchmarks.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="font-bold text-white mb-1">4. Recency Decay (15%)</div>
              <p className="text-[11px] text-slate-400">
                Ebbinghaus forgetting curve: penalizes topics left unpracticed for 14-30+ days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Radar Chart + Selected Topic Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Polygonal Algorithmic Radar Chart */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-between space-y-4">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Multi-Axis Topic Strength Radar
                </h3>
                <p className="text-[11px] text-slate-400">
                  Outer polygon vertices = High confidence; center collapse = Weakness
                </p>
              </div>
            </div>
          </div>

          <div className="py-4">
            <WeaknessRadarChart stats={topicStats} size={300} />
          </div>

          <div className="w-full flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Top Strength: {strongestTopics[0]?.topic}</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>Top Gap: {weakestTopics[0]?.topic}</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Topic Diagnostic Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Topic Diagnostic
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {currentStat.topic}
              </h3>
            </div>

            <select
              value={selectedTopicName}
              onChange={(e) => setSelectedTopicName(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            >
              {topicStats.map((t) => (
                <option key={t.topic} value={t.topic}>
                  {t.topic} ({t.weaknessScore}/100)
                </option>
              ))}
            </select>
          </div>

          {/* Weakness Score Gauge Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Composite Weakness Score</div>
              <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                {currentStat.weaknessScore}
                <span className="text-sm font-semibold text-slate-400"> / 100</span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                currentStat.weaknessScore <= 28
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : currentStat.weaknessScore <= 55
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
              }`}
            >
              {currentStat.weaknessLevel} Standing
            </span>
          </div>

          {/* 4 Factor Penalty Breakdown */}
          <div className="space-y-3 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200">
              Factor Penalty Breakdown (Sum = Weakness Score):
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">1. Practice Deficit Penalty (Max 35):</span>
                <span className="font-bold font-mono">{currentBreakdown.countScore} pts ({currentStat.solvedCount} solved)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${(currentBreakdown.countScore / 35) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">2. Error / Need-Revision Penalty (Max 30):</span>
                <span className="font-bold font-mono">{currentBreakdown.accuracyScore} pts ({currentStat.successRate}% acc)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(currentBreakdown.accuracyScore / 30) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">3. Speed Inefficiency Penalty (Max 20):</span>
                <span className="font-bold font-mono">{currentBreakdown.timeScore} pts ({currentStat.avgTimeMinutes}m avg)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(currentBreakdown.timeScore / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">4. Recency Decay Penalty (Max 15):</span>
                <span className="font-bold font-mono">
                  {currentBreakdown.inactivityScore} pts (
                  {currentStat.daysSinceLastSolve === -1 ? 'Never' : `${currentStat.daysSinceLastSolve}d ago`})
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(currentBreakdown.inactivityScore / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('recommendations')}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Remediation Practice Set for {currentStat.topic}</span>
          </button>
        </div>
      </div>

      {/* Complete Topic Matrix Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Complete DSA Topic Matrix ({topicStats.length} Categories)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-3">Solved Count</th>
                <th className="py-3 px-3">Avg Time</th>
                <th className="py-3 px-3">Success Rate</th>
                <th className="py-3 px-3">Last Active</th>
                <th className="py-3 px-3">Weakness Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topicStats
                .sort((a, b) => b.weaknessScore - a.weaknessScore)
                .map((t) => (
                  <tr
                    key={t.topic}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    onClick={() => setSelectedTopicName(t.topic)}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {t.topic}
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      {t.solvedCount}
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      {t.avgTimeMinutes > 0 ? `${t.avgTimeMinutes}m` : '—'}
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      {t.successRate}%
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {t.daysSinceLastSolve === -1 ? 'Never' : t.daysSinceLastSolve === 0 ? 'Today' : `${t.daysSinceLastSolve}d ago`}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                          t.weaknessScore <= 28
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : t.weaknessScore <= 55
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        {t.weaknessScore}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTopicName(t.topic);
                        }}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
