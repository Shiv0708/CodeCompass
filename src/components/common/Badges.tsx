import React from 'react';
import { Difficulty, Platform, ProblemStatus } from '../../types';

export const DifficultyBadge: React.FC<{ difficulty: Difficulty; size?: 'sm' | 'md' }> = ({
  difficulty,
  size = 'md',
}) => {
  const styles = {
    Easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  }[difficulty];

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${styles} ${sizeClass}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          difficulty === 'Easy'
            ? 'bg-emerald-500'
            : difficulty === 'Medium'
            ? 'bg-amber-500'
            : 'bg-rose-500'
        }`}
      />
      {difficulty}
    </span>
  );
};

export const PlatformBadge: React.FC<{ platform: Platform }> = ({ platform }) => {
  const styles: Record<Platform, string> = {
    LeetCode: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    GeeksforGeeks: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    Codeforces: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    HackerRank: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    Other: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium ${styles[platform] || styles.Other}`}>
      {platform}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ProblemStatus }> = ({ status }) => {
  const styles: Record<ProblemStatus, string> = {
    Solved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    Attempted: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    'Need Revision': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};
