import { useState, useEffect } from 'react';
import { generateUniqueId } from '@/utils/assessmentUtils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { profileService } from '@/services/profileService';

interface ExtendedProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  organization_id: string | null;
  country_of_citizenship: string | null;
  country_of_residence: string | null;
  first_language: string | null;
  created_at: string | null;
  updated_at: string | null;
  username?: string | null;
  target_language?: string | null;
  current_cefr_level?: string | null;
  test_reason?: string | null;
  date_of_birth?: string | null;
  is_active?: boolean;
}

export interface StudentInfo {
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
  country?: string;
  native_language?: string;
  role?: string;
  sessionId?: string;
  firstLanguage?: string;
  citizenshipCountry?: string;
  residenceCountry?: string;
  phoneNumber?: string;
  countryCode?: string;
}

export const useStudentInfoWithSupabase = (initialInfo: StudentInfo = {}) => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!studentInfo && user) {
      const sessionId = initialInfo.sessionId || generateUniqueId('ST');
      
      const fetchProfile = async () => {
        try {
          setIsLoading(true);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }
          
          if (data) {
            const profile = data as ExtendedProfile;
            
            setStudentInfo({
              name: profile.full_name || 'User',
              email: profile.email || user.email,
              phone: profile.phone,
              username: (profile.full_name || 'user')?.split(' ')[0].toLowerCase() + (profile.phone?.slice(-4) || ''),
              country: profile.country_of_residence,
              native_language: profile.first_language,
              role: profile.role,
              sessionId,
              firstLanguage: profile.first_language,
              citizenshipCountry: profile.country_of_citizenship,
              residenceCountry: profile.country_of_residence,
              phoneNumber: profile.phone,
              countryCode: profile.country_of_residence
            });
          } else if (initialInfo.name || initialInfo.email) {
            setStudentInfo({
              ...initialInfo,
              sessionId
            });
          }
        } catch (error) {
          console.error('Error in fetchProfile:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    } else if (!user && (initialInfo.name || initialInfo.email)) {
      const sessionId = initialInfo.sessionId || generateUniqueId('ST');
      setStudentInfo({
        ...initialInfo,
        sessionId
      });
    }
  }, [user, initialInfo, studentInfo]);

  const updateStudentInfo = async (info: StudentInfo) => {
    try {
      setIsSaving(true);
      
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: info.name,
            phone: info.phone || info.phoneNumber,
            country_of_citizenship: info.country || info.countryCode || info.citizenshipCountry,
            country_of_residence: info.residenceCountry || info.country,
            first_language: info.native_language || info.firstLanguage,
            role: (info.role || 'learner') as 'admin' | 'assessor' | 'learner',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error('Error updating profile:', updateError);
          toast({
            title: "Error",
            description: "Failed to save profile. Please try again.",
            variant: "destructive",
          });
          return false;
        }
        
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
      }
      
      setStudentInfo(prev => prev ? { ...prev, ...info } : info);
      return true;
    } catch (error) {
      console.error('Error updating student info:', error);
      toast({
        title: "Error",
        description: "Failed to save information. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const resetStudentInfo = () => {
    setStudentInfo(null);
  };

  return {
    studentInfo,
    setStudentInfo,
    updateStudentInfo,
    resetStudentInfo,
    isLoading,
    isSaving,
  };
};