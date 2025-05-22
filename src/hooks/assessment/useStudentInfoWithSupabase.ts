
import { useState, useEffect } from 'react';
import { generateUniqueId } from '@/utils/assessmentUtils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentInfo {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
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
  emailResults?: boolean;
  sessionId?: string;
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
          setStudentInfo({
            name: data.name,
            username: data.username,
            email: data.email,
            phone: data.phone,
            citizenshipCountry: data.citizenship_country,
            residenceCountry: data.residence_country,
            dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
            firstLanguage: data.first_language,
            testReason: data.test_reason,
            otherReason: data.other_reason,
            estimatedLevel: data.estimated_level,
            preferredContact: data.preferred_contact as "email" | "whatsapp" | "phone" | undefined,
            pronunciationPreference: data.pronunciation_preference as "british" | "american" | "neutral" | undefined,
            promoCode: data.promo_code,
            dataConsent: data.data_consent,
            sessionId
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
    
    // Check if username is already taken
    if (info.username) {
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', info.username);
        
      if (checkError) {
        console.warn('Could not check for duplicate usernames:', checkError);
      } else if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Username already exists",
          description: "This username is already taken. Please try a different one.",
          variant: "destructive"
        });
        return null;
      }
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
          username: info.username,
          phone: info.phone,
          citizenship_country: info.citizenshipCountry,
          residence_country: info.residenceCountry,
          date_of_birth: info.dateOfBirth,
          first_language: info.firstLanguage,
          test_reason: info.testReason,
          other_reason: info.otherReason,
          estimated_level: info.estimatedLevel,
          preferred_contact: info.preferredContact,
          pronunciation_preference: info.pronunciationPreference,
          promo_code: info.promoCode,
          data_consent: info.dataConsent,
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
