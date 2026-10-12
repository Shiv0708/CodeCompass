import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Code2,
  Timer,
  BarChart3,
  Crosshair,
  Sparkles,
  RotateCcw,
  CheckSquare,
  Trophy,
  User,
  GraduationCap,
  Calendar,
  Layers,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<{
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}> = ({ currentTab, setCurrentTab }) => {
  const { problems, revisions, user } = useApp();

  const dueCount = revisions.filter(
    (r) => r.status === 'due' || r.status === 'overdue'
  ).length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'problems',
      label: 'Problem Repo',
      icon: <Code2 className="w-4 h-4" />,
      badge: problems.length,
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'timer',
      label: 'Focus Timer',
      icon: <Timer className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Time Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'weakness',
      label: 'Weakness Radar',
      icon: <Crosshair className="w-4 h-4" />,
    },
    {
      id: 'recommendations',
      label: 'Recommended Picks',
      icon: <Sparkles className="w-4 h-4" />,
      badge: 'Next 5',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    },
    {
      id: 'revision',
      label: 'Revision Planner',
      icon: <RotateCcw className="w-4 h-4" />,
      badge: dueCount > 0 ? dueCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'sheets',
      label: 'DSA Sheet Tracker',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'contests',
      label: 'Contest Progress',
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: 'profile',
      label: 'Profile & Targets',
      icon: <User className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 p-4 justify-between h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Target Placement Badge Card at bottom of sidebar */}
      {user && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-slate-800/80 dark:to-slate-900/80 border border-indigo-100 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="truncate">{user.targetRole || 'SDE-1'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Target: {user.targetDate ? new Date(user.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Dec 2026'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{user.targetCompany || 'Top Tech Companies'}</span>
          </div>
          <div className="pt-2 border-t border-indigo-200/50 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
            <span>Built by Shivanshi</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">CSE '26</span>
          </div>
        </div>
      )}
    </aside>
  );
};
