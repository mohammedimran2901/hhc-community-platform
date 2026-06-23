'use client';

// Local storage utility for demo data (fallback when Supabase is not configured)
// Each section has exactly 1 demo item tagged with [Demo]

interface StoredAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'guidance' | 'update' | 'training' | 'policy';
  is_pinned: boolean;
  created_at: string;
}

interface StoredReply {
  id: string;
  thread_id: string;
  author: string;
  content: string;
  parent_reply_id: string | null;
  created_at: string;
}

interface StoredThread {
  id: string;
  title: string;
  content: string;
  author: string;
  clusterName: string | null;
  is_resolved: boolean;
  created_at: string;
}

interface StoredPollOption {
  id: string;
  text: string;
  sort_order: number;
  vote_count: number;
}

interface StoredPoll {
  id: string;
  question: string;
  description: string;
  author: string;
  clusterName: string | null;
  is_active: boolean;
  ends_at: string | null;
  created_at: string;
  options: StoredPollOption[];
}

interface StoredVote {
  poll_id: string;
  option_id: string;
}

const ANNOUNCEMENTS_KEY = 'hhc-demo-announcements';
const THREADS_KEY = 'hhc-demo-threads';
const REPLIES_KEY = 'hhc-demo-replies';
const POLLS_KEY = 'hhc-demo-polls';
const VOTES_KEY = 'hhc-demo-votes';
const SEEDED_KEY = 'hhc-demo-seeded-v2'; // bumped to force clean re-seed

function generateId(): string {
  return 'demo-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
}

function seedData() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEEDED_KEY)) return;

  const baseTime = Date.now();

  // 1 demo announcement
  const announcements: StoredAnnouncement[] = [
    {
      id: 'seed-ann-1',
      title: '[Demo] Welcome to the HHC Clinical Costing Community',
      content: 'This is a demo announcement. The platform brings together clinical costing professionals across all 20 health clusters in Saudi Arabia. Use this space to share knowledge, ask questions, and collaborate on costing methodologies.\n\nKey features:\n- Forum discussions with colleagues across clusters\n- HHC announcements and policy updates\n- Community polls to share your insights\n- Cluster directory to connect with peers',
      author: 'HHC Admin',
      category: 'update' as const,
      is_pinned: true,
      created_at: new Date(baseTime - 86400000 * 2).toISOString(),
    },
  ];

  // 1 demo thread
  const threads: StoredThread[] = [
    {
      id: 'seed-thread-1',
      title: '[Demo] How are you handling pharmaceutical cost allocation?',
      content: 'This is a demo thread. I\'d like to start a discussion on how clusters are approaching pharmaceutical cost allocation for outpatient services. What methodologies are you using?\n\nQuestions:\n- How do you handle high-cost biologics?\n- What cost drivers do you use for pharmacy overhead?\n- Any lessons learned or best practices to share?',
      author: 'Dr. Ahmed Al-Saud (Demo)',
      clusterName: 'Riyadh First',
      is_resolved: false,
      created_at: new Date(baseTime - 86400000 * 3).toISOString(),
    },
  ];

  // 1 reply on the demo thread
  const replies: StoredReply[] = [
    {
      id: 'seed-reply-1',
      thread_id: 'seed-thread-1',
      author: 'Fatima Al-Zahrani (Demo)',
      content: 'Great topic! At our cluster we moved to patient-level costing for high-cost biologics and it significantly improved accuracy. For pharmacy overhead, we use number of prescriptions weighted by complexity.',
      parent_reply_id: null,
      created_at: new Date(baseTime - 86400000 * 2.5).toISOString(),
    },
  ];

  // 1 demo poll
  const polls: StoredPoll[] = [
    {
      id: 'seed-poll-1',
      question: '[Demo] Which costing methodology does your cluster primarily use?',
      description: 'This is a demo poll to show how polling works on the platform.',
      author: 'HHC Admin',
      clusterName: null,
      is_active: true,
      ends_at: new Date(baseTime + 86400000 * 30).toISOString(),
      created_at: new Date(baseTime - 86400000 * 7).toISOString(),
      options: [
        { id: 'seed-poll-1-opt-1', text: 'Activity-Based Costing (ABC)', sort_order: 1, vote_count: 5 },
        { id: 'seed-poll-1-opt-2', text: 'Time-Driven ABC (TDABC)', sort_order: 2, vote_count: 3 },
        { id: 'seed-poll-1-opt-3', text: 'Traditional Cost-to-Charge Ratio', sort_order: 3, vote_count: 2 },
        { id: 'seed-poll-1-opt-4', text: 'Hybrid approach', sort_order: 4, vote_count: 4 },
      ],
    },
  ];

  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  localStorage.setItem(REPLIES_KEY, JSON.stringify(replies));
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
  localStorage.setItem(VOTES_KEY, JSON.stringify([]));
  localStorage.setItem(SEEDED_KEY, 'true');
}

// --- Announcements ---

export function getStoredAnnouncements(): StoredAnnouncement[] {
  if (typeof window === 'undefined') return [];
  seedData();
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveAnnouncement(data: {
  title: string;
  content: string;
  category: 'guidance' | 'update' | 'training' | 'policy';
  author: string;
}): StoredAnnouncement {
  const announcements = getStoredAnnouncements();
  const newAnnouncement: StoredAnnouncement = {
    id: generateId(),
    title: data.title,
    content: data.content,
    category: data.category,
    author: data.author,
    is_pinned: false,
    created_at: new Date().toISOString(),
  };
  announcements.unshift(newAnnouncement);
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  return newAnnouncement;
}

export function deleteAnnouncement(id: string): boolean {
  const announcements = getStoredAnnouncements();
  const filtered = announcements.filter(a => a.id !== id);
  if (filtered.length === announcements.length) return false;
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(filtered));
  return true;
}

