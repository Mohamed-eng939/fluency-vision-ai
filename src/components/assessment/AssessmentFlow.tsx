import React, { useState, useEffect } from 'react';
import { AssessmentStep, useAssessmentFlow } from '@/hooks/assessment/useAssessmentFlow';
import { StudentInfo } from '@/hooks/assessment';
import AdminControls from './AdminControls';
import AuthButtons from './auth/AuthButtons';
import LoginModal from './auth/LoginModal';
import SignUpSheet from './auth/SignUpSheet';
import AssessmentStepRenderer from './AssessmentStepRenderer';
import { useAuth } from '@/contexts/auth';

interface AssessmentFlowProps {
  onTakeFullAssessment: () => void;
}

const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ onTakeFullAssessment }) => {
  const { user } = useAuth();
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
    processingProgress,
    processBatchAndFinish,
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
    promptsCount: 23, // Use all 23 free-speaking prompts
    requiredConsistentScores: 4,
    showAdminControls: true
  });
  
  // Toggle admin controls visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Alt+D to toggle admin controls
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        setShowAdminControls(!showAdminControls);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAdminControls]);

  // Auto-populate student info if user is logged in (but only when not coming from profile form)
  useEffect(() => {
    if (user && !studentInfo && currentStep === 'entry') {
      // Only auto-populate if we're on the entry step and haven't manually submitted student info
      const defaultInfo = {
        name: user.full_name || 'Anonymous User',
        email: user.email || '',
        sessionId: sessionId || `session-${Date.now()}`,
        countryCode: user.country_of_citizenship || '',
        phoneNumber: user.phone || '',
      };
      
      console.log("Auto-populating student info from user profile:", defaultInfo);
      handleStudentInfoSubmit(defaultInfo);
    }
  }, [user, sessionId, handleStudentInfoSubmit, currentStep]);

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

  const handleSignUpSuccess = (studentInfo: StudentInfo) => {
    console.log("AssessmentFlow: SignUp successful, starting assessment with:", studentInfo);
    // Submit student info and start assessment
    handleStudentInfoSubmit(studentInfo);
    setShowSignUpDialog(false);
    setShowAssessmentOptions(false);
    // Initialize assessment to move to welcome step
    initializeAssessment(studentInfo.emailResults || false);
  };

  const handleLoginSuccess = (user: any) => {
    // Create student info from login data
    handleStudentInfoSubmit({
      name: user.name || 'Anonymous User',
      email: user.email || '',
      sessionId: sessionId || `session-${Date.now()}`,
      countryCode: user.country || '',
      phoneNumber: user.phone || '',
    });
    setShowLoginModal(false);
    setShowAssessmentOptions(false);
    startAssessment();
  };

  const handleAfterReset = () => {
    resetAssessment();
    setShowAssessmentOptions(true);
  };

  console.log("AssessmentFlow rendering with user:", user);
  console.log("AssessmentFlow rendering with studentInfo:", studentInfo);
  console.log("Current step:", currentStep);

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Auth Buttons - Optional, shown for convenience */}
      {showAssessmentOptions && !user && (
        <AuthButtons 
          onLoginClick={handleLoginClick} 
          onSignUpClick={handleSignUpClick} 
        />
      )}

      {/* Main Assessment Content */}
      <AssessmentStepRenderer
        currentStep={currentStep}
        showAssessmentOptions={showAssessmentOptions}
        studentInfo={studentInfo}
        currentPrompt={currentPrompt}
        currentPromptIndex={currentPromptIndex}
        totalPrompts={totalPrompts}
        finalResult={finalResult}
        isProcessing={isProcessing}
        emailResults={emailResults}
        detailedFeedback={detailedFeedback}
        promptHistory={promptHistory}
        showRawScoring={showRawScoring}
        showAdminControls={showAdminControls}
        processingProgress={processingProgress}
        sessionId={sessionId}
        processBatchAndFinish={processBatchAndFinish}
        onSelectQuickAssessment={handleSelectQuickAssessment}
        initializeAssessment={initializeAssessment}
        onStudentInfoSubmit={handleStudentInfoSubmit}
        startAssessment={startAssessment}
        handleResponseComplete={handleResponseComplete}
        skipToNextPrompt={skipToNextPrompt}
        finishAssessment={finishAssessment}
        resetAssessment={handleAfterReset}
        toggleAdminReviewMode={toggleAdminReviewMode}
        onTakeFullAssessment={onTakeFullAssessment}
      />
      
      {/* Admin Controls */}
      {showAdminControls && (
        <AdminControls 
          onToggleBypass={toggleAdminReviewMode}
          bypassEnabled={bypassScoringDelay}
          onShowRawScoring={toggleAdminReviewMode}
          rawScoringEnabled={showRawScoring}
        />
      )}

      {/* Modals */}
      <LoginModal 
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Sign Up Sheet */}
      <SignUpSheet
        open={showSignUpDialog}
        onOpenChange={setShowSignUpDialog}
        onContinue={handleSignUpSuccess}
      />
    </div>
  );
};

export default AssessmentFlow;
