import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Problem, Platform, Difficulty, TopicName, ProblemStatus } from '../../types';
import { ALL_TOPICS } from '../../utils/scoring';
import { X, Check, Code2, Link as LinkIcon, Clock } from 'lucide-react';

export const ProblemModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  problemToEdit?: Problem | null;
}> = ({ isOpen, onClose, problemToEdit }) => {
  const { addProblem, updateProblem } = useApp();

  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<Platform>('LeetCode');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [topic, setTopic] = useState<TopicName>('Arrays');
  const [tagsInput, setTagsInput] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ProblemStatus>('Solved');
  const [dateSolved, setDateSolved] = useState(new Date().toISOString().split('T')[0]);
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(25);

  useEffect(() => {
    if (problemToEdit) {
      setName(problemToEdit.name);
      setPlatform(problemToEdit.platform);
      setDifficulty(problemToEdit.difficulty);
      setTopic(problemToEdit.topic);
      setTagsInput((problemToEdit.tags || []).join(', '));
      setLink(problemToEdit.link || '');
      setNotes(problemToEdit.notes || '');
      setStatus(problemToEdit.status);
      setDateSolved(problemToEdit.dateSolved || new Date().toISOString().split('T')[0]);
      setTimeSpentMinutes(problemToEdit.timeSpentMinutes || 25);
    } else {
      setName('');
      setPlatform('LeetCode');
      setDifficulty('Medium');
      setTopic('Arrays');
      setTagsInput('');
      setLink('');
      setNotes('');
      setStatus('Solved');
      setDateSolved(new Date().toISOString().split('T')[0]);
      setTimeSpentMinutes(25);
    }
  }, [problemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (problemToEdit) {
      updateProblem(problemToEdit.id, {
        name,
        platform,
        difficulty,
        topic,
        tags: tags.length > 0 ? tags : [topic],
        link,
        notes,
        status,
        dateSolved,
        timeSpentMinutes: Number(timeSpentMinutes) || 20,
      });
    } else {
      addProblem({
        name,
        platform,
        difficulty,
        topic,
        tags: tags.length > 0 ? tags : [topic],
        link,
        notes,
        status,
        dateSolved,
        timeSpentMinutes: Number(timeSpentMinutes) || 20,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {problemToEdit ? 'Edit Problem Log' : 'Log New DSA Problem (OBJ-01)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Problem Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Word Break II"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs"
              >
                <option value="LeetCode">LeetCode</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
                <option value="Codeforces">Codeforces</option>
                <option value="HackerRank">HackerRank</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs"
              >
                <option value="Easy">Easy (Emerald)</option>
                <option value="Medium">Medium (Amber)</option>
                <option value="Hard">Hard (Rose)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Topic Category
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as TopicName)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs"
              >
                {ALL_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProblemStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs"
              >
                <option value="Solved">Solved</option>
                <option value="Attempted">Attempted</option>
                <option value="Need Revision">Need Revision</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time Spent (mins)</span>
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={timeSpentMinutes}
                onChange={(e) => setTimeSpentMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Date Solved
              </label>
              <input
                type="date"
                value={dateSolved}
                onChange={(e) => setDateSolved(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. DFS, Memoization, Trie"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Problem Link URL</span>
              </label>
              <input
                type="url"
                placeholder="https://leetcode.com/problems/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Personal Notes / Key Intuition / Edge Cases
            </label>
            <textarea
              rows={3}
              placeholder="e.g. State dp[i] represents minimum cuts. Watch out for single element base case."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-transform hover:scale-105"
            >
              <Check className="w-4 h-4" />
              <span>{problemToEdit ? 'Save Changes' : 'Add to Repository'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
