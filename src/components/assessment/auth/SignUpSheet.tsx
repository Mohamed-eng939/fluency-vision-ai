
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface SignUpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
}

const SignUpSheet: React.FC<SignUpSheetProps> = ({
  open,
  onOpenChange,
  onContinue
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sign Up</SheetTitle>
          <SheetDescription>
            Create a new account to take the assessment
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <p className="text-sm text-muted-foreground mb-4">
            Please complete the sign up form to create your account.
          </p>
          <Button 
            className="w-full" 
            onClick={onContinue}
          >
            Continue to Sign Up Form
          </Button>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SignUpSheet;
