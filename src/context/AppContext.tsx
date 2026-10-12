import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  Problem,
  RevisionItem,
  ContestLog,
  TopicStat,
  WeaknessBreakdown,
  RecommendedProblem,
  ReadinessScoreResult,
  BankProblem,
  SheetProblem,
  Difficulty,
  Platform,
  TopicName,
} from '../types';
import { DEMO_USER, DEMO_PROBLEMS, DEMO_REVISIONS, DEMO_CONTESTS, DEMO_CHECKED_SHEET_IDS } from '../data/seedData';
import { PROBLEM_BANK } from '../data/problemBank';
import { STRIVER_A2Z_PROBLEMS, NEETCODE_150_PROBLEMS } from '../data/dsaSheets';
import {
  ALL_TOPICS,
  calculateTopicWeakness,
  calculateInterviewReadiness,
  getRecommendedProblems,
  getNextSRSDate,
  evaluateRevisionStatus,
} from '../utils/scoring';
import confetti from 'canvas-confetti';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface ActiveTimerSession {
  isRunning: boolean;
  secondsElapsed: number;
  problemName?: string;
  problemId?: string;
  difficulty?: Difficulty;
  topic?: TopicName;
  startTime?: number;
}

interface AppContextType {
  // Auth & Profile
  user: UserProfile | null;
  allUsers: UserProfile[];
  login: (email: string, name?: string) => void;
  signup: (userData: Omit<UserProfile, 'id'>) => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  loadDemoStudent: () => void;

  // Problems
  problems: Problem[];
  addProblem: (p: Omit<Problem, 'id' | 'createdAt'>) => Problem;
  updateProblem: (id: string, updates: Partial<Problem>) => void;
  deleteProblem: (id: string) => void;
  importProblems: (newProblems: Partial<Problem>[]) => number;

  // Revisions (SRS)
  revisions: RevisionItem[];
  advanceRevision: (id: string, outcome: 'mastered' | 'struggled') => void;
  addRevisionForProblem: (problem: Problem) => void;
  deleteRevision: (id: string) => void;

  // Contests
  contests: ContestLog[];
  addContest: (c: Omit<ContestLog, 'id'>) => void;
  deleteContest: (id: string) => void;

  // DSA Sheets
  checkedSheetIds: Set<string>;
  toggleSheetProblem: (sheetProblem: SheetProblem) => void;

  // Timer
  timer: ActiveTimerSession;
  startTimer: (problem?: { name: string; difficulty: Difficulty; topic: TopicName; id?: string }) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  logTimerResult: (problemName: string, difficulty: Difficulty, topic: TopicName) => void;

  // Computed Algorithmic Intelligence
  topicStats: TopicStat[];
  weaknessBreakdowns: WeaknessBreakdown[];
  weakestTopics: TopicStat[];
  strongestTopics: TopicStat[];
  recommendations: RecommendedProblem[];
  readinessScore: ReadinessScoreResult;
  currentStreakDays: number;
  todaySolvesCount: number;

  // General App Actions & Polish
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message?: string) => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;
  resetUserData: () => void;
  loadDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'codecompass_all_users_v1';
