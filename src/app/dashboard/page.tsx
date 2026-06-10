'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCommunityStats, getStoredAnnouncements, getStoredThreads, getStoredPolls, getStoredReplies } from '@/lib/local-data';
import { Bell, MessageSquare, ArrowRight, Users, Vote, TrendingUp, MapPin, Activity, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total_threads: 0, total_replies: 0, total_polls: 0, total_announcements: 0, active_users: 0, clusters_active: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);

  useEffect(() => {
    setStats(getCommunityStats());
    setAnnouncements(getStoredAnnouncements());
    setThreads(getStoredThreads());
    setPolls(getStoredPolls());
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome to HHC Clinical Costing Community</h1>
        <p className="text-gray-500 mt-1">Your central hub for clinical costing collaboration across 20 health clusters</p>
      </div>

      {/* Stats Overview */}
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
          <div className="flex items-center gap-2 text-amber-600 mb-1"><Vote className="w-4 h-4" /><span className="text-xs font-medium">Active Polls</span></div>
          <p className="text-2xl font-bold text-gray-900">{polls.filter(p => p.is_active).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1"><Bell className="w-4 h-4" /><span className="text-xs font-medium">Announcements</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_announcements}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1"><Users className="w-4 h-4" /><span className="text-xs font-medium">Members</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.active_users}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-1"><MapPin className="w-4 h-4" /><span className="text-xs font-medium">Active Clusters</span></div>
          <p className="text-2xl font-bold text-gray-900">{stats.clusters_active}/20</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Announcements</h2>
            </div>
            <Link href="/announcements" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {announcements.length > 0 ? (
            <ul className="space-y-3">
              {announcements.slice(0, 4).map((a: any) => (
                <li key={a.id}>
                  <Link href={`/announcements/${a.id}`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 mb-0.5">
                      {a.is_pinned && <span className="text-amber-500 text-xs">📌</span>}
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{a.title}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {a.author} · {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No announcements</p>
          )}
        </div>

        {/* Recent Discussions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-gray-900">Recent Discussions</h2>
            </div>
            <Link href="/forum" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              All Threads <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {threads.length > 0 ? (
            <div className="space-y-3">
              {threads.slice(0, 5).map((t: any) => {
                const replyCount = getStoredReplies(t.id).length;
                return (
                  <Link
                    key={t.id}
                    href={`/forum/${t.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                          {t.is_resolved && (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0">Resolved</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {t.author}{t.clusterName ? ` · 📍 ${t.clusterName}` : ''} · {new Date(t.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                        <MessageSquare className="w-3 h-3" /> {replyCount}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No discussions yet</p>
          )}
          <Link href="/forum/new" className="mt-4 inline-flex items-center gap-2 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium transition-colors">
            Start a Discussion
          </Link>
        </div>
      </div>

      {/* Community Polls */}
      {polls.filter(p => p.is_active).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold text-gray-900">Community Polls</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {polls.filter(p => p.is_active).slice(0, 3).map((poll: any) => {
              const totalVotes = poll.options.reduce((s: number, o: any) => s + o.vote_count, 0);
              const topOption = [...poll.options].sort((a: any, b: any) => b.vote_count - a.vote_count)[0];
              return (
                <div key={poll.id} className="border border-amber-100 rounded-lg p-4 hover:border-amber-200 transition-colors">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{poll.question}</h3>
                  <div className="space-y-1 mb-3">
                    {poll.options.slice(0, 3).map((opt: any) => {
                      const pct = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 truncate flex-1">{opt.text}</span>
                          <span className="text-xs font-medium text-gray-700">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{totalVotes} votes</span>
                    <span className="text-xs text-gray-500">Leading: {topOption?.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link href="/announcements" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div><p className="font-medium text-gray-900">Announcements</p><p className="text-sm text-gray-500">Latest from HHC</p></div>
        </Link>
        <Link href="/forum" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-sm transition-all">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div><p className="font-medium text-gray-900">Forum</p><p className="text-sm text-gray-500">Discuss & collaborate</p></div>
        </Link>
        <Link href="/clusters" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-sm transition-all">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div><p className="font-medium text-gray-900">Clusters</p><p className="text-sm text-gray-500">20 clusters network</p></div>
        </Link>
        <Link href="/profile" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
          <div><p className="font-medium text-gray-900">My Profile</p><p className="text-sm text-gray-500">Your activity</p></div>
        </Link>
      </div>
    </div>
  );
}