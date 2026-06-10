'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getStoredThreads, getStoredReplies, saveReply, toggleResolvedThread, deleteThread } from '@/lib/local-data';
import { ArrowLeft, MessageSquare, Send, Loader2, CheckCircle, Check, Trash2, CornerDownRight } from 'lucide-react';

export default function ThreadDetailPage() {
  const params = useParams();
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    const id = params.id as string;
    const localThreads = getStoredThreads();
    const found = localThreads.find(t => t.id === id);
    if (found) {
      setThread(found);
      const threadReplies = getStoredReplies(id);
      setReplies(threadReplies);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [params.id]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!replyAuthor.trim() || !replyContent.trim()) {
      setError('Please enter your name and reply content');
      return;
    }
    setSubmitting(true);
    saveReply({
      thread_id: thread.id,
      author: replyAuthor.trim(),
      content: replyContent.trim(),
      parent_reply_id: replyTarget,
    });
    setReplyContent('');
    setReplyTarget(null);
    setSuccessMsg('Reply posted!');
    setTimeout(() => setSuccessMsg(null), 3000);
    loadData();
    setSubmitting(false);
  };

  const handleToggleResolved = () => {
    toggleResolvedThread(thread.id);
    loadData();
  };

  const handleDeleteThread = () => {
    if (confirm('Delete this thread?')) {
      deleteThread(thread.id);
      window.location.href = '/forum';
    }
  };

  const getReplyTargetAuthor = (parentId: string) => {
    const parent = replies.find(r => r.id === parentId);
    return parent ? parent.author : null;
  };

  // Build threaded replies
  const topLevelReplies = replies.filter(r => !r.parent_reply_id);
  const childReplies = (parentId: string) => replies.filter(r => r.parent_reply_id === parentId);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center"><p className="text-gray-500">Loading thread...</p></div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Thread Not Found</h1>
        <Link href="/forum" className="text-blue-600 hover:text-blue-700 font-medium">Back to forum</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to forum
      </Link>

      {/* Thread Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">{thread.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                <span>{thread.author}</span>
                <span>·</span>
                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                {thread.clusterName && <><span>·</span><span>📍 {thread.clusterName}</span></>}
                {thread.is_resolved && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Resolved</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={handleToggleResolved} className={`p-2 rounded-lg transition-colors text-sm ${thread.is_resolved ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={thread.is_resolved ? 'Mark unresolved' : 'Mark resolved'}>
              <CheckCircle className="w-4 h-4" />
            </button>
            <button onClick={handleDeleteThread} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete thread">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{thread.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> {replies.length} repl{replies.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      </div>

      {/* Replies Section */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Replies ({replies.length})</h2>

        {topLevelReplies.map((reply: any) => (
          <div key={reply.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-xs font-bold">{reply.author.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{reply.author}</span>
                  <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                <button onClick={() => { setReplyTarget(reply.id); setReplyAuthor(''); setReplyContent(''); }} className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Reply
                </button>
              </div>
            </div>

            {/* Child replies */}
            {childReplies(reply.id).map((child: any) => (
              <div key={child.id} className="ml-10 mt-3 pl-4 border-l-2 border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <CornerDownRight className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{child.author}</span>
                      <span className="text-xs text-gray-400">{new Date(child.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{child.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {replies.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No replies yet. Be the first to respond!</p>
          </div>
        )}
      </div>

      {/* Reply Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          {replyTarget ? `Replying to ${getReplyTargetAuthor(replyTarget)}...` : 'Post a Reply'}
          {replyTarget && (
            <button onClick={() => setReplyTarget(null)} className="ml-2 text-xs text-gray-500 hover:text-gray-700">(cancel)</button>
          )}
        </h3>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-4 text-sm">{successMsg}</div>}
        <form onSubmit={handleSubmitReply} className="space-y-3">
          <div>
            <input type="text" value={replyAuthor} onChange={e => setReplyAuthor(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Your name" />
          </div>
          <div>
            <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y" placeholder="Write your reply..." />
          </div>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post Reply
          </button>
        </form>
      </div>
    </div>
  );
}