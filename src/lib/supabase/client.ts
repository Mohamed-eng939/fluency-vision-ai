import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// We're using environment variables from the code since the project is already connected to Supabase
const supabaseUrl = "https://fjmiydniqxjqjbimgtjx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbWl5ZG5pcXhqcWpiaW1ndGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDM1MzIsImV4cCI6MjA2MzIxOTUzMn0.crxMN4RrcgF2ygzzo1mdw9vXvt8YFysujZsHIKZVm_0";

// Create Supabase client
const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

console.log("✅ Connected to Supabase");

// Export the client
export const supabase = supabaseClient;

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
