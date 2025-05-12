
import { useState } from 'react';
import { SpeakingPrompt, AssessmentResult, AssessmentQuestion, AudioAnalysisResult } from '@/types/assessment';
import { useToast } from '@/components/ui/use-toast';
import { analyzeAudio, scoreSpeakingResponse } from '@/utils/assessmentUtils';

export const useAssessmentState = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFullAssessment, setShowFullAssessment] = useState(false);
  const [showFullAssessmentIntro, setShowFullAssessmentIntro] = useState(false);
  const [detailedFeedback, setDetailedFeedback] = useState<Record<string, string> | null>(null);
  const { toast } = useToast();

  const handlePromptSelect = (prompt: SpeakingPrompt) => {
    setSelectedPrompt(prompt);
    setAssessmentResult(null);
    setDetailedFeedback(null);
  };

  const handleRecordingComplete = async (audioBlob: Blob, transcript?: string, audioAnalysis?: AudioAnalysisResult) => {
    try {
      setIsProcessing(true);
      
      // Use enhanced scoring if we have a prompt with assessment question data
      if (selectedPrompt && selectedPrompt.questionData) {
        const questionData = selectedPrompt.questionData as AssessmentQuestion;
        
        // Get detailed scoring using the question rubric
        const scoringResult = await scoreSpeakingResponse(
          audioBlob, 
          questionData,
          transcript
        );
        
        // Create assessment result from detailed scoring
        const result: AssessmentResult = {
          totalScore: scoringResult.score,
          cefrLevel: scoringResult.cefrLevel,
          metrics: {
            fluency: scoringResult.detailedScores['Fluency'] || scoringResult.detailedScores['Fluency & Coherence'] || 7,
            grammar: scoringResult.detailedScores['Grammar'] || 7, 
            pronunciation: scoringResult.detailedScores['Pronunciation'] || 7,
            prosody: scoringResult.detailedScores['Prosody'] || 7,
            vocabulary: scoringResult.detailedScores['Vocabulary'] || scoringResult.detailedScores['Lexical Resource'] || 7,
            syntax: scoringResult.detailedScores['Syntax'] || 7,
            coherence: scoringResult.detailedScores['Coherence'] || 7,
          },
          feedback: {
            fluency: scoringResult.feedback['Fluency'] || scoringResult.feedback['Fluency & Coherence'] || '',
            grammar: scoringResult.feedback['Grammar'] || '',
            pronunciation: scoringResult.feedback['Pronunciation'] || '',
            prosody: scoringResult.feedback['Prosody'] || '',
            vocabulary: scoringResult.feedback['Vocabulary'] || scoringResult.feedback['Lexical Resource'] || '',
            syntax: scoringResult.feedback['Syntax'] || '',
            coherence: scoringResult.feedback['Coherence'] || '',
            overall: `Your overall performance is at ${scoringResult.cefrLevel} level.`
          },
          audioUrl: URL.createObjectURL(audioBlob),
          transcript: transcript || ''
        };
        
        setAssessmentResult(result);
        setDetailedFeedback(scoringResult.feedback);
        
      } else {
        // Use the standard audio analysis
        const result = await analyzeAudio(audioBlob);
        
        // Add transcript if available
        if (transcript) {
          result.transcript = transcript;
        }
        
        setAssessmentResult(result);
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

  const handleStartFullAssessment = () => {
    setShowFullAssessmentIntro(false);
    setShowFullAssessment(true);
  };

  const handleFullAssessmentComplete = (result?: AssessmentResult) => {
    setShowFullAssessment(false);
    
    if (result) {
      // Display the result if available
      setAssessmentResult(result);
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
  };

  const handleFullAssessmentExit = () => {
    setShowFullAssessment(false);
    toast({
      title: "Assessment Saved",
      description: "Your progress has been saved. You can continue later.",
    });
  };

  const handleReset = () => {
    setSelectedPrompt(null);
    setAssessmentResult(null);
    setDetailedFeedback(null);
  };
  
  const handleShowFullAssessmentIntro = () => {
    setShowFullAssessmentIntro(true);
  };

  const handleCloseFullAssessmentIntro = () => {
    setShowFullAssessmentIntro(false);
  };

  return {
    selectedPrompt,
    assessmentResult,
    isProcessing,
    showFullAssessment,
    showFullAssessmentIntro,
    detailedFeedback,
    handlePromptSelect,
    handleRecordingComplete,
    handleStartFullAssessment,
    handleFullAssessmentComplete,
    handleFullAssessmentExit,
    handleReset,
    handleShowFullAssessmentIntro,
    handleCloseFullAssessmentIntro
  };
};
