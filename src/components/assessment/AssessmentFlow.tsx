import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [showAssessmentOptions, setShowAssessmentOptions] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  
  // Debug mode via URL param
  const showDebug = searchParams.get('debug') === 'true';
  
  // Track if we came from profile form to prevent auto-population overwriting
  const isFromProfileForm = useRef(false);
  
  // Initialization guards - persist across re-renders
  const isInitializing = useRef(false);
  const hasInitialized = useRef(false);
  
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
    // Skip auto-population if we came from the profile form signup flow
    if (isFromProfileForm.current) {
      console.log("Skipping auto-population - came from profile form");
      return;
    }
    
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
  }, [user, sessionId, handleStudentInfoSubmit, currentStep, studentInfo]);

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
    
    // Guard against duplicate initialization
    if (isInitializing.current || hasInitialized.current) {
      console.log("AssessmentFlow: Already initializing/initialized, skipping duplicate call");
      return;
    }
    
    isInitializing.current = true;
    isFromProfileForm.current = true;
    
    // Submit student info and start assessment
    handleStudentInfoSubmit(studentInfo);
    setShowSignUpDialog(false);
    setShowAssessmentOptions(false);
    
    // Initialize assessment to move to welcome step
    initializeAssessment(studentInfo.emailResults || false).finally(() => {
      isInitializing.current = false;
      hasInitialized.current = true;
    });
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
    // Reset refs to allow re-initialization
    isInitializing.current = false;
    hasInitialized.current = false;
    isFromProfileForm.current = false;
    
    resetAssessment();
    setShowAssessmentOptions(true);
  };

  console.log("AssessmentFlow rendering with user:", user);
  console.log("AssessmentFlow rendering with studentInfo:", studentInfo);
  console.log("Current step:", currentStep);

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Debug Panel - show with ?debug=true */}
      {showDebug && (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
          <div className="font-bold mb-2 text-yellow-400">🔧 Debug Panel</div>
          <div>Step: <span className="text-green-400">{currentStep}</span></div>
          <div>User: <span className="text-blue-400">{user?.id?.slice(0, 8) || 'null'}</span></div>
          <div>StudentInfo: <span className="text-purple-400">{studentInfo?.name || 'null'}</span></div>
          <div>SessionId: <span className="text-orange-400">{sessionId?.slice(0, 12) || 'null'}</span></div>
          <div>PromptQueue: <span className="text-cyan-400">{totalPrompts || 0}</span></div>
          <div>Initializing: <span className={isInitializing.current ? 'text-yellow-400' : 'text-gray-400'}>{String(isInitializing.current)}</span></div>
          <div>HasInitialized: <span className={hasInitialized.current ? 'text-green-400' : 'text-gray-400'}>{String(hasInitialized.current)}</span></div>
        </div>
      )}

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
