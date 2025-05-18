
import { useState } from 'react';
import { AssessmentStep } from './types/assessmentTypes';

export const useAdminControls = () => {
  // Admin/Bypass mode
  const [bypassScoringDelay, setBypassScoringDelay] = useState(false);
  const [showRawScoring, setShowRawScoring] = useState(false);
  
  // Toggle admin review mode
  const toggleAdminReviewMode = () => {
    setBypassScoringDelay(!bypassScoringDelay);
    setShowRawScoring(!showRawScoring);
    return !bypassScoringDelay;
  };
  
  // Reset admin controls
  const resetAdminControls = () => {
    setBypassScoringDelay(false);
    setShowRawScoring(false);
  };
  
  return {
    bypassScoringDelay,
    showRawScoring,
    toggleAdminReviewMode,
    resetAdminControls
  };
};
