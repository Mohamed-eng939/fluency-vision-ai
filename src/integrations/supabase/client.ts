import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Prefer env vars (set these per host / per white-label deployment), but fall
// back to the project's publishable values so the app always boots — even when
// a host hasn't had env vars configured yet. The anon/publishable key is public
// by design (it ships in the browser bundle); RLS is the real security layer,
// so this fallback is safe. Point at a different project by setting the env vars.
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://rrslhxigqtfllunmowcy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyc2xoeGlncXRmbGx1bm1vd2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI0NDUsImV4cCI6MjA2NjUyODQ0NX0.k3wjgHGU3d_k0vzSMP2jeKaXMs85zrhu_vb4Ym2Sq9c';

// Resolved values (env var or public fallback) for code that needs the raw URL
// or key — e.g. direct fetch() calls to edge functions.
export const SUPABASE_PROJECT_URL = SUPABASE_URL;
export const SUPABASE_ANON_KEY = SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Use singleton pattern to prevent multiple client instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return supabaseInstance;
})();