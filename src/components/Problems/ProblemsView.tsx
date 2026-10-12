import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Problem, Platform, Difficulty, TopicName, ProblemStatus } from '../../types';
import { DifficultyBadge, PlatformBadge, StatusBadge } from '../common/Badges';
import { ALL_TOPICS, generateCSVTemplate, exportProblemsToCSV, parseProblemsFromCSV } from '../../utils/scoring';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Timer,
  ExternalLink,
  Edit2,
  Trash2,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  X,
  RotateCcw,
} from 'lucide-react';

export const ProblemsView: React.FC<{
  openAddModal: () => void;
  openEditModal: (problem: Problem) => void;
}> = ({ openAddModal, openEditModal }) => {
  const { problems, deleteProblem, importProblems, startTimer, addRevisionForProblem, addToast } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'time-desc' | 'time-asc' | 'diff' | 'name'>('date-desc');

  // CSV Import Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  // Filtered and sorted problems
  const filteredProblems = useMemo(() => {
    return problems
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesPlatform = selectedPlatform === 'All' || p.platform === selectedPlatform;
        const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
        const matchesTopic = selectedTopic === 'All' || p.topic === selectedTopic;
        const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

        return matchesSearch && matchesPlatform && matchesDiff && matchesTopic && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.dateSolved || b.createdAt).getTime() - new Date(a.dateSolved || a.createdAt).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.dateSolved || a.createdAt).getTime() - new Date(b.dateSolved || b.createdAt).getTime();
        }
        if (sortBy === 'time-desc') {
          return (b.timeSpentMinutes || 0) - (a.timeSpentMinutes || 0);
        }
        if (sortBy === 'time-asc') {
          return (a.timeSpentMinutes || 0) - (b.timeSpentMinutes || 0);
        }
        if (sortBy === 'diff') {
          const weights = { Hard: 3, Medium: 2, Easy: 1 };
          return weights[b.difficulty] - weights[a.difficulty];
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [problems, searchQuery, selectedPlatform, selectedDifficulty, selectedTopic, selectedStatus, sortBy]);

  // Export CSV
  const handleExportCSV = () => {
    const csvData = exportProblemsToCSV(problems);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CodeCompass_DSA_Problems_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Export Complete', `Exported ${problems.length} problems to CSV file.`);
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'CodeCompass_Sample_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('info', 'Template Downloaded', 'Open and edit in Excel or Google Sheets.');
  };

  const handleProcessImport = () => {
    if (!csvContent.trim()) return;
    const parsed = parseProblemsFromCSV(csvContent);
    if (parsed.length === 0) {
      addToast('error', 'Import Failed', 'No valid rows found in CSV text.');
      return;
    }
    importProblems(parsed);
    setShowImportModal(false);
    setCsvContent('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Problem Repository (OBJ-01)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Unified tracker for LeetCode, GFG, Codeforces, and DSA sheets ({problems.length} logged)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Search input + Sort dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems by name, topic, tag (e.g. Kadane, DP, BFS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="time-desc">Time Spent (High to Low)</option>
              <option value="time-asc">Time Spent (Low to High)</option>
              <option value="diff">Difficulty (Hard First)</option>
              <option value="name">Problem Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Multi-Select Pills / Select Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs"
            >
              <option value="All">All Platforms</option>
              <option value="LeetCode">LeetCode</option>
              <option value="GeeksforGeeks">GeeksforGeeks</option>
              <option value="Codeforces">Codeforces</option>
              <option value="HackerRank">HackerRank</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs"
            >
              <option value="All">All Topics</option>
              {ALL_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Solved">Solved</option>
              <option value="Attempted">Attempted</option>
              <option value="Need Revision">Need Revision</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems List Table / Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        {filteredProblems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching problems found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or filters, or add a new problem to your repository.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatform('All');
                setSelectedDifficulty('All');
                setSelectedTopic('All');
                setSelectedStatus('All');
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Problem Name</th>
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Topic</th>
                  <th className="py-3 px-3">Difficulty</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProblems.map((prob) => (
                  <tr
                    key={prob.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {prob.link ? (
                          <a
                            href={prob.link}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <span>{prob.name}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                          </a>
                        ) : (
                          <span>{prob.name}</span>
                        )}
                      </div>
                      {prob.notes && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                          {prob.notes}
                        </p>
                      )}
                      {prob.tags && prob.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prob.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <PlatformBadge platform={prob.platform} />
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {prob.topic}
                    </td>

                    <td className="py-3.5 px-3">
                      <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                    </td>

                    <td className="py-3.5 px-3">
                      <StatusBadge status={prob.status} />
                    </td>

                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {prob.timeSpentMinutes ? `${prob.timeSpentMinutes}m` : '—'}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {prob.dateSolved || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            startTimer({
                              name: prob.name,
                              difficulty: prob.difficulty,
                              topic: prob.topic,
                              id: prob.id,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800"
                          title="Start stopwatch session for this problem"
                        >
                          <Timer className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => addRevisionForProblem(prob)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800"
                          title="Schedule in Revision Planner"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(prob)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                          title="Edit Problem"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteProblem(prob.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Import Problems via CSV
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bulk import your existing LeetCode, GFG, or sheet solutions without scraping.
            </p>

            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-indigo-900 dark:text-indigo-300">
                  Need the template?
                </div>
                <div className="text-slate-500 text-[11px]">
                  Download our formatted CSV template with required headers.
                </div>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Download Template
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upload CSV File:
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Or Paste CSV Raw Text:
              </label>
              <textarea
                rows={5}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder='Name,Platform,Difficulty,Topic,Tags,Link,Status,DateSolved,TimeSpentMinutes,Notes&#10;"Subarray Sum Equals K","LeetCode","Medium","Arrays","Prefix Sum","https://leetcode.com/...","Solved","2026-10-10",28,"Hash map with cumulative prefix sum"'
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessImport}
                disabled={!csvContent.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-colors"
              >
                Parse & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
