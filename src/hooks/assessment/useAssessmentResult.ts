
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  SpeakingPrompt, 
  AssessmentResult, 
  AssessmentQuestion, 
  AudioAnalysisResult 
} from '@/types/assessment';
import { analyzeAudio, generateUniqueId, scoreSpeakingResponse } from '@/utils/assessmentUtils';
import { estimateSyllableCount, calculateFluencyScoreFromSyllables } from '@/utils/scoringUtils';

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
          transcript: transcript || '',
          audioAnalysis: audioAnalysis,
          sessionId: studentInfo?.sessionId || generateUniqueId('Q'),
          learnerName: studentInfo?.name || 'Anonymous Learner',
          dateOfTest: new Date().toLocaleDateString(),
          assessmentType: 'quick'
        };
        
        setAssessmentResult(result);
        setDetailedFeedback(scoringResult.feedback);
        
      } else {
        // Use the standard audio analysis
        const result = await analyzeAudio(audioBlob);
        
        // Add transcript if available
        if (transcript) {
          result.transcript = transcript;
          
          // Calculate and add syllable data if not already present
          if (!result.metrics || result.metrics.fluency === undefined) {
            // If we don't have metrics at all, create basic ones
            result.metrics = result.metrics || {
              fluency: 7,
              grammar: 7,
              pronunciation: 7,
              prosody: 7,
              vocabulary: 7,
              syntax: 7,
              coherence: 7
            };
          }
          
          // Enhance with syllable-based fluency if we have duration
          if (result.duration) {
            const syllableCount = estimateSyllableCount(transcript);
            const durationInMinutes = result.duration / 60;
            const syllablesPerMinute = syllableCount / durationInMinutes;
            
            // Store the syllable data in the result
            if (!result.speechRate) {
              result.speechRate = (syllableCount / (result.duration / 60));
            }
            
            // Update the fluency metric with our new SPM-based calculation
            if (audioAnalysis) {
              audioAnalysis.syllableCount = syllableCount;
              audioAnalysis.syllablesPerMinute = syllablesPerMinute;
              
              // Use our improved fluency scoring based on SPM
              const improvedFluencyScore = calculateFluencyScoreFromSyllables(
                syllablesPerMinute, 
                audioAnalysis.pauseRatio || 0.2
              );
              
              result.metrics.fluency = improvedFluencyScore;
            }
          }
        }
        
        // Add student info and audio analysis to result
        result.audioAnalysis = audioAnalysis;
        result.sessionId = studentInfo?.sessionId || generateUniqueId('Q');
        result.learnerName = studentInfo?.name || 'Anonymous Learner';
        result.dateOfTest = new Date().toLocaleDateString();
        result.assessmentType = 'quick';
        
        // Add CEFR level from prompt if available
        if (selectedPrompt?.cefrLevel) {
          // Adjust scoring based on the CEFR level of the prompt
          // This ensures the scoring is appropriate for the expected level
          result.cefrLevel = selectedPrompt.cefrLevel;
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
