import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using service role key. Requires
// SUPABASE_SERVICE_ROLE_KEY to be set in Vercel (or locally in .env)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

export default supabase
