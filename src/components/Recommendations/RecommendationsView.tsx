import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DifficultyBadge, PlatformBadge } from '../common/Badges';
import { RecommendedProblem } from '../../types';
import {
  Sparkles,
  ExternalLink,
  Timer,
  CheckCircle2,
  SkipForward,
  Info,
  Lightbulb,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const RecommendationsView: React.FC<{
  setCurrentTab: (tab: string) => void;
}> = ({ setCurrentTab }) => {
  const { recommendations, startTimer, addProblem, addToast } = useApp();
  const [skippedProblemIds, setSkippedProblemIds] = useState<Set<string>>(new Set());

  // Filter out skipped problems in this view session
  const activeRecommendations = recommendations.filter(
    (rec) => !skippedProblemIds.has(rec.problem.id)
  );

  const handleSkip = (rec: RecommendedProblem) => {
    setSkippedProblemIds((prev) => new Set([...prev, rec.problem.id]));
    addToast('info', 'Problem Skipped', `Skipped ${rec.problem.name}. Updating next recommendation queue.`);
  };

  const handleMarkSolved = (rec: RecommendedProblem) => {
    addProblem({
      name: rec.problem.name,
      platform: rec.problem.platform,
      difficulty: rec.problem.difficulty,
      topic: rec.problem.topic,
      tags: rec.problem.tags,
      link: rec.problem.link,
      notes: `Solved from recommended set. ${rec.reason}`,
      status: 'Solved',
      dateSolved: new Date().toISOString().split('T')[0],
      timeSpentMinutes: rec.problem.defaultTimeEstimate,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Personalized Recommendation Engine (OBJ-04)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Smart problem selection powered by weakness mitigation, difficulty progression, and tag affinity.
        </p>
      </div>

      {/* Rationale & Pipeline Explanation Card */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Recommendation Pipeline Rules:
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
              1. <strong>Weak Topics First:</strong> Highest priority to topics with high weakness scores. • 2. <strong>Mastery Progression:</strong> Easy → Medium → Hard advancement. • 3. <strong>Pattern Similarity:</strong> Reinforces recently touched algorithms.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentTab('weakness')}
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline shrink-0 text-xs flex items-center gap-1"
        >
          <span>Weakness Radar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {activeRecommendations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Sparkles className="w-10 h-10 text-indigo-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              All Recommended Problems Reviewed!
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You’ve worked through the primary queue. Click reset skips to re-evaluate bank candidates.
            </p>
            <button
              onClick={() => setSkippedProblemIds(new Set())}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Reset Skipped Queue
            </button>
          </div>
        ) : (
          activeRecommendations.map((rec, index) => (
            <div
              key={rec.problem.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    #{index + 1}
                  </span>
                  <a
                    href={rec.problem.link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-extrabold text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5"
                  >
                    <span>{rec.problem.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                  <DifficultyBadge difficulty={rec.problem.difficulty} size="sm" />
                  <PlatformBadge platform={rec.problem.platform} />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Est. Time: {rec.problem.defaultTimeEstimate}m</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.urgency === 'High'
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                    }`}
                  >
                    {rec.urgency} Urgency
                  </span>
                </div>
              </div>

              {/* "Why This?" Explanation Rationale */}
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/50 border border-indigo-100/80 dark:border-slate-800 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-indigo-700 dark:text-indigo-400 shrink-0">
                    💡 Why this problem?
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {rec.reason}
                  </span>
                </div>
              </div>

              {/* Tags & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                    Tags:
                  </span>
                  {rec.problem.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSkip(rec)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Skip</span>
                  </button>

                  <button
                    onClick={() =>
                      startTimer({
                        name: rec.problem.name,
                        difficulty: rec.problem.difficulty,
                        topic: rec.problem.topic,
                      })
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Timed Solve</span>
                  </button>

                  <button
                    onClick={() => handleMarkSolved(rec)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-transform hover:scale-105"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Solved</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
