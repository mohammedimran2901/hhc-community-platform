-- FIX: If you created your admin user BEFORE running seed.sql,
-- your auth user exists but has no profile row.
-- Run this in Supabase SQL Editor to fix it.

-- 1. Find your user's UUID (look for mohammed.imran@health.sa)
SELECT id, email, created_at FROM auth.users WHERE email = 'mohammed.imran@health.sa';

-- 2. Then copy the UUID from step 1 and run:
-- INSERT INTO profiles (id, email, full_name, role)
-- VALUES ('REPLACE_WITH_UUID', 'mohammed.imran@health.sa', 'Mohammed Imran', 'hhc_admin');
--
-- Or more simply, run this one-liner that does both steps automatically:
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'Mohammed Imran', 'hhc_admin'
FROM auth.users
WHERE email = 'mohammed.imran@health.sa'
AND NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.users.id);