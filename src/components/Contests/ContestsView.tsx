import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ContestLog } from '../../types';
import { SimpleLineChart } from '../common/Charts';
import {
  Trophy,
  Plus,
  TrendingUp,
  Award,
  Calendar,
  X,
  Check,
  Trash2,
  Medal,
} from 'lucide-react';

export const ContestsView: React.FC = () => {
  const { contests, addContest, deleteContest } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [platform, setPlatform] = useState<ContestLog['platform']>('LeetCode');
  const [contestName, setContestName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rank, setRank] = useState(2500);
  const [ratingAfter, setRatingAfter] = useState(1750);
  const [ratingChange, setRatingChange] = useState(35);
  const [problemsSolved, setProblemsSolved] = useState(3);
  const [totalProblems, setTotalProblems] = useState(4);
  const [notes, setNotes] = useState('');

  // Rating chart data sorted chronologically
  const chartPoints = useMemo(() => {
    return [...contests]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((c) => ({
        label: c.contestName.replace('Contest', '').trim(),
        value: c.ratingAfter,
        subtext: `Rank #${c.rank} (${c.problemsSolved}/${c.totalProblems})`,
      }));
  }, [contests]);

  const maxRating = useMemo(() => {
    if (contests.length === 0) return 0;
    return Math.max(...contests.map((c) => c.ratingAfter));
  }, [contests]);

  const bestRank = useMemo(() => {
    if (contests.length === 0) return 0;
    return Math.min(...contests.map((c) => c.rank));
  }, [contests]);

  const avgSolves = useMemo(() => {
    if (contests.length === 0) return 0;
    const sum = contests.reduce((s, c) => s + c.problemsSolved, 0);
    return (sum / contests.length).toFixed(1);
  }, [contests]);

  const handleCreateContest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestName.trim()) return;

    addContest({
      platform,
      contestName,
      date,
      rank: Number(rank) || 1000,
      ratingAfter: Number(ratingAfter) || 1600,
      ratingChange: Number(ratingChange) || 0,
      problemsSolved: Number(problemsSolved) || 2,
      totalProblems: Number(totalProblems) || 4,
      notes,
    });

    setShowAddModal(false);
    setContestName('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Contest Progress & Rating Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log competitive programming contests and track your rating trajectory toward Knight / Guardian benchmarks.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Log Contest Result</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Peak Rating</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {maxRating || '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {maxRating >= 1750 ? 'Knight Benchmark Achieved' : 'Target: 1750 (Knight)'}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Medal className="w-4 h-4 text-indigo-500" />
            <span>Best Global Rank</span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            #{bestRank || '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Top performance tier
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Avg Solves / Contest</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-500 font-mono">
            {avgSolves}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Consistent 3/4 solves pace
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span>Contests Completed</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {contests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Weekly contest discipline
          </div>
        </div>
      </div>

      {/* Rating Over Time Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Contest Rating Over Time
            </h3>
          </div>
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
            Current: {contests[contests.length - 1]?.ratingAfter || 1600}
          </span>
        </div>

        <div className="pt-2">
          <SimpleLineChart
            data={chartPoints}
            height={220}
            lineColor="#6366f1"
            unit="rating"
          />
        </div>
      </div>

      {/* Contests Log Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Contest History Log ({contests.length} Records)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Contest Name</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Global Rank</th>
                <th className="py-3 px-3">Rating After</th>
                <th className="py-3 px-3">Delta</th>
                <th className="py-3 px-3">Solved</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {contests.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {c.contestName}
                    {c.notes && (
                      <p className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                        {c.notes}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {c.platform}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">{c.date}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold">#{c.rank}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {c.ratingAfter}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold">
                    <span
                      className={
                        c.ratingChange >= 0
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                      }
                    >
                      {c.ratingChange >= 0 ? `+${c.ratingChange}` : c.ratingChange}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    {c.problemsSolved} / {c.totalProblems}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => deleteContest(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete contest entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-500" />
                <span>Log Contest Experience</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="CodeChef">CodeChef</option>
                    <option value="AtCoder">AtCoder</option>
                    <option value="College Internal">College Internal</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Contest Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Contest 401"
                  value={contestName}
                  onChange={(e) => setContestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Rank</label>
                  <input
                    type="number"
                    value={rank}
                    onChange={(e) => setRank(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Rating After</label>
                  <input
                    type="number"
                    value={ratingAfter}
                    onChange={(e) => setRatingAfter(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Delta (+/-)</label>
                  <input
                    type="number"
                    value={ratingChange}
                    onChange={(e) => setRatingChange(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Problems Solved</label>
                  <input
                    type="number"
                    min={0}
                    value={problemsSolved}
                    onChange={(e) => setProblemsSolved(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Total Problems</label>
                  <input
                    type="number"
                    min={1}
                    value={totalProblems}
                    onChange={(e) => setTotalProblems(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Contest Notes / Debrief</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Solved Q1 & Q2 quickly, penalty on Q3 due to edge case."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Contest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
