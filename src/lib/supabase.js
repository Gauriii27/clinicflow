import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your_supabase_url_here') ||
  supabaseAnonKey.includes('your_supabase_anon_key_here')
) {
  const msg =
    'Missing Supabase configuration. Please create a `.env` file at the project root with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set (see `.env.example`).';
  // eslint-disable-next-line no-console
  console.error(msg);
  throw new Error(msg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
