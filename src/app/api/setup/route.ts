import { NextRequest, NextResponse } from 'next/server';

const SETUP_SECRET = 'hhc-setup-2026-secret-key';

const SUPABASE_URL = 'https://bxmgcazkdzhyvnqsttnp.supabase.co';

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

/**
 * POST /api/setup
 * Creates initial admin users via Supabase Management REST API (no Supabase client).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, users } = body;

    if (secret !== SETUP_SECRET) {
      return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 });
    }

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Users array is required' }, { status: 400 });
    }

    const serviceKey = getServiceKey();
    if (!serviceKey) {
      return NextResponse.json({ error: 'Service key not configured' }, { status: 500 });
    }

    const results: Array<{ email: string; status: string; id?: string; error?: string }> = [];

    for (const user of users) {
      const { email, password, full_name, role } = user;

      if (!email || !password) {
        results.push({ email: email || 'unknown', status: 'skipped', error: 'Email and password required' });
        continue;
      }

      try {
        // Step 1: Create auth user via Supabase Admin API (raw fetch)
        const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: full_name || '' },
          }),
        });

        const createData = await createRes.json();

        if (createRes.status === 201 || createRes.status === 200) {
          const userId = createData.id;
          results.push({ email, status: 'created', id: userId });

          // Step 2: Update profile role to hhc_admin
          if (role && role !== 'member') {
            // Check if profile exists
            const profileCheck = await fetch(
              `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=id`,
              {
                headers: {
                  'Authorization': `Bearer ${serviceKey}`,
                  'apikey': serviceKey,
                },
              }
            );
            const profileData = await profileCheck.json();

            if (profileData && profileData.length > 0) {
              // Update existing profile
              await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${serviceKey}`,
                  'apikey': serviceKey,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal',
                },
                body: JSON.stringify({ role }),
              });
            } else {
              // Insert new profile
              await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${serviceKey}`,
                  'apikey': serviceKey,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal',
                },
                body: JSON.stringify({
                  id: userId,
                  email,
                  full_name: full_name || '',
                  role,
                }),
              });
            }
          }
        } else if (
          createData.error_code === 'user_already_exists' ||
          (createData.message && createData.message.includes('already'))
        ) {
          // User exists — update their role
          const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            headers: {
              'Authorization': `Bearer ${serviceKey}`,
              'apikey': serviceKey,
            },
          });
          const listData = await listRes.json();

          if (listData.users) {
            const existing = listData.users.find((u: any) => u.email === email);
            if (existing) {
              await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${serviceKey}`,
                  'apikey': serviceKey,
                  'Content-Type': 'application/json',
                  'Prefer': 'resolution=merge-duplicates',
                },
                body: JSON.stringify({
                  id: existing.id,
                  email,
                  full_name: full_name || '',
                  role: role || 'member',
                }),
              });
              results.push({ email, status: 'updated_existing', id: existing.id });
            } else {
              results.push({ email, status: 'error', error: 'User exists but not found in listing' });
            }
          } else {
            results.push({ email, status: 'error', error: createData.message || 'User already exists' });
          }
        } else {
          results.push({ email, status: 'error', error: createData.message || `Status ${createRes.status}` });
        }
      } catch (err: any) {
        results.push({ email, status: 'error', error: err?.message || 'Unknown error' });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}