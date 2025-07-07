
import { useState, useEffect } from 'react';
import { generateUniqueId } from '@/utils/assessmentUtils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

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
          // Map database fields to our StudentInfo interface
          setStudentInfo({
            name: data.name || data.full_name,
            email: data.email,
            phone: data.phone,
            username: (data.name || data.full_name)?.split(' ')[0].toLowerCase() + (data.phone?.slice(-4) || ''),
            country: data.country,
            native_language: data.native_language,
            role: data.role,
            sessionId,
            // Set compatibility fields
            firstLanguage: data.native_language,
            citizenshipCountry: data.country,
            residenceCountry: data.country,
            phoneNumber: data.phone,
            countryCode: data.country
          });
        } else if (initialInfo.name || initialInfo.email) {
          setStudentInfo({
            ...initialInfo,
            sessionId
          });
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
    
    // If user is authenticated, update profile in Supabase
    if (user) {
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
