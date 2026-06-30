
import React from 'react';

interface ReportFooterProps {
  reportId: string;
}

const ReportFooter: React.FC<ReportFooterProps> = ({ reportId }) => {
  return (
    <div className="mt-8 text-center text-gray-500 text-sm print:text-black">
      <p>English Placement Assessment Report</p>
      <p>Report ID: {reportId} | Generated on {new Date().toLocaleDateString()}</p>
    </div>
  );
};

export default ReportFooter;
