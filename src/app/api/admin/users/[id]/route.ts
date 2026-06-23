import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/admin/users/[id]
 * Updates a user's role or profile fields.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify the requesting user is an admin
    const { error: authError } = await verifyAdmin(request);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await request.json();
    const { role, full_name, cluster_id } = body;

    const adminClient = createAdminClient();

    // Update role in profiles table
    if (role) {
      if (!['member', 'cluster_lead', 'hhc_admin'].includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be member, cluster_lead, or hhc_admin' },
          { status: 400 }
        );
      }

      const { error: roleError } = await adminClient
        .from('profiles')
        .update({ role })
        .eq('id', id);

      if (roleError) {
        console.error('Error updating role:', roleError);
        return NextResponse.json(
          { error: 'Failed to update role' },
          { status: 500 }
        );
      }
    }

    // Update profile fields
    const profileUpdates: Record<string, string | null> = {};
    if (full_name !== undefined) profileUpdates.full_name = full_name;
    if (cluster_id !== undefined) profileUpdates.cluster_id = cluster_id;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await adminClient
        .from('profiles')
        .update(profileUpdates)
        .eq('id', id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error in PATCH /api/admin/users/[id]:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Removes a user from the platform (deletes auth user and profile).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify the requesting user is an admin
    const { error: authError } = await verifyAdmin(request);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Delete the auth user (cascades to profile via ON DELETE CASCADE)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error in DELETE /api/admin/users/[id]:', err);
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