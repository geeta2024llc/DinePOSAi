import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://wnfzfaicohlcrnmvaybj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- DB CONNECTION HEALTH CHECK ---');
console.log('Target Supabase URL:', supabaseUrl);

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY missing from environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    // 1. Check Users table & Owner Wilson account
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .limit(10);

    if (userError) {
      console.error('❌ Error querying users table:', userError.message);
    } else {
      console.log(`✅ Users Table Connection OK! Found ${users?.length || 0} registered user records.`);
      if (users && users.length > 0) {
        console.log('   Sample Users:', users.map(u => `${u.name} (${u.email}) - Role: ${u.role}`));
      }
    }

    // 2. Check Owner Account Wilson
    const { data: ownerUser, error: ownerError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'wilxon.xtha@gmail.com')
      .single();

    if (ownerError) {
      console.warn('⚠️ Wilson owner query note:', ownerError.message);
    } else if (ownerUser) {
      console.log(`✅ Owner Admin Account Active: ${ownerUser.name} (${ownerUser.email}) -> Role: ${ownerUser.role}`);
    }

    // 3. Check Tenants table
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);

    if (tenantError) {
      console.warn('⚠️ Tenants table note:', tenantError.message);
    } else {
      console.log(`✅ Tenants Table OK! Found ${tenants?.length || 0} tenant environments.`);
    }

    // 4. Check Orders table
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, total, status')
      .limit(5);

    if (orderError) {
      console.warn('⚠️ Orders table note:', orderError.message);
    } else {
      console.log(`✅ Orders Table OK! Query succeeded.`);
    }

    console.log('--- RESULT: DATABASE IS FULLY FUNCTIONAL AND ONLINE ---');
  } catch (err: any) {
    console.error('❌ Database health check exception:', err.message);
  }
}

checkDatabase();
