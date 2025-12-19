import { createClient } from '@supabase/supabase-js'

// Admin client with service role for server-side operations
// THIS FILE SHOULD ONLY BE IMPORTED IN SERVER-SIDE CONTEXTS (API Routes, Server Actions)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