const ACTIVE_USER_ID_KEY = 'codecompass_active_user_id_v1';
const THEME_STORAGE_KEY = 'codecompass_theme_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // Dark mode by default for dev student vibe
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      body?.classList.add('dark');
      body?.classList.remove('light');
      body?.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      body?.classList.remove('dark');
      body?.classList.add('light');
      body?.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback(
    (type: 'success' | 'info' | 'warning' | 'error', title: string, message?: string) => {
      const id = 'toast-' + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      addToast('info', next === 'dark' ? '🌙 Dark Mode Active' : '☀️ Light Mode Active', 'Theme preference saved');
      return next;
    });
  }, [addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Fallback silent
    }
  }, []);

  // Users management
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const parsed: UserProfile[] = JSON.parse(raw);
        // Cleanse legacy demo user and migrate to Shivanshi Bhatt
        const migrated = parsed.map((u) =>
          u.id === 'user-demo-aryan' || u.name === 'Aryan Sharma' ? DEMO_USER : u
        );
        if (!migrated.some((u) => u.id === DEMO_USER.id)) {
          migrated.unshift(DEMO_USER);
        }
        return migrated;
      }
    } catch (e) {
      console.error('Failed to load users', e);
    }
    return [DEMO_USER];
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_USER_ID_KEY);
    if (!saved || saved === 'user-demo-aryan') return DEMO_USER.id;
    return saved;
  });

  const currentUser = useMemo(() => {
    return allUsers.find((u) => u.id === activeUserId) || DEMO_USER;
  }, [allUsers, activeUserId]);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (activeUserId) {
      localStorage.setItem(ACTIVE_USER_ID_KEY, activeUserId);
    }
  }, [activeUserId]);

  // Keys for active user data
  const userPrefix = `codecompass_${activeUserId}_`;
  const PROBLEMS_KEY = `${userPrefix}problems`;
  const REVISIONS_KEY = `${userPrefix}revisions`;
  const CONTESTS_KEY = `${userPrefix}contests`;
  const SHEETS_KEY = `${userPrefix}checked_sheets`;

  // Core state for active user
  const [problems, setProblems] = useState<Problem[]>(() => {
    try {
      const raw = localStorage.getItem(PROBLEMS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return activeUserId === DEMO_USER.id ? DEMO_PROBLEMS : [];
  });

  const [revisions, setRevisions] = useState<RevisionItem[]>(() => {
    try {
      const raw = localStorage.getItem(REVISIONS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return activeUserId === DEMO_USER.id ? DEMO_REVISIONS : [];
  });

  const [contests, setContests] = useState<ContestLog[]>(() => {
    try {
      const raw = localStorage.getItem(CONTESTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return activeUserId === DEMO_USER.id ? DEMO_CONTESTS : [];
  });

  const [checkedSheetIds, setCheckedSheetIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(SHEETS_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }
    return activeUserId === DEMO_USER.id ? DEMO_CHECKED_SHEET_IDS : new Set();
  });

  // When active user switches, reload user-specific collections
  useEffect(() => {
    const rawProbs = localStorage.getItem(PROBLEMS_KEY);
    if (rawProbs) setProblems(JSON.parse(rawProbs));
    else setProblems(activeUserId === DEMO_USER.id ? DEMO_PROBLEMS : []);

    const rawRevs = localStorage.getItem(REVISIONS_KEY);
    if (rawRevs) setRevisions(JSON.parse(rawRevs));
    else setRevisions(activeUserId === DEMO_USER.id ? DEMO_REVISIONS : []);

    const rawContests = localStorage.getItem(CONTESTS_KEY);
    if (rawContests) setContests(JSON.parse(rawContests));
    else setContests(activeUserId === DEMO_USER.id ? DEMO_CONTESTS : []);

    const rawSheets = localStorage.getItem(SHEETS_KEY);
    if (rawSheets) setCheckedSheetIds(new Set(JSON.parse(rawSheets)));
    else setCheckedSheetIds(activeUserId === DEMO_USER.id ? DEMO_CHECKED_SHEET_IDS : new Set());
  }, [activeUserId]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
  }, [PROBLEMS_KEY, problems]);

  useEffect(() => {
    localStorage.setItem(REVISIONS_KEY, JSON.stringify(revisions));
  }, [REVISIONS_KEY, revisions]);

  useEffect(() => {
    localStorage.setItem(CONTESTS_KEY, JSON.stringify(contests));
  }, [CONTESTS_KEY, contests]);

  useEffect(() => {
    localStorage.setItem(SHEETS_KEY, JSON.stringify(Array.from(checkedSheetIds)));
  }, [SHEETS_KEY, checkedSheetIds]);

  // Timer state
  const [timer, setTimer] = useState<ActiveTimerSession>({
    isRunning: false,
    secondsElapsed: 0,
  });

  useEffect(() => {
    let interval: any;
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => ({
          ...prev,
          secondsElapsed: prev.secondsElapsed + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning]);

  const startTimer = useCallback(
    (problem?: { name: string; difficulty: Difficulty; topic: TopicName; id?: string }) => {
      setTimer({
        isRunning: true,
        secondsElapsed: 0,
        problemName: problem?.name,
        difficulty: problem?.difficulty,
        topic: problem?.topic,
        problemId: problem?.id,
        startTime: Date.now(),
      });
      addToast('info', 'Timer Started', problem?.name ? `Tracking: ${problem.name}` : 'Free practice session started');
    },
    [addToast]
  );

  const pauseTimer = useCallback(() => {
    setTimer((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resumeTimer = useCallback(() => {
    setTimer((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimer({
      isRunning: false,
      secondsElapsed: 0,
      problemName: undefined,
      problemId: undefined,
      difficulty: undefined,
      topic: undefined,
    });
  }, []);

  // Update revision statuses daily based on due date
  useEffect(() => {
    setRevisions((prev) =>
      prev.map((r) => {
        const calculatedStatus = evaluateRevisionStatus(r.dueDate);
        return calculatedStatus !== r.status ? { ...r, status: calculatedStatus } : r;
      })
    );
  }, []);

  // Add problem handler
  const addProblem = useCallback(
    (data: Omit<Problem, 'id' | 'createdAt'>): Problem => {
      const newProblem: Problem = {
        ...data,
        id: 'prob-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
      };

      setProblems((prev) => [newProblem, ...prev]);

      // If status is Solved or Need Revision, create or sync SRS revision
      if (newProblem.status === 'Solved' || newProblem.status === 'Need Revision') {
        const { nextDate, interval } = getNextSRSDate(0);
        const newRevision: RevisionItem = {
          id: 'rev-' + Date.now(),
          problemId: newProblem.id,
          problemName: newProblem.name,
          topic: newProblem.topic,
          difficulty: newProblem.difficulty,
          platform: newProblem.platform,
          link: newProblem.link,
          stage: 0,
          intervalDays: interval,
          lastReviewedDate: newProblem.dateSolved || new Date().toISOString().split('T')[0],
          dueDate: nextDate,
          status: 'upcoming',
          consecutiveSuccesses: newProblem.status === 'Solved' ? 1 : 0,
          totalReviews: 0,
        };
        setRevisions((prev) => [newRevision, ...prev]);
      }

      addToast('success', 'Problem Logged!', `${newProblem.name} added to your repository.`);
      triggerConfetti();
      return newProblem;
    },
    [addToast, triggerConfetti]
  );

  const updateProblem = useCallback(
    (id: string, updates: Partial<Problem>) => {
      setProblems((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const updated = { ...p, ...updates };
            return updated;
          }
          return p;
        })
      );
      addToast('info', 'Problem Updated', 'Changes saved successfully.');
    },
    [addToast]
  );

  const deleteProblem = useCallback(
    (id: string) => {
      const p = problems.find((item) => item.id === id);
      setProblems((prev) => prev.filter((item) => item.id !== id));
      // Also remove associated revision
      setRevisions((prev) => prev.filter((r) => r.problemId !== id));
      addToast('warning', 'Problem Deleted', p ? `${p.name} removed.` : 'Removed from repository.');
    },
    [problems, addToast]
  );

  const importProblems = useCallback(
    (newProblems: Partial<Problem>[]): number => {
      let count = 0;
      const formatted: Problem[] = [];
      newProblems.forEach((p) => {
        if (!p.name) return;
        formatted.push({
          id: 'prob-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          name: p.name,
          platform: p.platform || 'LeetCode',
          difficulty: p.difficulty || 'Medium',
          topic: p.topic || 'Arrays',
          tags: p.tags || ['Imported'],
          link: p.link || '',
          notes: p.notes || 'Imported via CSV',
          status: p.status || 'Solved',
          dateSolved: p.dateSolved || new Date().toISOString().split('T')[0],
          timeSpentMinutes: p.timeSpentMinutes || 25,
          createdAt: new Date().toISOString(),
        });
        count++;
      });

      setProblems((prev) => [...formatted, ...prev]);
      addToast('success', 'CSV Import Complete', `Successfully imported ${count} problems.`);
      triggerConfetti();
      return count;
    },
    [addToast, triggerConfetti]
  );

  // Spaced repetition progression
  const advanceRevision = useCallback(
    (id: string, outcome: 'mastered' | 'struggled') => {
      setRevisions((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;

          const todayStr = new Date().toISOString().split('T')[0];
          if (outcome === 'mastered') {
            const nextStage = Math.min(r.stage + 1, 4);
            const { nextDate, interval } = getNextSRSDate(nextStage);
            return {
              ...r,
              stage: nextStage,
              intervalDays: interval,
              lastReviewedDate: todayStr,
              dueDate: nextDate,
              status: 'upcoming',
              consecutiveSuccesses: r.consecutiveSuccesses + 1,
              totalReviews: r.totalReviews + 1,
            };
          } else {
            // Struggled: reset stage to 0 or 1 for urgent review in 1 day
            const { nextDate, interval } = getNextSRSDate(0);
            return {
              ...r,
              stage: 0,
              intervalDays: interval,
              lastReviewedDate: todayStr,
              dueDate: nextDate,
              status: 'upcoming',
              consecutiveSuccesses: 0,
              totalReviews: r.totalReviews + 1,
            };
          }
        })
      );

      if (outcome === 'mastered') {
        addToast('success', 'Revision Promoted! 🎉', 'Scheduled for the next spaced repetition interval.');
        triggerConfetti();
      } else {
        addToast('warning', 'Scheduled for Review', 'Interval reset to 1 day for reinforcement.');
      }
    },
    [addToast, triggerConfetti]
  );

  const addRevisionForProblem = useCallback(
    (problem: Problem) => {
      const existing = revisions.find((r) => r.problemId === problem.id);
      if (existing) {
        addToast('info', 'Already Scheduled', 'This problem is already in your Revision Planner.');
        return;
      }
      const { nextDate, interval } = getNextSRSDate(0);
      const newRev: RevisionItem = {
        id: 'rev-' + Date.now(),
        problemId: problem.id,
        problemName: problem.name,
        topic: problem.topic,
        difficulty: problem.difficulty,
        platform: problem.platform,
        link: problem.link,
        stage: 0,
        intervalDays: interval,
        lastReviewedDate: new Date().toISOString().split('T')[0],
        dueDate: nextDate,
        status: 'upcoming',
        consecutiveSuccesses: 0,
        totalReviews: 0,
      };
      setRevisions((prev) => [newRev, ...prev]);
      addToast('success', 'Added to Revision Planner', `Scheduled review for ${nextDate}.`);
    },
    [revisions, addToast]
  );

  const deleteRevision = useCallback((id: string) => {
    setRevisions((prev) => prev.filter((r) => r.id !== id));
    addToast('info', 'Revision Removed', 'Removed from spaced repetition schedule.');
  }, [addToast]);

  // Contests
  const addContest = useCallback(
    (data: Omit<ContestLog, 'id'>) => {
      const newContest: ContestLog = {
        ...data,
        id: 'cnt-' + Date.now(),
      };
      setContests((prev) => [newContest, ...prev]);
      addToast('success', 'Contest Logged!', `Recorded ${newContest.contestName} with rank #${newContest.rank}`);
      triggerConfetti();
    },
    [addToast, triggerConfetti]
  );

  const deleteContest = useCallback((id: string) => {
    setContests((prev) => prev.filter((c) => c.id !== id));
    addToast('info', 'Contest Deleted', 'Removed from contest log.');
  }, [addToast]);

  // DSA Sheets
  const toggleSheetProblem = useCallback(
    (sheetProblem: SheetProblem) => {
      setCheckedSheetIds((prev) => {
        const next = new Set(prev);
        const isCurrentlyChecked = next.has(sheetProblem.id);

        if (isCurrentlyChecked) {
          next.delete(sheetProblem.id);
          addToast('info', 'Unchecked', `${sheetProblem.name} unmarked.`);
        } else {
          next.add(sheetProblem.id);
          addToast('success', 'Sheet Progress Updated!', `Completed: ${sheetProblem.name}`);
          triggerConfetti();

          // Auto-log into repository if not already present
          const alreadyLogged = problems.some(
            (p) => p.name.toLowerCase().trim() === sheetProblem.name.toLowerCase().trim()
          );
          if (!alreadyLogged) {
            const todayStr = new Date().toISOString().split('T')[0];
            const created = {
              name: sheetProblem.name,
              platform: sheetProblem.platform,
              difficulty: sheetProblem.difficulty,
              topic: sheetProblem.topic,
              tags: [sheetProblem.category, 'DSA Sheet'],
              link: sheetProblem.link,
              notes: `Completed as part of ${sheetProblem.sheetId === 'striver-a2z' ? 'Striver A2Z' : 'NeetCode 150'} sheet.`,
              status: 'Solved' as const,
              dateSolved: todayStr,
              timeSpentMinutes: sheetProblem.difficulty === 'Easy' ? 15 : sheetProblem.difficulty === 'Medium' ? 28 : 45,
              sourceSheet: sheetProblem.sheetId === 'striver-a2z' ? 'Striver A2Z' : 'NeetCode 150',
            };
            addProblem(created);
          }
        }
        return next;
      });
    },
    [problems, addProblem, addToast, triggerConfetti]
  );

  // Timer save
  const logTimerResult = useCallback(
    (problemName: string, difficulty: Difficulty, topic: TopicName) => {
      const minutes = Math.max(1, Math.round(timer.secondsElapsed / 60));
      const todayStr = new Date().toISOString().split('T')[0];

      // Check if problem already exists
      const existing = problems.find((p) => p.name.toLowerCase().trim() === problemName.toLowerCase().trim());
      if (existing) {
        updateProblem(existing.id, {
          timeSpentMinutes: minutes,
          status: 'Solved',
          dateSolved: todayStr,
        });
      } else {
        addProblem({
          name: problemName,
          platform: 'LeetCode',
          difficulty,
          topic,
          tags: ['Timed Session'],
          link: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(problemName)}`,
          notes: `Timed solve: Completed in ${minutes} minutes.`,
          status: 'Solved',
          dateSolved: todayStr,
          timeSpentMinutes: minutes,
        });
      }

      resetTimer();
      addToast('success', 'Timed Solve Logged!', `${problemName} saved (${minutes}m).`);
    },
    [timer.secondsElapsed, problems, updateProblem, addProblem, resetTimer, addToast]
  );

  // Profile
  const updateProfile = useCallback(
    (updated: Partial<UserProfile>) => {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === activeUserId) {
            return { ...u, ...updated };
          }
          return u;
        })
      );
      addToast('success', 'Profile Updated', 'Target and personal preferences saved.');
    },
    [activeUserId, addToast]
  );

  const login = useCallback(
    (email: string, name?: string) => {
      const trimmed = email.trim().toLowerCase();
      let targetUser = allUsers.find((u) => u.email.toLowerCase() === trimmed);
      if (!targetUser) {
        targetUser = {
          id: 'user-' + Date.now(),
          name: name || email.split('@')[0],
          email: trimmed,
          college: 'College of Engineering',
          targetRole: 'SDE-1',
          targetCompany: 'Top Tech Companies',
          targetDate: '2026-12-31',
          dailyGoal: 3,
          themePreference: 'dark',
        };
        setAllUsers((prev) => [...prev, targetUser!]);
      }
      setActiveUserId(targetUser.id);
      addToast('success', `Welcome back, ${targetUser.name}!`);
    },
    [allUsers, addToast]
  );

  const signup = useCallback(
    (userData: Omit<UserProfile, 'id'>) => {
      const newUser: UserProfile = {
        ...userData,
        id: 'user-' + Date.now(),
      };
      setAllUsers((prev) => [...prev, newUser]);
      setActiveUserId(newUser.id);
      addToast('success', `Welcome, ${newUser.name}!`, 'Account created successfully.');
    },
    [addToast]
  );

  const logout = useCallback(() => {
    setActiveUserId('');
    addToast('info', 'Logged Out', 'You have been logged out.');
  }, [addToast]);

  const loadDemoStudent = useCallback(() => {
    const demo = allUsers.find((u) => u.id === DEMO_USER.id);
    if (!demo) {
      setAllUsers((prev) => [DEMO_USER, ...prev.filter((u) => u.id !== 'user-demo-aryan')]);
    }
    setActiveUserId(DEMO_USER.id);
    setProblems(DEMO_PROBLEMS);
    setRevisions(DEMO_REVISIONS);
    setContests(DEMO_CONTESTS);
    setCheckedSheetIds(DEMO_CHECKED_SHEET_IDS);
    addToast('success', 'Profile Active: Shivanshi Bhatt', 'Loaded full placement preparation portfolio.');
  }, [allUsers, addToast]);

  const resetUserData = useCallback(() => {
    setProblems([]);
    setRevisions([]);
    setContests([]);
    setCheckedSheetIds(new Set());
    addToast('warning', 'Data Cleared', 'Active user repository and logs have been reset.');
  }, [addToast]);

  const loadDemoData = useCallback(() => {
    setProblems(DEMO_PROBLEMS);
    setRevisions(DEMO_REVISIONS);
    setContests(DEMO_CONTESTS);
    setCheckedSheetIds(DEMO_CHECKED_SHEET_IDS);
    addToast('success', 'Demo Data Seeded', 'Loaded 47 problems, contest charts, and revision queue.');
    triggerConfetti();
  }, [addToast, triggerConfetti]);

  // Streak calculation
  const currentStreakDays = useMemo(() => {
    if (problems.length === 0) return 0;
    const dates = new Set(
      problems
        .filter((p) => p.status === 'Solved' && p.dateSolved)
        .map((p) => p.dateSolved)
    );

    let streak = 0;
    const checkDate = new Date();
    // Allow today or yesterday as start
    const todayStr = checkDate.toISOString().split('T')[0];
    if (!dates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (!dates.has(yesterdayStr)) {
        return 0;
      }
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dates.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [problems]);

  const todaySolvesCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return problems.filter((p) => p.status === 'Solved' && p.dateSolved === todayStr).length;
  }, [problems]);

  // Topic Statistics & Weakness Evaluation
  const topicStatsAndBreakdowns = useMemo(() => {
    const stats: TopicStat[] = [];
    const breakdowns: WeaknessBreakdown[] = [];

    ALL_TOPICS.forEach((t) => {
      const { stat, breakdown } = calculateTopicWeakness(t, problems);
      stats.push(stat);
      breakdowns.push(breakdown);
    });

    return { stats, breakdowns };
  }, [problems]);

  const topicStats = topicStatsAndBreakdowns.stats;
  const weaknessBreakdowns = topicStatsAndBreakdowns.breakdowns;

  // Weakest and strongest topics
  const weakestTopics = useMemo(() => {
    return [...topicStats].sort((a, b) => b.weaknessScore - a.weaknessScore).slice(0, 3);
  }, [topicStats]);

  const strongestTopics = useMemo(() => {
    return [...topicStats].sort((a, b) => a.weaknessScore - b.weaknessScore).slice(0, 3);
  }, [topicStats]);

  // Recommendations
  const recommendations = useMemo(() => {
    return getRecommendedProblems(PROBLEM_BANK, problems, topicStats);
  }, [problems, topicStats]);

  // Readiness Score
  const readinessScore = useMemo(() => {
    return calculateInterviewReadiness(problems, revisions, currentStreakDays);
  }, [problems, revisions, currentStreakDays]);

  return (
    <AppContext.Provider
      value={{
        user: currentUser,
        allUsers,
        login,
        signup,
        logout,
        updateProfile,
        loadDemoStudent,
        problems,
        addProblem,
        updateProblem,
        deleteProblem,
        importProblems,
        revisions,
        advanceRevision,
        addRevisionForProblem,
        deleteRevision,
        contests,
        addContest,
        deleteContest,
        checkedSheetIds,
        toggleSheetProblem,
        timer,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        logTimerResult,
        topicStats,
        weaknessBreakdowns,
        weakestTopics,
        strongestTopics,
        recommendations,
        readinessScore,
        currentStreakDays,
        todaySolvesCount,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        triggerConfetti,
        resetUserData,
        loadDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
