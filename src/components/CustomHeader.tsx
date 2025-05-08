
import React from 'react';
import Logo from './Logo';
import { Button } from './ui/button';

interface CustomHeaderProps {
  onSelectAssessmentMode: (mode: 'quick' | 'full') => void;
  currentMode: 'quick' | 'full';
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ 
  onSelectAssessmentMode,
  currentMode
}) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="assessment-container py-3 flex justify-between items-center">
        <Logo size="md" variant="full" />
        
        <div className="flex space-x-2">
          <Button 
            variant={currentMode === 'quick' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onSelectAssessmentMode('quick')}
            className={currentMode === 'quick' ? 'bg-assessment-teal hover:bg-assessment-lightBlue' : ''}
          >
            Quick Assessment
          </Button>
          <Button 
            variant={currentMode === 'full' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onSelectAssessmentMode('full')}
            className={currentMode === 'full' ? 'bg-assessment-teal hover:bg-assessment-lightBlue' : ''}
          >
            Full Assessment
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CustomHeader;
