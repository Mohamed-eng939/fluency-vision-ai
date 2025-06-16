
import { useRef, useState } from 'react';
import { generateReportPdf } from '@/utils/reports/pdfGenerator';
import { generateWaveformImage } from '@/utils/reports/imageCapture';
import { useToast } from '@/hooks/use-toast';

interface UsePdfGenerationProps {
  learnerName: string;
  sessionId: string;
  dateOfTest: string;
  isFullAssessment: boolean;
  promptHistory: { prompt: any; result?: any }[];
}

export const usePdfGeneration = ({
  learnerName,
  sessionId,
  dateOfTest,
  isFullAssessment,
  promptHistory
}: UsePdfGenerationProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const handleDownloadReport = async (
    reportRef: React.RefObject<HTMLDivElement>,
    waveformErrors: any[]
  ) => {
    if (!reportRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Generate waveform image
      const waveformImage = generateWaveformImage(
        waveformErrors,
        10 // default duration
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

  return {
    isGeneratingPDF,
    handleDownloadReport
  };
};
