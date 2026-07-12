import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAuthAdmin() {
  const email = 'auth_admin_user_' + Math.floor(Math.random() * 1000000) + '@test.com';
  console.log('Testing auth.admin.createUser with email:', email);
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: 'Password123!',
      email_confirm: true
    });
    
    if (error) {
      console.error('Auth Admin Error:', error);
    } else {
      console.log('Auth Admin Success. User ID:', data.user.id);
      
      // Clean up the created user so we don't leave garbage
      console.log('Deleting test user...');
      const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);
      if (deleteError) {
        console.error('Failed to delete test user:', deleteError);
      } else {
        console.log('Test user deleted successfully.');
      }
    }
  } catch (err) {
    console.error('Caught error:', err);
  }
}

testAuthAdmin();
