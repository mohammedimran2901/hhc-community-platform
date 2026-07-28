#!/usr/bin/env node
/**
 * Update admin users:
 * 1. Remove admin privileges from existing admins (make them Eastern cluster members)
 * 2. Create new admin users
 *
 * Usage: node scripts/update-admin-users.mjs
 */

const SUPABASE_URL = 'https://bxmgcazkdzhyvnqsttnp.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bWdjYXprZHpoeXZucXN0dG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIzNDc4MCwiZXhwIjoyMDk3ODEwNzgwfQ.nyTiLiSog0Bj0psz7o7_fGTX4v6YnOLlXwGSnomgrjw';

const headers = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

const DEFAULT_PASSWORD = 'HhcCommunity2026!';

// Existing admins to demote to Eastern cluster members
const existingAdmins = [
  { email: 'walhalal@moh.gov.sa', name: 'Walaa Abduljabbar Hassan Alhalal' },
  { email: 'azzaad@moh.gov.sa', name: 'Azza Qurashi' },
  { email: 'rahafw@moh.gov.sa', name: 'Rahaf' },
];

// New admins to create
const newAdmins = [
  { email: 'mohammed.alsuhaibani@health.sa', name: 'Mohammed Alsuhaibani' },
  { email: 'kristian.mccormack@health.sa', name: 'Kristian McCormack' },
  { email: 'hessah.alaqeel@health.sa', name: 'Hessah Alaqeel' },
  { email: 'waleed.alomari@health.sa', name: 'Waleed Alomari' },
];

async function listUsers() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, {
    headers,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.users || [];
}

async function updateUserRole(userId, email, name, clusterId, role) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      full_name: name,
      cluster_id: clusterId,
      role: role,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return { success: false, error: err.message || JSON.stringify(err) };
  }

  return { success: true };
}

async function createUser(email, name, role) {
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: name,
      },
    }),
  });

  if (!authRes.ok) {
    const err = await authRes.json();
    if (err.msg?.includes('already been registered') || err.message?.includes('already been registered')) {
      return { status: 'exists' };
    }
    return { status: 'error', error: err.msg || err.message || JSON.stringify(err) };
  }

  const authUser = await authRes.json();

  // Create/update profile with role
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id: authUser.id,
      email: email,
      full_name: name,
      role: role,
    }),
  });

  if (!profileRes.ok) {
    // Try PATCH instead
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${authUser.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role: role }),
    });

    if (!patchRes.ok) {
      const err = await patchRes.json();
      return { status: 'error', error: `Profile update failed: ${err.message || JSON.stringify(err)}` };
    }
  }

  return { status: 'created', userId: authUser.id };
}

async function main() {
  console.log('🔄 Updating admin users...\n');

  const allUsers = await listUsers();

  // Step 1: Demote existing admins to Eastern cluster members
  console.log('📋 Step 1: Removing admin privileges from existing admins...\n');

  for (const admin of existingAdmins) {
    const existing = allUsers.find(u => u.email === admin.email);
    if (!existing) {
      console.log(`   ⚠️  User not found: ${admin.email}`);
      continue;
    }

    const result = await updateUserRole(existing.id, admin.email, admin.name, 'c09', 'member');
    if (result.success) {
      console.log(`   ✅ ${admin.email} → Eastern cluster member (role: member)`);
    } else {
      console.log(`   ❌ Failed to update ${admin.email}: ${result.error}`);
    }
  }

  // Step 2: Create new admin users
  console.log('\n📋 Step 2: Creating new admin users...\n');

  for (const admin of newAdmins) {
    console.log(`Creating: ${admin.name} (${admin.email})...`);

    const result = await createUser(admin.email, admin.name, 'hhc_admin');

    if (result.status === 'created') {
      console.log(`   ✅ Created with admin role (${result.userId})\n`);
    } else if (result.status === 'exists') {
      console.log(`   ⚠️  Already exists, updating to admin role...`);
      const existing = allUsers.find(u => u.email === admin.email);
      if (existing) {
        const updateResult = await updateUserRole(existing.id, admin.email, admin.name, null, 'hhc_admin');
        if (updateResult.success) {
          console.log(`   ✅ Updated to admin role\n`);
        } else {
          console.log(`   ❌ Failed to update: ${updateResult.error}\n`);
        }
      }
    } else {
      console.log(`   ❌ Failed: ${result.error}\n`);
    }
  }

  console.log('════════════════════════════════════════');
  console.log('✅ Admin user updates complete!');
  console.log(`🔑 New admin password: ${DEFAULT_PASSWORD}`);
  console.log('════════════════════════════════════════\n');
}

main().catch(console.error);