export function togglePinAnnouncement(id: string): StoredAnnouncement | null {
  const announcements = getStoredAnnouncements();
  const idx = announcements.findIndex(a => a.id === id);
  if (idx === -1) return null;
  announcements[idx].is_pinned = !announcements[idx].is_pinned;
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  return announcements[idx];
}

// --- Threads ---

export function getStoredThreads(): StoredThread[] {
  if (typeof window === 'undefined') return [];
  seedData();
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveThread(data: {
  title: string;
  content: string;
  author: string;
  clusterName: string | null;
}): StoredThread {
  const threads = getStoredThreads();
  const newThread: StoredThread = {
    id: generateId(),
    title: data.title,
    content: data.content,
    author: data.author,
    clusterName: data.clusterName,
    is_resolved: false,
    created_at: new Date().toISOString(),
  };
  threads.unshift(newThread);
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  return newThread;
}

export function toggleResolvedThread(id: string): StoredThread | null {
  const threads = getStoredThreads();
  const idx = threads.findIndex(t => t.id === id);
  if (idx === -1) return null;
  threads[idx].is_resolved = !threads[idx].is_resolved;
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  return threads[idx];
}

export function deleteThread(id: string): boolean {
  const threads = getStoredThreads();
  const filtered = threads.filter(t => t.id !== id);
  if (filtered.length === threads.length) return false;
  localStorage.setItem(THREADS_KEY, JSON.stringify(filtered));
  const replies = getStoredReplies();
  localStorage.setItem(REPLIES_KEY, JSON.stringify(replies.filter(r => r.thread_id !== id)));
  return true;
}

// --- Replies ---

export function getStoredReplies(threadId?: string): StoredReply[] {
  if (typeof window === 'undefined') return [];
  seedData();
  try {
    const raw = localStorage.getItem(REPLIES_KEY);
    const all: StoredReply[] = raw ? JSON.parse(raw) : [];
    return threadId ? all.filter(r => r.thread_id === threadId) : all;
  } catch { return []; }
}

export function saveReply(data: {
  thread_id: string;
  author: string;
  content: string;
  parent_reply_id?: string | null;
}): StoredReply {
  const replies = getStoredReplies();
  const newReply: StoredReply = {
    id: generateId(),
    thread_id: data.thread_id,
    author: data.author,
    content: data.content,
    parent_reply_id: data.parent_reply_id || null,
    created_at: new Date().toISOString(),
  };
  replies.push(newReply);
  localStorage.setItem(REPLIES_KEY, JSON.stringify(replies));
  return newReply;
}

// --- Polls ---

export function getStoredPolls(): StoredPoll[] {
  if (typeof window === 'undefined') return [];
  seedData();
  try {
    const raw = localStorage.getItem(POLLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getStoredPoll(id: string): StoredPoll | null {
  return getStoredPolls().find(p => p.id === id) || null;
}

export function savePoll(data: {
  question: string;
  description: string;
  author: string;
  clusterName: string | null;
  options: string[];
  ends_at: string | null;
}): StoredPoll {
  const polls = getStoredPolls();
  const newPoll: StoredPoll = {
    id: generateId(),
    question: data.question,
    description: data.description,
    author: data.author,
    clusterName: data.clusterName,
    is_active: true,
    ends_at: data.ends_at,
    created_at: new Date().toISOString(),
    options: data.options.map((text, i) => ({
      id: generateId() + '-opt-' + i,
      text,
      sort_order: i + 1,
      vote_count: 0,
    })),
  };
  polls.unshift(newPoll);
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
  return newPoll;
}

export function getStoredVotes(): StoredVote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function castVote(pollId: string, optionId: string): { success: boolean; message: string } {
  const votes = getStoredVotes();
  const existing = votes.find(v => v.poll_id === pollId);
  if (existing) {
    existing.option_id = optionId;
  } else {
    votes.push({ poll_id: pollId, option_id: optionId });
  }
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));

  const polls = getStoredPolls();
  const poll = polls.find(p => p.id === pollId);
  if (poll) {
    const option = poll.options.find(o => o.id === optionId);
    if (option) {
      option.vote_count += 1;
      localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
    }
  }
  return { success: true, message: existing ? 'Vote updated!' : 'Vote cast!' };
}

export function getUserVoteOptionId(pollId: string): string | null {
  const votes = getStoredVotes();
  const vote = votes.find(v => v.poll_id === pollId);
  return vote ? vote.option_id : null;
}

export function togglePollActive(id: string): StoredPoll | null {
  const polls = getStoredPolls();
  const idx = polls.findIndex(p => p.id === id);
  if (idx === -1) return null;
  polls[idx].is_active = !polls[idx].is_active;
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
  return polls[idx];
}

export function deletePoll(id: string): boolean {
  const polls = getStoredPolls();
  const filtered = polls.filter(p => p.id !== id);
  if (filtered.length === polls.length) return false;
  localStorage.setItem(POLLS_KEY, JSON.stringify(filtered));
  const votes = getStoredVotes().filter(v => v.poll_id !== id);
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  return true;
}

// --- Stats ---

export function getCommunityStats() {
  const threads = getStoredThreads();
  const replies = getStoredReplies();
  const polls = getStoredPolls();
  const announcements = getStoredAnnouncements();

  return {
    total_threads: threads.length,
    total_replies: replies.length,
    total_polls: polls.length,
    total_announcements: announcements.length,
    active_users: threads.length > 0 ? Math.max(1, new Set([...threads.map(t => t.author)]).size) : 0,
    clusters_active: threads.some(t => t.clusterName) ? 1 : 0,
  };
}