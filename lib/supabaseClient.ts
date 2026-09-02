
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these with your actual keys from Supabase Settings -> API
// In a real production app, these should be in .env files (VITE_SUPABASE_URL, etc.)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
