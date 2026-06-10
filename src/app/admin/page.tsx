'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCommunityStats, getStoredAnnouncements, getStoredThreads, getStoredReplies, getStoredPolls } from '@/lib/local-data';
import { Bell, MessageSquare, Vote, Users, MapPin, TrendingUp, Plus } from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ total_threads: 0, total_replies: 0, total_polls: 0, total_announcements: 0, active_users: 0, clusters_active: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const s = getCommunityStats();
    setStats(s);

    // Build recent activity feed
    const announcements = getStoredAnnouncements().map(a => ({ ...a, type: 'announcement' }));
    const threads = getStoredThreads().map(t => ({ ...t, type: 'thread' }));
    const replies = getStoredReplies().map(r => ({ ...r, type: 'reply' }));
    const polls = getStoredPolls().map(p => ({ ...p, type: 'poll' }));

    const all = [...announcements, ...threads, ...replies, ...polls].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setRecentActivity(all.slice(0, 15));
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell className="w-4 h-4 text-blue-500" />;
      case 'thread': return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'reply': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'poll': return <Vote className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  const getActivityLabel = (item: any) => {
    switch (item.type) {
      case 'announcement': return `Announcement: ${item.title}`;
      case 'thread': return `New thread: ${item.title}`;
      case 'reply': return `Reply in thread by ${item.author}`;
      case 'poll': return `Poll: ${item.question}`;
      default: return '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">Manage the HHC Clinical Costing Community</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1"><MessageSquare className="w-4 h-4" /><span className="text-xs font-medium">Threads</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_threads}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-1"><MessageSquare className="w-4 h-4" /><span className="text-xs font-medium">Replies</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_replies}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1"><Vote className="w-4 h-4" /><span className="text-xs font-medium">Polls</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_polls}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1"><Bell className="w-4 h-4" /><span className="text-xs font-medium">Announcements</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_announcements}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1"><Users className="w-4 h-4" /><span className="text-xs font-medium">Active Users</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.active_users}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-1"><MapPin className="w-4 h-4" /><span className="text-xs font-medium">Clusters</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.clusters_active}/20</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/announcements" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors">
          <Bell className="w-4 h-4" /> Manage Announcements
        </Link>
        <Link href="/admin/polls" className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium text-sm transition-colors">
          <Vote className="w-4 h-4" /> Manage Polls
        </Link>
        <Link href="/admin/announcements" className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
          <Plus className="w-4 h-4" /> Create Announcement
        </Link>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Activity Feed</h2>
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </div>
        <div className="space-y-3">
          {recentActivity.map((item: any, i: number) => (
            <div key={item.id + '-' + i} className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50">
              <div className="mt-0.5 flex-shrink-0">{getActivityIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{getActivityLabel(item)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.author || item.author_name || 'Unknown'} · {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}