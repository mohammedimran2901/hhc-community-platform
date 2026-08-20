'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveAnnouncement } from '@/lib/local-data';
import { AttachmentPicker } from '@/components/AttachmentPicker';
import { ArrowLeft, Loader2 } from 'lucide-react';

const categories = [
  { value: 'guidance', label: 'Guidance' },
  { value: 'update', label: 'Update' },
  { value: 'training', label: 'Training' },
  { value: 'policy', label: 'Policy' },
];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'guidance' | 'update' | 'training' | 'policy'>('guidance');
  const [author, setAuthor] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentWarnings, setAttachmentWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim() || !author.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const warnings: string[] = [];
    let supabaseCreated = false;

    // Try Supabase first
    try {
      const { getClient } = await import('@/lib/supabase/client-lazy');
      const supabase = await getClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: created, error: insertError } = await supabase
          .from('announcements')
          .insert({
            title: title.trim(),
            content: content.trim(),
            category,
            author_id: user.id,
          })
          .select('id')
          .single();

        if (!insertError && created) {
          supabaseCreated = true;

          // Upload attachments (admin only — enforced by /api/admin/files)
          if (attachments.length > 0) {
            for (let i = 0; i < attachments.length; i++) {
              setProgress(`Uploading attachment ${i + 1} of ${attachments.length}...`);
              try {
                const form = new FormData();
                form.append('file', attachments[i]);
                form.append('announcement_id', created.id);
                const res = await fetch('/api/admin/files', { method: 'POST', body: form });
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  warnings.push(`${attachments[i].name}: ${data.error || 'upload failed'}`);
                }
              } catch {
                warnings.push(`${attachments[i].name}: upload failed`);
              }
            }
          }
        }
      } else if (attachments.length > 0) {
        warnings.push('Attachments require an admin sign-in and were skipped.');
      }
    } catch {
      // Supabase not available — will fall back to localStorage
    }

    // Only save to localStorage if Supabase didn't handle it (demo mode)
    if (!supabaseCreated) {
      saveAnnouncement({ title: title.trim(), content: content.trim(), category, author: author.trim() });
      if (attachments.length > 0) {
        warnings.push('Attachments are only available when connected to Supabase.');
      }
    }

    setAttachmentWarnings(warnings);
    setProgress('');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Announcement Created!</h1>
        <p className="text-gray-600 mb-6">Your announcement has been published.</p>
        {attachmentWarnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 text-sm text-left">
            <p className="font-medium mb-1">Some attachments could not be uploaded:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {attachmentWarnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        <Link href="/announcements" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to announcements
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/announcements" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" />
        Back to announcements
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">New Announcement</h1>
        <p className="text-gray-500 mb-6">Share guidance, updates, or training with the community</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Announcement title"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category" value={category} onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              id="author" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g. HHC Admin"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={8}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
              placeholder="Write your announcement content here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <AttachmentPicker files={attachments} onChange={setAttachments} maxFiles={5} disabled={loading} />
            <p className="text-xs text-gray-400 mt-1.5">Members will be able to download these files from the announcement.</p>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> {progress || 'Publishing...'}</>) : 'Publish Announcement'}
          </button>
        </form>
      </div>
    </div>
  );
}