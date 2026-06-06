'use client';

// Demo local storage utility - stores announcements and threads in localStorage
// This allows the site to work without Supabase during demo/preview mode

interface StoredAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'guidance' | 'update' | 'training' | 'policy';
  is_pinned: boolean;
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

const ANNOUNCEMENTS_KEY = 'hhc-demo-announcements';
const THREADS_KEY = 'hhc-demo-threads';

function generateId(): string {
  return 'demo-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
}

// --- Announcements ---

export function getStoredAnnouncements(): StoredAnnouncement[] {
  if (typeof window === 'undefined') return [];
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

// --- Threads ---

export function getStoredThreads(): StoredThread[] {
  if (typeof window === 'undefined') return [];
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