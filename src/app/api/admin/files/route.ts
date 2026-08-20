import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  FILES_BUCKET,
  MAX_FILE_SIZE,
  buildStoragePath,
  isAllowedFileName,
} from '@/lib/files';

/**
 * POST /api/admin/files
 * Uploads a file to the private "resources" storage bucket.
 * Requires the requesting user to have hhc_admin role.
 *
 * Accepts multipart/form-data with:
 *   - file: the file to upload (required)
 *   - announcement_id: if provided, the file is recorded as an
 *     attachment of that announcement (used by the announcement form)
 *
 * Returns: { success, file: { path, file_name, file_size, mime_type } }
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

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data with a "file" field' },
        { status: 400 }
      );
    }

    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'A "file" field is required' },
        { status: 400 }
      );
    }

    if (!isAllowedFileName(file.name)) {
      return NextResponse.json(
        { error: 'File type not allowed. Supported: PDF, Word, Excel, PowerPoint, CSV, TXT, and images.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 4 MB.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const storagePath = buildStoragePath(file.name);

    const { error: uploadError } = await adminClient.storage
      .from(FILES_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // If an announcement_id was provided, record this file as an attachment
    const announcementId = form.get('announcement_id');
    if (typeof announcementId === 'string' && announcementId.length > 0) {
      // Verify the announcement exists before linking
      const { data: announcement } = await adminClient
        .from('announcements')
        .select('id')
        .eq('id', announcementId)
        .single();

      if (!announcement) {
        return NextResponse.json(
          { error: 'Announcement not found — file was uploaded but not attached' },
          { status: 404 }
        );
      }

      const { error: attachError } = await adminClient
        .from('announcement_attachments')
        .insert({
          announcement_id: announcementId,
          file_path: storagePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || null,
        });

      if (attachError) {
        console.error('Error inserting announcement attachment:', attachError);
        return NextResponse.json(
          { error: 'File uploaded but could not be attached to the announcement' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || null,
      },
    });
  } catch (err) {
    console.error('Unexpected error in POST /api/admin/files:', err);
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
