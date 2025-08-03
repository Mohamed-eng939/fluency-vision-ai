import { useState, useEffect } from 'react';
import { generateUniqueId } from '@/utils/assessmentUtils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { profileService } from '@/services/profileService';

// Extended profile type that includes the new fields
interface ExtendedProfile {
  id: string;
  name: string | null;
  full_name?: string | null;
  role: string | null;
  organization_id: string | null;
  created_at: string | null;
  // Extended fields that we added
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  native_language?: string | null;
  username?: string | null;
  updated_at?: string | null;
}

export interface StudentInfo {
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  country?: string;
  native_language?: string;
  role?: string;
  sessionId?: string;
  emailResults?: boolean;
  // Legacy fields - kept for backward compatibility
  countryCode?: string;
  phoneNumber?: string;
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

export const useStudentInfoWithSupabase = (initialInfo: Partial<StudentInfo> = {}) => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Initialize with a unique session ID if none provided
  useEffect(() => {
    if (!studentInfo && user) {
      const sessionId = initialInfo.sessionId || generateUniqueId('ST');
      
      // If we have a logged-in user, fetch their profile
      const fetchProfile = async () => {
        // Try Edge Function first
        const response = await profileService.getProfile(user.id);
        
        if (response.success && response.data) {
          const extendedProfile = response.data as ExtendedProfile;
          
          // Map database fields to our StudentInfo interface
          setStudentInfo({
            name: extendedProfile.name || extendedProfile.full_name,
            email: extendedProfile.email,
            phone: extendedProfile.phone,
            username: (extendedProfile.name || extendedProfile.full_name)?.split(' ')[0].toLowerCase() + (extendedProfile.phone?.slice(-4) || ''),
            country: extendedProfile.country,
            native_language: extendedProfile.native_language,
            role: extendedProfile.role,
            sessionId,
            // Set compatibility fields
            firstLanguage: extendedProfile.native_language,
            citizenshipCountry: extendedProfile.country,
            residenceCountry: extendedProfile.country,
            phoneNumber: extendedProfile.phone,
            countryCode: extendedProfile.country
          });
        } else {
          // Fallback to direct database query
          console.warn('Edge Function failed, falling back to direct query:', response.error);
          
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
            const extendedProfile = data as ExtendedProfile;
            
            setStudentInfo({
              name: extendedProfile.name || extendedProfile.full_name,
              email: extendedProfile.email,
              phone: extendedProfile.phone,
              username: (extendedProfile.name || extendedProfile.full_name)?.split(' ')[0].toLowerCase() + (extendedProfile.phone?.slice(-4) || ''),
              country: extendedProfile.country,
              native_language: extendedProfile.native_language,
              role: extendedProfile.role,
              sessionId,
              // Set compatibility fields
              firstLanguage: extendedProfile.native_language,
              citizenshipCountry: extendedProfile.country,
              residenceCountry: extendedProfile.country,
              phoneNumber: extendedProfile.phone,
              countryCode: extendedProfile.country
            });
          } else if (initialInfo.name || initialInfo.email) {
            setStudentInfo({
              ...initialInfo,
              sessionId
            });
          }
        }
      };
      
      fetchProfile();
    } else if (!studentInfo && (initialInfo.name || initialInfo.email)) {
      const sessionId = initialInfo.sessionId || generateUniqueId('ST');
      setStudentInfo({
        ...initialInfo,
        sessionId
      });
    }
  }, [initialInfo, studentInfo, user]);

  const handleStudentInfoSubmit = async (info: StudentInfo) => {
    // Generate a session ID if none provided
    const sessionId = info.sessionId || generateUniqueId('ST');
    
    // Generate username if not provided
    if (!info.username && info.name && (info.phone || info.phoneNumber)) {
      const firstName = info.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      const phone = info.phone || info.phoneNumber || '';
      const lastFourDigits = phone.slice(-4).replace(/[^0-9]/g, '');
      info.username = `${firstName}${lastFourDigits}`;
    }
    
    // Store student info
    const updatedInfo = {
      ...info,
      sessionId
    };
    
    setStudentInfo(updatedInfo);
    
    // If user is authenticated, update profile via Edge Function
    if (user) {
      const response = await profileService.upsertProfile({
        name: info.name,
        full_name: info.name,
        phone: info.phone || info.phoneNumber,
        country: info.country || info.countryCode || info.citizenshipCountry,
        native_language: info.native_language || info.firstLanguage,
        role: info.role || 'learner'
      });
      
      if (!response.success) {
        // Fallback to direct database update
        console.warn('Edge Function failed, falling back to direct update:', response.error);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: info.name,
            full_name: info.name,
            phone: info.phone || info.phoneNumber,
            country: info.country || info.countryCode || info.citizenshipCountry,
            native_language: info.native_language || info.firstLanguage,
            role: info.role || 'learner',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error('Error updating profile:', updateError);
          toast({
            title: "Failed to update profile",
            description: updateError.message,
            variant: "destructive"
          });
          return null;
        }
      }
    } else {
      // For non-authenticated users (should be rare with Supabase auth)
      try {
        localStorage.setItem('lingua_student_info', JSON.stringify(updatedInfo));
      } catch (error) {
        console.warn('Could not save student info to localStorage:', error);
      }
    }
    
    // Notify
    if (info.name) {
      toast({
        title: "Profile Created",
        description: `Thank you, ${info.name}. Your profile has been created.`
      });
    }
    
    return updatedInfo;
  };

  return {
    studentInfo,
    handleStudentInfoSubmit,
  };
};
