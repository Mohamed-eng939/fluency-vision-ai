
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AssessmentResult } from '@/types/assessment';

export const useFullAssessment = () => {
  const [showFullAssessment, setShowFullAssessment] = useState(false);
  const [showFullAssessmentIntro, setShowFullAssessmentIntro] = useState(false);
  const { toast } = useToast();

  const handleStartFullAssessment = () => {
    setShowFullAssessmentIntro(false);
    setShowFullAssessment(true);
  };

  const handleFullAssessmentComplete = (result?: AssessmentResult) => {
    setShowFullAssessment(false);
    
    if (result) {
      // Display the result if available
      toast({
        title: "Assessment Complete",
        description: `Your assessment is complete with a score of ${result.totalScore}% (${result.cefrLevel}).`,
      });
    } else {
      toast({
        title: "Assessment Complete",
        description: "Your assessment has been completed and is being processed.",
      });
    }
    
    // Return the result so it can be set in the main hook
    return result;
  };

  const handleFullAssessmentExit = () => {
    setShowFullAssessment(false);
    toast({
      title: "Assessment Saved",
      description: "Your progress has been saved. You can continue later.",
    });
  };
  
  const handleShowFullAssessmentIntro = () => {
    setShowFullAssessmentIntro(true);
  };

  const handleCloseFullAssessmentIntro = () => {
    setShowFullAssessmentIntro(false);
  };

  return {
    showFullAssessment,
    showFullAssessmentIntro,
    handleStartFullAssessment,
    handleFullAssessmentComplete,
    handleFullAssessmentExit,
    handleShowFullAssessmentIntro,
    handleCloseFullAssessmentIntro,
  };
};
