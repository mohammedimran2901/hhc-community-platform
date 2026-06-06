import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';

export default async function AnnouncementsPage() {
  let announcements: any[] = [];

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data } = await supabase
      .from('announcements')
      .select('*, author:author_id(full_name)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    if (data) announcements = data;
  } catch {
    // Supabase not configured
  }

  const categoryColors: Record<string, string> = {
    guidance: 'bg-blue-100 text-blue-700',
    update: 'bg-emerald-100 text-emerald-700',
    training: 'bg-purple-100 text-purple-700',
    policy: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements & Guidance</h1>
          <p className="text-gray-500 mt-1">Latest communications from HHC</p>
        </div>
        <Link
          href="/announcements/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </Link>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((a: any) => (
            <Link
              key={a.id}
              href={`/announcements/${a.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[a.category] || 'bg-gray-100 text-gray-700'}`}>
                      {a.category}
                    </span>
                    {a.is_pinned && <span className="text-xs font-medium text-amber-600">📌 Pinned</span>}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 truncate">{a.title}</h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <span>{new Date(a.created_at).toLocaleDateString()}</span>
                {a.author && <span>By {a.author.full_name}</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No announcements yet</p>
        </div>
      )}
    </div>
  );
}