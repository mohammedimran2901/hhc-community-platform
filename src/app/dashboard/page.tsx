import Link from 'next/link';
import { Bell, MessageSquare, ArrowRight, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch recent announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, category, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent forum threads
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id, title, created_at, author_id')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome to HHC Costing Community</h1>
        <p className="text-gray-500 mt-1">Your central hub for clinical costing collaboration</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Recent Announcements</h2>
            </div>
            <Link
              href="/announcements"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {announcements && announcements.length > 0 ? (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/announcements/${a.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No announcements yet</p>
          )}
        </div>

        {/* Recent Forum Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-gray-900">Recent Forum Activity</h2>
            </div>
            <Link
              href="/forum"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {threads && threads.length > 0 ? (
            <ul className="space-y-3">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/forum/${t.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No forum threads yet</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/announcements"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Browse Announcements</p>
            <p className="text-sm text-gray-500">Latest guidance from HHC</p>
          </div>
        </Link>

        <Link
          href="/forum"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Join the Discussion</p>
            <p className="text-sm text-gray-500">Ask questions & share knowledge</p>
          </div>
        </Link>

        <Link
          href="/clusters"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">View Clusters</p>
            <p className="text-sm text-gray-500">20 health clusters directory</p>
          </div>
        </Link>
      </div>
    </div>
  );
}