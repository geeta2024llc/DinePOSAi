import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
}

// Admin client: always uses service role key for DB operations (PostgREST).
// NEVER use this client for auth.signInWithPassword — that would overwrite the
// service-role session with a user session, causing subsequent DB queries to fail RLS.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseServiceKey || 'placeholder-service-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  }
);

// Separate auth-only client: used exclusively for signInWithPassword so it doesn't
// contaminate the admin client's service-role context.
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || supabaseServiceKey || 'placeholder-anon-key';
export const supabaseAuthClient = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  }
);
