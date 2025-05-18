
import { useState, useEffect } from 'react';
import { generateUniqueId } from '@/utils/assessmentUtils';
import { useToast } from '@/components/ui/use-toast';

export interface StudentInfo {
  name?: string;
  email?: string;
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
    
    // Store student info
    const updatedInfo = {
      ...info,
      sessionId
    };
    
    setStudentInfo(updatedInfo);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('lingua_student_info', JSON.stringify(updatedInfo));
    } catch (error) {
      console.warn('Could not save student info to localStorage:', error);
    }
    
    // Notify
    if (info.name) {
      toast({
        title: "Information Saved",
        description: `Thank you, ${info.name}. Your assessment results will be sent to ${info.email}.`
      });
    }
    
    return updatedInfo;
  };

  return {
    studentInfo,
    handleStudentInfoSubmit,
  };
};
