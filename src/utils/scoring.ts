/**
 * CodeCompass Algorithmic Intelligence & Scoring Engine
 * 
 * This module isolates all mathematical scoring models for:
 * 1. Topic Weakness Detection (transparent 4-factor multi-attribute model)
 * 2. Interview Readiness Score (0-100 gauge with 5-pillar composite evaluation)
 * 3. Personalized Problem Recommendation Engine (weakness + mastery progression + tag similarity)
 * 4. Spaced Repetition (SRS) Scheduling intervals (1, 3, 7, 14, 30 days)
 * 5. CSV Import / Export serialization
 */

import {
  Problem,
  TopicName,
  TopicStat,
  WeaknessBreakdown,
  BankProblem,
  RecommendedProblem,
  ReadinessScoreResult,
  Difficulty,
  RevisionItem,
} from '../types';

export const ALL_TOPICS: TopicName[] = [
  'Arrays',
  'Strings',
  'Linked List',
  'Stack & Queue',
  'Binary Search',
  'Two Pointers',
  'Sliding Window',
  'Trees & BST',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Heaps & Priority Queue',
  'Recursion',
  'Bit Manipulation',
  'Trie',
  'Math & Geometry',
];

// Target benchmark solving times in minutes
export const TIME_BENCHMARKS: Record<Difficulty, number> = {
  Easy: 18,    // 18 mins benchmark
  Medium: 32,  // 32 mins benchmark
  Hard: 48,    // 48 mins benchmark
};

// Spaced repetition progression intervals in days
export const SRS_INTERVALS = [1, 3, 7, 14, 30];

/**
 * ============================================================================
 * 1. TOPIC WEAKNESS SCORE FORMULA (0 - 100)
 * ============================================================================
 *
 * Mathematical Model:
 * Weakness Score W(topic) =
 *   w_count * Penalty_count +
 *   w_accuracy * Penalty_accuracy +
 *   w_speed * Penalty_speed +
 *   w_recency * Penalty_recency
 *
 * Weights (sum to 100):
 * - w_count = 35%      (Lack of practice volume / shallow breadth)
 * - w_accuracy = 30%   (Failure / Need Revision rate)
 * - w_speed = 20%      (Exceeding benchmark time for the problems solved)
 * - w_recency = 15%    (Skill decay / forgetting curve from days inactive)
 *
 * Output: 0 (Flawless mastery) to 100 (Critical weakness requiring immediate drill)
 */
