
import { useState } from 'react';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StudentInfo {
  name: string;
  email?: string;
  countryCode?: string;
  phoneNumber?: string;
  sessionId?: string;
}

export const useStudentInfo = () => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  const handleStudentInfoSubmit = useCallback((info: StudentInfo) => {
    setStudentInfo(info);
    
    // If the user is authenticated, update their profile with this information
    const updateProfileIfAuthenticated = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const profileUpdate = {
          name: info.name,
          email: info.email,
          country: info.countryCode,
          phone: info.phoneNumber
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
