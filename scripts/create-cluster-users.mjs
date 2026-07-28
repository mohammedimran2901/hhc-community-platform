#!/usr/bin/env node
/**
 * Create cluster users for the HHC Community Platform.
 * Uses Supabase Management REST API (no Supabase client needed).
 * All users are created as 'member' role (non-admin).
 *
 * Usage: node scripts/create-cluster-users.mjs
 */

const SUPABASE_URL = 'https://bxmgcazkdzhyvnqsttnp.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bWdjYXprZHpoeXZucXN0dG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIzNDc4MCwiZXhwIjoyMDk3ODEwNzgwfQ.nyTiLiSog0Bj0psz7o7_fGTX4v6YnOLlXwGSnomgrjw';

// Cluster name mapping: user's cluster name -> seed cluster ID
const clusterMap = {
  'Ahsa': 'c10',
  'Al-Bahah': 'c19',
  'Asir': 'c17',
  'Eastern': 'c09',
  'Hafar': 'c11',
  'Hail': 'c13',
  'J1': 'c04',
  'J2': 'c05',
  'Jazan': 'c20',
  'Jouf': 'c15',
  'Madinah': 'c08',
  'Makakh': 'c06',
  'Makkah': 'c06',
  'Najran': 'c18',
  'Northern Borders': 'c16',
  'Qassim': 'c12',
  'R1': 'c01',
  'R2': 'c02',
  'R3': 'c03',
  'Tabuk': 'c14',
  'Taif': 'c07',
};

const DEFAULT_PASSWORD = 'HhcCommunity2026!';

const users = [
  { cluster: 'Ahsa', name: 'Abdulrahman Alshaiti', email: 'ashiti@moh.gov.sa' },
  { cluster: 'Al-Bahah', name: 'COSTING-BHC', email: 'COSTING-BHC@Moh.gov.sa' },
  { cluster: 'Asir', name: 'Mohammed Alzidan', email: 'malzidan@moh.gov.sa' },
  { cluster: 'Eastern', name: 'Azza Qurashi', email: 'azzaad@moh.gov.sa' },
  { cluster: 'Eastern', name: 'Rahaf', email: 'rahafw@moh.gov.sa' },
  { cluster: 'Hafar', name: 'Turki Alshamari', email: 'tualshammary@moh.gov.sa' },
  { cluster: 'Hail', name: 'Fahad Almutairi', email: 'falmutairi17@moh.gov.sa' },
  { cluster: 'J1', name: 'Abdulrasheed Saeed', email: 'abdulrasheeds@moh.gov.sa' },
  { cluster: 'J2', name: 'Abdulrahman Alawi', email: 'abtalawi@moh.gov.sa' },
  { cluster: 'J2', name: 'Bushra Tawfig Jaber Asseeri', email: 'basseeri@moh.gov.sa' },
  { cluster: 'Jazan', name: 'Amal', email: 'amshakami@moh.gov.sa' },
  { cluster: 'Jouf', name: 'Anas Alruwaili', email: 'am.alruwaili@moh.gov.sa' },
  { cluster: 'Madinah', name: 'Abdullah Al Subaia', email: 'aalsubia@moh.gov.sa' },
  { cluster: 'Makakh', name: 'Ahmed Bushnaq', email: 'abushnaq@makkahhc.sa' },
  { cluster: 'Makkah', name: 'Ohood Fallatah', email: 'OFallatah2@makkahhc.sa' },
  { cluster: 'Najran', name: 'Fatimah Alsharhrani', email: 'falshahranii@moh.gov.sa' },
  { cluster: 'Northern Borders', name: 'Ahlam Alenzi', email: 'ahafalenzi@moh.gov.sa' },
  { cluster: 'Qassim', name: 'Fahad Alsabhan', email: 'fsabhan@moh.gov.sa' },
  { cluster: 'R1', name: 'Salman Almoraif', email: 'salmureef@moh.gov.sa' },
  { cluster: 'R2', name: 'Mohammed H. Aldughayh', email: 'maldughayh@kfmc.med.sa' },
  { cluster: 'R3', name: 'Modhi Alhabradi', email: 'mfalhabradi@moh.gov.sa' },
  { cluster: 'Tabuk', name: 'Dr.Abdullah Alshahrani', email: 'aalshahrani213@moh.gov.sa' },
  { cluster: 'Taif', name: 'Abdulmajeed Alghamdi', email: 'aalghamdi151@moh.gov.sa' },
];

const headers = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function createUser(user) {
  const clusterId = clusterMap[user.cluster];

  // Create auth user
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: user.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: user.name,
        cluster_id: clusterId,
      },
    }),
  });

  if (!authRes.ok) {
    const err = await authRes.json();
    if (err.msg?.includes('already been registered') || err.message?.includes('already been registered') || err.msg?.includes('already exists') || err.message?.includes('already exists')) {
      return { status: 'exists', error: null };
    }
    return { status: 'error', error: err.msg || err.message || JSON.stringify(err) };
  }

  const authUser = await authRes.json();

  // Update profile with cluster_id and role
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id: authUser.id,
      email: user.email,
      full_name: user.name,
      cluster_id: clusterId,
      role: 'member',
    }),
  });

  if (!profileRes.ok) {
    // Try PATCH instead
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${authUser.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        cluster_id: clusterId,
        role: 'member',
      }),
    });

    if (!patchRes.ok) {
      const err = await patchRes.json();
      return { status: 'error', error: `Profile update failed: ${err.message || JSON.stringify(err)}`, userId: authUser.id };
    }
  }

  return { status: 'created', userId: authUser.id };
}

async function listUsers() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, {
    headers,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.users || [];
}

async function updateExistingUser(user) {
  const clusterId = clusterMap[user.cluster];
  const allUsers = await listUsers();
  const existing = allUsers.find(u => u.email === user.email);
  if (!existing) return { status: 'error', error: 'User not found' };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${existing.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      full_name: user.name,
      cluster_id: clusterId,
      role: 'member',
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return { status: 'error', error: err.message || JSON.stringify(err) };
  }

  return { status: 'updated', userId: existing.id };
}

async function main() {
  console.log('🚀 Creating HHC Community Platform cluster users...\n');
  console.log(`📋 Total users to create: ${users.length}`);
  console.log(`🔑 Default password: ${DEFAULT_PASSWORD}\n`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const user of users) {
    const clusterId = clusterMap[user.cluster];
    console.log(`Creating: ${user.name} (${user.email}) → ${user.cluster} [${clusterId}]...`);

    const result = await createUser(user);

    if (result.status === 'created') {
      console.log(`   ✅ Created (${result.userId})\n`);
      created++;
    } else if (result.status === 'exists') {
      console.log(`   ⚠️  Already exists, updating profile...`);
      const updateResult = await updateExistingUser(user);
      if (updateResult.status === 'updated') {
        console.log(`   ✅ Profile updated\n`);
        updated++;
      } else {
        console.log(`   ❌ Update failed: ${updateResult.error}\n`);
        failed++;
      }
    } else {
      console.log(`   ❌ Failed: ${result.error}\n`);
      failed++;
    }
  }

  console.log('════════════════════════════════════════');
  console.log(`✅ Done! Created: ${created}, Updated: ${updated}, Failed: ${failed}`);
  console.log(`🔑 All passwords set to: ${DEFAULT_PASSWORD}`);
  console.log('   (Please share passwords securely and ask users to change on first login)');
  console.log('════════════════════════════════════════\n');
}

main().catch(console.error);
