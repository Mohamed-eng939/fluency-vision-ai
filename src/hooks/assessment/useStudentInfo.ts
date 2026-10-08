
import { useState } from 'react';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Track } from '@/types/assessment';

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
  // Age-based placement (captured at the age gate before the test starts).
  age?: number;
  track?: Track;
  // Set at finalisation when a student scores above their track's ceiling
  // (e.g. a teen scoring above A2): the track a human assessor should consider.
  suggestedTrack?: Track;
  placementNote?: string;
}

export const useStudentInfo = () => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  const handleStudentInfoSubmit = useCallback((info: StudentInfo) => {
    // Merge with any previously captured info so fields set earlier (e.g. the
    // age/track chosen at the age gate, before the profile form) are preserved
    // when a later step submits a fresh StudentInfo object.
    setStudentInfo((prev) => {
      const merged: StudentInfo = { ...(prev || {}), ...info };

      // Generate username if not provided
      if (!merged.username && merged.name && (merged.phone || merged.phoneNumber)) {
        const firstName = merged.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        const phone = merged.phone || merged.phoneNumber || '';
        const lastFourDigits = phone.slice(-4).replace(/[^0-9]/g, '');
        merged.username = `${firstName}${lastFourDigits}`;
      }

      // Mutate the caller's object too so the returned value reflects the merge.
      Object.assign(info, merged);
      return merged;
    });
    
    // Only update profile if user is authenticated
    const updateProfileIfAuthenticated = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("Updating profile for authenticated user:", user.id);
          const profileUpdate = {
            full_name: info.name,
            email: info.email,
            country_of_citizenship: info.citizenshipCountry,
            country_of_residence: info.residenceCountry || info.countryCode,
            phone: info.phoneNumber || info.phone,
            first_language: info.firstLanguage,
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
