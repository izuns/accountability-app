import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with the actual URL and Key from your Supabase Dashboard!
const supabaseUrl = 'https://obkssuvghstlhddwhzgq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ia3NzdXZnaHN0bGhkZHdoemdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjU4NDgsImV4cCI6MjA5NjAwMTg0OH0.AmtlemTpLMotChoG2AzbsAQ0Y_zdyrbYmdIonQ6tVSw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});