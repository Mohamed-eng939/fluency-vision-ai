
import { supabase } from '@/integrations/supabase/client';
import { generateSecurePassword } from '@/utils/authUtils';

export const setupAdminUser = async (): Promise<{ success: boolean; password?: string; error?: any }> => {
  try {
    // Check if admin user exists - fix the query syntax
    const { data: existingUsers, error: searchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'mohamed.tarek4115@gmail.com')
      .eq('role', 'admin'); // Changed to separate query calls
      
    if (searchError) throw searchError;
    
    // If admin already exists, return success but no password
    if (existingUsers && existingUsers.length > 0) {
      console.log('Admin user already exists');
      return { success: true };
    }
    
    // Generate a secure password
    const password = generateSecurePassword();
    console.log('Generated admin password:', password); // Log the password for visibility
    
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
        .insert({
          id: data.user.id,
          email: 'mohamed.tarek4115@gmail.com',
          name: 'Global Admin',
          role: 'admin'
        });
        
      if (updateError) throw updateError;
    }
    
    return { success: true, password };
  } catch (error) {
    console.error("Error setting up admin user:", error);
    return { success: false, error };
  }
};
