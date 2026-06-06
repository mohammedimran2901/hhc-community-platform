// Lazy-loaded Supabase client that only creates the client on the client side
// This prevents build-time errors when env vars aren't available

export async function getClient() {
  const { createBrowserClient } = await import('@supabase/ssr');
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}