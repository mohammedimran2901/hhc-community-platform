import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { FILES_BUCKET } from '@/lib/files';

/**
 * DELETE /api/admin/resources/[id]
 * Deletes a resource record and its stored file (admin only).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await verifyAdmin(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Look up the resource first so we can remove the stored file too
    const { data: resource, error: fetchError } = await adminClient
      .from('resources')
      .select('id, file_path')
      .eq('id', id)
      .single();

    if (fetchError || !resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Delete the storage object (ignore errors — the row delete is the priority)
    if (resource.file_path) {
      const { error: storageError } = await adminClient.storage
        .from(FILES_BUCKET)
        .remove([resource.file_path]);
      if (storageError) {
        console.error('Error removing file from storage (continuing):', storageError);
      }
    }

    const { error: deleteError } = await adminClient
      .from('resources')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting resource:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete resource' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error in DELETE /api/admin/resources/[id]:', err);
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
