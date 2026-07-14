#!/usr/bin/env node
/**
 * Create users via Supabase Management REST API (no Supabase client needed).
 * Uses Node.js built-in fetch (available in Node 18+).
 *
 * Usage: node scripts/create-users-direct.mjs
 */

const SUPABASE_URL = 'https://bxmgcazkdzhyvnqsttnp.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bWdjYXprZHpoeXZucXN0dG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIzNDc4MCwiZXhwIjoyMDk3ODEwNzgwfQ.nyTiLiSog0Bj0psz7o7_fGTX4v6YnOLlXwGSnomgrjw';

const users = [
  {
    email: 'walhalal@moh.gov.sa',
    password: 'HhcCommunity2026!',
    full_name: 'Walaa Abduljabbar Hassan Alhalal',
    role: 'hhc_admin',
  },
  {
    email: 'azzaad@moh.gov.sa',
    password: 'HhcCommunity2026!',
    full_name: 'Azzaad',
    role: 'hhc_admin',
  },
  {
    email: 'rahafw@moh.gov.sa',
    password: 'HhcCommunity2026!',
    full_name: 'Rahaf Abdullah Abdulqader Wazirah',
    role: 'hhc_admin',
  },
];

async function createUser(user) {
  console.log(`\n📧 Creating: ${user.email} (${user.full_name})`);

  // Step 1: Create auth user
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name },
    }),
  });

  const createData = await createRes.json();

  if (createRes.status === 201 || createRes.status === 200) {
    console.log(`  ✅ Auth user created: ${createData.id}`);
    const userId = createData.id;

    // Step 2: Set role to hhc_admin via REST API (upsert into profiles)
    // Use the Supabase REST API with service key to bypass RLS
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        }),
      }
    );

    if (profileRes.ok) {
      console.log(`  ✅ Role set to: ${user.role}`);
    } else {
      const errText = await profileRes.text();
      console.log(`  ⚠️  Profile update returned ${profileRes.status}: ${errText}`);
      // Try POST (upsert)
      const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          id: userId,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        }),
      });
      if (upsertRes.ok) {
        console.log(`  ✅ Profile upserted with role: ${user.role}`);
      } else {
        const upsertErr = await upsertRes.text();
        console.log(`  ❌ Upsert failed: ${upsertErr}`);
      }
    }
    return true;
  } else {
    // User may already exist
    if (createData.error_code === 'user_already_exists' || createData.message?.includes('already')) {
      console.log(`  ⚠️  User already exists`);
      
      // Look up the user to get their UUID
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?filter=${encodeURIComponent(user.email)}`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
      });
      const listData = await listRes.json();
      
      if (listData.users && listData.users.length > 0) {
        const existing = listData.users.find(u => u.email === user.email);
        if (existing) {
          // Update their profile role
          const profileRes = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?id=eq.${existing.id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
              },
              body: JSON.stringify({
                email: user.email,
                full_name: user.full_name,
                role: user.role,
              }),
            }
          );
          if (profileRes.ok) {
            console.log(`  ✅ Updated role to hhc_admin for existing user`);
          } else {
            const errText = await profileRes.text();
            console.log(`  ⚠️  Profile update: ${profileRes.status} ${errText}`);
          }
        }
      } else {
        console.log(`  ⚠️  Could not find existing user to update role`);
      }
      return true;
    }
    
    console.log(`  ❌ Failed (${createRes.status}): ${JSON.stringify(createData)}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Creating HHC Community Platform users via Supabase Management API...\n');
  
  for (const user of users) {
    await createUser(user);
  }

  console.log('\n✅ Done!');
  console.log('\n📋 All users password: HhcCommunity2026!');
  console.log('📋 Role: hhc_admin (full admin access)');
}

main().catch(console.error);