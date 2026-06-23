import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase env vars are not configured, skip auth checks
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  const { pathname } = request.nextUrl;

  // Public routes (accessible without authentication) - must be checked BEFORE auth
  const publicPaths = [
    '/',
    '/how-to-use',
    '/auth/login',
    '/auth/register',
    '/auth/verify',
    '/auth/forgot-password',
    '/auth/callback',
  ];

  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));

  // Skip middleware for public routes entirely to avoid redirect loops
  if (isPublicPath) {
    return NextResponse.next({ request });
  }

  // Skip middleware for static files and API routes
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.startsWith('/static/')) {
    return NextResponse.next({ request });
  }

  // Dynamic import to avoid startup crashes when env vars are missing
  const { createServerClient } = await import('@supabase/ssr');
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Try to get the user session - wrap in try/catch to handle cases where
  // the database hasn't been seeded yet or other transient errors
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // If auth fails (e.g., no tables yet), treat as unauthenticated
    user = null;
  }

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access auth pages (shouldn't reach here due to early return, but safety check)
  // Already handled by early return above.

  return supabaseResponse;
}
