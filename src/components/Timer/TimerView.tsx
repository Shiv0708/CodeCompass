import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Difficulty, TopicName } from '../../types';
import { ALL_TOPICS, TIME_BENCHMARKS } from '../../utils/scoring';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Target,
} from 'lucide-react';

export const TimerView: React.FC = () => {
  const { timer, startTimer, pauseTimer, resumeTimer, resetTimer, logTimerResult, recommendations } = useApp();

  const [problemName, setProblemName] = useState(timer.problemName || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(timer.difficulty || 'Medium');
  const [topic, setTopic] = useState<TopicName>(timer.topic || 'Dynamic Programming');
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [targetMins, setTargetMins] = useState<number>(30);

  // Time calculations
  const totalSeconds = timer.secondsElapsed;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime = `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const benchmark = TIME_BENCHMARKS[difficulty];
  const isOverBenchmark = minutes >= benchmark;

  const handleStart = () => {
    startTimer({
      name: problemName || 'Custom Focus Practice',
      difficulty,
      topic,
    });
  };

  const handleSaveResult = () => {
    if (totalSeconds < 10) return;
    logTimerResult(problemName || 'Focused Practice Problem', difficulty, topic);
    setProblemName('');
  };

  const selectRecommendation = (recName: string, recDiff: Difficulty, recTopic: TopicName) => {
    setProblemName(recName);
    setDifficulty(recDiff);
    setTopic(recTopic);
    startTimer({ name: recName, difficulty: recDiff, topic: recTopic });
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Focus Stopwatch & Interview Timer (OBJ-02)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track genuine solving time, practice under 35-min interview constraints, and eliminate guess logs.
        </p>
      </div>

      {/* Main Timer Display Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Glow background effect */}
        <div
          className={`absolute inset-0 opacity-10 transition-colors pointer-events-none ${
            isOverBenchmark ? 'bg-rose-500' : timer.isRunning ? 'bg-indigo-500' : 'bg-transparent'
          }`}
        />

        {/* Status Pills */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
              timer.isRunning
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse'
                : totalSeconds > 0
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {timer.isRunning ? 'Active Solving Session' : totalSeconds > 0 ? 'Paused' : 'Ready'}
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Target: {benchmark} mins ({difficulty})
          </span>
        </div>

        {/* Large Digital Clock Face */}
        <div className="text-6xl sm:text-7xl font-mono font-extrabold tracking-tight text-slate-900 dark:text-white py-4 select-none">
          {formattedTime}
        </div>

        {/* Benchmark Warning Warning if exceeding target */}
        {isOverBenchmark && (
          <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 font-semibold mb-3 animate-bounce">
            <AlertCircle className="w-4 h-4" />
            <span>Exceeded {difficulty} benchmark ({benchmark}m). Consider drafting brute-force or reading intuition.</span>
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          {!timer.isRunning ? (
            <button
              onClick={totalSeconds > 0 ? resumeTimer : handleStart}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{totalSeconds > 0 ? 'Resume Timer' : 'Start Solving'}</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-500/30 transition-transform hover:scale-105"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={resetTimer}
            disabled={totalSeconds === 0}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          {totalSeconds > 10 && (
            <button
              onClick={handleSaveResult}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-transform hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Log to Repository</span>
            </button>
          )}
        </div>
      </div>

      {/* Problem Session Configuration */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          <span>Active Session Problem Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Problem Name
            </label>
            <input
              type="text"
              placeholder="e.g. Longest Increasing Subsequence"
              value={problemName}
              onChange={(e) => setProblemName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs"
            >
              <option value="Easy">Easy (Target 18m)</option>
              <option value="Medium">Medium (Target 32m)</option>
              <option value="Hard">Hard (Target 48m)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as TopicName)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs"
            >
              {ALL_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Launch Recommendations */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Quick Launch from Weakest Topics
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {recommendations.slice(0, 3).map((rec) => (
            <button
              key={rec.problem.id}
              onClick={() =>
                selectRecommendation(rec.problem.name, rec.problem.difficulty, rec.problem.topic)
              }
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 text-left transition-all"
            >
              <div className="font-bold text-slate-900 dark:text-white truncate">
                {rec.problem.name}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>{rec.problem.topic}</span>
                <span className="font-semibold text-indigo-500">{rec.problem.difficulty}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
