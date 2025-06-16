
import React, { useRef, useMemo } from 'react';
import { AssessmentResult, AudioAnalysisResult, FullAssessment } from '@/types/assessment';
import QuickAssessmentReport from './QuickAssessmentReport';
import FullAssessmentReport from './FullAssessmentReport';
import EnhancedPronunciationAnalysis from './EnhancedPronunciationAnalysis';
import ReportDownloadButton from './ReportDownloadButton';
import { usePdfGeneration } from '@/hooks/reports/usePdfGeneration';

interface ReportGeneratorProps {
  result: AssessmentResult;
  audioAnalysis?: AudioAnalysisResult;
  isFullAssessment?: boolean;
  fullAssessmentData?: FullAssessment;
  learnerName?: string;
  sessionId?: string;
  promptHistory?: { prompt: any; result?: AssessmentResult }[];
}

interface TimestampError {
  start: number;
  end: number;
  type: 'phoneme' | 'pause' | 'disfluency';
  message: string;
  phoneme?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  result,
  audioAnalysis,
  isFullAssessment = false,
  fullAssessmentData,
  learnerName = 'Anonymous Learner',
  sessionId = `S-${Date.now().toString(36)}`,
  promptHistory = []
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const dateOfTest = new Date().toLocaleDateString();

  const { isGeneratingPDF, handleDownloadReport } = usePdfGeneration({
    learnerName,
    sessionId,
    dateOfTest,
    isFullAssessment,
    promptHistory
  });

  // Convert pronunciation data to waveform errors
  const waveformErrors = useMemo(() => {
    const errors: TimestampError[] = [];
    
    if (result.audioAnalysis?.pronunciationDetails?.problematic_phonemes) {
      result.audioAnalysis.pronunciationDetails.problematic_phonemes.forEach(phoneme => {
        if (phoneme.start !== undefined && phoneme.end !== undefined) {
          errors.push({
            start: phoneme.start,
            end: phoneme.end,
            type: 'phoneme' as const,
            message: `Pronunciation issue with /${phoneme.phone}/ sound`,
            phoneme: phoneme.phone
          });
        }
      });
    }

    return errors;
  }, [result.audioAnalysis]);

  const pronunciationData = useMemo(() => {
    const details = result.audioAnalysis?.pronunciationDetails;
    if (!details) return null;

    return {
      wordAccuracy: details.word_accuracy || 0,
      phonemeAccuracy: details.phoneme_accuracy || 0,
      speechRate: details.speech_rate || 0,
      targetSpeechRate: details.cefr_level ? `${details.cefr_level} level` : 'B1 level',
      overallScore: details.pronunciation_score || 0,
      cefrLevel: details.cefr_level || 'B1'
    };
  }, [result.audioAnalysis]);

  const handleDownload = () => {
    handleDownloadReport(reportRef, waveformErrors);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-assessment-blue">
          {isFullAssessment ? 'Full Assessment Report' : 'Quick Assessment Report'}
        </h2>
        <ReportDownloadButton
          onDownload={handleDownload}
          isGenerating={isGeneratingPDF}
          isFullAssessment={isFullAssessment}
        />
      </div>
      
      <div ref={reportRef} className="bg-white p-6 rounded-lg shadow-md">
        {isFullAssessment ? (
          <FullAssessmentReport 
            result={result}
            fullAssessmentData={fullAssessmentData}
            learnerName={learnerName}
            sessionId={sessionId}
            dateOfTest={dateOfTest}
            audioAnalysis={audioAnalysis}
          />
        ) : (
          <QuickAssessmentReport 
            result={result}
            audioAnalysis={audioAnalysis}
            learnerName={learnerName}
            sessionId={sessionId}
            dateOfTest={dateOfTest}
          />
        )}

        {/* Enhanced Pronunciation Analysis Section for PDF */}
        {pronunciationData && (
          <EnhancedPronunciationAnalysis
            pronunciationData={pronunciationData}
            audioUrl={result.audioUrl}
            waveformErrors={waveformErrors}
            duration={result.duration || 10}
          />
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;
