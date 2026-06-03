import { createClient } from '@supabase/supabase-js';

// These pull the values from your .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Verify that keys exist before creating the client
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);