import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Code2,
  Timer,
  Crosshair,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';

export const MobileNav: React.FC<{
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}> = ({ currentTab, setCurrentTab }) => {
  const { revisions } = useApp();
  const dueCount = revisions.filter(
    (r) => r.status === 'due' || r.status === 'overdue'
  ).length;

  const items = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'problems', label: 'Problems', icon: <Code2 className="w-5 h-5" /> },
    { id: 'timer', label: 'Timer', icon: <Timer className="w-5 h-5" /> },
    { id: 'weakness', label: 'Weakness', icon: <Crosshair className="w-5 h-5" /> },
    {
      id: 'revision',
      label: 'Revision',
      icon: (
        <div className="relative">
          <RotateCcw className="w-5 h-5" />
          {dueCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
        </div>
      ),
    },
    { id: 'recommendations', label: 'Recs', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'contests', label: 'Contests', icon: <Trophy className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex justify-around items-center">
      {items.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
