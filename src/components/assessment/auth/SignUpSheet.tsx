
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { ProfileForm } from '../profile-form/ProfileForm';
import { StudentInfo } from '@/hooks/assessment';

interface SignUpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (studentInfo: StudentInfo) => void;
}

const SignUpSheet: React.FC<SignUpSheetProps> = ({
  open,
  onOpenChange,
  onContinue
}) => {
  const handleProfileSubmit = (studentInfo: StudentInfo) => {
    console.log("SignUpSheet: Profile submitted successfully, proceeding to assessment");
    onContinue(studentInfo);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Your Profile</SheetTitle>
          <SheetDescription>
            Complete your profile to get started with the assessment
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <ProfileForm 
            onSubmit={handleProfileSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SignUpSheet;
