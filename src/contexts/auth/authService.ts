
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

// Sign in function
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  } catch (error: any) {
    return { error };
  }
};

// Sign up function
export const signUpWithEmail = async (email: string, password: string, userData: Partial<UserProfile>) => {
  try {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || 'learner'
        }
      }
    });
    
    return { error, data };
  } catch (error: any) {
    return { error, data: null };
  }
};

// Sign out function
export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Update profile function
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    return { error };
  } catch (error: any) {
    return { error };
  }
};

// Fetch user profile
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    return { data, error };
  } catch (error: any) {
    return { data: null, error };
  }
};
