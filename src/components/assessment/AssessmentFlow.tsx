
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AssessmentFlowProps {
  onTakeFullAssessment: () => void;
}

const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ onTakeFullAssessment }) => {
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [showAssessmentOptions, setShowAssessmentOptions] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  
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

  const handleSelectFullAssessment = () => {
    // This now is handled inside the AssessmentOptions component
    // with a dialog that shows "coming soon"
  };

  const handleLoginClick = () => {
    setShowLoginDialog(true);
  };

  const handleSignUpClick = () => {
    setShowSignUpDialog(true);
    setShowAssessmentOptions(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate credentials against a backend
    // For now, we'll just check localStorage
    try {
      const users = JSON.parse(localStorage.getItem('lingua_auth_users') || '[]');
      const user = users.find((u: any) => 
        (u.username === loginCredentials.username || u.email === loginCredentials.username) && 
        u.password === loginCredentials.password
      );
      
      if (user) {
        // Login successful
        handleStudentInfoSubmit(user);
        setShowLoginDialog(false);
        setShowAssessmentOptions(false);
        startAssessment();
      } else {
        // Login failed
        alert('Invalid username or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login');
    }
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

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log In</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your account
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLoginSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username or Email</Label>
                <Input
                  id="username"
                  value={loginCredentials.username}
                  onChange={(e) => setLoginCredentials({...loginCredentials, username: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowLoginDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Log In</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentFlow;
