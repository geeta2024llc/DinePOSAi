import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create client with service role key
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function testLoginSupabase() {
  const email = 'login_test_user_' + Math.floor(Math.random() * 1000000) + '@test.com';
  const password = 'Password123!';
  
  console.log('1. Creating test user via auth.admin.createUser:', email);
  try {
    const { data: createData, error: createError } = await supabaseService.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });
    
    if (createError) {
      console.error('Failed to create user:', createError);
      return;
    }
    
    const userId = createData.user.id;
    console.log('User created successfully. ID:', userId);
    
    console.log('2. Trying to sign in with password using service role client...');
    const { data: signInData, error: signInError } = await supabaseService.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (signInError) {
      console.error('Sign in error with service role client:', signInError);
    } else {
      console.log('Sign in success with service role client! Access token exists:', !!signInData.session?.access_token);
    }
    
    // Clean up
    console.log('3. Deleting test user...');
    await supabaseService.auth.admin.deleteUser(userId);
    console.log('Test user deleted.');
    
  } catch (err) {
    console.error('Caught error:', err);
  }
}

testLoginSupabase();
