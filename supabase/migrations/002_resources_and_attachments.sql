-- ============================================================
-- Resources library + announcement attachments
-- Run this in your Supabase SQL Editor (same as 001_feedback_table.sql)
-- ============================================================

-- ============================================================
-- 0. Helper function to check admin status without RLS recursion
-- ============================================================
CREATE OR REPLACE FUNCTION is_hhc_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'hhc_admin'
  );
$$;

-- ============================================================
-- 1. Create a PRIVATE storage bucket for all uploaded files
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', false)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies (defense-in-depth; the app uploads via the
-- service role key in /api/admin/* routes, which bypasses RLS)
CREATE POLICY "HHC admins can upload to resources bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resources'
    AND is_hhc_admin()
  );

CREATE POLICY "HHC admins can update objects in resources bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resources'
    AND is_hhc_admin()
  );

CREATE POLICY "HHC admins can delete from resources bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resources'
    AND is_hhc_admin()
  );

-- NOTE: no SELECT policy on storage.objects — the bucket is private.
-- Files are served through /api/files/download which creates short-lived
-- signed URLs for authenticated users.

-- ============================================================
-- 2. Resources table (shared document library)
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('template', 'guidance', 'policy', 'training', 'other')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Any signed-in user can browse/download the library
CREATE POLICY "Authenticated users can read resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

-- Only hhc_admin can upload/manage
CREATE POLICY "Only HHC admins can add resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (is_hhc_admin());

CREATE POLICY "Only HHC admins can update resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (is_hhc_admin());

CREATE POLICY "Only HHC admins can delete resources"
  ON resources FOR DELETE
  TO authenticated
  USING (is_hhc_admin());

-- ============================================================
-- 3. Announcement attachments table
-- ============================================================
CREATE TABLE IF NOT EXISTS announcement_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE announcement_attachments ENABLE ROW LEVEL SECURITY;

-- Any signed-in user can see attachments
CREATE POLICY "Authenticated users can read attachments"
  ON announcement_attachments FOR SELECT
  TO authenticated
  USING (true);

-- Only hhc_admin can add/remove attachments
CREATE POLICY "Only HHC admins can add attachments"
  ON announcement_attachments FOR INSERT
  TO authenticated
  WITH CHECK (is_hhc_admin());

CREATE POLICY "Only HHC admins can delete attachments"
  ON announcement_attachments FOR DELETE
  TO authenticated
  USING (is_hhc_admin());
