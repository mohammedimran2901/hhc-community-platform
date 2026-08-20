import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { RESOURCE_CATEGORIES } from '@/lib/files';

/**
 * GET /api/admin/resources
 * Lists all resources with uploader info (admin only).
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAdmin(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    const { data: resources, error } = await adminClient
      .from('resources')
      .select('*, uploader:uploaded_by(id, full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      return NextResponse.json(
        { error: 'Failed to fetch resources' },
        { status: 500 }
      );
    }

    return NextResponse.json({ resources });
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/resources:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/resources
 * Creates a resource record for a previously uploaded file (admin only).
 * Body: { name, description?, category, file_path, file_name, file_size?, mime_type? }
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAdmin(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, category, file_path, file_name, file_size, mime_type } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!file_path || !file_name) {
      return NextResponse.json(
        { error: 'file_path and file_name are required (upload the file first via /api/admin/files)' },
        { status: 400 }
      );
    }
    const safeCategory = RESOURCE_CATEGORIES.includes(category) ? category : 'other';

    const adminClient = createAdminClient();

    const { data: resource, error } = await adminClient
      .from('resources')
      .insert({
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        category: safeCategory,
        file_path,
        file_name,
        file_size: typeof file_size === 'number' ? file_size : null,
        mime_type: mime_type || null,
        uploaded_by: user.id,
      })
      .select('*, uploader:uploaded_by(id, full_name)')
      .single();

    if (error) {
      console.error('Error creating resource:', error);
      return NextResponse.json(
        { error: 'Failed to create resource' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, resource });
  } catch (err) {
    console.error('Unexpected error in POST /api/admin/resources:', err);
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
