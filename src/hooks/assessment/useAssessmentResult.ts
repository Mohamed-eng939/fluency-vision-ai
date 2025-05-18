
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  SpeakingPrompt, 
  AssessmentResult, 
  AudioAnalysisResult 
} from '@/types/assessment';
import { processRecordingForAssessment } from '@/utils/assessment/audioProcessingUtils';

interface UseAssessmentResultProps {
  selectedPrompt: SpeakingPrompt | null;
  studentInfo: {
    sessionId?: string;
    name?: string;
  } | null;
}

export const useAssessmentResult = ({ selectedPrompt, studentInfo }: UseAssessmentResultProps) => {
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detailedFeedback, setDetailedFeedback] = useState<Record<string, string> | null>(null);
  const { toast } = useToast();

  const handleRecordingComplete = async (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    try {
      setIsProcessing(true);
      
      const result = await processRecordingForAssessment(
        audioBlob,
        transcript,
        audioAnalysis,
        selectedPrompt,
        studentInfo
      );
      
      setAssessmentResult(result);
      
      // If we have detailed scores from question-based scoring, set detailed feedback
      if (selectedPrompt?.questionData && result.feedback) {
        // Cast the feedback to Record<string, string> if it comes from a question-based assessment
        // This is safe because question-based feedback follows the Record<string, string> structure
        setDetailedFeedback(result.feedback as unknown as Record<string, string>);
      }
    } catch (error) {
      console.error("Error processing recording:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your recording. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAssessmentResult(null);
    setDetailedFeedback(null);
  };

  return {
    assessmentResult,
    isProcessing,
    detailedFeedback,
    handleRecordingComplete,
    handleReset,
  };
};
