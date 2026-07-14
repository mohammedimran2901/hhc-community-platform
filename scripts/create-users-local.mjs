#!/usr/bin/env node
/**
 * Create the three initial HHC users using raw fetch to Supabase Management API.
 * No Supabase client needed — uses Node.js built-in fetch.
 */

const SUPABASE_URL = 'https://bxmgcazkdzhyvnqsttnp.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bWdjYXprZHpoeXZucXN0dG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIzNDc4MCwiZXhwIjoyMDk3ODEwNzgwfQ.nyTiLiSog0Bj0psz7o7_fGTX4v6YnOLlXwGSnomgrjw';

const users = [
  { email: 'walhalal@moh.gov.sa', password: 'HhcCommunity2026!', full_name: 'Walaa Abduljabbar Hassan Alhalal', role: 'hhc_admin' },
  { email: 'azzaad@moh.gov.sa', password: 'HhcCommunity2026!', full_name: 'Azzaad', role: 'hhc_admin' },
  { email: 'rahafw@moh.gov.sa', password: 'HhcCommunity2026!', full_name: 'Rahaf Abdullah Abdulqader Wazirah', role: 'hhc_admin' },
];

async function createUser(user) {
  console.log(`\n📧 Creating: ${user.email} (${user.full_name})`);

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name },
    }),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text.substring(0, 100) }; }

  if (res.status === 200 || res.status === 201) {
    console.log(`  ✅ Created: ${data.id}`);
    return { success: true, id: data.id };
  } else if (data.error_code === 'user_already_exists' || data.message?.includes('already')) {
    console.log(`  ⚠️  Already exists: ${data.message || data.msg}`);
    return { success: false, exists: true, error: data.message };
  } else {
    console.log(`  ❌ Failed (${res.status}): ${JSON.stringify(data)}`);
    return { success: false, error: data.message || data.msg };
  }
}

async function main() {
  console.log('🚀 Creating HHC users via Supabase Admin API...\n');
  
  for (const user of users) {
    await createUser(user);
  }

  console.log('\n✅ Done!');
  console.log('Password for all: HhcCommunity2026!');
  console.log('Login at: https://hhc-community-platform.vercel.app/auth/login');
}

main().catch(console.error);