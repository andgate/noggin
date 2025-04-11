import type { Database } from '@noggin/types/database.types'
import { supabaseAnonKey, supabaseUrl } from '@noggin/utils/env'
import { createClient } from '@supabase/supabase-js'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not defined in environment variables', {
    supabaseUrl,
    supabaseAnonKey,
  })
  throw new Error(
    'Supabase URL and Anon Key must be provided in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Did you copy .env.example to .env?'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
