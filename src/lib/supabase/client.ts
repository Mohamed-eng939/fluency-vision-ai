
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Check for Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that both environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase environment variables are missing! Please connect this project to Supabase.");
  
  // Instead of using placeholder values that will cause runtime errors,
  // we'll create a mock client that logs errors when used but doesn't fail immediately
  const mockSupabase = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signUp: async () => ({ error: new Error("Supabase not configured"), data: null }),
      signInWithPassword: async () => ({ error: new Error("Supabase not configured"), data: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: null, error: new Error("Supabase not configured") }),
          update: () => ({ error: new Error("Supabase not configured") }),
          delete: () => ({ error: new Error("Supabase not configured") })
        }),
        update: () => ({ error: new Error("Supabase not configured") })
      })
    })
  };
  
  // @ts-ignore - Use the mock client
  export const supabase = mockSupabase;
} else {
  // Create real Supabase client if environment variables are available
  export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  console.log("✅ Connected to Supabase");
}

export const getRole = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return profile?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const isAdmin = async (): Promise<boolean> => {
  const role = await getRole();
  return role === 'admin';
};

export const isAssessor = async (): Promise<boolean> => {
  const role = await getRole();
  return role === 'assessor';
};

export const isLearner = async (): Promise<boolean> => {
  const role = await getRole();
  return role === 'learner';
};
