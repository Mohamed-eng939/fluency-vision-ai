import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// We're using environment variables from the code since the project is already connected to Supabase
const supabaseUrl = "https://rrslhxigqtfllunmowcy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyc2xoeGlncXRmbGx1bm1vd2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI0NDUsImV4cCI6MjA2NjUyODQ0NX0.k3wjgHGU3d_k0vzSMP2jeKaXMs85zrhu_vb4Ym2Sq9c";

// Create Supabase client - ensure singleton
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: localStorage
      }
    });
    console.log("✅ Connected to Supabase");
  }
  return supabaseClient;
};

// Export the client
export const supabase = getSupabaseClient();

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
