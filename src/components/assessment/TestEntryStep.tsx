
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudentInfo } from '@/hooks/assessment';
import { ProfileForm } from './profile-form/ProfileForm';
import { generateUniqueId } from '@/utils/assessmentUtils';

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

  const handleSkipProfile = () => {
    // Create minimal anonymous student info
    const anonymousInfo: StudentInfo = {
      name: 'Anonymous User',
      sessionId: generateUniqueId('QA'),
      dataConsent: true, // Implied consent for anonymous usage
      emailResults: false,
    };
    
    // Save anonymous info
    onStudentInfoSubmit(anonymousInfo);
    
    // Start assessment without email
    onStart(false);
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
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Don't want to create a profile? You can start the test immediately.
              </p>
              <Button 
                variant="outline" 
                onClick={handleSkipProfile}
                className="w-full"
              >
                Skip Profile & Start Test
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Note: Results will not be emailed without a profile
              </p>
            </div>
          </div>
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
