'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredThreads } from '@/lib/local-data';
import { Plus, MessageSquare, ArrowRight, Search } from 'lucide-react';

export default function ForumPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get local threads from localStorage
    const local = getStoredThreads();
    setThreads(local);
    setLoading(false);

    // Also try fetching from Supabase if configured
    async function fetchSupabase() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('forum_threads')
          .select('*, author:author_id(full_name), cluster:cluster_id(name_en)')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          const mapped = data.map((t: any) => ({
            id: t.id,
            title: t.title,
            content: t.content,
            author: t.author?.full_name || 'Unknown',
            clusterName: t.cluster?.name_en || null,
            is_resolved: t.is_resolved,
            created_at: t.created_at,
          }));
          // Merge: local first, then Supabase
          setThreads([...local, ...mapped.filter((m: any) => !local.find((l: any) => l.id === m.id))]);
        }
      } catch {}
    }
    fetchSupabase();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-500 mt-1">Ask questions, share knowledge, and collaborate</p>
        </div>
        <Link
          href="/forum/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Thread
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search threads..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          disabled
        />
      </div>

      {loading ? (
        <div className="text-center py-10"><p className="text-gray-500">Loading...</p></div>
      ) : threads.length > 0 ? (
        <div className="space-y-3">
          {threads.map((t: any) => (
            <Link
              key={t.id}
              href={`/forum/${t.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <h2 className="font-semibold text-gray-900 truncate">{t.title}</h2>
                    {t.is_resolved && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Resolved</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{t.content}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>{new Date(t.created_at).toLocaleDateString()}</span>
                <span>{t.author}</span>
                {t.clusterName && <span>📍 {t.clusterName}</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No threads yet. Start the first discussion!</p>
          <Link href="/forum/new" className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium">
            <Plus className="w-4 h-4" />
            Create Thread
          </Link>
        </div>
      )}
    </div>
  );
}