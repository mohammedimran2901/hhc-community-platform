import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/feedback
 * Submit feedback (authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message, category } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Get user profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name, email, cluster_id')
      .eq('id', user.id)
      .single();

    // Insert feedback
    const { data: feedback, error: insertError } = await adminClient
      .from('feedback')
      .insert({
        user_id: user.id,
        user_name: profile?.full_name || user.email || 'Unknown',
        user_email: profile?.email || user.email || '',
        cluster_id: profile?.cluster_id || null,
        subject,
        message,
        category: category || 'general',
        status: 'new',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    console.error('Unexpected error in POST /api/feedback:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback
 * Get user's own feedback (authenticated users)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: feedback, error } = await adminClient
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error('Unexpected error in GET /api/feedback:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