export function calculateTopicWeakness(
  topic: TopicName,
  problems: Problem[],
  referenceDate: Date = new Date()
): { stat: TopicStat; breakdown: WeaknessBreakdown } {
  const topicProblems = problems.filter((p) => p.topic === topic);
  const solved = topicProblems.filter((p) => p.status === 'Solved');
  const attempted = topicProblems.filter((p) => p.status === 'Attempted');
  const needRevision = topicProblems.filter((p) => p.status === 'Need Revision');

  const solvedCount = solved.length;
  const attemptedCount = attempted.length;
  const needRevisionCount = needRevision.length;
  const totalLogged = topicProblems.length;

  const totalTimeMinutes = topicProblems.reduce((sum, p) => sum + (p.timeSpentMinutes || 0), 0);
  const avgTimeMinutes = totalLogged > 0 ? Math.round(totalTimeMinutes / totalLogged) : 0;

  // Success rate (%): Solved / Total with weighting (attempted is 0.3 partial credit)
  const successRate =
    totalLogged > 0
      ? Math.round(((solvedCount + attemptedCount * 0.3) / totalLogged) * 100)
      : 0;

  // Recency calculation (days since last activity)
  let daysSinceLastSolve = 999;
  if (topicProblems.length > 0) {
    const dates = topicProblems
      .map((p) => new Date(p.dateSolved || p.createdAt).getTime())
      .filter((t) => !isNaN(t));
    if (dates.length > 0) {
      const mostRecent = Math.max(...dates);
      const diffMs = referenceDate.getTime() - mostRecent;
      daysSinceLastSolve = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  // --- SUB-FACTOR CALCULATIONS ---

  // 1. Solve Count Penalty (0 - 35 points): Target is at least 8 problems in a core topic
  const TARGET_SOLVES = 8;
  const countRatio = Math.min(solvedCount / TARGET_SOLVES, 1.0);
  const countScore = Math.round(35 * (1.0 - countRatio));

  // 2. Accuracy Penalty (0 - 30 points)
  let accuracyScore = 30;
  if (totalLogged > 0) {
    const failureRatio = (attemptedCount + needRevisionCount) / totalLogged;
    accuracyScore = Math.round(30 * failureRatio);
  }

  // 3. Speed / Time Penalty (0 - 20 points)
  // Benchmark is weighted by difficulties solved
  let expectedTime = 25; // default
  if (topicProblems.length > 0) {
    const expectedSum = topicProblems.reduce((sum, p) => sum + TIME_BENCHMARKS[p.difficulty], 0);
    expectedTime = Math.round(expectedSum / topicProblems.length);
  }
  let timeScore = 10;
  if (totalLogged > 0 && avgTimeMinutes > 0) {
    // If taking > expected time, penalty increases up to 20
    const timeRatio = avgTimeMinutes / expectedTime;
    if (timeRatio > 1.0) {
      timeScore = Math.min(20, Math.round(10 + (timeRatio - 1.0) * 10));
    } else {
      timeScore = Math.max(0, Math.round(10 * timeRatio));
    }
  }

  // 4. Inactivity / Forgetting Penalty (0 - 15 points)
  // 0-3 days: 0 pts, 7 days: 5 pts, 14 days: 10 pts, >= 30 days: 15 pts
  let inactivityScore = 15;
  if (totalLogged > 0) {
    if (daysSinceLastSolve <= 3) inactivityScore = 2;
    else if (daysSinceLastSolve <= 7) inactivityScore = 5;
    else if (daysSinceLastSolve <= 14) inactivityScore = 9;
    else if (daysSinceLastSolve <= 21) inactivityScore = 12;
    else inactivityScore = 15;
  }

  // Total Weakness Score (Sum of weighted penalties, clamped 0 - 100)
  const totalWeaknessScore = Math.min(
    100,
    Math.max(0, countScore + accuracyScore + timeScore + inactivityScore)
  );

  let weaknessLevel: 'Strong' | 'Moderate' | 'Weak' | 'Critical' = 'Moderate';
  if (totalWeaknessScore <= 28) weaknessLevel = 'Strong';
  else if (totalWeaknessScore <= 55) weaknessLevel = 'Moderate';
  else if (totalWeaknessScore <= 75) weaknessLevel = 'Weak';
  else weaknessLevel = 'Critical';

  return {
    stat: {
      topic,
      solvedCount,
      attemptedCount,
      needRevisionCount,
      totalTimeMinutes,
      avgTimeMinutes,
      successRate,
      daysSinceLastSolve: daysSinceLastSolve === 999 ? -1 : daysSinceLastSolve,
      weaknessScore: totalWeaknessScore,
      weaknessLevel,
    },
    breakdown: {
      topic,
      countScore,
      timeScore,
      accuracyScore,
      inactivityScore,
      totalWeaknessScore,
    },
  };
}

/**
 * ============================================================================
 * 2. INTERVIEW READINESS SCORE (0 - 100)
 * ============================================================================
 *
 * Modeled after technical interview bars at top tech firms (Google, Amazon, etc.).
 *
 * 5 Evaluated Pillars:
 * 1. Topic Breadth Coverage (Max 25 pts): Breadth across essential DSA branches
 * 2. Difficulty Distribution (Max 25 pts): Healthy ratio of Medium and Hard solves
 * 3. Consistency & Streak (Max 15 pts): Daily problem habit & weekly momentum
 * 4. Algorithmic Speed Efficiency (Max 20 pts): Solving under interview time bounds
 * 5. Spaced Revision Discipline (Max 15 pts): Retention health without overdue rot
 */
export function calculateInterviewReadiness(
  problems: Problem[],
  revisions: RevisionItem[],
  currentStreakDays: number = 0
): ReadinessScoreResult {
  const solvedProblems = problems.filter((p) => p.status === 'Solved');
  const totalSolved = solvedProblems.length;

  // 1. Topic Coverage (Max 25 pts)
  // Target: At least 3 solved problems in each of the 10 core placement topics
  const coreTopics: TopicName[] = [
    'Arrays',
    'Strings',
    'Linked List',
    'Binary Search',
    'Trees & BST',
    'Graphs',
    'Dynamic Programming',
    'Stack & Queue',
    'Two Pointers',
    'Sliding Window',
  ];
  let coveredCoreCount = 0;
  coreTopics.forEach((t) => {
    const count = solvedProblems.filter((p) => p.topic === t).length;
    if (count >= 3) coveredCoreCount++;
    else if (count >= 1) coveredCoreCount += 0.5;
  });
  const coverageRatio = coveredCoreCount / coreTopics.length;
  const topicCoverageScore = Math.round(coverageRatio * 25);

  // 2. Difficulty Distribution (Max 25 pts)
  // Placement bar: 25% Easy, 55% Medium, 20% Hard
  const easyCount = solvedProblems.filter((p) => p.difficulty === 'Easy').length;
  const medCount = solvedProblems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = solvedProblems.filter((p) => p.difficulty === 'Hard').length;

  let difficultyScore = 0;
  if (totalSolved > 0) {
    // Medium solves are the bread-and-butter of coding rounds (up to 15 pts)
    const medRatio = medCount / totalSolved;
    const medPoints = Math.min(15, Math.round((medRatio / 0.5) * 15));

    // Hard solves show algorithmic depth (up to 7 pts)
    const hardRatio = hardCount / totalSolved;
    const hardPoints = Math.min(7, Math.round((hardRatio / 0.15) * 7));

    // Base volume bonus (up to 3 pts)
    const volumeBonus = Math.min(3, Math.round((totalSolved / 50) * 3));

    difficultyScore = Math.min(25, medPoints + hardPoints + volumeBonus);
  }

  // 3. Consistency & Streak (Max 15 pts)
  // A 7-14 day streak indicates high active recall and readiness
  let streakScore = 0;
  if (currentStreakDays >= 14) streakScore = 15;
  else if (currentStreakDays >= 7) streakScore = 12;
  else if (currentStreakDays >= 3) streakScore = 8;
  else if (currentStreakDays >= 1) streakScore = 5;
  else if (totalSolved > 10) streakScore = 3;

  // 4. Solving Speed / Time Efficiency (Max 20 pts)
  let speedScore = 12; // default neutral
  if (solvedProblems.length > 0) {
    let withinBenchmarkCount = 0;
    solvedProblems.forEach((p) => {
      const benchmark = TIME_BENCHMARKS[p.difficulty];
      if (p.timeSpentMinutes > 0 && p.timeSpentMinutes <= benchmark * 1.15) {
        withinBenchmarkCount++;
      }
    });
    const speedRatio = withinBenchmarkCount / solvedProblems.length;
    speedScore = Math.round(speedRatio * 20);
  }

  // 5. Revision Discipline (Max 15 pts)
  // Penalize overdue revisions
  const overdueCount = revisions.filter((r) => r.status === 'overdue').length;
  const completedRevisions = revisions.filter((r) => r.totalReviews > 0).length;
  let revisionScore = 10;
  if (revisions.length === 0) {
    revisionScore = totalSolved > 5 ? 10 : 5;
  } else {
    const overduePenalty = Math.min(10, overdueCount * 2);
    const retentionReward = Math.min(5, completedRevisions);
    revisionScore = Math.max(0, Math.min(15, 10 - overduePenalty + retentionReward));
  }

  const totalScore = Math.min(
    100,
    topicCoverageScore + difficultyScore + streakScore + speedScore + revisionScore
  );

  let tier: 'Beginner' | 'Developing' | 'Interview-Ready' = 'Developing';
  let tierColor = 'text-amber-500';
  if (totalScore >= 75) {
    tier = 'Interview-Ready';
    tierColor = 'text-emerald-500';
  } else if (totalScore < 45) {
    tier = 'Beginner';
    tierColor = 'text-rose-500';
  }

  // Actionable Suggestions to raise readiness score
  const suggestions: string[] = [];
  if (coverageRatio < 0.8) {
    suggestions.push(
      `Cover gap topics: Practice at least 3 problems in ${coreTopics.filter((t) => solvedProblems.filter((p) => p.topic === t).length < 2).slice(0, 2).join(' and ') || 'Graphs/DP'} to boost Topic Coverage.`
    );
  }
  if (medCount < 20 || medCount / Math.max(1, totalSolved) < 0.45) {
    suggestions.push(
      'Increase Medium problem ratio: Interview shortlists heavily test Medium DP, Graphs, and Tree variations.'
    );
  }
  if (overdueCount > 0) {
    suggestions.push(
      `Clear ${overdueCount} overdue revision item${overdueCount > 1 ? 's' : ''} in the Revision Planner to reinforce long-term algorithmic recall.`
    );
  }
  if (currentStreakDays < 5) {
    suggestions.push(
      'Build a 7+ day daily solve streak: Consistency prevents cognitive friction during online assessments.'
    );
  }
  if (speedScore < 14) {
    suggestions.push(
      'Practice with the active stopwatch timer: Aim to solve Easy under 18 mins and Medium under 32 mins without looking at hints.'
    );
  }
  if (suggestions.length < 3) {
    suggestions.push(
      'Attempt 1-2 Hard problems in your strongest topic to establish algorithmic mastery for senior rounds.'
    );
  }

  return {
    totalScore,
    tier,
    tierColor,
    components: {
      topicCoverage: {
        score: topicCoverageScore,
        maxScore: 25,
        description: `${coveredCoreCount}/${coreTopics.length} Core DSA topics sufficiently practiced`,
        percentage: Math.round((topicCoverageScore / 25) * 100),
      },
      difficultyMix: {
        score: difficultyScore,
        maxScore: 25,
        description: `${easyCount} Easy, ${medCount} Medium, ${hardCount} Hard solved`,
        percentage: Math.round((difficultyScore / 25) * 100),
      },
      consistencyStreak: {
        score: streakScore,
        maxScore: 15,
        description: `${currentStreakDays} day active streak maintained`,
        percentage: Math.round((streakScore / 15) * 100),
      },
      solvingSpeed: {
        score: speedScore,
        maxScore: 20,
        description: 'Solving speed aligned with 45-min interview thresholds',
        percentage: Math.round((speedScore / 20) * 100),
      },
      revisionDiscipline: {
        score: revisionScore,
        maxScore: 15,
        description: `${overdueCount} overdue items, ${completedRevisions} reviews completed`,
        percentage: Math.round((revisionScore / 15) * 100),
      },
    },
    suggestions: suggestions.slice(0, 3),
  };
}

/**
 * ============================================================================
 * 3. RECOMMENDATION ENGINE (OBJ-04)
 * ============================================================================
 *
 * Algorithm criteria:
 * 1. Weak topics prioritized first (higher weakness score = higher weight)
 * 2. Difficulty progression (recommend Easy if <3 solved in topic, Medium if >=3 with good accuracy, Hard if Medium is mastered)
 * 3. Tag similarity with recently solved problems (reinforcing newly acquired patterns)
 * 4. Exclusion of already solved problems
 * 5. Returns top 5 recommendations with transparent rationale
 */
export function getRecommendedProblems(
  problemBank: BankProblem[],
  userProblems: Problem[],
  topicStats: TopicStat[]
): RecommendedProblem[] {
  const solvedIds = new Set(
    userProblems
      .filter((p) => p.status === 'Solved')
      .map((p) => p.name.toLowerCase().trim())
  );

  // Map topic to weakness
  const weaknessMap = new Map<TopicName, TopicStat>();
  topicStats.forEach((ts) => weaknessMap.set(ts.topic, ts));

  // Collect recently solved tags for similarity matching
  const recentTags = new Set<string>();
  userProblems
    .slice(-8)
    .forEach((p) => p.tags.forEach((t) => recentTags.add(t.toLowerCase())));

  // Available bank candidates
  const candidates = problemBank.filter(
    (bp) => !solvedIds.has(bp.name.toLowerCase().trim())
  );

  const scoredList: RecommendedProblem[] = candidates.map((bp) => {
    const tStat = weaknessMap.get(bp.topic);
    const weaknessScore = tStat ? tStat.weaknessScore : 60;
    const topicSolves = tStat ? tStat.solvedCount : 0;
    const topicAccuracy = tStat ? tStat.successRate : 50;

    let matchScore = weaknessScore * 1.5; // Base weight from topic weakness
    let reason = '';
    let urgency: 'High' | 'Medium' | 'Normal' = 'Normal';

    // Difficulty progression evaluation
    let difficultyBonus = 0;
    if (topicSolves < 2) {
      if (bp.difficulty === 'Easy') {
        difficultyBonus = 35;
        reason = `Weak in ${bp.topic} (${weaknessScore}/100) — build initial foundation with this standard Easy problem.`;
      } else if (bp.difficulty === 'Medium') {
        difficultyBonus = 5;
      }
    } else if (topicSolves < 6 || topicAccuracy < 70) {
      if (bp.difficulty === 'Medium') {
        difficultyBonus = 40;
        reason = `Strengthen ${bp.topic} pattern recognition — your Medium solve count needs elevation for coding rounds.`;
      } else if (bp.difficulty === 'Easy') {
        difficultyBonus = 10;
      }
    } else {
      // Advanced mastery stage
      if (bp.difficulty === 'Medium') {
        difficultyBonus = 30;
        reason = `Consistent in ${bp.topic} (${topicAccuracy}% accuracy) — perfect Medium interview pattern to cement speed.`;
      } else if (bp.difficulty === 'Hard') {
        difficultyBonus = 35;
        reason = `Solid foundation in ${bp.topic} — step up to this Hard problem to ace tier-1 technical rounds.`;
      }
    }

    matchScore += difficultyBonus;

    // Tag similarity bonus
    const tagMatches = bp.tags.filter((t) => recentTags.has(t.toLowerCase())).length;
    if (tagMatches > 0) {
      matchScore += tagMatches * 8;
      if (!reason.includes('pattern')) {
        reason += ` Reinforces familiar "${bp.tags.join(', ')}" patterns you recently practiced.`;
      }
    }

    // Essential problem bonus
    if (bp.importance === 'Essential') {
      matchScore += 15;
    }

    if (weaknessScore > 65) {
      urgency = 'High';
      if (!reason.includes('Weak in')) {
        reason = `Target weakness in ${bp.topic} (Weakness score: ${weaknessScore}/100). ${reason}`;
      }
    } else if (weaknessScore > 40) {
      urgency = 'Medium';
    }

    return {
      problem: bp,
      matchScore,
      reason: reason || `Recommended based on ${bp.topic} progression and interview relevance.`,
      urgency,
    };
  });

  // Sort by match score descending and take top 5
  return scoredList.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
}

/**
 * ============================================================================
 * 4. SPACED REPETITION (SRS) HELPERS
 * ============================================================================
 */
export function getNextSRSDate(stage: number, baseDate: Date = new Date()): { nextDate: string; interval: number } {
  // Clamped stage from 0 to 4
  const stageIndex = Math.min(Math.max(0, stage), SRS_INTERVALS.length - 1);
  const interval = SRS_INTERVALS[stageIndex];
  
  const d = new Date(baseDate);
  d.setDate(d.getDate() + interval);
  
  const nextDate = d.toISOString().split('T')[0];
  return { nextDate, interval };
}

export function evaluateRevisionStatus(dueDateStr: string): 'due' | 'overdue' | 'upcoming' {
  const todayStr = new Date().toISOString().split('T')[0];
  if (dueDateStr === todayStr) return 'due';
  if (dueDateStr < todayStr) return 'overdue';
  return 'upcoming';
}

/**
 * ============================================================================
 * 5. CSV EXPORT & IMPORT SERIALIZATION
 * ============================================================================
 */
export function generateCSVTemplate(): string {
  const headers = 'Name,Platform,Difficulty,Topic,Tags,Link,Status,DateSolved,TimeSpentMinutes,Notes';
  const sample1 = '"Two Sum","LeetCode","Easy","Arrays","Hash Table;Array","https://leetcode.com/problems/two-sum/","Solved","2026-10-10",14,"Solved with single-pass hash map for O(n) time."';
  const sample2 = '"Course Schedule","LeetCode","Medium","Graphs","DFS;Topological Sort","https://leetcode.com/problems/course-schedule/","Need Revision","2026-10-11",32,"Cycle detection in directed graph using Kahn algorithm."';
  return `${headers}\n${sample1}\n${sample2}`;
}

export function exportProblemsToCSV(problems: Problem[]): string {
  const headers = 'Name,Platform,Difficulty,Topic,Tags,Link,Status,DateSolved,TimeSpentMinutes,Notes';
  const rows = problems.map((p) => {
    const cleanName = `"${p.name.replace(/"/g, '""')}"`;
    const cleanPlatform = `"${p.platform}"`;
    const cleanDiff = `"${p.difficulty}"`;
    const cleanTopic = `"${p.topic}"`;
    const cleanTags = `"${(p.tags || []).join(';')}"`;
    const cleanLink = `"${p.link.replace(/"/g, '""')}"`;
    const cleanStatus = `"${p.status}"`;
    const cleanDate = `"${p.dateSolved || ''}"`;
    const cleanTime = p.timeSpentMinutes || 0;
    const cleanNotes = `"${(p.notes || '').replace(/"/g, '""')}"`;

    return `${cleanName},${cleanPlatform},${cleanDiff},${cleanTopic},${cleanTags},${cleanLink},${cleanStatus},${cleanDate},${cleanTime},${cleanNotes}`;
  });

  return [headers, ...rows].join('\n');
}

export function parseProblemsFromCSV(csvText: string): Partial<Problem>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  // Parse CSV line handling quotes
  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = headers.indexOf('name');
  const platformIdx = headers.indexOf('platform');
  const diffIdx = headers.indexOf('difficulty');
  const topicIdx = headers.indexOf('topic');
  const tagsIdx = headers.indexOf('tags');
  const linkIdx = headers.indexOf('link');
  const statusIdx = headers.indexOf('status');
  const dateIdx = headers.indexOf('datesolved');
  const timeIdx = headers.indexOf('timespentminutes');
  const notesIdx = headers.indexOf('notes');

  const problems: Partial<Problem>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length < 2) continue;

    const name = nameIdx !== -1 ? cols[nameIdx] : cols[0];
    if (!name) continue;

    const platform = (platformIdx !== -1 && cols[platformIdx]) ? cols[platformIdx] as any : 'LeetCode';
    const difficulty = (diffIdx !== -1 && cols[diffIdx]) ? cols[diffIdx] as any : 'Medium';
    const topic = (topicIdx !== -1 && cols[topicIdx]) ? cols[topicIdx] as any : 'Arrays';
    const tags = tagsIdx !== -1 && cols[tagsIdx] ? cols[tagsIdx].split(';').map((t) => t.trim()).filter(Boolean) : ['DSA'];
    const link = linkIdx !== -1 ? cols[linkIdx] : '';
    const status = (statusIdx !== -1 && cols[statusIdx]) ? cols[statusIdx] as any : 'Solved';
    const dateSolved = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString().split('T')[0];
    const timeSpentMinutes = timeIdx !== -1 ? parseInt(cols[timeIdx], 10) || 25 : 25;
    const notes = notesIdx !== -1 ? cols[notesIdx] : '';

    problems.push({
      name,
      platform,
      difficulty,
      topic,
      tags,
      link,
      status,
      dateSolved,
      timeSpentMinutes,
      notes,
    });
  }

  return problems;
}
