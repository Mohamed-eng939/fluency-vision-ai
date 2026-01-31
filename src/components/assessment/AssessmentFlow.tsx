import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AssessmentStep, useAssessmentFlow } from '@/hooks/assessment/useAssessmentFlow';
import { StudentInfo } from '@/hooks/assessment';
import AdminControls from './AdminControls';
import AuthButtons from './auth/AuthButtons';
import LoginModal from './auth/LoginModal';
import SignUpSheet from './auth/SignUpSheet';
import AssessmentStepRenderer from './AssessmentStepRenderer';
import { useAuth } from '@/contexts/auth';

// Module-level flags to persist across re-renders caused by auth state changes
let moduleInitializing = false;
let moduleHasInitialized = false;
let modulePendingStudentInfo: StudentInfo | null = null;
let moduleShowAssessmentOptions = true;

interface AssessmentFlowProps {
  onTakeFullAssessment: () => void;
}

const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ onTakeFullAssessment }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [showAssessmentOptions, setShowAssessmentOptions] = useState(moduleShowAssessmentOptions);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Sync module-level flag whenever state changes
  useEffect(() => {
    moduleShowAssessmentOptions = showAssessmentOptions;
  }, [showAssessmentOptions]);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  
  // Debug mode via URL param
  const showDebug = searchParams.get('debug') === 'true';
  
  // Track if we came from profile form to prevent auto-population overwriting
  const isFromProfileForm = useRef(false);
  
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

  // Handle pending initialization after auth-triggered re-renders
  useEffect(() => {
    if (modulePendingStudentInfo && currentStep === 'entry' && !moduleInitializing) {
      console.log("📦 Processing pending student info after re-render:", modulePendingStudentInfo);
      const pendingInfo = modulePendingStudentInfo;
      modulePendingStudentInfo = null;
      
      moduleInitializing = true;
      isFromProfileForm.current = true;
      
      handleStudentInfoSubmit(pendingInfo);
      setShowSignUpDialog(false);
      setShowAssessmentOptions(false);
      
      initializeAssessment(pendingInfo.emailResults || false).finally(() => {
        moduleInitializing = false;
        moduleHasInitialized = true;
        console.log("✅ Pending initialization complete");
      });
    }
  }, [currentStep, handleStudentInfoSubmit, initializeAssessment]);
  
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
    if (isFromProfileForm.current || moduleHasInitialized || moduleInitializing) {
      console.log("Skipping auto-population - profile form flow active");
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

  const handleSignUpSuccess = useCallback((info: StudentInfo) => {
    console.log("🎯 AssessmentFlow: SignUp callback received:", info.name);
    
    // Guard against duplicate initialization
    if (moduleInitializing || moduleHasInitialized) {
      console.log("⚠️ AssessmentFlow: Already initializing/initialized, skipping");
      return;
    }
    
    // Store the student info for processing after any auth-triggered re-render
    // This persists across component re-mounts caused by auth state changes
    modulePendingStudentInfo = info;
    moduleInitializing = true;
    isFromProfileForm.current = true;
    
    // Submit student info and close dialogs
    handleStudentInfoSubmit(info);
    setShowSignUpDialog(false);
    setShowAssessmentOptions(false);
    
    // Initialize assessment to move to welcome step
    console.log("🚀 Starting assessment initialization...");
    initializeAssessment(info.emailResults || false).then(() => {
      console.log("✅ Assessment initialization complete");
      moduleInitializing = false;
      moduleHasInitialized = true;
      modulePendingStudentInfo = null;
    }).catch((err) => {
      console.error("❌ Assessment initialization failed:", err);
      moduleInitializing = false;
      modulePendingStudentInfo = null;
    });
  }, [handleStudentInfoSubmit, initializeAssessment]);

  const handleLoginSuccess = (loginUser: any) => {
    // Create student info from login data
    handleStudentInfoSubmit({
      name: loginUser.name || 'Anonymous User',
      email: loginUser.email || '',
      sessionId: sessionId || `session-${Date.now()}`,
      countryCode: loginUser.country || '',
      phoneNumber: loginUser.phone || '',
    });
    setShowLoginModal(false);
    setShowAssessmentOptions(false);
    startAssessment();
  };

  const handleAfterReset = () => {
    // Reset module-level flags to allow re-initialization
    moduleInitializing = false;
    moduleHasInitialized = false;
    modulePendingStudentInfo = null;
    moduleShowAssessmentOptions = true;
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
        <div className="fixed bottom-4 right-4 bg-background/95 border border-border text-foreground p-4 rounded-lg text-xs font-mono z-50 max-w-xs shadow-lg">
          <div className="font-bold mb-2 text-primary">🔧 Debug Panel</div>
          <div>Step: <span className="text-accent-foreground font-semibold">{currentStep}</span></div>
          <div>User: <span className="text-muted-foreground">{user?.id?.slice(0, 8) || 'null'}</span></div>
          <div>StudentInfo: <span className="text-muted-foreground">{studentInfo?.name || 'null'}</span></div>
          <div>SessionId: <span className="text-muted-foreground">{sessionId?.slice(0, 12) || 'null'}</span></div>
          <div>PromptQueue: <span className="text-muted-foreground">{totalPrompts || 0}</span></div>
          <div>Initializing: <span className={moduleInitializing ? 'text-primary' : 'text-muted-foreground'}>{String(moduleInitializing)}</span></div>
          <div>HasInitialized: <span className={moduleHasInitialized ? 'text-primary' : 'text-muted-foreground'}>{String(moduleHasInitialized)}</span></div>
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
