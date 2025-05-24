
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportHeaderProps {
  reportType: string;
  onDownloadPDF: () => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ reportType, onDownloadPDF }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm print:shadow-none">
      <div className="container mx-auto py-4 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="print:hidden"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-assessment-blue">
                {reportType}
              </h1>
              <p className="text-gray-600">Detailed analysis and scoring breakdown</p>
            </div>
          </div>
          <Button 
            onClick={onDownloadPDF}
            className="bg-assessment-teal hover:bg-assessment-lightBlue print:hidden"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
