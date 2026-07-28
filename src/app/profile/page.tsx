'use client';

import { useState, useEffect } from 'react';
import { getClient } from '@/lib/supabase/client-lazy';
import { User, Loader2, MessageSquare, Bell, Vote, Activity, MapPin, Lock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getStoredThreads, getStoredReplies, getStoredPolls, getUserVoteOptionId } from '@/lib/local-data';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myThreads, setMyThreads] = useState<any[]>([]);
  const [myReplies, setMyReplies] = useState<any[]>([]);

  // Change password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const supabase = await getClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      // Try Supabase auth
      try {
        const supabase = await getClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*, cluster:cluster_id(name_en, name_ar)')
            .eq('id', user.id)
            .single();
          setProfile(profile);
        }
      } catch {
        // Demo mode - no auth
      }

      // Load from localStorage (demo mode)
      const allThreads = getStoredThreads();
      const allReplies = getStoredReplies();

      // Show all threads/replies as "community" activity since no auth
      setMyThreads(allThreads.slice(0, 5));
      setMyReplies(allReplies.slice(0, 5));
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isDemo = !user;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">
          {isDemo ? 'Demo mode — community activity overview' : 'Your account and activity'}
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {profile?.full_name || user?.email || 'Demo User'}
            </h2>
            <p className="text-sm text-gray-500">{user?.email || 'demo@hhc-community.sa'}</p>
            {isDemo && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                Demo Mode
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900">{profile?.full_name || 'Demo User'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user?.email || 'demo@hhc-community.sa'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Cluster</label>
              <p className="text-gray-900 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                {profile?.cluster ? `${profile.cluster.name_en}` : 'Not assigned'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="text-gray-900 capitalize">{profile?.role || 'member'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Member since</label>
              <p className="text-gray-900">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'June 2024'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card - only for logged-in users */}
      {!isDemo && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            Change Password
          </h3>

          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Password updated successfully!
            </div>
          )}

          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Re-enter your new password"
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {changingPassword ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <MessageSquare className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{myThreads.length}</p>
          <p className="text-xs text-gray-500">Threads</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Activity className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{myReplies.length}</p>
          <p className="text-xs text-gray-500">Replies</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Vote className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{getStoredPolls().filter(p => p.is_active).length}</p>
          <p className="text-xs text-gray-500">Active Polls</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <MapPin className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">1</p>
          <p className="text-xs text-gray-500">Cluster</p>
        </div>
      </div>

      {/* My Recent Threads */}
      {myThreads.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Community Threads
          </h3>
          <div className="space-y-2">
            {myThreads.map((t: any) => (
              <div key={t.id} className="p-3 rounded-lg hover:bg-gray-50">
                <p className="text-sm font-medium text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-400">{t.author}{t.clusterName ? ` · ${t.clusterName}` : ''} · {new Date(t.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}