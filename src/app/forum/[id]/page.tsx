'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getStoredThreads } from '@/lib/local-data';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function ThreadDetailPage() {
  const params = useParams();
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;

    // Look in local storage first
    const localThreads = getStoredThreads();
    const found = localThreads.find(t => t.id === id);
    if (found) {
      setThread(found);
      setLoading(false);
      return;
    }

    // Try Supabase if not found locally
    async function fetchFromSupabase() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('forum_threads')
          .select('*, author:author_id(full_name)')
          .eq('id', id)
          .single();
        if (data) {
          setThread({
            id: data.id,
            title: data.title,
            content: data.content,
            author: data.author?.full_name || 'Unknown',
            clusterName: null,
            created_at: data.created_at,
          });
        }
      } catch {}
      setLoading(false);
    }
    fetchFromSupabase();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-gray-500">Loading thread...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Thread Not Found</h1>
        <Link href="/forum" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to forum
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" />
        Back to forum
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{thread.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{thread.author}</span>
              <span>{new Date(thread.created_at).toLocaleDateString()}</span>
              {thread.clusterName && <span>📍 {thread.clusterName}</span>}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{thread.content}</p>
        </div>
      </div>
    </div>
  );
}