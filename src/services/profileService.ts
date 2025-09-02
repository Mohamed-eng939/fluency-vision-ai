import { supabase } from '@/lib/supabase/client';

export interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
  country?: string;
  native_language?: string;
  role?: string;
  full_name?: string;
}

export interface ProfileResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Profile Service - Handle all profile-related operations via Edge Functions
 */
export const profileService = {
  /**
   * Create or update user profile
   */
  upsertProfile: async (profileData: ProfileData): Promise<ProfileResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('profile-manager', {
        body: {
          action: 'upsert',
          ...profileData
        }
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Failed to upsert profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile'
      };
    }
  },

  /**
   * Get user profile
   */
  getProfile: async (userId?: string): Promise<ProfileResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('profile-manager', {
        body: {
          action: 'get',
          userId
        }
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Failed to get profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to get profile'
      };
    }
  },

  /**
   * Delete user profile
   */
  deleteProfile: async (userId: string): Promise<ProfileResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('profile-manager', {
        body: {
          action: 'delete',
          userId
        }
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Failed to delete profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete profile'
      };
    }
  },

  /**
   * Generate username from profile data
   */
  generateUsername: async (name: string, phone?: string): Promise<ProfileResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('profile-manager', {
        body: {
          action: 'generate_username',
          name,
          phone
        }
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Failed to generate username:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate username'
      };
    }
  }
};