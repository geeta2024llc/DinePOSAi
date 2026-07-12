import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCustomId() {
  const customId = crypto.randomUUID();
  const email = 'custom_id_user_' + Math.floor(Math.random() * 1000000) + '@test.com';
  console.log('Creating user with custom UUID:', customId, 'email:', email);
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      id: customId,
      email: email,
      password: 'Password123!',
      email_confirm: true
    });
    
    if (error) {
      console.error('Error creating user with custom ID:', error);
    } else {
      console.log('Successfully created user! Returned ID:', data.user.id);
      console.log('IDs match:', data.user.id === customId);
      
      // Clean up
      await supabase.auth.admin.deleteUser(data.user.id);
      console.log('Cleaned up.');
    }
  } catch (err) {
    console.error('Caught error:', err);
  }
}

testCustomId();
