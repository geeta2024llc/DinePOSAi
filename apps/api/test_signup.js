import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSignup() {
  const email = 'test_signup_user_' + Math.floor(Math.random() * 1000000) + '@test.com';
  const passwordHash = await bcrypt.hash('Password123!', 12);
  
  console.log('Testing RPC signup_tenant_and_user with email:', email);
  
  try {
    const { data, error } = await supabase
      .rpc('signup_tenant_and_user', {
        p_business_name: 'Test Restaurant',
        p_name: 'Test Admin',
        p_email: email,
        p_password_hash: passwordHash,
        p_country: 'Japan',
        p_timezone: 'Asia/Tokyo',
        p_currency: 'JPY'
      });
      
    if (error) {
      console.error('RPC Error:', error);
    } else {
      console.log('RPC Success:', data);
    }
  } catch (err) {
    console.error('Caught error:', err);
  }
}

testSignup();
