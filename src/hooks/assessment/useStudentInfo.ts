
import { useState } from 'react';
import { generateUniqueId } from '@/utils/assessmentUtils';

export interface StudentInfo {
  name: string;
  email?: string;
  institution?: string;
  sessionId: string;
  countryCode: string;
  phoneNumber: string;
}

export const useStudentInfo = () => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  
  const handleStudentInfoSubmit = (info: StudentInfo) => {
    setStudentInfo(info);
  };
  
  return {
    studentInfo,
    handleStudentInfoSubmit,
  };
};
