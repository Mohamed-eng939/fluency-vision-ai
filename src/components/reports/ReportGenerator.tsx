
import React, { useRef, useState } from 'react';
import { AssessmentResult, AudioAnalysisResult, FullAssessment } from '@/types/assessment';
import QuickAssessmentReport from './QuickAssessmentReport';
import FullAssessmentReport from './FullAssessmentReport';
import PronunciationRadarChart from './PronunciationRadarChart';
import WaveformVisualization, { WaveformVisualizationRef } from '../assessment/WaveformVisualization';
import { generateReportPdf, captureVisualizationImages } from '@/utils/reports/pdfGenerator';
import { generateWaveformImage } from '@/utils/reports/imageCapture';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const waveformRef = useRef<WaveformVisualizationRef>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();
  const dateOfTest = new Date().toLocaleDateString();

  // Convert pronunciation data to waveform errors
  const waveformErrors = React.useMemo(() => {
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

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Generate waveform image
      const waveformImage = generateWaveformImage(
        waveformErrors,
        result.duration || 10
      );

      const reportType = isFullAssessment ? 'full' : 'quick';
      
      // Add all prompt history content to the report before PDF generation
      const reportContent = reportRef.current;
      
      // Add prompt history section if available
      if (promptHistory.length > 0) {
        const historySection = document.createElement('div');
        historySection.className = 'prompt-history-section pdf-page-break';
        historySection.innerHTML = `
          <h2 class="text-xl font-bold mb-4 text-assessment-blue border-b pb-2">Question & Answer History</h2>
          ${promptHistory.map((item, index) => `
            <div class="mb-6 p-4 border rounded-lg">
              <h3 class="font-semibold mb-2">Question ${index + 1}: ${item.prompt.cefrLevel} Level</h3>
              <p class="text-sm text-gray-600 mb-2">${item.prompt.text}</p>
              ${item.result?.transcript ? `
                <div class="mt-2">
                  <h4 class="font-medium text-sm">Your Response:</h4>
                  <p class="text-sm bg-gray-50 p-2 rounded">${item.result.transcript}</p>
                </div>
              ` : ''}
              ${item.result ? `
                <div class="mt-2 text-xs text-gray-500">
                  Score: ${Math.round(item.result.totalScore)}% | CEFR: ${item.result.cefrLevel}
                </div>
              ` : ''}
            </div>
          `).join('')}
        `;
        reportContent.appendChild(historySection);
      }

      // Add placeholders for images in the report before generating PDF
      const pronunciationSection = reportRef.current.querySelector('.pronunciation-analysis-section');
      if (pronunciationSection && !pronunciationSection.querySelector('.waveform-placeholder')) {
        const waveformDiv = document.createElement('div');
        waveformDiv.className = 'waveform-placeholder mb-4';
        waveformDiv.innerHTML = '<div class="w-full h-30 bg-gray-100 rounded flex items-center justify-center">Waveform visualization</div>';
        
        const radarDiv = document.createElement('div');
        radarDiv.className = 'radar-chart-placeholder';
        radarDiv.innerHTML = '<div class="w-full h-64 bg-gray-100 rounded flex items-center justify-center">Pronunciation radar chart</div>';
        
        pronunciationSection.appendChild(waveformDiv);
        pronunciationSection.appendChild(radarDiv);
      }

      await generateReportPdf(reportRef.current, {
        fileName: `${reportType}-assessment-report-${sessionId}.pdf`,
        learnerName,
        sessionId,
        dateOfTest,
        waveformImage,
        radarChartImage: ''
      });
      
      // Clean up added content
      const addedSection = reportRef.current.querySelector('.prompt-history-section');
      if (addedSection) {
        addedSection.remove();
      }
      
      toast({
        title: 'Report Downloaded',
        description: 'Your assessment report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'There was a problem generating your report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const pronunciationData = React.useMemo(() => {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-assessment-blue">
          {isFullAssessment ? 'Full Assessment Report' : 'Quick Assessment Report'}
        </h2>
        <Button 
          onClick={handleDownloadReport} 
          disabled={isGeneratingPDF}
          className="bg-assessment-teal hover:bg-assessment-lightBlue"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPDF ? 'Generating...' : 'Download Report'}
        </Button>
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
          <div className="pronunciation-analysis-section mt-8">
            <h3 className="text-xl font-semibold mb-4 text-assessment-blue">Enhanced Pronunciation Analysis</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-2">Audio Timeline Analysis</h4>
                <WaveformVisualization
                  ref={waveformRef}
                  audioUrl={result.audioUrl}
                  errors={waveformErrors}
                  duration={result.duration || 10}
                  forPDF={false}
                />
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-2">Pronunciation Profile</h4>
                <PronunciationRadarChart
                  pronunciationData={pronunciationData}
                  forPDF={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;
