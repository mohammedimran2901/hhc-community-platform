'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveThread } from '@/lib/local-data';
import { ArrowLeft, Loader2 } from 'lucide-react';

const clusterOptions = [
  { id: '', name: 'General (no cluster)' },
  { id: 'c01', name: 'Riyadh First' },
  { id: 'c02', name: 'Riyadh Second' },
  { id: 'c03', name: 'Riyadh Third' },
  { id: 'c04', name: 'Jeddah First' },
  { id: 'c05', name: 'Jeddah Second' },
  { id: 'c06', name: 'Makkah Al-Mukarramah' },
  { id: 'c07', name: 'Al-Taif' },
  { id: 'c08', name: 'Al-Madinah Al-Munawarah' },
  { id: 'c09', name: 'Eastern' },
  { id: 'c10', name: 'Al-Ahsa' },
  { id: 'c11', name: 'Hafar Al-Batin' },
  { id: 'c12', name: 'Al-Qassim' },
  { id: 'c13', name: 'Hail' },
  { id: 'c14', name: 'Tabuk' },
  { id: 'c15', name: 'Al-Jouf' },
  { id: 'c16', name: 'Northern Borders' },
  { id: 'c17', name: 'Aseer' },
  { id: 'c18', name: 'Najran' },
  { id: 'c19', name: 'Al-Baha' },
  { id: 'c20', name: 'Jazan' },
];

export default function NewThreadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [clusterId, setClusterId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newThreadId, setNewThreadId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim() || !author.trim()) {
      setError('Please fill in title, content, and your name');
      return;
    }

    setLoading(true);

    const clusterName = clusterId ? clusterOptions.find(c => c.id === clusterId)?.name || null : null;

    // Save to localStorage for demo mode
    const saved = saveThread({
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      clusterName,
    });
    setNewThreadId(saved.id);

    // Also try Supabase if configured
    try {
      const { getClient } = await import('@/lib/supabase/client-lazy');
      const supabase = await getClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('forum_threads').insert({
          title: title.trim(),
          content: content.trim(),
          author_id: user.id,
          cluster_id: clusterId || null,
        });
      }
    } catch {
      // Supabase not available - demo mode
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thread Created!</h1>
        <p className="text-gray-600 mb-6">Your discussion thread is now live.</p>
        <div className="flex gap-4 justify-center">
          {newThreadId && (
            <Link href={`/forum/${newThreadId}`} className="text-blue-600 hover:text-blue-700 font-medium">
              View Thread
            </Link>
          )}
          <Link href="/forum" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" />
        Back to forum
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">New Thread</h1>
        <p className="text-gray-500 mb-6">Start a discussion, ask a question, or share knowledge</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="What's your question or topic?"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              id="author" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g. Costing Lead - Riyadh"
            />
          </div>

          <div>
            <label htmlFor="cluster" className="block text-sm font-medium text-gray-700 mb-1">Cluster (optional)</label>
            <select
              id="cluster" value={clusterId} onChange={(e) => setClusterId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              {clusterOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={8}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
              placeholder="Describe your question or share your thoughts in detail..."
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Thread'}
          </button>
        </form>
      </div>
    </div>
  );
}