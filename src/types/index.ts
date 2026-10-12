export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Platform = 'LeetCode' | 'GeeksforGeeks' | 'Codeforces' | 'HackerRank' | 'Other';

export type ProblemStatus = 'Solved' | 'Attempted' | 'Need Revision';

export type TopicName =
  | 'Arrays'
  | 'Strings'
  | 'Linked List'
  | 'Stack & Queue'
  | 'Binary Search'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Trees & BST'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Greedy'
  | 'Backtracking'
  | 'Heaps & Priority Queue'
  | 'Recursion'
  | 'Bit Manipulation'
  | 'Trie'
  | 'Math & Geometry';

export interface Problem {
  id: string;
  name: string;
  platform: Platform;
  difficulty: Difficulty;
  topic: TopicName;
  tags: string[];
  link: string;
  notes: string;
  status: ProblemStatus;
  dateSolved: string; // ISO date YYYY-MM-DD
  timeSpentMinutes: number; // in minutes
  createdAt: string;
  sourceSheet?: string; // e.g. "Striver A2Z", "NeetCode 150"
}

export interface BankProblem {
  id: string;
  name: string;
  platform: Platform;
  difficulty: Difficulty;
  topic: TopicName;
  tags: string[];
  link: string;
  defaultTimeEstimate: number; // expected minutes
  importance: 'Essential' | 'Standard' | 'Advanced';
}

export interface TopicStat {
  topic: TopicName;
  solvedCount: number;
  attemptedCount: number;
  needRevisionCount: number;
  totalTimeMinutes: number;
  avgTimeMinutes: number;
  successRate: number; // 0 to 100%
  daysSinceLastSolve: number;
  weaknessScore: number; // 0 (mastered) to 100 (critical weakness)
  weaknessLevel: 'Strong' | 'Moderate' | 'Weak' | 'Critical';
}

export interface WeaknessBreakdown {
  topic: TopicName;
  countScore: number;       // penalty for low solve count
  timeScore: number;        // penalty for taking longer than benchmark
  accuracyScore: number;    // penalty for failed/attempted status
  inactivityScore: number;  // penalty for long inactivity
  totalWeaknessScore: number;
}

export interface RecommendedProblem {
  problem: BankProblem;
  matchScore: number;
  reason: string;
  urgency: 'High' | 'Medium' | 'Normal';
}

export interface RevisionItem {
  id: string;
  problemId: string;
  problemName: string;
  topic: TopicName;
  difficulty: Difficulty;
  platform: Platform;
  link: string;
  stage: number; // 1, 2, 3, 4, 5 corresponding to intervals [1, 3, 7, 14, 30]
  intervalDays: number; // 1, 3, 7, 14, 30
  lastReviewedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: 'due' | 'overdue' | 'upcoming' | 'completed';
  consecutiveSuccesses: number;
  totalReviews: number;
}

export interface SheetProblem {
  id: string;
  sheetId: 'striver-a2z' | 'neetcode-150';
  category: string;
  name: string;
  difficulty: Difficulty;
  topic: TopicName;
  link: string;
  platform: Platform;
}

export interface ContestLog {
  id: string;
  platform: 'LeetCode' | 'Codeforces' | 'CodeChef' | 'AtCoder' | 'HackerRank' | 'College Internal';
  contestName: string;
  date: string;
  rank: number;
  ratingAfter: number;
  ratingChange: number;
  problemsSolved: number;
  totalProblems: number;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  college: string;
  targetRole: string; // e.g. "SDE-1", "Software Engineer Intern"
  targetCompany: string; // e.g. "Google, Amazon, Microsoft"
  targetDate: string; // YYYY-MM-DD
  dailyGoal: number; // problems per day
  avatarUrl?: string;
  themePreference: 'light' | 'dark' | 'system';
}

export interface ReadinessScoreResult {
  totalScore: number; // 0 - 100
  tier: 'Beginner' | 'Developing' | 'Interview-Ready';
  tierColor: string;
  components: {
    topicCoverage: {
      score: number;
      maxScore: number;
      description: string;
      percentage: number;
    };
    difficultyMix: {
      score: number;
      maxScore: number;
      description: string;
      percentage: number;
    };
    consistencyStreak: {
      score: number;
      maxScore: number;
      description: string;
      percentage: number;
    };
    solvingSpeed: {
      score: number;
      maxScore: number;
      description: string;
      percentage: number;
    };
    revisionDiscipline: {
      score: number;
      maxScore: number;
      description: string;
      percentage: number;
    };
  };
  suggestions: string[];
}
