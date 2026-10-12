import React from 'react';
import { X, GraduationCap, Code, Cpu, BookOpen, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export const VivaNotesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Developer Notes & Viva Defense
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Shivanshi Bhatt
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Why I designed CodeCompass and how the underlying algorithms work
            </p>
          </div>
        </div>

        {/* Section 1: Motivation */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Why I Built This (The Real Problem)</span>
          </h3>
          <p className="leading-relaxed">
            During my pre-final and final year placement prep, my solved questions were scattered all over: LeetCode profile, GeeksforGeeks bookmarks, Striver’s sheets in browser tabs, and random notes in Notion. When campus tests approached, I couldn't answer basic questions:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700 dark:text-slate-300 font-medium">
            <li><em>"Which specific algorithmic topics am I slowest at?"</em></li>
            <li><em>"What solved problems have I already forgotten due to spacing decay?"</em></li>
            <li><em>"Am I genuinely interview-ready for 45-minute timed rounds?"</em></li>
          </ul>
          <p className="leading-relaxed">
            CodeCompass was born to answer those questions mathematically in one personalized, self-contained dashboard.
          </p>
        </div>

        {/* Section 2: Mathematical Models */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>Formulas I Formulated (Viva Explanation)</span>
          </h3>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                1. 4-Factor Topic Weakness Formula (0 - 100):
              </span>
              <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-1.5 rounded">
                W(topic) = 35%·(1 - Solves/8) + 30%·(Failed/Total) + 20%·(Time/Target) + 15%·(RecencyDecay)
              </p>
              <p className="text-[11px] text-slate-500">
                Balances volume breadth (35%), failure rate (30%), speed overrun (20%), and Ebbinghaus forgetting curve (15%).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                2. 5-Pillar Placement Readiness Composite (0 - 100):
              </span>
              <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-1.5 rounded">
                Readiness = Coverage(25) + DiffMix(25) + Speed(20) + Streak(15) + SRS(15)
              </p>
              <p className="text-[11px] text-slate-500">
                Directly mirrors the screening bar used by tech companies: Medium problem dominance, speed within 35 minutes, and consistent streak.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Technical Architecture */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-500" />
            <span>Architecture & Design Decisions</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                Offline-First Local Storage
              </div>
              <p className="text-[11px] text-slate-500">
                No external API rate limits, no slow login cold starts, zero scraping dependencies. User data stays strictly on the client.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                Spaced Repetition (1-3-7-14-30)
              </div>
              <p className="text-[11px] text-slate-500">
                Adapted SuperMemo Leitner algorithm to programming: advancing a problem doubles the retention interval, while struggling resets back to 1 day.
              </p>
            </div>
          </div>
        </div>

        {/* Student Signature Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Handcrafted by Shivanshi Bhatt • CSE 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
