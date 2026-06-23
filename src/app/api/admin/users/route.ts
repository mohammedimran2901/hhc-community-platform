import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/users
 * Lists all users with their profiles (name, email, cluster, role, status).
 * Requires the requesting user to have hhc_admin role.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the requesting user is an admin
    const { user, error: authError } = await verifyAdmin(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    // Get all auth users
    const { data: authUsers, error: usersError } = await adminClient.auth.admin.listUsers();

    if (usersError) {
      console.error('Error listing users:', usersError);
      return NextResponse.json(
        { error: 'Failed to list users' },
        { status: 500 }
      );
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      );
    }

    // Merge auth users with profiles
    const mergedUsers = authUsers.users.map((authUser) => {
      const profile = profiles?.find((p) => p.id === authUser.id);
      return {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        confirmed_at: authUser.confirmed_at,
        last_sign_in_at: authUser.last_sign_in_at,
        is_active: !authUser.banned_until && !!authUser.confirmed_at,
        ...(profile
          ? {
              full_name: profile.full_name,
              cluster_id: profile.cluster_id,
              role: profile.role,
              avatar_url: profile.avatar_url,
            }
          : {
              full_name: null,
              cluster_id: null,
              role: 'member',
              avatar_url: null,
            }),
      };
    });

    return NextResponse.json({ users: mergedUsers });
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/users:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users/invite
 * Invites a new user by creating their account via Supabase Admin API.
 * The admin specifies email, password, full_name, cluster, and role.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the requesting user is an admin
    const { user, error: authError } = await verifyAdmin(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, password, full_name, cluster_id, role } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (role && !['member', 'cluster_lead', 'hhc_admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be member, cluster_lead, or hhc_admin' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Create the user via Admin API (bypasses email verification)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm so they can log in immediately
      user_metadata: {
        full_name: full_name || '',
        cluster_id: cluster_id || null,
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    // The trigger `on_auth_user_created` should auto-create the profile
    // But we also update the role if specified
    if (role && role !== 'member') {
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ role })
        .eq('id', newUser.user.id);

      if (updateError) {
        console.error('Error updating user role:', updateError);
        // User was created, role update failed silently
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        full_name: full_name || null,
        cluster_id: cluster_id || null,
        role: role || 'member',
      },
    });
  } catch (err) {
    console.error('Unexpected error in POST /api/admin/users:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verifies the requesting user has hhc_admin role.
 */
async function verifyAdmin(request: NextRequest): Promise<{ user: any; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: 'Not authenticated' };
    }

    // Check if user has hhc_admin role
    // We could check the profiles table, but the middleware should handle this.
    // For extra safety, let's also verify in the API.
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'hhc_admin') {
      return { user: null, error: 'Forbidden: Admin access required' };
    }

    return { user, error: null };
  } catch (err) {
    return { user: null, error: 'Authentication failed' };
  }
}