
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
          full_name: userData.full_name, // Use correct field name
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

// Update profile function - with field mapping to match database schema
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    // Map UserProfile fields to actual database column names
    const mappedUpdates: any = {};
    
    if (updates.full_name !== undefined) mappedUpdates.full_name = updates.full_name;
    if (updates.email !== undefined) mappedUpdates.email = updates.email;
    if (updates.phone !== undefined) mappedUpdates.phone = updates.phone;
    if (updates.country_of_citizenship !== undefined) mappedUpdates.country_of_citizenship = updates.country_of_citizenship;
    if (updates.country_of_residence !== undefined) mappedUpdates.country_of_residence = updates.country_of_residence;
    if (updates.first_language !== undefined) mappedUpdates.first_language = updates.first_language;
    if (updates.username !== undefined) mappedUpdates.username = updates.username;
    if (updates.date_of_birth !== undefined) mappedUpdates.date_of_birth = updates.date_of_birth;
    if (updates.role !== undefined) mappedUpdates.role = updates.role;
    
    // Always set updated_at
    mappedUpdates.updated_at = new Date().toISOString();
    
    console.log('🔄 [updateUserProfile] Updating profile for user:', userId);
    console.log('🔄 [updateUserProfile] Mapped updates:', mappedUpdates);
    
    const { error } = await supabase
      .from('profiles')
      .update(mappedUpdates)
      .eq('id', userId);
    
    if (error) {
      console.error('❌ [updateUserProfile] Database update failed:', error);
    } else {
      console.log('✅ [updateUserProfile] Profile updated successfully');
    }
    
    return { error };
  } catch (error: any) {
    console.error('💥 [updateUserProfile] Exception:', error);
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
