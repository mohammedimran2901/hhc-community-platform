import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const SETUP_SECRET = 'hhc-setup-2026-secret-key';

/**
 * POST /api/setup
 * One-time setup endpoint to create initial admin users.
 * Protected by a shared secret (not meant to be left in production permanently).
 *
 * Body: { secret: string, users: Array<{ email, password, full_name, role }> }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, users } = body;

    // Validate secret
    if (secret !== SETUP_SECRET) {
      return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 });
    }

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Users array is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const results: Array<{ email: string; status: string; id?: string; error?: string }> = [];

    for (const user of users) {
      const { email, password, full_name, role } = user;

      if (!email || !password) {
        results.push({ email: email || 'unknown', status: 'skipped', error: 'Email and password required' });
        continue;
      }

      try {
        // Create auth user
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: full_name || '' },
        });

        if (createError) {
          // Check if user already exists
          if (createError.message.includes('already') || createError.message.includes('been registered')) {
            // Look up existing user to update role
            const { data: existingUsers } = await adminClient.auth.admin.listUsers();
            const existing = existingUsers?.users?.find(u => u.email === email);
            if (existing) {
              await adminClient
                .from('profiles')
                .upsert(
                  { id: existing.id, email, full_name: full_name || '', role: role || 'member' },
                  { onConflict: 'id' }
                );
              results.push({ email, status: 'updated_existing', id: existing.id });
            } else {
              results.push({ email, status: 'error', error: createError.message });
            }
          } else {
            results.push({ email, status: 'error', error: createError.message });
          }
          continue;
        }

        const userId = newUser.user.id;
        results.push({ email, status: 'created', id: userId });

        // Set role if not member
        if (role && role !== 'member') {
          await adminClient
            .from('profiles')
            .update({ role })
            .eq('id', userId);
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