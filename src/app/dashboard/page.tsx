'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCommunityStats, getStoredAnnouncements, getStoredThreads, getStoredPolls, getStoredReplies } from '@/lib/local-data';
import PollCard from './poll-card';
import { Bell, MessageSquare, ArrowRight, Users, Vote, MapPin, Activity, Sparkles } from 'lucide-react';

const statCards = [
  { key: 'threads', label: 'Threads', icon: MessageSquare, chip: 'bg-emerald-500/10 text-emerald-600' },
  { key: 'replies', label: 'Replies', icon: MessageSquare, chip: 'bg-purple-500/10 text-purple-600' },
  { key: 'polls', label: 'Active Polls', icon: Vote, chip: 'bg-amber-500/10 text-amber-600' },
  { key: 'announcements', label: 'Announcements', icon: Bell, chip: 'bg-blue-500/10 text-blue-600' },
  { key: 'members', label: 'Members', icon: Users, chip: 'bg-teal-500/10 text-teal-600' },
  { key: 'clusters', label: 'Active Clusters', icon: MapPin, chip: 'bg-indigo-500/10 text-indigo-600' },
];

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

  const statValues: Record<string, string | number> = {
    threads: stats.total_threads,
    replies: stats.total_replies,
    polls: polls.filter(p => p.is_active).length,
    announcements: stats.total_announcements,
    members: stats.active_users,
    clusters: `${stats.clusters_active}/20`,
  };

  return (
    <div className="space-y-8">
      {/* Premium Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-10 sm:px-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-emerald-300 px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            HHC Clinical Costing Community
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl">
            Your central hub for clinical costing collaboration across Saudi Arabia's 20 health clusters.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`w-9 h-9 ${card.chip} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{statValues[card.key]}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Announcements</h2>
            </div>
            <Link href="/announcements" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {announcements.length > 0 ? (
            <ul className="space-y-2">
              {announcements.slice(0, 4).map((a: any) => (
                <li key={a.id}>
                  <Link href={`/announcements/${a.id}`} className="block p-3 rounded-xl hover:bg-slate-50 transition-colors">
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
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Recent Discussions</h2>
            </div>
            <Link href="/forum" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              All Threads <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {threads.length > 0 ? (
            <div className="space-y-2">
              {threads.slice(0, 5).map((t: any) => {
                const replyCount = getStoredReplies(t.id).length;
                return (
                  <Link
                    key={t.id}
                    href={`/forum/${t.id}`}
                    className="block p-3 rounded-xl hover:bg-slate-50 transition-colors"
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
          <Link href="/forum/new" className="mt-5 inline-flex items-center gap-2 text-sm bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 font-medium transition-all shadow-sm hover:shadow-md">
            Start a Discussion
          </Link>
        </div>
      </div>

      {/* Community Polls */}
      {polls.filter(p => p.is_active).length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Vote className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Community Polls</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {polls.filter((p: any) => p.is_active).slice(0, 3).map((poll: any) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link href="/announcements" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Announcements</p>
            <p className="text-xs text-gray-500 mt-0.5">Latest from HHC</p>
          </div>
        </Link>
        <Link href="/forum" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Forum</p>
            <p className="text-xs text-gray-500 mt-0.5">Discuss & collaborate</p>
          </div>
        </Link>
        <Link href="/clusters" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Clusters</p>
            <p className="text-xs text-gray-500 mt-0.5">20 clusters network</p>
          </div>
        </Link>
        <Link href="/profile" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">My Profile</p>
            <p className="text-xs text-gray-500 mt-0.5">Your activity</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
