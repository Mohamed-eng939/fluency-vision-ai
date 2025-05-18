import React, { useState } from 'react';
import { AssessmentStep, useAssessmentFlow } from '@/hooks/assessment/useAssessmentFlow';
import TestEntryStep from './TestEntryStep';
import WelcomeStep from './WelcomeStep';
import RecordingStep from './RecordingStep';
import ProcessingStep from './ProcessingStep';
import ResultsStep from './ResultsStep';
import AdminControls from './AdminControls';
import AssessmentOptions from './AssessmentOptions';
import { Button } from '@/components/ui/button';
import { UserPlus, LogIn } from 'lucide-react';
import LoginModal from './auth/LoginModal';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AssessmentFlowProps {
  onTakeFullAssessment: () => void;
}

const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ onTakeFullAssessment }) => {
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [showAssessmentOptions, setShowAssessmentOptions] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  
  // Initialize the assessment flow
  const {
    // State
    currentStep,
    studentInfo,
    emailResults,
    sessionId,
    currentPrompt,
    currentPromptIndex,
    finalResult,
    bypassScoringDelay,
    showRawScoring,
    isProcessing,
    detailedFeedback,
    promptHistory,
    
    // Methods
    initializeAssessment,
    startAssessment,
    handleResponseComplete,
    skipToNextPrompt,
    finishAssessment,
    resetAssessment,
    toggleAdminReviewMode,
    handleStudentInfoSubmit,
    
    // Configuration
    totalPrompts
  } = useAssessmentFlow({
    promptsCount: 10,
    requiredConsistentScores: 4,
    showAdminControls: true
  });
  
  // Toggle admin controls visibility with keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Alt+D to toggle admin controls
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        setShowAdminControls(!showAdminControls);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAdminControls]);

  const handleSelectQuickAssessment = () => {
    setShowAssessmentOptions(false);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleSignUpClick = () => {
    setShowSignUpDialog(true);
    setShowAssessmentOptions(false);
  };

  const handleLoginSuccess = (user: any) => {
    handleStudentInfoSubmit(user);
    setShowLoginModal(false);
    setShowAssessmentOptions(false);
    startAssessment();
  };

  // Render the appropriate step
  const renderStep = () => {
    // If showing assessment options, render those first
    if (showAssessmentOptions) {
      return (
        <>
          <div className="flex justify-end mb-4 gap-2">
            <Button 
              variant="outline"
              className="flex items-center gap-1" 
              onClick={handleLoginClick}
            >
              <LogIn className="h-4 w-4" /> Log In
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleSignUpClick}
            >
              <UserPlus className="h-4 w-4" /> Sign Up
            </Button>
          </div>

          <AssessmentOptions
            onSelectQuickAssessment={handleSelectQuickAssessment}
          />
        </>
      );
    }

    switch (currentStep) {
      case AssessmentStep.ENTRY:
        return (
          <TestEntryStep 
            onStart={initializeAssessment}
            onStudentInfoSubmit={handleStudentInfoSubmit}
          />
        );
      
      case AssessmentStep.WELCOME:
        return (
          <WelcomeStep 
            onStart={startAssessment}
          />
        );
      
      case AssessmentStep.RECORDING:
        if (!currentPrompt) return null;
        
        return (
          <RecordingStep 
            prompt={currentPrompt}
            currentIndex={currentPromptIndex}
            totalPrompts={totalPrompts}
            onRecordingComplete={handleResponseComplete}
            onPause={() => {}} // This would be implemented for pausing functionality
            onFinishNow={() => finishAssessment(finalResult)}
            onNext={skipToNextPrompt}
            isProcessing={isProcessing}
          />
        );
      
      case AssessmentStep.PROCESSING:
        return (
          <ProcessingStep 
            hasEmail={emailResults}
            email={studentInfo?.email}
            onBypassProcessing={toggleAdminReviewMode}
            isAdmin={showAdminControls}
          />
        );
      
      case AssessmentStep.RESULTS:
        return (
          <ResultsStep 
            result={finalResult}
            detailedFeedback={detailedFeedback}
            promptHistory={promptHistory}
            showRawScoring={showRawScoring && showAdminControls}
            onReset={() => {
              resetAssessment();
              setShowAssessmentOptions(true);
            }}
            onTakeFullAssessment={onTakeFullAssessment}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {renderStep()}
      
      {showAdminControls && (
        <AdminControls 
          onToggleBypass={toggleAdminReviewMode}
          bypassEnabled={bypassScoringDelay}
          onShowRawScoring={toggleAdminReviewMode}
          rawScoringEnabled={showRawScoring}
        />
      )}

      {/* Login Modal */}
      <LoginModal 
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Sign Up Sheet (Existing) */}
      <Sheet open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
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
              onClick={() => {
                setShowSignUpDialog(false);
                setShowAssessmentOptions(false);
              }}
            >
              Continue to Sign Up Form
            </Button>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setShowSignUpDialog(false)}>
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AssessmentFlow;
