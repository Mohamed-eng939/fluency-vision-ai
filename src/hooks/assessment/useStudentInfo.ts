
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
    
    // If the user is authenticated, update their profile with this information
    const updateProfileIfAuthenticated = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const profileUpdate = {
          name: info.name,
          email: info.email,
          country: info.countryCode || info.citizenshipCountry || info.residenceCountry,
          phone: info.phoneNumber || info.phone,
          native_language: info.firstLanguage
        };
        
        // Update the profile with the provided information
        await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              console.error('Failed to update profile:', error);
            }
          });
      }
    };
    
    updateProfileIfAuthenticated();
  }, []);

  return {
    studentInfo,
    handleStudentInfoSubmit
  };
};
