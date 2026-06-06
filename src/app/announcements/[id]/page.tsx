import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft } from 'lucide-react';

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: announcement } = await supabase
    .from('announcements')
    .select('*, author:author_id(full_name)')
    .eq('id', id)
    .single();

  if (!announcement) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/announcements"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to announcements
      </Link>

      <article className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {announcement.category}
          </span>
          {announcement.is_pinned && (
            <span className="text-xs font-medium text-amber-600">📌 Pinned</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{announcement.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
          <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
          {announcement.author && <span>By {announcement.author.full_name}</span>}
        </div>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
        </div>
      </article>
    </div>
  );
}