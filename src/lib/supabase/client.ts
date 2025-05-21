
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Try to get environment variables or use fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-placeholder';

// For development purposes, let's make sure we have values, even if they're placeholders
// Remove this condition in production and use proper environment variables
if (!supabaseUrl.includes('your-supabase-project') && !supabaseAnonKey.includes('your-anon-key')) {
  console.log('Using Supabase configuration:', { url: supabaseUrl.substring(0, 15) + '...', keyLength: supabaseAnonKey.length });
} else {
  console.warn('⚠️ Using placeholder Supabase values. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
