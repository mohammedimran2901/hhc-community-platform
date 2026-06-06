import { type NextRequest, NextResponse } from 'next/server';

// Middleware disabled for demo/preview mode.
// The auth guard is bypassed so you can explore the site without Supabase.
// To enable auth, uncomment the import and use updateSession below.

// import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Demo mode: allow all requests through without auth
  return NextResponse.next({ request });

  // To re-enable auth middleware:
  // return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};