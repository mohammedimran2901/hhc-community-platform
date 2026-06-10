'use client';

import { useState, useEffect } from 'react';
import { getStoredAnnouncements, saveAnnouncement, deleteAnnouncement, togglePinAnnouncement } from '@/lib/local-data';
import { Plus, Pin, PinOff, Trash2, Loader2, Bell, X } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'guidance' | 'update' | 'training' | 'policy'>('guidance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refresh = () => setAnnouncements(getStoredAnnouncements());

  useEffect(() => { refresh(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) { setError('Title and content are required'); return; }
    setLoading(true);
    saveAnnouncement({ title: title.trim(), content: content.trim(), category, author: 'Admin' });
    setTitle(''); setContent(''); setCategory('guidance'); setShowForm(false);
    setSuccessMsg('Announcement created!');
    setTimeout(() => setSuccessMsg(null), 3000);
    refresh();
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this announcement?')) {
      deleteAnnouncement(id);
      refresh();
    }
  };

  const handleTogglePin = (id: string) => {
    togglePinAnnouncement(id);
    refresh();
  };

  const categoryColors: Record<string, string> = {
    guidance: 'bg-purple-100 text-purple-700',
    update: 'bg-blue-100 text-blue-700',
    training: 'bg-green-100 text-green-700',
    policy: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Announcements</h1>
          <p className="text-gray-500 mt-1">Create, pin, and manage HHC announcements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{successMsg}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create Announcement</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Announcement title..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white">
                <option value="guidance">Guidance</option>
                <option value="update">Update</option>
                <option value="training">Training</option>
                <option value="policy">Policy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y" placeholder="Write the announcement content..." />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Announcement'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {announcements.map((a: any) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Bell className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[a.category] || 'bg-gray-100 text-gray-700'}`}>{a.category}</span>
                  {a.is_pinned && <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pinned</span>}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-wrap">{a.content}</p>
                <p className="text-xs text-gray-400 mt-2">{a.author} · {new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleTogglePin(a.id)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title={a.is_pinned ? 'Unpin' : 'Pin'}>
                  {a.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(a.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No announcements yet. Create the first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}