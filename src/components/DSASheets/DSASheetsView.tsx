import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { STRIVER_A2Z_PROBLEMS, NEETCODE_150_PROBLEMS, SHEETS_INFO } from '../../data/dsaSheets';
import { DifficultyBadge } from '../common/Badges';
import { SheetProblem } from '../../types';
import {
  CheckSquare,
  Square,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';

export const DSASheetsView: React.FC = () => {
  const { checkedSheetIds, toggleSheetProblem } = useApp();
  const [activeSheet, setActiveSheet] = useState<'striver-a2z' | 'neetcode-150'>('striver-a2z');
  const [searchFilter, setSearchFilter] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const activeProblems = activeSheet === 'striver-a2z' ? STRIVER_A2Z_PROBLEMS : NEETCODE_150_PROBLEMS;
  const currentSheetInfo = SHEETS_INFO[activeSheet];

  // Group problems by category
  const groupedCategories = useMemo(() => {
    const groups: Record<string, SheetProblem[]> = {};
    activeProblems.forEach((p) => {
      const cat = p.category;
      if (!groups[cat]) groups[cat] = [];
      if (
        !searchFilter ||
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchFilter.toLowerCase()) ||
        cat.toLowerCase().includes(searchFilter.toLowerCase())
      ) {
        groups[cat].push(p);
      }
    });
    return groups;
  }, [activeProblems, searchFilter]);

  // Overall sheet completion stats
  const totalSheetCount = activeProblems.length;
  const completedSheetCount = activeProblems.filter((p) => checkedSheetIds.has(p.id)).length;
  const sheetPercentage = totalSheetCount > 0 ? Math.round((completedSheetCount / totalSheetCount) * 100) : 0;

  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          DSA Sheet Tracker (Striver A2Z & NeetCode 150)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Integrated roadmap sheets. Ticking any problem automatically records it in your problem repository and revision queue.
        </p>
      </div>

      {/* Sheet Switcher & Overall Progress Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Sheet Selector Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setActiveSheet('striver-a2z')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSheet === 'striver-a2z'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Striver’s A2Z DSA
            </button>
            <button
              onClick={() => setActiveSheet('neetcode-150')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSheet === 'neetcode-150'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              NeetCode 150
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Completion:
            </span>
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono ml-2">
              {sheetPercentage}%
            </span>
            <span className="text-xs text-slate-400 ml-1">
              ({completedSheetCount}/{totalSheetCount})
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700"
              style={{ width: `${sheetPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{currentSheetInfo.description}</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Curated by {currentSheetInfo.creator}
            </span>
          </div>
        </div>

        {/* Search bar inside sheet */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Filter ${currentSheetInfo.title} problems...`}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Accordions */}
      <div className="space-y-4">
        {Object.entries(groupedCategories).map(([category, items]) => {
          if (items.length === 0) return null;

          const isCollapsed = collapsedCategories.has(category);
          const solvedInCategory = items.filter((p) => checkedSheetIds.has(p.id)).length;
          const catPercentage = Math.round((solvedInCategory / items.length) * 100);

          return (
            <div
              key={category}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              {/* Category Header */}
              <div
                onClick={() => toggleCategoryCollapse(category)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400">
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {category}
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      {solvedInCategory} of {items.length} completed ({catPercentage}%)
                    </div>
                  </div>
                </div>

                <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${catPercentage}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {items.map((prob) => {
                    const isChecked = checkedSheetIds.has(prob.id);
                    return (
                      <div
                        key={prob.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleSheetProblem(prob)}
                            className="p-0.5 rounded text-indigo-600 dark:text-indigo-400 focus:outline-hidden"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 fill-indigo-600 text-white" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-indigo-400" />
                            )}
                          </button>

                          <div className={isChecked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                            <a
                              href={prob.link}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5"
                            >
                              <span>{prob.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                            <span className="text-[11px] text-slate-400">
                              Topic: {prob.topic}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            {prob.platform}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
