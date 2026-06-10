'use client';

import { useState, useEffect } from 'react';
import { getStoredPolls, savePoll, deletePoll, togglePollActive, castVote, getUserVoteOptionId } from '@/lib/local-data';
import { Plus, Vote, Trash2, Loader2, X, BarChart3, CheckCircle, PauseCircle, PlayCircle } from 'lucide-react';

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refresh = () => setPolls(getStoredPolls());

  useEffect(() => { refresh(); }, []);

  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const filledOptions = options.filter(o => o.trim());
    if (!question.trim()) { setError('Question is required'); return; }
    if (filledOptions.length < 2) { setError('At least 2 options are required'); return; }
    setLoading(true);
    savePoll({
      question: question.trim(),
      description: description.trim(),
      author: 'Admin',
      clusterName: null,
      options: filledOptions.map(o => o.trim()),
      ends_at: null,
    });
    setQuestion(''); setDescription(''); setOptions(['', '']);
    setShowForm(false);
    setSuccessMsg('Poll created!');
    setTimeout(() => setSuccessMsg(null), 3000);
    refresh();
    setLoading(false);
  };

  const handleToggleActive = (id: string) => {
    togglePollActive(id);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this poll?')) {
      deletePoll(id);
      refresh();
    }
  };

  const getTotalVotes = (poll: any) => poll.options.reduce((sum: number, o: any) => sum + o.vote_count, 0);
  const getTopOption = (poll: any) => {
    const sorted = [...poll.options].sort((a, b) => b.vote_count - a.vote_count);
    return sorted[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Polls</h1>
          <p className="text-gray-500 mt-1">Create and manage community polling</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium text-sm transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Poll'}
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{successMsg}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create Poll</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" placeholder="What do you want to ask?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-y" placeholder="Add context for the poll..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={opt} onChange={e => { const copy = [...options]; copy[i] = e.target.value; setOptions(copy); }} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" placeholder={`Option ${i + 1}`} />
                    {options.length > 2 && (
                      <button type="button" onClick={() => handleRemoveOption(i)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleAddOption} className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium">
                + Add option
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white py-2.5 rounded-lg hover:bg-amber-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Poll'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {polls.map((poll: any) => {
          const totalVotes = getTotalVotes(poll);
          const topOption = getTopOption(poll);
          return (
            <div key={poll.id} className={`bg-white rounded-xl border p-5 transition-shadow ${poll.is_active ? 'border-amber-200' : 'border-gray-200 opacity-70'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Vote className={`w-4 h-4 flex-shrink-0 ${poll.is_active ? 'text-amber-600' : 'text-gray-400'}`} />
                    <h3 className="font-semibold text-gray-900">{poll.question}</h3>
                    {poll.is_active ? (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                    ) : (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Closed</span>
                    )}
                  </div>
                  {poll.description && <p className="text-sm text-gray-500 mb-3">{poll.description}</p>}
                  <div className="space-y-1.5 mb-2">
                    {poll.options.map((opt: any) => {
                      const pct = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 w-48 truncate">{opt.text}</span>
                          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-12 text-right">{opt.vote_count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400">
                    {totalVotes} total vote{totalVotes !== 1 ? 's' : ''} · Created {new Date(poll.created_at).toLocaleDateString()}
                    {topOption && totalVotes > 0 && ` · Leading: "${topOption.text}"`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggleActive(poll.id)} className={`p-2 rounded-lg transition-colors ${poll.is_active ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={poll.is_active ? 'Close poll' : 'Reopen poll'}>
                    {poll.is_active ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(poll.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {polls.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No polls yet. Create the first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}