// Database types for the HHC Community Platform

export interface Cluster {
  id: string;
  name_en: string;
  name_ar: string;
  region: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  cluster_id: string | null;
  role: 'member' | 'cluster_lead' | 'hhc_admin';
  avatar_url: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author?: Profile;
  category: 'guidance' | 'update' | 'training' | 'policy';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author?: Profile;
  cluster_id: string | null;
  cluster?: Cluster;
  is_resolved: boolean;
  reply_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  author_id: string;
  author?: Profile;
  content: string;
  parent_reply_id: string | null;
  created_at: string;
}

export type UserRole = 'member' | 'cluster_lead' | 'hhc_admin';