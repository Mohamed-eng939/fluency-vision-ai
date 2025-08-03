
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
          <div class="page-break-before"></div>
          <h2 class="text-xl font-bold mb-4 text-assessment-blue border-b pb-2">Transcript History - All Responses</h2>
          <p class="text-sm text-gray-600 mb-4">Below are all your responses to the assessment questions, organized by difficulty level.</p>
          ${promptHistory.map((item, index) => `
            <div class="mb-6 p-4 border rounded-lg break-inside-avoid">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold">Q${index + 1}: ${item.prompt.category || 'Speaking'} Task</h3>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${item.prompt.cefrLevel || 'B1'} Level</span>
              </div>
              <div class="mb-3 p-3 bg-gray-50 rounded">
                <p class="text-sm font-medium text-gray-700">${item.prompt.text}</p>
              </div>
              ${item.result?.transcript ? `
                <div class="mt-2">
                  <h4 class="font-medium text-sm mb-1">Your Response:</h4>
                  <div class="text-sm bg-white p-3 border-l-4 border-blue-200 rounded-r">
                    "${item.result.transcript}"
                  </div>
                </div>
              ` : '<p class="text-sm text-gray-500 italic">No transcript available</p>'}
              ${item.result ? `
                <div class="mt-3 flex gap-4 text-xs text-gray-600 border-t pt-2">
                  <span>Overall Score: <strong>${Math.round(item.result.totalScore)}%</strong></span>
                  <span>CEFR Level: <strong>${item.result.cefrLevel}</strong></span>
                  <span>Duration: <strong>${item.result.duration ? Math.round(item.result.duration) + 's' : 'N/A'}</strong></span>
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
