import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://rfhvknywoyigjmsgxmmj.supabase.co"
const supabaseKey = "YOUR_SUPeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmaHZrbnl3b3lpZ2ptc2d4bW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MDc1MDYsImV4cCI6MjA4Njk4MzUwNn0.cHdPo6r2uE6_QI4n5VbgWmNDgmLhwSjBWyfgmjDI02c"

export const supabase = createClient(supabaseUrl, supabaseKey)
