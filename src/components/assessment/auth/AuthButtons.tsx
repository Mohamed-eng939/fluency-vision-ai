
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, LogIn } from 'lucide-react';

interface AuthButtonsProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ onLoginClick, onSignUpClick }) => {
  return (
    <div className="flex justify-end mb-4 gap-2">
      <Button 
        variant="outline"
        className="flex items-center gap-1" 
        onClick={onLoginClick}
      >
        <LogIn className="h-4 w-4" /> Log In
      </Button>
      <Button 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={onSignUpClick}
      >
        <UserPlus className="h-4 w-4" /> Sign Up
      </Button>
    </div>
  );
};

export default AuthButtons;
