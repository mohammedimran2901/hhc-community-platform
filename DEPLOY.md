# HHC Clinical Costing Community — Production Deployment Guide

## Prerequisites

1. **Vercel account** — https://vercel.com
2. **Supabase project** — https://supabase.com (already configured)
3. **GitHub repository** with this code pushed

---

## Step 1: Run the Database Schema

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `supabase/seed.sql` from this project
3. Copy the entire contents and paste into the SQL Editor
4. Click **Run** — this creates all tables, RLS policies, triggers, and seed data

## Step 2: Create the Admin User

1. In **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"**
3. Enter:
   - **Email**: `mohammed.imran@health.sa`
   - **Password**: Choose a strong password (e.g. 16+ characters)
   - **Auto Confirm User**: ✅ Enabled
4. Click **Create User**

5. Go to **SQL Editor** and run:
   ```sql
   UPDATE profiles
   SET role = 'hhc_admin'
   WHERE email = 'mohammed.imran@health.sa';
   ```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Push your code to a GitHub repository:
   ```bash
   cd hhc-community-platform
   git init
   git add .
   git commit -m "Initial commit - HHC Clinical Costing Community"
   gh repo create hhc-community-platform --public
   git push origin main
   ```

2. Go to **https://vercel.com** → **Add New Project** → **Import Git Repository**

3. Select your `hhc-community-platform` repository

4. **Configure Project:**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Root Directory: `./hhc-community-platform`

5. **Add Environment Variables:**
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://bxmgcazkdzhyvnqsttnp.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bWdjYXprZHpoeXZucXN0dG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzQ3ODAsImV4cCI6MjA5NzgxMDc4MH0.Wm5tqfLHnKXuKnvMDFybP6PJkgJ2ASnO2SgbCZZ-mj4` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bWdjYXprZHpoeXZucXN0dG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIzNDc4MCwiZXhwIjoyMDk3ODEwNzgwfQ.nyTiLiSog0Bj0psz7o7_fGTX4v6YnOLlXwGSnomgrjw` |
   | `NEXTAUTH_SECRET` | `hhc-clinical-costing-community-secret-v1` |

6. Click **Deploy**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd hhc-community-platform

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_SECRET

# Deploy to production
vercel --prod
```

---

## Step 4: Post-Deployment Checklist

- [ ] App loads at your Vercel URL
- [ ] Home page displays with HHC branding
- [ ] Click **"Demo Mode — Enter App"** — dashboard loads
- [ ] Click **"Sign In"** — login page loads
- [ ] Login with `mohammed.imran@health.sa` — redirects to dashboard
- [ ] Navigate to `/admin` — admin panel loads
- [ ] **Admin → Users** — shows user list
- [ ] Can **Add User** via the modal
- [ ] Can **edit role** inline from the table
- [ ] Can **delete user** with confirmation
- [ ] Forum, announcements, polls, clusters pages all load

---

## Step 5: (Optional) Custom Domain

1. In Vercel dashboard → your project → **Domains**
2. Add your custom domain (e.g., `community.hhc-costing.sa`)
3. Configure DNS as instructed

---

## Key Architecture Notes

### Auth Flow
- **Registration**: Users sign up via `/auth/register` — Supabase sends verification email
- **Admin-created users**: Admins add users via `/admin/users` — users are auto-confirmed
- **Login**: `/auth/login` — uses Supabase email/password auth
- **Session**: Managed by Supabase SSR cookies via `@supabase/ssr`
- **Middleware**: `middleware.ts` redirects unauthenticated users to login

### Admin Access
- Only users with `role = 'hhc_admin'` in the `profiles` table can access `/admin/*`
- API routes under `/api/admin/*` verify admin role via the `profiles` table
- The admin panel shows: Overview (stats), Users (manage), Announcements, Polls

### User Roles
| Role | Permissions |
|------|------------|
| `member` | View forum, create threads/replies, vote in polls |
| `cluster_lead` | Member permissions + cluster-specific moderation |
| `hhc_admin` | Full admin access (users, announcements, polls, all content) |

### Security
- **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`) is only used server-side in `/api/admin/*`
- RLS policies protect all tables at the database level
- Admin API routes double-check admin role before any operation
- `.env.local` is gitignored — never commit secrets