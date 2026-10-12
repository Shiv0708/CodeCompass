import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserCheck, UserPlus, Sparkles, GraduationCap } from 'lucide-react';
import { DEMO_USER } from '../../data/seedData';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { allUsers, login, signup, loadDemoStudent } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [targetRole, setTargetRole] = useState('SDE-1');
  const [targetDate, setTargetDate] = useState('2026-12-15');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    login(email, name);
    onClose();
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    signup({
      name,
      email,
      college: college || 'Engineering College',
      targetRole: targetRole || 'SDE-1',
      targetCompany: 'Google, Amazon, Microsoft',
      targetDate: targetDate || '2026-12-31',
      dailyGoal: 3,
      themePreference: 'dark',
    });
    onClose();
  };

  const handleQuickDemo = () => {
    loadDemoStudent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-900 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Quick Demo Profile Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Evaluation
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold">
              Preloaded
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            Load demo student <strong className="text-slate-900 dark:text-white">{DEMO_USER.name}</strong> with 47 solved problems, weakness analysis, contest ratings, and revision queue.
          </p>
          <button
            onClick={handleQuickDemo}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <UserCheck className="w-4 h-4" />
            <span>Launch as Shivanshi Bhatt (Placement Profile)</span>
          </button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Switch / Log In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors ${
              mode === 'signup'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            New Student Profile
          </button>
        </div>

        {mode === 'login' ? (
          <div>
            {allUsers.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
                  Select Existing Local Profile:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        login(u.email, u.name);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 text-left text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {u.targetRole}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Or Enter Email:
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Log In
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                College / University
              </label>
              <input
                type="text"
                placeholder="e.g. NIT Trichy / CSE"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="priya@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  placeholder="SDE-1"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Profile</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
