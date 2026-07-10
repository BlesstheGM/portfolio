import { createClient } from '@supabase/supabase-js';

let admin: ReturnType<typeof createClient<any>> | null = null;

/**
 * Server-only Supabase client using the service_role key.
 * Never import this from a 'use client' component — it must stay on the server
 * (route handlers only), since the service_role key bypasses row-level security.
 */
export function getSupabaseAdmin() {
  if (admin) return admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  }

  admin = createClient<any>(url, key, { auth: { persistSession: false } });
  return admin;
}
