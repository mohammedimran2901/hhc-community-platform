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

export interface AnnouncementAttachment {
  id: string;
  announcement_id: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
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
  attachments?: AnnouncementAttachment[];
  created_at: string;
  updated_at: string;
}

export type ResourceCategory = 'template' | 'guidance' | 'policy' | 'training' | 'other';

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  category: ResourceCategory;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  uploader?: { id: string; full_name: string } | null;
  created_at: string;
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

export interface Poll {
  id: string;
  question: string;
  description: string;
  author_id: string;
  author?: Profile;
  cluster_id: string | null;
  is_active: boolean;
  ends_at: string | null;
  created_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  sort_order: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
  total_votes: number;
  user_vote_option_id?: string | null;
}

export type UserRole = 'member' | 'cluster_lead' | 'hhc_admin';