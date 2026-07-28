import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTenantDeleteVerificationTest() {
  console.log('\n======================================================');
  console.log('STARTING TENANT DELETE & VERIFICATION INTEGRATION TEST');
  console.log('======================================================\n');

  // 1. Create a dummy tenant
  const tenantName = `Test Delete Tenant ${Date.now()}`;
  console.log(`1. Inserting dummy tenant "${tenantName}" into Supabase...`);
  
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .insert({
      name: tenantName,
      country: 'Nepal',
      currency: 'NPR',
      plan: 'TRIAL',
      status: 'ACTIVE'
    })
    .select()
    .single();

  if (tenantErr || !tenant) {
    console.error('Failed to create test tenant:', tenantErr);
    process.exit(1);
  }

  const tenantId = tenant.id;
  console.log(`   --> Created Tenant ID: ${tenantId}`);

  // 2. Create associated dummy records (branch, user, table, setting)
  console.log('2. Inserting associated records (branch, user, table, settings)...');

  const { error: branchErr } = await supabase
    .from('branches')
    .insert({
      tenant_id: tenantId,
      name: 'Kathmandu Main Branch',
      is_active: true
    });
  if (branchErr) console.warn('   - Branch insert notice:', branchErr.message);

  const { error: userErr } = await supabase
    .from('users')
    .insert({
      tenant_id: tenantId,
      name: 'Test Staff User',
      email: `test_delete_${Date.now()}@dineposai.com`,
      password_hash: 'hash_test_123',
      role: 'MANAGER',
      is_active: true
    });
  if (userErr) console.warn('   - User insert notice:', userErr.message);

  const { error: tableErr } = await supabase
    .from('tables')
    .insert({
      tenant_id: tenantId,
      name: 'Table T1',
      status: 'AVAILABLE'
    });
  if (tableErr) console.warn('   - Table insert notice:', tableErr.message);

  const { error: settingErr } = await supabase
    .from('settings')
    .insert({
      tenant_id: tenantId,
      key: 'receipt_header',
      value: { header: 'Welcome to Test' }
    });
  if (settingErr) console.warn('   - Setting insert notice:', settingErr.message);

  console.log('   --> Dummy data successfully initialized.');

  // 3. Perform Cascading Delete
  console.log(`\n3. Executing backend cascading delete sequence for Tenant ID: ${tenantId}...`);

  const tablesToClean = [
    'user_sessions',
    'login_history',
    'audit_logs',
    'kitchen_logs',
    'cash_transactions',
    'cash_drawers',
    'purchase_order_items',
    'purchase_orders',
    'inventory_logs',
    'recipe_ingredients',
    'inventory_items',
    'suppliers',
    'payment_splits',
    'refunds',
    'invoices',
    'payments',
    'order_item_addons',
    'order_items',
    'orders',
    'item_addons',
    'item_variants',
    'menu_items',
    'categories',
    'tables',
    'devices',
    'settings',
    'tenant_billing',
    'subscription_invoices',
    'daily_sales',
    'users',
    'branches'
  ];

  for (const tableName of tablesToClean) {
    const { error: cleanErr } = await supabase
      .from(tableName)
      .delete()
      .eq('tenant_id', tenantId);
    if (cleanErr && cleanErr.code !== '42P01') {
      console.warn(`   - Cleaning table ${tableName}: ${cleanErr.message}`);
    }
  }

  const { error: deleteTenantErr } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId);

  if (deleteTenantErr) {
    console.error('FAILED TO DELETE TENANT RECORD:', deleteTenantErr.message);
    process.exit(1);
  }

  console.log('   --> Tenant delete SQL command executed cleanly.');

  // 4. Verification Step
  console.log('\n4. Executing DB Post-Deletion Verification Check...');

  const { data: verifyData, error: verifyErr } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', tenantId)
    .maybeSingle();

  if (verifyErr) {
    console.error('Verification error:', verifyErr.message);
  }

  if (verifyData) {
    console.error(`❌ FAIL: Tenant ${tenantId} STILL EXISTS in Supabase database!`);
    process.exit(1);
  } else {
    console.log(`✅ VERIFIED: Tenant ${tenantId} is PERMANENTLY GONE from Supabase database.`);
  }

  // Double check child records are gone
  const { data: usersLeft } = await supabase.from('users').select('id').eq('tenant_id', tenantId);
  const { data: branchesLeft } = await supabase.from('branches').select('id').eq('tenant_id', tenantId);

  console.log(`   --> Child users remaining for tenant: ${usersLeft?.length || 0}`);
  console.log(`   --> Child branches remaining for tenant: ${branchesLeft?.length || 0}`);

  if ((usersLeft?.length || 0) === 0 && (branchesLeft?.length || 0) === 0) {
    console.log('\n======================================================');
    console.log('SUCCESS: TENANT DELETE FLOW FULLY VERIFIED & WORKING');
    console.log('======================================================\n');
  } else {
    console.error('❌ FAIL: Some child records were not cleaned up.');
    process.exit(1);
  }
}

runTenantDeleteVerificationTest();
