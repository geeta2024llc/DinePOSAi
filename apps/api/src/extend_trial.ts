import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://wnfzfaicohlcrnmvaybj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY missing from environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function extendTrial() {
  const targetEmail = 'wilxon.xtha@gmail.com';
  console.log(`[Trial Extension] Target Email: ${targetEmail}`);

  // 1. Find user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, name, email, tenant_id')
    .eq('email', targetEmail)
    .maybeSingle();

  if (userError) {
    console.error('❌ Error fetching user:', userError.message);
  }

  let tenantId = user?.tenant_id;

  // If no user found, find first tenant or demo tenant
  if (!tenantId) {
    console.log('User not found by direct email search. Searching tenants directly...');
    const { data: tenants } = await supabase.from('tenants').select('id, name').limit(1);
    if (tenants && tenants.length > 0) {
      tenantId = tenants[0].id;
    }
  }

  if (!tenantId) {
    console.error('❌ No tenant found to update.');
    process.exit(1);
  }

  // Calculate new trial_ends_at: 2 days from now (48 hours) to ensure ample buffer
  const extendedDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const extendedIso = extendedDate.toISOString();

  console.log(`Extending trial for Tenant ID: ${tenantId}`);
  console.log(`New Trial Expiry: ${extendedIso}`);

  const { data: updatedTenant, error: updateError } = await supabase
    .from('tenants')
    .update({
      plan: 'TRIAL',
      status: 'ACTIVE',
      trial_ends_at: extendedIso,
      updated_at: new Date().toISOString()
    })
    .eq('id', tenantId)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Failed to update tenant in Supabase:', updateError.message);
  } else {
    console.log('✅ TRIAL EXTENDED SUCCESSFULLY IN SUPABASE DATABASE!');
    console.log('Updated Tenant Details:', {
      id: updatedTenant.id,
      name: updatedTenant.name,
      plan: updatedTenant.plan,
      trial_ends_at: updatedTenant.trial_ends_at
    });
  }
}

extendTrial();
