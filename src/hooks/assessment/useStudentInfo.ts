
import { useState } from 'react';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StudentInfo {
  name: string;
  email?: string;
  username?: string;
  phone?: string;
  countryCode?: string;
  phoneNumber?: string;
  sessionId?: string;
  emailResults?: boolean;
  // Additional fields from profile form
  password?: string;
  citizenshipCountry?: string;
  residenceCountry?: string;
  dateOfBirth?: Date;
  firstLanguage?: string;
  testReason?: string;
  otherReason?: string;
  estimatedLevel?: string;
  preferredContact?: "email" | "whatsapp" | "phone";
  pronunciationPreference?: "british" | "american" | "neutral";
  promoCode?: string;
  dataConsent?: boolean;
}

export const useStudentInfo = () => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  const handleStudentInfoSubmit = useCallback((info: StudentInfo) => {
    // Generate username if not provided
    if (!info.username && info.name && (info.phone || info.phoneNumber)) {
      const firstName = info.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      const phone = info.phone || info.phoneNumber || '';
      const lastFourDigits = phone.slice(-4).replace(/[^0-9]/g, '');
      info.username = `${firstName}${lastFourDigits}`;
    }

    setStudentInfo(info);
    
    // Only update profile if user is authenticated
    const updateProfileIfAuthenticated = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("Updating profile for authenticated user:", user.id);
          const profileUpdate = {
            name: info.name,
            full_name: info.name,
            email: info.email,
            country: info.countryCode || info.citizenshipCountry || info.residenceCountry,
            phone: info.phoneNumber || info.phone,
            native_language: info.firstLanguage,
            updated_at: new Date().toISOString()
          };
          
          // Update the profile with the provided information
          await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', user.id)
            .then(({ error }) => {
              if (error) {
                console.error('Failed to update profile:', error);
              } else {
                console.log('Profile updated successfully');
              }
            });
        } else {
          console.log("User not authenticated, skipping profile update");
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
      }
    };
    
    updateProfileIfAuthenticated();
    
    return info;
  }, []);

  return {
    studentInfo,
    handleStudentInfoSubmit
  };
};
