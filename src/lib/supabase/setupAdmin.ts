
import { supabase } from './client';
import { generateSecurePassword } from '@/utils/authUtils';

export const setupAdminUser = async (): Promise<{ success: boolean; password?: string; error?: any }> => {
  try {
    // Check if admin user exists
    const { data: existingUsers, error: searchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'mohamed.tarek4115@gmail.com')
      .eq('role', 'admin');
      
    if (searchError) throw searchError;
    
    // If admin already exists, return success but no password
    if (existingUsers && existingUsers.length > 0) {
      return { success: true };
    }
    
    // Generate a secure password
    const password = generateSecurePassword();
    
    // Create the admin user
    const { data, error } = await supabase.auth.signUp({
      email: 'mohamed.tarek4115@gmail.com',
      password,
      options: {
        data: {
          role: 'admin',
        }
      }
    });
    
    if (error) throw error;
    
    // Update the profile to ensure admin role
    if (data.user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', name: 'Global Admin' })
        .eq('id', data.user.id);
        
      if (updateError) throw updateError;
    }
    
    return { success: true, password };
  } catch (error) {
    console.error("Error setting up admin user:", error);
    return { success: false, error };
  }
};
