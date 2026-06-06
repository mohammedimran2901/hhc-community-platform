-- HHC Clinical Costing Community - Database Schema & Seed Data
-- Run this in your Supabase SQL Editor to set up the database

-- 1. Create the clusters table
CREATE TABLE IF NOT EXISTS clusters (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  region TEXT DEFAULT 'Saudi Arabia',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;

-- Allow public read access to clusters
CREATE POLICY "Clusters are publicly readable"
  ON clusters FOR SELECT USING (true);

-- 3. Seed the 20 clusters
INSERT INTO clusters (id, name_en, name_ar, region) VALUES
  ('c01', 'Riyadh First', 'الرياض الأولى', 'Riyadh'),
  ('c02', 'Riyadh Second', 'الرياض الثانية', 'Riyadh'),
  ('c03', 'Riyadh Third', 'الرياض الثالثة', 'Riyadh'),
  ('c04', 'Jeddah First', 'جدة الأولى', 'Makkah'),
  ('c05', 'Jeddah Second', 'جدة الثانية', 'Makkah'),
  ('c06', 'Makkah Al-Mukarramah', 'مكة المكرمة', 'Makkah'),
  ('c07', 'Al-Taif', 'الطائف', 'Makkah'),
  ('c08', 'Al-Madinah Al-Munawarah', 'المدينة المنورة', 'Madinah'),
  ('c09', 'Eastern', 'الشرقية', 'Eastern Province'),
  ('c10', 'Al-Ahsa', 'الأحساء', 'Eastern Province'),
  ('c11', 'Hafar Al-Batin', 'حفر الباطن', 'Eastern Province'),
  ('c12', 'Al-Qassim', 'القصيم', 'Qassim'),
  ('c13', 'Hail', 'حائل', 'Hail'),
  ('c14', 'Tabuk', 'تبوك', 'Tabuk'),
  ('c15', 'Al-Jouf', 'الجوف', 'Jouf'),
  ('c16', 'Northern Borders', 'الحدود الشمالية', 'Northern Borders'),
  ('c17', 'Aseer', 'عسير', 'Aseer'),
  ('c18', 'Najran', 'نجران', 'Najran'),
  ('c19', 'Al-Baha', 'الباحة', 'Baha'),
  ('c20', 'Jazan', 'جازان', 'Jazan')
ON CONFLICT (id) DO NOTHING;

-- 4. Create the profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  cluster_id TEXT REFERENCES clusters(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'cluster_lead', 'hhc_admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 5. Create function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, cluster_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'cluster_id',
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 6. Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  category TEXT DEFAULT 'guidance' CHECK (category IN ('guidance', 'update', 'training', 'policy')),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read announcements
CREATE POLICY "Announcements are publicly readable"
  ON announcements FOR SELECT USING (true);

-- Only hhc_admin can create announcements
CREATE POLICY "Only HHC admins can create announcements"
  ON announcements FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'hhc_admin')
  );

-- 7. Create forum threads table
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  cluster_id TEXT REFERENCES clusters(id),
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;

-- Anyone can read threads
CREATE POLICY "Threads are publicly readable"
  ON forum_threads FOR SELECT USING (true);

-- Authenticated users can create threads
CREATE POLICY "Authenticated users can create threads"
  ON forum_threads FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own threads
CREATE POLICY "Authors can update own threads"
  ON forum_threads FOR UPDATE USING (auth.uid() = author_id);

-- 8. Create forum replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES forum_replies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Anyone can read replies
CREATE POLICY "Replies are publicly readable"
  ON forum_replies FOR SELECT USING (true);

-- Authenticated users can reply
CREATE POLICY "Authenticated users can reply"
  ON forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 9. Enable real-time for forum tables
ALTER PUBLICATION supabase_realtime ADD TABLE forum_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;