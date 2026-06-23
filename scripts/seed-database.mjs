#!/usr/bin/env node
/**
 * Seed the Supabase database with schema and initial data.
 * Uses the service role key for admin operations.
 *
 * Usage: node scripts/seed-database.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Read the seed SQL
const seedSqlPath = join(__dirname, '..', 'supabase', 'seed.sql');
const seedSql = readFileSync(seedSqlPath, 'utf-8');

// Split into individual statements
const statements = seedSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function main() {
  console.log('🚀 Seeding Supabase database...\n');

  // Execute each statement
  for (const stmt of statements) {
    // Skip publication statements - they need special handling
    if (stmt.toUpperCase().startsWith('ALTER PUBLICATION')) {
      console.log('⏭️  Skipping publication statement (run manually in SQL editor):');
      console.log(`   ${stmt.substring(0, 80)}...\n`);
      continue;
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' });
      if (error) {
        // If exec_sql doesn't exist, try direct SQL
        console.log(`   ⚠️  rpc exec_sql failed: ${error.message}`);
        console.log('   Trying direct REST API...\n');
        
        // Fallback: use supabase-js raw query
        const { error: sqlError } = await supabase.from('_exec_sql').select('*').limit(0);
        if (sqlError && sqlError.message.includes('relation "_exec_sql" does not exist')) {
          console.log(`   ⏭️  Cannot automate - run manually in Supabase SQL Editor\n`);
          break;
        }
      } else {
        console.log(`✅ ${stmt.substring(0, 60)}...`);
      }
    } catch (err) {
      console.log(`   ⏭️  Statement requires manual execution: ${stmt.substring(0, 60)}...`);
    }
  }

  console.log('\n📋 Manual steps required:');
  console.log('  1. Go to https://supabase.com/dashboard/project/bxmgcazkdzhyvnqsttnp/sql/new');
  console.log('  2. Open supabase/seed.sql');
  console.log('  3. Copy-paste and run ALL SQL in the editor');
  console.log('  4. This will create all tables, RLS policies, triggers, and seed data\n');
  console.log('✅ After running the SQL, the database will be ready!');
}

main().catch(console.error);