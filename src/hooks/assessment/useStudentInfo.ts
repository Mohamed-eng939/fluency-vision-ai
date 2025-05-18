
import { useState, useEffect } from 'react';
import { generateUniqueId } from '@/utils/assessmentUtils';
import { useToast } from '@/components/ui/use-toast';

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

export const useStudentInfo = (initialInfo: Partial<StudentInfo> = {}) => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const { toast } = useToast();
  
  // Initialize with a unique session ID if none provided
  useEffect(() => {
    if (!studentInfo) {
      const sessionId = initialInfo.sessionId || generateUniqueId('ST');
      if (initialInfo.name || initialInfo.email) {
        setStudentInfo({
          ...initialInfo,
          sessionId
        });
      }
    }
  }, [initialInfo]);

  const handleStudentInfoSubmit = (info: StudentInfo) => {
    // Generate a session ID if none provided
    const sessionId = info.sessionId || generateUniqueId('ST');
    
    // Check if username is already taken
    try {
      const authUsers = JSON.parse(localStorage.getItem('lingua_auth_users') || '[]');
      const existingUser = authUsers.find((user: any) => user.username === info.username);
      
      if (existingUser) {
        toast({
          title: "Username already exists",
          description: "This username is already taken. Please try a different one.",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.warn('Could not check for duplicate usernames:', error);
    }
    
    // Store student info
    const updatedInfo = {
      ...info,
      sessionId
    };
    
    setStudentInfo(updatedInfo);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('lingua_student_info', JSON.stringify(updatedInfo));
      
      // Also save to auth-related storage for future login
      if (info.username && info.password && info.email) {
        const authUsers = JSON.parse(localStorage.getItem('lingua_auth_users') || '[]');
        const existingUserIndex = authUsers.findIndex((user: any) => 
          user.username === info.username || user.email === info.email
        );
        
        if (existingUserIndex >= 0) {
          // Update existing user
          authUsers[existingUserIndex] = {
            ...authUsers[existingUserIndex],
            ...info
          };
        } else {
          // Add new user
          authUsers.push({
            ...info,
            id: sessionId,
            createdAt: new Date().toISOString()
          });
        }
        
        localStorage.setItem('lingua_auth_users', JSON.stringify(authUsers));
      }
    } catch (error) {
      console.warn('Could not save student info to localStorage:', error);
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
