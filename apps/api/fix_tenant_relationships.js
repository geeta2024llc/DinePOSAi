import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log('=======================================================');
  console.log('DinePOS AI — Tenant-Staff Relationship Migration v1.0');
  console.log('=======================================================\n');

  let issuesFixed = 0;
  let issuesFailed = 0;

  // ── STEP 1: Show BEFORE state ────────────────────────────────────────────
  console.log('📋 BEFORE STATE:\n');

  const { data: tenantsBefore } = await supabase
    .from('tenants')
    .select('id, name, plan, status');
  console.log('Tenants:', JSON.stringify(tenantsBefore, null, 2));

  const { data: usersBefore } = await supabase
    .from('users')
    .select('id, name, email, role, tenant_id, branch_id, is_active');
  console.log('Users:', JSON.stringify(usersBefore, null, 2));

  // ── FIX 1: Set tenant_id = NULL for ALL SUPER_ADMIN users ────────────────
  console.log('\n🔧 FIX 1: Clearing tenant_id for SUPER_ADMIN users...');

  const superAdmins = (usersBefore || []).filter(u => u.role === 'SUPER_ADMIN');
  console.log('  Found ' + superAdmins.length + ' SUPER_ADMIN user(s):', superAdmins.map(u => u.name + ' (' + u.email + ')'));

  if (superAdmins.length > 0) {
    const { data: fixSA, error: fixSAErr } = await supabase
      .from('users')
      .update({ tenant_id: null, branch_id: null, updated_at: new Date().toISOString() })
      .eq('role', 'SUPER_ADMIN')
      .select('id, name, email, role, tenant_id');

    if (fixSAErr) {
      console.error('  FAILED to clear SUPER_ADMIN tenant_id:', fixSAErr.message);
      issuesFailed++;
    } else {
      console.log('  SUCCESS: SUPER_ADMIN users now have tenant_id=null:', JSON.stringify(fixSA, null, 2));
      issuesFixed++;
    }
  } else {
    console.log('  No SUPER_ADMIN users with tenant_id found.');
  }

  // ── FIX 2: Normalize plan='ACTIVE' to 'BUSINESS' ────────────────────────
  console.log('\n🔧 FIX 2: Normalizing invalid plan values (plan=ACTIVE to BUSINESS)...');

  const { data: badPlanTenants } = await supabase
    .from('tenants')
    .select('id, name, plan')
    .eq('plan', 'ACTIVE');

  console.log('  Found ' + (badPlanTenants || []).length + " tenant(s) with plan='ACTIVE':", 
    (badPlanTenants || []).map(t => t.name + ' (' + t.id + ')'));

  if ((badPlanTenants || []).length > 0) {
    const { data: fixPlan, error: fixPlanErr } = await supabase
      .from('tenants')
      .update({ plan: 'BUSINESS', updated_at: new Date().toISOString() })
      .eq('plan', 'ACTIVE')
      .select('id, name, plan');

    if (fixPlanErr) {
      console.error('  FAILED to fix plan value:', fixPlanErr.message);
      issuesFailed++;
    } else {
      console.log('  SUCCESS: Plan normalized:', JSON.stringify(fixPlan, null, 2));
      issuesFixed++;
    }
  } else {
    console.log('  No tenants with invalid plan found.');
  }

  // ── FIX 3: Detect and report duplicate tenant names ──────────────────────
  console.log('\n🔧 FIX 3: Checking for duplicate tenant names...');

  const { data: allTenants } = await supabase.from('tenants').select('id, name, plan, status, created_at');
  const nameMap = {};
  (allTenants || []).forEach(t => {
    if (!nameMap[t.name]) nameMap[t.name] = [];
    nameMap[t.name].push(t);
  });

  const duplicates = Object.entries(nameMap).filter(([, arr]) => arr.length > 1);
  if (duplicates.length > 0) {
    console.log('  DUPLICATE TENANT NAMES DETECTED (manual review required):');
    for (const [name, tenants] of duplicates) {
      console.log('\n  Business: "' + name + '"');
      for (const t of tenants) {
        const { data: tUsers } = await supabase
          .from('users')
          .select('id, name, email, role')
          .eq('tenant_id', t.id);
        console.log('    ID: ' + t.id + ' | Plan: ' + t.plan + ' | Status: ' + t.status + ' | Created: ' + t.created_at);
        console.log('    Staff: ' + JSON.stringify((tUsers || []).map(u => u.name + ' (' + u.role + ')')));
      }
    }
  } else {
    console.log('  No duplicate tenant names found.');
  }

  // ── FIX 4: Orphaned users check ──────────────────────────────────────────
  console.log('\n🔧 FIX 4: Checking for orphaned users...');

  const { data: usersAfter } = await supabase.from('users').select('id, name, email, role, tenant_id');
  const { data: tenantsAfter } = await supabase.from('tenants').select('id');
  const tenantIdSet = new Set((tenantsAfter || []).map(t => t.id));

  const orphans = (usersAfter || []).filter(u => 
    u.tenant_id && !tenantIdSet.has(u.tenant_id) && u.role !== 'SUPER_ADMIN'
  );

  if (orphans.length > 0) {
    console.log('  ORPHANED USERS:');
    for (const o of orphans) {
      console.log('    - ' + o.name + ' (' + o.email + ', role: ' + o.role + ') -> tenant_id: ' + o.tenant_id + ' [MISSING TENANT]');
    }
  } else {
    console.log('  No orphaned users found.');
  }

  // ── AFTER STATE ──────────────────────────────────────────────────────────
  console.log('\n📋 AFTER STATE:\n');

  const { data: finalUsers } = await supabase
    .from('users')
    .select('id, name, email, role, tenant_id, branch_id')
    .order('role');

  const { data: finalTenants } = await supabase
    .from('tenants')
    .select('id, name, plan, status');

  console.log('Tenants (final):', JSON.stringify(finalTenants, null, 2));
  console.log('Users (final):');
  for (const u of (finalUsers || [])) {
    const t = (finalTenants || []).find(t => t.id === u.tenant_id);
    console.log('  ' + u.name + ' (' + u.role + ') -> Tenant: ' + (t ? t.name : u.tenant_id ? 'ORPHAN:' + u.tenant_id : 'NULL (Platform-level)'));
  }

  console.log('\n=======================================================');
  console.log('Migration Complete: ' + issuesFixed + ' fixed, ' + issuesFailed + ' failed');
  console.log('=======================================================');
}

runMigration().catch(err => {
  console.error('Migration script fatal error:', err);
  process.exit(1);
});
