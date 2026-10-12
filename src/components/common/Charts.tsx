import React, { useState } from 'react';
import { TopicStat } from '../../types';

/**
 * 1. Interview Readiness Score Gauge
 */
export const ReadinessGauge: React.FC<{
  score: number;
  tier: 'Beginner' | 'Developing' | 'Interview-Ready';
  tierColor: string;
  size?: number;
}> = ({ score, tier, size = 180 }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle or 270 degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * score) / 100;

  const color =
    score >= 75
      ? '#10b981' // emerald-500
      : score >= 45
      ? '#f59e0b' // amber-500
      : '#f43f5e'; // rose-500

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-135 drop-shadow-sm"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          className="text-slate-200 dark:text-slate-800"
        />
        {/* Animated fill track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
        <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {score}
        </span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          / 100
        </span>
        <span
          className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            score >= 75
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : score >= 45
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          {tier}
        </span>
      </div>
    </div>
  );
};

/**
 * 2. Topic Weakness / Strength Radar Chart
 */
export const WeaknessRadarChart: React.FC<{
  stats: TopicStat[];
  size?: number;
}> = ({ stats, size = 320 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take top 8 prominent topics for clean readability
  const activeStats = stats.slice(0, 8);
  const total = activeStats.length;
  if (total === 0) return null;

  const center = size / 2;
  const radius = center - 48;

  // Calculate coordinates on circle
  const getCoordinates = (index: number, valNorm: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = radius * valNorm;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Convert weakness score (100 is high weakness, so strength = 100 - weakness)
  const polygonPoints = activeStats
    .map((s, i) => {
      // Invert weakness to represent strength for the radar polygon (higher = stronger)
      const strength = Math.max(10, 100 - s.weaknessScore);
      const { x, y } = getCoordinates(i, strength / 100);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric grid circles */}
        {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={radius * level}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray={level === 1 ? 'none' : '3 3'}
          />
        ))}

        {/* Spoke lines */}
        {activeStats.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-200 dark:text-slate-800"
            />
          );
        })}

        {/* Filled polygon for student strength */}
        <polygon
          points={polygonPoints}
          fill="rgba(99, 102, 241, 0.25)"
          stroke="#6366f1"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Data points & Topic labels */}
        {activeStats.map((s, i) => {
          const strength = Math.max(10, 100 - s.weaknessScore);
          const { x, y } = getCoordinates(i, strength / 100);
          const labelCoord = getCoordinates(i, 1.25);
          const isHovered = hoveredIndex === i;

          return (
            <g key={s.topic}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 6 : 4}
                className="fill-indigo-500 stroke-white dark:stroke-slate-900 cursor-pointer transition-all"
                strokeWidth="2"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[11px] font-medium transition-colors select-none ${
                  isHovered
                    ? 'fill-indigo-500 font-bold'
                    : 'fill-slate-600 dark:fill-slate-400'
                }`}
              >
                {s.topic.length > 12 ? s.topic.split(' ')[0] : s.topic}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredIndex !== null && (
        <div className="mt-2 text-xs text-center p-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md">
          <span className="font-bold">{activeStats[hoveredIndex].topic}</span>:{' '}
          Weakness Score: <span className="font-semibold text-rose-400 dark:text-rose-600">{activeStats[hoveredIndex].weaknessScore}/100</span> | Solved:{' '}
          {activeStats[hoveredIndex].solvedCount} | Avg Time: {activeStats[hoveredIndex].avgTimeMinutes}m
        </div>
      )}
      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
        Higher polygon expansion = Higher Topic Strength (Lower Weakness)
      </div>
    </div>
  );
};

/**
 * 3. Line Chart for Contests or Weekly Solves Trend
 */
export interface LinePoint {
  label: string;
  value: number;
  secondaryValue?: number;
  subtext?: string;
}

export const SimpleLineChart: React.FC<{
  data: LinePoint[];
  height?: number;
  lineColor?: string;
  unit?: string;
}> = ({ data, height = 200, lineColor = '#6366f1', unit = '' }) => {
  const [activePoint, setActivePoint] = useState<LinePoint | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
        No data logged yet
      </div>
    );
  }

  const paddingX = 40;
  const paddingY = 24;
  const width = 500;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.95;
  const maxVal = Math.max(...values) * 1.05 || 100;
  const valRange = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.value - minVal) / valRange) * (height - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Fill gradient path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full flex flex-col">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="lineFillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.5, 1].map((pct) => {
          const y = height - paddingY - pct * (height - paddingY * 2);
          const gridVal = Math.round(minVal + pct * valRange);
          return (
            <g key={pct}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Gradient fill underneath curve */}
        <path d={areaD} fill="url(#lineFillGrad)" />

        {/* Main curve */}
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={activePoint?.label === p.data.label ? 6 : 4}
              fill={lineColor}
              className="stroke-white dark:stroke-slate-900 cursor-pointer transition-all hover:scale-125"
              strokeWidth="2"
              onMouseEnter={() => setActivePoint(p.data)}
              onMouseLeave={() => setActivePoint(null)}
            />
            {/* X Axis Labels */}
            <text
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              className="text-[10px] fill-slate-400 select-none"
            >
              {p.data.label}
            </text>
          </g>
        ))}
      </svg>

      {activePoint && (
        <div className="mt-2 text-xs self-center px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow">
          <span className="font-semibold">{activePoint.label}:</span> {activePoint.value} {unit}
          {activePoint.subtext && <span className="opacity-75 ml-2">({activePoint.subtext})</span>}
        </div>
      )}
    </div>
  );
};

/**
 * 4. Bar Chart for Solving Time & Weekly Distribution
 */
export interface BarItem {
  label: string;
  value: number;
  benchmark?: number;
  colorClass?: string;
  formattedVal?: string;
}

export const SimpleBarChart: React.FC<{
  bars: BarItem[];
  maxVal?: number;
  showBenchmark?: boolean;
}> = ({ bars, maxVal, showBenchmark = false }) => {
  const calculatedMax = maxVal || Math.max(...bars.map((b) => Math.max(b.value, b.benchmark || 0))) * 1.15 || 50;

  return (
    <div className="w-full space-y-3">
      {bars.map((bar) => {
        const pct = Math.min(100, Math.round((bar.value / calculatedMax) * 100));
        const benchPct = bar.benchmark ? Math.min(100, Math.round((bar.benchmark / calculatedMax) * 100)) : 0;

        return (
          <div key={bar.label} className="text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">{bar.label}</span>
              <div className="flex items-center gap-2 text-xs">
                {showBenchmark && bar.benchmark && (
                  <span className="text-slate-400">Target: {bar.benchmark}m</span>
                )}
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {bar.formattedVal || `${bar.value}m`}
                </span>
              </div>
            </div>
            <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  bar.colorClass || 'bg-indigo-500'
                }`}
                style={{ width: `${pct}%` }}
              />
              {/* Benchmark marker tick */}
              {showBenchmark && bar.benchmark && (
                <div
                  className="absolute top-0 bottom-0 w-1 bg-rose-500 dark:bg-rose-400 z-10"
                  style={{ left: `${benchPct}%` }}
                  title={`Benchmark: ${bar.benchmark}m`}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 5. Daily Solving Activity Heatmap (GitHub-style 12-week grid)
 */
export const ActivityHeatmap: React.FC<{
  problems: { dateSolved: string }[];
}> = ({ problems }) => {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  // Map counts per date YYYY-MM-DD
  const dateCounts: Record<string, number> = {};
  problems.forEach((p) => {
    if (p.dateSolved) {
      dateCounts[p.dateSolved] = (dateCounts[p.dateSolved] || 0) + 1;
    }
  });

  // Generate last 84 days (12 weeks x 7 days)
  const days: { date: string; count: number; dayOfWeek: number }[] = [];
  const today = new Date();

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: dateCounts[dateStr] || 0,
      dayOfWeek: d.getDay(),
    });
  }

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/80';
    if (count === 1) return 'bg-emerald-300 dark:bg-emerald-900';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-700';
    if (count === 3) return 'bg-emerald-500 dark:bg-emerald-500';
    return 'bg-emerald-600 dark:bg-emerald-400';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Past 12 Weeks Activity</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-900" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-500" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-1">
        {days.map((day) => (
          <div
            key={day.date}
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
            className={`w-3.5 h-3.5 rounded-xs cursor-pointer transition-transform hover:scale-125 ${getColorClass(
              day.count
            )}`}
            title={`${day.date}: ${day.count} problem${day.count === 1 ? '' : 's'} solved`}
          />
        ))}
      </div>

      {hoveredDay && (
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold">{hoveredDay.date}:</span> {hoveredDay.count} problem
          {hoveredDay.count === 1 ? '' : 's'} solved
        </div>
      )}
    </div>
  );
};
