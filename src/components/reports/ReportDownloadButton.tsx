
import React from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

interface ReportDownloadButtonProps {
  onDownload: () => void;
  isGenerating: boolean;
  isFullAssessment: boolean;
}

const ReportDownloadButton: React.FC<ReportDownloadButtonProps> = ({
  onDownload,
  isGenerating,
  isFullAssessment
}) => {
  return (
    <Button 
      onClick={onDownload} 
      disabled={isGenerating}
      className="bg-assessment-teal hover:bg-assessment-lightBlue"
    >
      <Download className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Download Report'}
    </Button>
  );
};

export default ReportDownloadButton;
