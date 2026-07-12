import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Key length:', supabaseServiceKey ? supabaseServiceKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  try {
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('*');
      
    if (tenantError) {
      console.error('Error fetching tenants:', tenantError);
    } else {
      console.log('Tenants:', tenants);
    }

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*');

    if (userError) {
      console.error('Error fetching users:', userError);
    } else {
      console.log('Users:', users);
    }
  } catch (err) {
    console.error('Caught error:', err);
  }
}

check();
