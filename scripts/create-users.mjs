#!/usr/bin/env node
/**
 * Create the three initial users for the HHC Community Platform.
 * Uses the Supabase Admin API with the service role key.
 *
 * Usage: node scripts/create-users.mjs
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxmgcazkdzhyvnqsttnp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bWdjYXprZHpoeXZucXN0dG5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIzNDc4MCwiZXhwIjoyMDk3ODEwNzgwfQ.nyTiLiSog0Bj0psz7o7_fGTX4v6YnOLlXwGSnomgrjw';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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

async function main() {
  console.log('🚀 Creating HHC Community Platform users...\n');

  for (const user of users) {
    console.log(`Creating user: ${user.email} (${user.full_name})...`);

    // 1. Create the auth user via Admin API (auto-confirm email)
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
      },
    });

    if (createError) {
      // If user already exists, we can still update role
      if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
        console.log(`   ⚠️  User already exists: ${user.email}`);
        
        // Look up existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find(u => u.email === user.email);
        if (existing) {
          // Update the role
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: existing.id,
              email: user.email,
              full_name: user.full_name,
              role: user.role,
            }, { onConflict: 'id' });

          if (updateError) {
            console.log(`   ❌ Failed to update role: ${updateError.message}`);
          } else {
            console.log(`   ✅ Updated role to hhc_admin for existing user ${user.email}`);
          }
        }
        continue;
      }

      console.log(`   ❌ Failed: ${createError.message}`);
      continue;
    }

    console.log(`   ✅ Auth user created: ${newUser.user.id}`);

    // 2. Update the profile role to hhc_admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: user.role })
      .eq('id', newUser.user.id);

    if (updateError) {
      console.log(`   ⚠️  Role update failed: ${updateError.message}`);
      // Try upsert
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: newUser.user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        }, { onConflict: 'id' });

      if (upsertError) {
        console.log(`   ❌ Upsert also failed: ${upsertError.message}`);
      } else {
        console.log(`   ✅ Profile upserted with role: ${user.role}`);
      }
    } else {
      console.log(`   ✅ Role set to: ${user.role}`);
    }

    console.log('');
  }

  console.log('✅ Done! All users created/verified.\n');
  console.log('📋 Users created with password: HhcCommunity2026!');
  console.log('   (Please share passwords securely and ask users to change on first login)');
}

main().catch(console.error);