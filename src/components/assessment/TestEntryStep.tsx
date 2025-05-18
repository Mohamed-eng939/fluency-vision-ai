
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { StudentInfo } from '@/hooks/assessment';
import { ProfileForm } from './profile-form/ProfileForm';

interface TestEntryStepProps {
  onStart: (withEmail: boolean) => void;
  onStudentInfoSubmit: (info: StudentInfo) => void;
}

const TestEntryStep: React.FC<TestEntryStepProps> = ({ 
  onStart,
  onStudentInfoSubmit 
}) => {
  const handleProfileSubmit = (studentInfo: StudentInfo) => {
    // Save student info
    onStudentInfoSubmit(studentInfo);
    
    // Start assessment with email flag
    onStart(!!studentInfo.emailResults);
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6">
      <Card>
        <CardHeader className="text-center">
          <h2 className="text-2xl font-bold text-assessment-blue">Create Your Profile</h2>
          <p className="text-gray-600">Please provide the following information before starting your assessment</p>
        </CardHeader>
        
        <CardContent>
          <ProfileForm onSubmit={handleProfileSubmit} />
        </CardContent>
        
        <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
          <div>10 minutes or less</div>
          <div>CEFR level evaluation</div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestEntryStep;
