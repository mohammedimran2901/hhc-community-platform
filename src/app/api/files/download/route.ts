import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { FILES_BUCKET, isValidStoragePath } from '@/lib/files';

/**
 * GET /api/files/download?path=<storage_path>
 * Serves files from the private "resources" bucket to any authenticated user
 * by redirecting to a short-lived signed URL.
 */
export async function GET(request: NextRequest) {
  try {
    // Any signed-in user may download (members, cluster leads, admins)
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path || !isValidStoragePath(path)) {
      return NextResponse.json(
        { error: 'A valid "path" query parameter is required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Signed URL expires in 2 minutes — enough for the redirect + download
    const { data: signed, error: signedError } = await adminClient.storage
      .from(FILES_BUCKET)
      .createSignedUrl(path, 120);

    if (signedError || !signed?.signedUrl) {
      console.error('Error creating signed URL:', signedError);
      return NextResponse.json(
        { error: 'File not found or unavailable' },
        { status: 404 }
      );
    }

    return NextResponse.redirect(signed.signedUrl);
  } catch (err) {
    console.error('Unexpected error in GET /api/files/download:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
